import json
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..deps import get_db
from ..models import AVAProfile, AVAUseProfile, ActorAudioAsset
from ..schemas import AudioAssetQualityRead, AudioAssetRead, AudioUploadResponse, QualityReportRead, UseProfileRead
from ..security import rate_limit_guard, require_api_key
from ..services.audio_profile import (
    build_audio_derivatives,
    extract_voice_features,
    save_upload,
    segment_wav,
    update_use_profile,
)
from ..services.stt import transcribe_audio


router = APIRouter(
    prefix="/profile",
    tags=["profile"],
    dependencies=[Depends(require_api_key), Depends(rate_limit_guard)],
)

ALLOWED_EXTENSIONS = {".wav", ".mp3", ".flac", ".m4a", ".aac", ".ogg"}


@router.post("/{ava_slug}/audio", response_model=AudioUploadResponse, status_code=status.HTTP_201_CREATED)
def upload_audio_to_profile(
    ava_slug: str, file: UploadFile = File(...), db: Session = Depends(get_db)
) -> AudioUploadResponse:
    ava = db.scalar(select(AVAProfile).where(AVAProfile.slug == ava_slug))
    if not ava:
        raise HTTPException(status_code=404, detail="AVA profile not found")

    ext = Path(file.filename or "").suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext or 'unknown'}'. Allowed: {sorted(ALLOWED_EXTENSIONS)}",
        )

    stored_path = save_upload(ava_slug, file)
    derivatives = build_audio_derivatives(ava_slug, stored_path)
    analysis_path = derivatives["analysis_wav_path"]
    archival_path = derivatives["archival_wav_path"]
    immersive_path = derivatives["immersive_wav_path"]
    quality_profile = str(derivatives["quality_profile"])
    quality_report = derivatives["quality_report"]

    stats = {
        "duration_seconds": 0,
        "sample_rate": 0,
        "channels": 0,
        "feature_backend": "basic",
        "pitch_mean_hz": 0.0,
        "pitch_std_hz": 0.0,
        "rms_mean": 0.0,
        "zcr_mean": 0.0,
    }
    transcript_input_path = analysis_path if analysis_path else stored_path
    segment_paths = [transcript_input_path]
    if analysis_path:
        stats = extract_voice_features(analysis_path)
        segment_paths = segment_wav(ava_slug, analysis_path)

    transcripts: list[str] = []
    for segment in segment_paths[:16]:
        _, partial = transcribe_audio(str(segment))
        if partial:
            transcripts.append(partial.strip())
    transcript = " ".join(transcripts).strip() or "no transcript generated"
    transcript_excerpt = transcript[:220]

    asset = ActorAudioAsset(
        ava_id=ava.id,
        original_filename=file.filename or "unknown",
        stored_path=str(stored_path),
        normalized_wav_path=str(analysis_path) if analysis_path else "",
        archival_wav_path=str(archival_path) if archival_path else "",
        immersive_wav_path=str(immersive_path) if immersive_path else "",
        duration_seconds=int(stats["duration_seconds"]),
        sample_rate=int(stats["sample_rate"]),
        channels=int(stats["channels"]),
        quality_profile=quality_profile,
        quality_report_json=json.dumps(quality_report),
        transcript_excerpt=transcript_excerpt,
        status="processed",
    )
    db.add(asset)

    profile_row = db.scalar(select(AVAUseProfile).where(AVAUseProfile.ava_id == ava.id))
    updated_profile = update_use_profile(
        profile_row=profile_row,
        stats=stats,
        transcript_excerpt=transcript_excerpt,
        segment_count=len(segment_paths),
        quality_profile=quality_profile,
        quality_report=quality_report,
    )
    if profile_row is None:
        updated_profile.ava_id = ava.id
        db.add(updated_profile)

    db.commit()
    db.refresh(asset)

    return AudioUploadResponse(
        asset_id=asset.id,
        ava_slug=ava.slug,
        original_filename=asset.original_filename,
        duration_seconds=asset.duration_seconds,
        sample_rate=asset.sample_rate,
        channels=asset.channels,
        segments_processed=len(segment_paths),
        feature_backend=str(stats.get("feature_backend", "basic")),
        transcript_excerpt=asset.transcript_excerpt,
        quality_profile=asset.quality_profile,
        analysis_wav_path=asset.normalized_wav_path,
        archival_wav_path=asset.archival_wav_path,
        immersive_wav_path=asset.immersive_wav_path,
        quality_report=quality_report,
        use_profile_updated=True,
    )


@router.get("/{ava_slug}/audio", response_model=list[AudioAssetRead])
def list_profile_audio(ava_slug: str, db: Session = Depends(get_db)) -> list[ActorAudioAsset]:
    ava = db.scalar(select(AVAProfile).where(AVAProfile.slug == ava_slug))
    if not ava:
        raise HTTPException(status_code=404, detail="AVA profile not found")
    return db.scalars(
        select(ActorAudioAsset)
        .where(ActorAudioAsset.ava_id == ava.id)
        .order_by(ActorAudioAsset.created_at.desc())
    ).all()


@router.get("/{ava_slug}/use-profile", response_model=UseProfileRead)
def get_use_profile(ava_slug: str, db: Session = Depends(get_db)) -> UseProfileRead:
    ava = db.scalar(select(AVAProfile).where(AVAProfile.slug == ava_slug))
    if not ava:
        raise HTTPException(status_code=404, detail="AVA profile not found")
    profile_row = db.scalar(select(AVAUseProfile).where(AVAUseProfile.ava_id == ava.id))
    profile = json.loads(profile_row.profile_json) if profile_row and profile_row.profile_json else {}
    return UseProfileRead(ava_slug=ava.slug, profile=profile)


@router.get("/{ava_slug}/quality-report", response_model=QualityReportRead)
def get_quality_report(ava_slug: str, db: Session = Depends(get_db)) -> QualityReportRead:
    ava = db.scalar(select(AVAProfile).where(AVAProfile.slug == ava_slug))
    if not ava:
        raise HTTPException(status_code=404, detail="AVA profile not found")

    profile_row = db.scalar(select(AVAUseProfile).where(AVAUseProfile.ava_id == ava.id))
    profile = json.loads(profile_row.profile_json) if profile_row and profile_row.profile_json else {}

    assets = db.scalars(
        select(ActorAudioAsset)
        .where(ActorAudioAsset.ava_id == ava.id)
        .order_by(ActorAudioAsset.created_at.desc())
    ).all()
    asset_rows = [
        AudioAssetQualityRead(
            asset_id=a.id,
            original_filename=a.original_filename,
            quality_profile=a.quality_profile,
            analysis_wav_path=a.normalized_wav_path,
            archival_wav_path=a.archival_wav_path,
            immersive_wav_path=a.immersive_wav_path,
            duration_seconds=a.duration_seconds,
            sample_rate=a.sample_rate,
            channels=a.channels,
            created_at=a.created_at,
        )
        for a in assets
    ]
    return QualityReportRead(ava_slug=ava.slug, profile=profile, assets=asset_rows)
