from __future__ import annotations

import json
import subprocess
import uuid
import wave
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from fastapi import UploadFile

from ..config import get_settings
from ..models import AVAUseProfile


ROOT = Path(__file__).resolve().parents[2]
UPLOAD_ROOT = ROOT / "storage" / "uploads"
ANALYSIS_ROOT = ROOT / "storage" / "analysis"
ARCHIVE_ROOT = ROOT / "storage" / "archival"
IMMERSIVE_ROOT = ROOT / "storage" / "immersive"
SEGMENT_ROOT = ROOT / "storage" / "segments"
settings = get_settings()


def save_upload(ava_slug: str, upload: UploadFile) -> Path:
    target_dir = UPLOAD_ROOT / ava_slug
    target_dir.mkdir(parents=True, exist_ok=True)
    ext = Path(upload.filename or "").suffix or ".bin"
    path = target_dir / f"{uuid.uuid4().hex}{ext}"
    with path.open("wb") as f:
        while True:
            chunk = upload.file.read(1024 * 1024)
            if not chunk:
                break
            f.write(chunk)
    return path


def _run_command(cmd: list[str]) -> bool:
    try:
        subprocess.run(cmd, capture_output=True, check=True, text=True)
        return True
    except (FileNotFoundError, subprocess.CalledProcessError):
        return False


def _render_wav(
    source_path: Path,
    target_path: Path,
    sample_rate: int,
    channels: int,
    sample_fmt: str,
    audio_filter: str = "",
) -> bool:
    target_path.parent.mkdir(parents=True, exist_ok=True)
    cmd = [
        settings.ffmpeg_bin,
        "-y",
        "-i",
        str(source_path),
        "-ar",
        str(sample_rate),
        "-ac",
        str(channels),
        "-sample_fmt",
        sample_fmt,
    ]
    if audio_filter:
        cmd += ["-af", audio_filter]
    cmd.append(str(target_path))
    return _run_command(cmd)


def _probe_with_ffprobe(path: Path) -> dict[str, Any]:
    cmd = [
        settings.ffprobe_bin,
        "-v",
        "error",
        "-show_streams",
        "-show_format",
        "-of",
        "json",
        str(path),
    ]
    try:
        result = subprocess.run(cmd, capture_output=True, check=True, text=True)
        payload = json.loads(result.stdout or "{}")
    except (FileNotFoundError, subprocess.CalledProcessError, json.JSONDecodeError):
        return {}
    streams = payload.get("streams") or []
    audio_stream = next((s for s in streams if s.get("codec_type") == "audio"), {})
    fmt = payload.get("format") or {}
    return {
        "duration_seconds": int(float(audio_stream.get("duration") or fmt.get("duration") or 0.0)),
        "sample_rate": int(audio_stream.get("sample_rate") or 0),
        "channels": int(audio_stream.get("channels") or 0),
        "sample_fmt": str(audio_stream.get("sample_fmt") or ""),
        "codec_name": str(audio_stream.get("codec_name") or ""),
        "bit_rate": int(audio_stream.get("bit_rate") or fmt.get("bit_rate") or 0),
    }


def analyze_wav(wav_path: Path) -> dict[str, Any]:
    probe = _probe_with_ffprobe(wav_path)
    if probe:
        return probe
    with wave.open(str(wav_path), "rb") as wf:
        frames = wf.getnframes()
        sample_rate = wf.getframerate()
        channels = wf.getnchannels()
        duration = int(frames / sample_rate) if sample_rate > 0 else 0
    return {
        "duration_seconds": duration,
        "sample_rate": sample_rate,
        "channels": channels,
        "sample_fmt": "",
        "codec_name": "pcm",
        "bit_rate": 0,
    }


def build_audio_derivatives(ava_slug: str, source_path: Path) -> dict[str, Any]:
    analysis_dir = ANALYSIS_ROOT / ava_slug
    archive_dir = ARCHIVE_ROOT / ava_slug
    immersive_dir = IMMERSIVE_ROOT / ava_slug
    analysis_path = analysis_dir / f"{source_path.stem}-analysis.wav"
    archival_path = archive_dir / f"{source_path.stem}-archival.wav"
    immersive_path = immersive_dir / f"{source_path.stem}-immersive.wav"

    analysis_ok = _render_wav(
        source_path=source_path,
        target_path=analysis_path,
        sample_rate=settings.analysis_sample_rate,
        channels=settings.analysis_channels,
        sample_fmt=settings.analysis_sample_fmt,
    )

    archival_ok = False
    if settings.enable_archival_derivative:
        archival_ok = _render_wav(
            source_path=source_path,
            target_path=archival_path,
            sample_rate=settings.archival_sample_rate,
            channels=settings.archival_channels,
            sample_fmt=settings.archival_sample_fmt,
        )

    immersive_ok = False
    if settings.enable_immersive_derivative:
        immersive_source = archival_path if archival_ok else source_path
        # Keep this conservative: preserve signal integrity while preparing a stereo immersive-ready asset.
        immersive_ok = _render_wav(
            source_path=immersive_source,
            target_path=immersive_path,
            sample_rate=settings.immersive_sample_rate,
            channels=settings.immersive_channels,
            sample_fmt=settings.immersive_sample_fmt,
            audio_filter="alimiter=limit=0.95",
        )

    source_probe = _probe_with_ffprobe(source_path)
    quality_report = {
        "quality_profile": settings.audio_quality_profile,
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "source_probe": source_probe,
        "targets": {
            "analysis": {
                "sample_rate": settings.analysis_sample_rate,
                "channels": settings.analysis_channels,
                "sample_fmt": settings.analysis_sample_fmt,
                "path": str(analysis_path) if analysis_ok else "",
                "available": analysis_ok,
                "probe": analyze_wav(analysis_path) if analysis_ok else {},
            },
            "archival": {
                "sample_rate": settings.archival_sample_rate,
                "channels": settings.archival_channels,
                "sample_fmt": settings.archival_sample_fmt,
                "path": str(archival_path) if archival_ok else "",
                "available": archival_ok,
                "probe": analyze_wav(archival_path) if archival_ok else {},
            },
            "immersive": {
                "sample_rate": settings.immersive_sample_rate,
                "channels": settings.immersive_channels,
                "sample_fmt": settings.immersive_sample_fmt,
                "path": str(immersive_path) if immersive_ok else "",
                "available": immersive_ok,
                "probe": analyze_wav(immersive_path) if immersive_ok else {},
            },
        },
    }
    return {
        "quality_profile": settings.audio_quality_profile,
        "analysis_wav_path": analysis_path if analysis_ok else None,
        "archival_wav_path": archival_path if archival_ok else None,
        "immersive_wav_path": immersive_path if immersive_ok else None,
        "quality_report": quality_report,
    }


def segment_wav(ava_slug: str, wav_path: Path, segment_seconds: int = 30) -> list[Path]:
    target_dir = SEGMENT_ROOT / ava_slug / wav_path.stem
    target_dir.mkdir(parents=True, exist_ok=True)
    pattern = target_dir / "seg-%03d.wav"
    cmd = [
        settings.ffmpeg_bin,
        "-y",
        "-i",
        str(wav_path),
        "-f",
        "segment",
        "-segment_time",
        str(segment_seconds),
        "-c",
        "copy",
        str(pattern),
    ]
    if _run_command(cmd):
        return sorted(target_dir.glob("seg-*.wav"))
    return [wav_path]


def extract_voice_features(wav_path: Path) -> dict[str, Any]:
    base_stats = analyze_wav(wav_path)
    try:
        import librosa  # type: ignore
        import numpy as np  # type: ignore

        y, sr = librosa.load(str(wav_path), sr=settings.analysis_sample_rate, mono=True)
        pitch, _, _ = librosa.pyin(y, fmin=librosa.note_to_hz("C2"), fmax=librosa.note_to_hz("C7"))
        pitch_clean = pitch[~np.isnan(pitch)] if pitch is not None else np.array([])
        pitch_mean = float(np.mean(pitch_clean)) if pitch_clean.size else 0.0
        pitch_std = float(np.std(pitch_clean)) if pitch_clean.size else 0.0
        rms = librosa.feature.rms(y=y)[0]
        zcr = librosa.feature.zero_crossing_rate(y)[0]
        return {
            **base_stats,
            "feature_backend": "librosa",
            "pitch_mean_hz": round(pitch_mean, 2),
            "pitch_std_hz": round(pitch_std, 2),
            "rms_mean": round(float(np.mean(rms)), 6),
            "zcr_mean": round(float(np.mean(zcr)), 6),
        }
    except Exception:
        return {
            **base_stats,
            "feature_backend": "basic",
            "pitch_mean_hz": 0.0,
            "pitch_std_hz": 0.0,
            "rms_mean": 0.0,
            "zcr_mean": 0.0,
        }


def transcribe_to_midi(wav_path: Path, output_dir: Path | None = None) -> dict:
    """Transcribe audio to MIDI using Spotify Basic Pitch (polyphonic, instrument-agnostic).

    Requires the .venv312 virtualenv with basic-pitch installed.
    The analysis WAV (22050 Hz mono) is the ideal input.
    Returns dict: midi_path, note_count, backend, error.
    """
    venv_python = Path(__file__).resolve().parents[3] / ".venv312" / "bin" / "python3.12"
    if not venv_python.exists():
        return {"backend": "basic_pitch", "midi_path": "", "note_count": 0,
                "error": f"venv312 not found at {venv_python.parent}"}

    out_dir = output_dir or wav_path.parent / "midi"
    out_dir.mkdir(parents=True, exist_ok=True)

    try:
        result = subprocess.run(
            [str(venv_python), "-m", "basic_pitch", str(out_dir), str(wav_path)],
            capture_output=True,
            text=True,
            timeout=120,
        )
        if result.returncode != 0:
            return {"backend": "basic_pitch", "midi_path": "", "note_count": 0,
                    "error": result.stderr[:500]}

        midi_files = sorted(out_dir.glob(f"{wav_path.stem}*.mid"))
        if not midi_files:
            return {"backend": "basic_pitch", "midi_path": "", "note_count": 0,
                    "error": "no MIDI output generated"}

        midi_path = midi_files[0]
        note_count = -1
        try:
            import mido  # type: ignore
            mid = mido.MidiFile(str(midi_path))
            note_count = sum(
                1 for track in mid.tracks for msg in track
                if msg.type == "note_on" and msg.velocity > 0
            )
        except Exception:
            pass

        return {
            "backend": "basic_pitch",
            "midi_path": str(midi_path),
            "note_count": note_count,
            "error": "",
        }
    except subprocess.TimeoutExpired:
        return {"backend": "basic_pitch", "midi_path": "", "note_count": 0, "error": "timeout"}
    except Exception as e:
        return {"backend": "basic_pitch", "midi_path": "", "note_count": 0, "error": str(e)}


def update_use_profile(
    profile_row: AVAUseProfile | None,
    stats: dict[str, Any],
    transcript_excerpt: str,
    segment_count: int,
    quality_profile: str,
    quality_report: dict[str, Any],
) -> AVAUseProfile:
    now = datetime.now(timezone.utc).isoformat()
    source_probe = quality_report.get("source_probe") or {}
    targets = quality_report.get("targets") or {}
    archival_available = bool(targets.get("archival", {}).get("available"))
    immersive_available = bool(targets.get("immersive", {}).get("available"))

    if profile_row is None:
        profile = {
            "upload_count": 1,
            "total_duration_seconds": int(stats.get("duration_seconds", 0)),
            "sample_rates_seen": sorted({int(stats.get("sample_rate", 0))}),
            "channels_seen": sorted({int(stats.get("channels", 0))}),
            "latest_transcript_preview": transcript_excerpt[:220],
            "feature_backend": stats.get("feature_backend", "basic"),
            "pitch_mean_hz": stats.get("pitch_mean_hz", 0.0),
            "pitch_std_hz": stats.get("pitch_std_hz", 0.0),
            "rms_mean": stats.get("rms_mean", 0.0),
            "zcr_mean": stats.get("zcr_mean", 0.0),
            "segments_processed": int(segment_count),
            "quality_profiles_seen": [quality_profile],
            "archival_assets_count": 1 if archival_available else 0,
            "immersive_assets_count": 1 if immersive_available else 0,
            "max_source_sample_rate": int(source_probe.get("sample_rate") or 0),
            "last_quality_report": quality_report,
            "last_updated_utc": now,
        }
        return AVAUseProfile(profile_json=json.dumps(profile))

    profile = json.loads(profile_row.profile_json or "{}")
    profile["upload_count"] = int(profile.get("upload_count", 0)) + 1
    profile["total_duration_seconds"] = int(profile.get("total_duration_seconds", 0)) + int(
        stats.get("duration_seconds", 0)
    )

    sample_rates = set(profile.get("sample_rates_seen", []))
    sample_rates.add(int(stats.get("sample_rate", 0)))
    profile["sample_rates_seen"] = sorted(sample_rates)

    channels = set(profile.get("channels_seen", []))
    channels.add(int(stats.get("channels", 0)))
    profile["channels_seen"] = sorted(channels)

    quality_profiles = set(profile.get("quality_profiles_seen", []))
    quality_profiles.add(quality_profile)
    profile["quality_profiles_seen"] = sorted(quality_profiles)

    profile["latest_transcript_preview"] = transcript_excerpt[:220]
    profile["feature_backend"] = stats.get("feature_backend", profile.get("feature_backend", "basic"))
    profile["pitch_mean_hz"] = stats.get("pitch_mean_hz", profile.get("pitch_mean_hz", 0.0))
    profile["pitch_std_hz"] = stats.get("pitch_std_hz", profile.get("pitch_std_hz", 0.0))
    profile["rms_mean"] = stats.get("rms_mean", profile.get("rms_mean", 0.0))
    profile["zcr_mean"] = stats.get("zcr_mean", profile.get("zcr_mean", 0.0))
    profile["segments_processed"] = int(profile.get("segments_processed", 0)) + int(segment_count)
    profile["archival_assets_count"] = int(profile.get("archival_assets_count", 0)) + (1 if archival_available else 0)
    profile["immersive_assets_count"] = int(profile.get("immersive_assets_count", 0)) + (
        1 if immersive_available else 0
    )
    profile["max_source_sample_rate"] = max(
        int(profile.get("max_source_sample_rate", 0)),
        int(source_probe.get("sample_rate") or 0),
    )
    profile["last_quality_report"] = quality_report
    profile["last_updated_utc"] = now
    profile_row.profile_json = json.dumps(profile)
    return profile_row
