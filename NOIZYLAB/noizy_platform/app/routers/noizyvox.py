"""
NOIZYVOX Router — 75/25 Creator Voice Ownership Protocol
---------------------------------------------------------
Endpoints:
  POST /noizyvox/models              — register a new voice model (owner locked)
  GET  /noizyvox/models              — list all registered voice models
  GET  /noizyvox/models/{slug}       — get voice model details
  POST /noizyvox/models/{slug}/clone — upload samples + build XTTS model
  POST /noizyvox/models/{slug}/synthesize — generate speech with a cloned voice
  GET  /noizyvox/models/{slug}/splits — lifetime split summary
  GET  /noizyvox/models/{slug}/usage  — usage history
  GET  /noizyvox/status              — XTTS availability check

The 75/25 split is LOCKED at model creation:
  creator_share = 0.75
  platform_share = 0.25
  Activates after 30 days (or immediately in demo mode).

Rate: 1 NOIZY credit per second of generated audio.
"""
from __future__ import annotations

import datetime as dt
import json
import os
import tempfile
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status, Form
from sqlalchemy import select, func
from sqlalchemy.orm import Session

from ..deps import get_db
from ..models import VoiceModel, VoiceUsage, SplitRecord
from ..config import get_settings
from ..schemas import (
    VoiceModelCreate,
    VoiceModelRead,
    VoiceCloneRequest,
    VoiceCloneResponse,
    VoiceSynthRequest,
    VoiceSynthResponse,
    VoiceUsageRead,
    SplitSummary,
    VoiceFingerprintRead,
    HVSReport,
    HVSAnalyzeRequest,
)
from ..security import require_api_key, rate_limit_guard
from ..services import xtts as xtts_svc
from ..services import voice_analysis as analysis_svc
from ..services import hvs as hvs_svc

router = APIRouter(
    prefix="/noizyvox",
    tags=["noizyvox"],
    dependencies=[Depends(require_api_key), Depends(rate_limit_guard)],
)

# Storage root for voice model artifacts
_VOICES_DIR = os.environ.get("NOIZYVOX_VOICES_DIR", os.path.expanduser("~/.noizy/voices"))


def _voice_dir(slug: str) -> str:
    d = os.path.join(_VOICES_DIR, slug)
    os.makedirs(d, exist_ok=True)
    return d


def _get_model_or_404(slug: str, db: Session) -> VoiceModel:
    model = db.scalar(select(VoiceModel).where(VoiceModel.slug == slug))
    if not model:
        raise HTTPException(status_code=404, detail=f"Voice model '{slug}' not found")
    return model


# ─── XTTS status ─────────────────────────────────────────────────────────────

@router.get("/status")
def noizyvox_status() -> dict:
    return {
        "noizyvox": "online",
        "split": "75/25 — creator perpetual",
        "xtts": xtts_svc.xtts_available(),
    }


# ─── Voice model registry ─────────────────────────────────────────────────────

@router.get("/models", response_model=list[VoiceModelRead])
def list_voice_models(
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db),
) -> list[VoiceModel]:
    limit = min(limit, 200)  # hard cap — no unbounded scans
    return db.scalars(
        select(VoiceModel).order_by(VoiceModel.created_at.desc()).limit(limit).offset(offset)
    ).all()


@router.post("/models", response_model=VoiceModelRead, status_code=status.HTTP_201_CREATED)
def create_voice_model(payload: VoiceModelCreate, db: Session = Depends(get_db)) -> VoiceModel:
    existing = db.scalar(select(VoiceModel).where(VoiceModel.slug == payload.slug))
    if existing:
        raise HTTPException(status_code=409, detail=f"Voice model slug '{payload.slug}' already exists")

    model = VoiceModel(
        slug=payload.slug,
        display_name=payload.display_name,
        owner_handle=payload.owner_handle,
        status="pending",
        creator_share=0.75,
        platform_share=0.25,
    )
    db.add(model)
    db.commit()
    db.refresh(model)
    return model


@router.get("/models/{slug}", response_model=VoiceModelRead)
def get_voice_model(slug: str, db: Session = Depends(get_db)) -> VoiceModel:
    return _get_model_or_404(slug, db)


# ─── Voice cloning (upload samples → XTTS model) ──────────────────────────────

@router.post("/models/{slug}/clone", response_model=VoiceCloneResponse)
async def clone_voice(
    slug: str,
    files: list[UploadFile] = File(...),
    language: str = Form(default="en"),
    db: Session = Depends(get_db),
) -> VoiceCloneResponse:
    """
    Upload reference audio files (.wav, .mp3) to build an XTTS voice model.
    Minimum: 3 files, ideally 10-30 seconds each.
    The 75/25 split is locked at registration and cannot be changed.
    """
    model = _get_model_or_404(slug, db)

    if model.status in ("active", "training"):
        raise HTTPException(
            status_code=409,
            detail=f"Voice model '{slug}' is already {model.status}. Delete and re-register to retrain."
        )

    voice_dir = _voice_dir(slug)
    samples_dir = os.path.join(voice_dir, "samples")
    os.makedirs(samples_dir, exist_ok=True)

    # Save uploaded files — sanitize filenames to prevent directory traversal
    _ALLOWED_AUDIO_EXT = {".wav", ".mp3", ".flac", ".ogg", ".m4a"}
    _MAX_FILE_BYTES = 50 * 1024 * 1024  # 50 MB per file
    _MAX_FILES = 30

    if len(files) > _MAX_FILES:
        raise HTTPException(status_code=422, detail=f"Too many files — maximum {_MAX_FILES} per clone request")

    saved_paths: list[str] = []
    for upload in files:
        if not upload.filename:
            continue
        # Strip path components — only keep the bare filename
        safe_name = Path(upload.filename).name
        ext = Path(safe_name).suffix.lower()
        if ext not in _ALLOWED_AUDIO_EXT:
            raise HTTPException(status_code=422, detail=f"Unsupported file type '{ext}' — allowed: {_ALLOWED_AUDIO_EXT}")
        # Read with size guard
        content = await upload.read(_MAX_FILE_BYTES + 1)
        if len(content) > _MAX_FILE_BYTES:
            raise HTTPException(status_code=413, detail=f"File '{safe_name}' exceeds 50 MB limit")
        dest = os.path.join(samples_dir, safe_name)
        with open(dest, "wb") as f:
            f.write(content)
        saved_paths.append(dest)

    if not saved_paths:
        raise HTTPException(status_code=422, detail="No valid audio files received")

    # Mark as training
    model.status = "training"
    db.commit()

    try:
        # 1. Extract Librosa fingerprint
        fingerprint = analysis_svc.extract_fingerprint(saved_paths)
        quality = analysis_svc.voice_quality_gate(fingerprint)

        # 2. Extract XTTS speaker embeddings
        embed_result = xtts_svc.extract_speaker_embeddings(
            sample_paths=saved_paths,
            output_dir=os.path.join(voice_dir, "embeddings"),
            slug=slug,
        )

        # 3. Update model record
        model.gpt_cond_latent_path = embed_result["gpt_cond_latent_path"]
        model.speaker_embedding_path = embed_result["speaker_embedding_path"]
        model.voice_fingerprint_json = json.dumps(fingerprint)
        model.status = "active" if quality["pass"] else "pending"
        model.activated_at = dt.datetime.now(dt.timezone.utc) if quality["pass"] else None
        db.commit()

        return VoiceCloneResponse(
            voice_model_slug=slug,
            status=model.status,
            fingerprint=fingerprint,
            message=(
                f"Voice model ready — {embed_result['samples_used']} samples processed. "
                f"Quality score: {quality['score']}/100. Split locked: 75/25 perpetual."
                if quality["pass"]
                else f"Quality gate failed (score {quality['score']}/100): {'; '.join(quality['issues'])}"
            ),
        )

    except Exception as exc:
        model.status = "pending"
        db.commit()
        raise HTTPException(status_code=500, detail=f"XTTS training failed: {exc}") from exc


# ─── Synthesis ────────────────────────────────────────────────────────────────

@router.post("/models/{slug}/synthesize", response_model=VoiceSynthResponse)
def synthesize_voice(
    slug: str,
    payload: VoiceSynthRequest,
    db: Session = Depends(get_db),
) -> VoiceSynthResponse:
    """
    Generate speech using a registered cloned voice.
    Records usage and calculates 75/25 split automatically.
    """
    model = _get_model_or_404(slug, db)

    if model.status != "active":
        raise HTTPException(
            status_code=409,
            detail=f"Voice model '{slug}' is not active (status: {model.status})"
        )

    if not model.gpt_cond_latent_path or not model.speaker_embedding_path:
        raise HTTPException(status_code=422, detail="Voice embeddings not found — re-clone this model")

    # Output path — always platform-controlled; ignore any client-supplied path
    voice_dir = _voice_dir(slug)
    output_dir = os.path.join(voice_dir, "output")
    os.makedirs(output_dir, exist_ok=True)
    ts = dt.datetime.now().strftime("%Y%m%d_%H%M%S")
    output_path = os.path.join(output_dir, f"{slug}_{ts}.wav")

    try:
        result = xtts_svc.synthesize_with_clone(
            text=payload.text,
            gpt_cond_latent_path=model.gpt_cond_latent_path,
            speaker_embedding_path=model.speaker_embedding_path,
            output_path=output_path,
            language=payload.language,
            speed=payload.speed,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Synthesis failed: {exc}") from exc

    duration = result["duration_seconds"]

    # 75/25 split — 1 credit per second
    credits = round(duration, 4)
    creator_earned = round(credits * model.creator_share, 4)
    platform_earned = round(credits * model.platform_share, 4)

    # Log usage
    usage = VoiceUsage(
        voice_model_id=model.id,
        used_by=payload.used_by,
        text_length=len(payload.text),
        duration_seconds=duration,
        output_path=output_path,
        credits_charged=credits,
        creator_earned=creator_earned,
        platform_earned=platform_earned,
    )
    db.add(usage)

    # Update or create monthly split record
    now = dt.datetime.now(dt.timezone.utc)
    split_rec = db.scalar(
        select(SplitRecord).where(
            SplitRecord.voice_model_id == model.id,
            SplitRecord.period_year == now.year,
            SplitRecord.period_month == now.month,
        )
    )
    if split_rec:
        split_rec.total_uses += 1
        split_rec.total_seconds += duration
        split_rec.total_credits += credits
        split_rec.creator_total += creator_earned
        split_rec.platform_total += platform_earned
    else:
        split_rec = SplitRecord(
            voice_model_id=model.id,
            period_year=now.year,
            period_month=now.month,
            total_uses=1,
            total_seconds=duration,
            total_credits=credits,
            creator_total=creator_earned,
            platform_total=platform_earned,
        )
        db.add(split_rec)

    db.commit()

    return VoiceSynthResponse(
        voice_model_slug=slug,
        output_path=output_path,
        duration_seconds=duration,
        credits_charged=credits,
        creator_earned=creator_earned,
        platform_earned=platform_earned,
    )


# ─── Split summary ────────────────────────────────────────────────────────────

@router.get("/models/{slug}/splits", response_model=SplitSummary)
def get_split_summary(slug: str, db: Session = Depends(get_db)) -> SplitSummary:
    model = _get_model_or_404(slug, db)

    totals = db.execute(
        select(
            func.count(VoiceUsage.id),
            func.sum(VoiceUsage.duration_seconds),
            func.sum(VoiceUsage.credits_charged),
            func.sum(VoiceUsage.creator_earned),
            func.sum(VoiceUsage.platform_earned),
        ).where(VoiceUsage.voice_model_id == model.id)
    ).one()

    return SplitSummary(
        voice_model_slug=slug,
        owner_handle=model.owner_handle,
        total_uses=totals[0] or 0,
        total_seconds=round(totals[1] or 0.0, 3),
        total_credits=round(totals[2] or 0.0, 4),
        creator_total=round(totals[3] or 0.0, 4),
        platform_total=round(totals[4] or 0.0, 4),
        activation_status=model.status,
        activated_at=model.activated_at,
    )


@router.get("/models/{slug}/usage", response_model=list[VoiceUsageRead])
def get_usage_history(
    slug: str,
    limit: int = 50,
    db: Session = Depends(get_db),
) -> list[VoiceUsage]:
    model = _get_model_or_404(slug, db)
    return db.scalars(
        select(VoiceUsage)
        .where(VoiceUsage.voice_model_id == model.id)
        .order_by(VoiceUsage.created_at.desc())
        .limit(limit)
    ).all()


@router.get("/models/{slug}/fingerprint", response_model=VoiceFingerprintRead)
def get_fingerprint(slug: str, db: Session = Depends(get_db)) -> VoiceFingerprintRead:
    model = _get_model_or_404(slug, db)
    try:
        fp = json.loads(model.voice_fingerprint_json or "{}")
    except json.JSONDecodeError:
        fp = {}
    return VoiceFingerprintRead(voice_model_slug=slug, fingerprint=fp)


# ─── HVS — Human Voice Signature ─────────────────────────────────────────────

@router.get("/models/{slug}/hvs", response_model=HVSReport)
def get_hvs_report(
    slug: str,
    regenerate: bool = False,
    db: Session = Depends(get_db),
) -> HVSReport:
    """
    Get the Human Voice Signature report for a voice model.
    Includes voice type, vocal health, emotion distribution, neural embedding status,
    drift alert, and a Claude-generated narrative.

    Pass ?regenerate=true to recompute from stored samples.
    """
    model = _get_model_or_404(slug, db)

    # Check stored HVS in fingerprint field
    try:
        stored = json.loads(model.voice_fingerprint_json or "{}")
    except json.JSONDecodeError:
        stored = {}

    # If HVS already computed and not forcing regeneration, return cached
    hvs_data = stored.get("hvs") if stored else None

    if not hvs_data or regenerate:
        # Re-run HVS from stored sample files
        samples_dir = os.path.join(_voice_dir(slug), "samples")
        if not os.path.exists(samples_dir):
            raise HTTPException(status_code=422, detail="No audio samples found — clone the model first")

        sample_paths = [
            os.path.join(samples_dir, f)
            for f in os.listdir(samples_dir)
            if f.lower().endswith((".wav", ".mp3", ".flac", ".ogg"))
        ]
        if not sample_paths:
            raise HTTPException(status_code=422, detail="No audio files in samples directory")

        # Get existing acoustic fingerprint as baseline for drift
        existing_fp = None
        if stored.get("mfcc_means"):
            existing_fp = stored

        import concurrent.futures
        hvs_data = hvs_svc.build_hvs(sample_paths, existing_fingerprint=existing_fp)

        # Generate Claude narrative with a hard timeout (30 s)
        settings = get_settings()
        api_key = getattr(settings, "anthropic_api_key", "") or os.environ.get("ANTHROPIC_API_KEY", "")
        try:
            with concurrent.futures.ThreadPoolExecutor(max_workers=1) as pool:
                future = pool.submit(hvs_svc.generate_hvs_narrative, hvs_data, api_key)
                hvs_data["narrative"] = future.result(timeout=30)
        except concurrent.futures.TimeoutError:
            hvs_data["narrative"] = "Narrative generation timed out — HVS data available above."
        hvs_data["generated_at"] = dt.datetime.now(dt.timezone.utc).isoformat()

        # Cache in fingerprint JSON
        stored["hvs"] = hvs_data
        model.voice_fingerprint_json = json.dumps(stored)
        db.commit()

    vt = hvs_data.get("voice_type")
    vh = hvs_data.get("vocal_health")

    return HVSReport(
        voice_model_slug=slug,
        owner_handle=model.owner_handle,
        version=hvs_data.get("version", "1.0"),
        samples_analyzed=hvs_data.get("samples_analyzed", 0),
        voice_type=vt,
        vocal_health=vh,
        emotion_distribution=hvs_data.get("emotion_distribution"),
        dominant_emotion=hvs_data.get("dominant_emotion"),
        neural_embedding_available=hvs_data.get("neural_embedding_available", False),
        neural_embedding_dim=hvs_data.get("neural_embedding_dim", 0),
        drift=hvs_data.get("drift"),
        narrative=hvs_data.get("narrative"),
        generated_at=hvs_data.get("generated_at", dt.datetime.now(dt.timezone.utc).isoformat()),
    )


@router.post("/models/{slug}/hvs/analyze", response_model=HVSReport)
async def analyze_new_hvs_samples(
    slug: str,
    files: list[UploadFile] = File(...),
    db: Session = Depends(get_db),
) -> HVSReport:
    """
    Upload NEW audio samples for an HVS drift check — without retraining the voice model.
    Computes drift vs the registered baseline. Useful for periodic vocal health checks.
    """
    model = _get_model_or_404(slug, db)

    # Save new samples to a temporary analysis directory
    analyze_dir = os.path.join(_voice_dir(slug), "hvs_analysis")
    os.makedirs(analyze_dir, exist_ok=True)

    _ALLOWED_AUDIO_EXT = {".wav", ".mp3", ".flac", ".ogg", ".m4a"}
    _MAX_FILE_BYTES = 50 * 1024 * 1024  # 50 MB per file

    saved_paths: list[str] = []
    for upload in files:
        if not upload.filename:
            continue
        safe_name = Path(upload.filename).name
        ext = Path(safe_name).suffix.lower()
        if ext not in _ALLOWED_AUDIO_EXT:
            raise HTTPException(status_code=422, detail=f"Unsupported file type '{ext}'")
        content = await upload.read(_MAX_FILE_BYTES + 1)
        if len(content) > _MAX_FILE_BYTES:
            raise HTTPException(status_code=413, detail=f"File '{safe_name}' exceeds 50 MB limit")
        dest = os.path.join(analyze_dir, f"hvs_{dt.datetime.now().strftime('%H%M%S%f')}_{safe_name}")
        with open(dest, "wb") as f:
            f.write(content)
        saved_paths.append(dest)

    if not saved_paths:
        raise HTTPException(status_code=422, detail="No valid audio files received")

    # Get baseline fingerprint for drift comparison
    try:
        stored = json.loads(model.voice_fingerprint_json or "{}")
    except json.JSONDecodeError:
        stored = {}

    baseline_fp = stored if stored.get("mfcc_means") else None

    import concurrent.futures
    hvs_data = hvs_svc.build_hvs(saved_paths, existing_fingerprint=baseline_fp)

    # Generate Claude narrative with a hard timeout (30 s)
    settings = get_settings()
    api_key = getattr(settings, "anthropic_api_key", "") or os.environ.get("ANTHROPIC_API_KEY", "")
    try:
        with concurrent.futures.ThreadPoolExecutor(max_workers=1) as pool:
            future = pool.submit(hvs_svc.generate_hvs_narrative, hvs_data, api_key)
            hvs_data["narrative"] = future.result(timeout=30)
    except concurrent.futures.TimeoutError:
        hvs_data["narrative"] = "Narrative generation timed out — HVS data available above."
    hvs_data["generated_at"] = dt.datetime.now(dt.timezone.utc).isoformat()

    # Update cached HVS
    stored["hvs"] = hvs_data
    model.voice_fingerprint_json = json.dumps(stored)
    db.commit()

    vt = hvs_data.get("voice_type")
    vh = hvs_data.get("vocal_health")

    return HVSReport(
        voice_model_slug=slug,
        owner_handle=model.owner_handle,
        version=hvs_data.get("version", "1.0"),
        samples_analyzed=hvs_data.get("samples_analyzed", 0),
        voice_type=vt,
        vocal_health=vh,
        emotion_distribution=hvs_data.get("emotion_distribution"),
        dominant_emotion=hvs_data.get("dominant_emotion"),
        neural_embedding_available=hvs_data.get("neural_embedding_available", False),
        neural_embedding_dim=hvs_data.get("neural_embedding_dim", 0),
        drift=hvs_data.get("drift"),
        narrative=hvs_data.get("narrative"),
        generated_at=hvs_data.get("generated_at", dt.datetime.now(dt.timezone.utc).isoformat()),
    )
