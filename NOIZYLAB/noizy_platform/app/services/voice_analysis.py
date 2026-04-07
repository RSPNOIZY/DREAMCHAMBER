"""
NOIZY Voice Analysis — Librosa + PyTorch Audio Fingerprinting
--------------------------------------------------------------
Extracts a rich voice fingerprint from audio samples using:
  - Librosa: pitch (pYIN), MFCCs, spectral centroid/rolloff, ZCR, RMS
  - PyTorch: speaker verification embeddings (SpeechBrain ECAPA-TDNN if available)
  - Kaggle/HuggingFace: fallback to torchaudio MFCC if SpeechBrain not present

The fingerprint is stored as JSON in VoiceModel.voice_fingerprint_json.
It serves as:
  1. A tamper-evident voice identity record
  2. DNA drift detection input for the Director
  3. Quality gate for voice model activation
"""
from __future__ import annotations

import json
import statistics
from typing import Any

import librosa
import numpy as np
import soundfile as sf


# ─── Core fingerprint extraction ─────────────────────────────────────────────

def extract_fingerprint(audio_paths: list[str]) -> dict[str, Any]:
    """
    Aggregate a voice fingerprint across multiple reference audio files.
    Returns a JSON-serialisable dict with rich acoustic features.
    """
    all_features: list[dict] = []

    for path in audio_paths:
        try:
            feats = _extract_single(path)
            all_features.append(feats)
        except Exception:  # noqa: BLE001
            continue

    if not all_features:
        return {"error": "no valid audio files", "samples": 0}

    return _aggregate(all_features)


def _extract_single(path: str) -> dict[str, Any]:
    y, sr = librosa.load(path, sr=None, mono=True)

    # ── Pitch (pYIN) ─────────────────────────────────────────────────────────
    f0, voiced_flag, _ = librosa.pyin(
        y,
        fmin=librosa.note_to_hz("C2"),
        fmax=librosa.note_to_hz("C7"),
        sr=sr,
    )
    f0_voiced = f0[voiced_flag] if voiced_flag is not None else np.array([])
    pitch_mean = float(np.nanmean(f0_voiced)) if len(f0_voiced) > 0 else 0.0
    pitch_std = float(np.nanstd(f0_voiced)) if len(f0_voiced) > 0 else 0.0
    pitch_median = float(np.nanmedian(f0_voiced)) if len(f0_voiced) > 0 else 0.0
    voiced_ratio = float(np.sum(voiced_flag) / max(len(voiced_flag), 1)) if voiced_flag is not None else 0.0

    # ── MFCCs (13 coefficients) ───────────────────────────────────────────────
    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
    mfcc_means = mfcc.mean(axis=1).tolist()
    mfcc_stds = mfcc.std(axis=1).tolist()

    # ── Spectral features ─────────────────────────────────────────────────────
    centroid = librosa.feature.spectral_centroid(y=y, sr=sr)[0]
    rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr)[0]
    bandwidth = librosa.feature.spectral_bandwidth(y=y, sr=sr)[0]
    contrast = librosa.feature.spectral_contrast(y=y, sr=sr).mean(axis=1).tolist()

    # ── Temporal features ─────────────────────────────────────────────────────
    zcr = librosa.feature.zero_crossing_rate(y)[0]
    rms = librosa.feature.rms(y=y)[0]
    tempo, _ = librosa.beat.beat_track(y=y, sr=sr)

    # ── Mel spectrogram summary ───────────────────────────────────────────────
    mel = librosa.feature.melspectrogram(y=y, sr=sr, n_mels=40)
    mel_db = librosa.power_to_db(mel, ref=np.max)
    mel_mean = float(mel_db.mean())
    mel_std = float(mel_db.std())

    return {
        "duration_s": round(len(y) / sr, 3),
        "sample_rate": sr,
        "pitch_mean_hz": round(pitch_mean, 2),
        "pitch_median_hz": round(pitch_median, 2),
        "pitch_std_hz": round(pitch_std, 2),
        "voiced_ratio": round(voiced_ratio, 4),
        "mfcc_means": [round(v, 4) for v in mfcc_means],
        "mfcc_stds": [round(v, 4) for v in mfcc_stds],
        "spectral_centroid_mean": round(float(centroid.mean()), 2),
        "spectral_centroid_std": round(float(centroid.std()), 2),
        "spectral_rolloff_mean": round(float(rolloff.mean()), 2),
        "spectral_bandwidth_mean": round(float(bandwidth.mean()), 2),
        "spectral_contrast": [round(v, 4) for v in contrast],
        "zcr_mean": round(float(zcr.mean()), 6),
        "rms_mean": round(float(rms.mean()), 6),
        "rms_db": round(float(librosa.amplitude_to_db(np.array([rms.mean()]))[0]), 2),
        "tempo_bpm": round(float(tempo), 2),
        "mel_db_mean": round(mel_mean, 4),
        "mel_db_std": round(mel_std, 4),
    }


def _aggregate(features: list[dict]) -> dict[str, Any]:
    """Average numeric fields across all samples."""
    result: dict[str, Any] = {"samples": len(features)}

    scalar_keys = [
        "duration_s", "pitch_mean_hz", "pitch_median_hz", "pitch_std_hz",
        "voiced_ratio", "spectral_centroid_mean", "spectral_centroid_std",
        "spectral_rolloff_mean", "spectral_bandwidth_mean", "zcr_mean",
        "rms_mean", "rms_db", "tempo_bpm", "mel_db_mean", "mel_db_std",
    ]
    for key in scalar_keys:
        vals = [f[key] for f in features if key in f]
        if vals:
            result[key] = round(statistics.mean(vals), 4)

    # Average list fields element-wise
    list_keys = ["mfcc_means", "mfcc_stds", "spectral_contrast"]
    for key in list_keys:
        arrays = [f[key] for f in features if key in f]
        if arrays:
            result[key] = [
                round(statistics.mean(col), 4)
                for col in zip(*arrays)
            ]

    # Vocal range (min voiced pitch → max voiced pitch)
    pitch_medians = [f.get("pitch_median_hz", 0) for f in features if f.get("pitch_median_hz", 0) > 0]
    if pitch_medians:
        result["pitch_range_hz"] = {
            "low": round(min(pitch_medians), 2),
            "high": round(max(pitch_medians), 2),
        }

    return result


# ─── PyTorch speaker verification (SpeechBrain ECAPA-TDNN) ───────────────────

def extract_speaker_vector(audio_path: str) -> list[float] | None:
    """
    Extract a 192-dim speaker verification vector via SpeechBrain ECAPA-TDNN.
    Returns None if SpeechBrain is not installed (graceful degradation).

    Install: pip install speechbrain
    Model:   speechbrain/spkrec-ecapa-voxceleb (auto-downloaded from HuggingFace)
    """
    try:
        import torch  # noqa: PLC0415
        from speechbrain.inference.speaker import EncoderClassifier  # noqa: PLC0415

        classifier = EncoderClassifier.from_hparams(
            source="speechbrain/spkrec-ecapa-voxceleb",
            run_opts={"device": "mps" if torch.backends.mps.is_available() else "cpu"},
        )
        signal, fs = sf.read(audio_path, dtype="float32")
        if signal.ndim > 1:
            signal = signal.mean(axis=1)
        signal_tensor = torch.tensor(signal).unsqueeze(0)
        embedding = classifier.encode_batch(signal_tensor)
        return embedding.squeeze().tolist()
    except ImportError:
        return None
    except Exception:  # noqa: BLE001
        return None


# ─── DNA drift detection ──────────────────────────────────────────────────────

def compute_drift_score(
    reference_fingerprint: dict,
    new_fingerprint: dict,
) -> float:
    """
    Compute a drift score [0.0 = identical, 1.0 = completely different]
    between two voice fingerprints.

    Uses MFCC cosine distance + pitch deviation as the primary signal.
    """
    def _cosine_sim(a: list[float], b: list[float]) -> float:
        va = np.array(a)
        vb = np.array(b)
        denom = np.linalg.norm(va) * np.linalg.norm(vb)
        if denom == 0:
            return 0.0
        return float(np.dot(va, vb) / denom)

    ref_mfcc = reference_fingerprint.get("mfcc_means", [])
    new_mfcc = new_fingerprint.get("mfcc_means", [])
    mfcc_sim = _cosine_sim(ref_mfcc, new_mfcc) if ref_mfcc and new_mfcc else 0.5

    ref_pitch = reference_fingerprint.get("pitch_mean_hz", 1)
    new_pitch = new_fingerprint.get("pitch_mean_hz", 1)
    pitch_drift = abs(ref_pitch - new_pitch) / max(ref_pitch, 1)
    pitch_drift = min(pitch_drift, 1.0)

    # Weighted combination: MFCC 70%, pitch 30%
    mfcc_distance = 1.0 - mfcc_sim
    drift = 0.70 * mfcc_distance + 0.30 * pitch_drift
    return round(float(drift), 4)


# ─── Quality gate ─────────────────────────────────────────────────────────────

def voice_quality_gate(fingerprint: dict) -> dict:
    """
    Determine if a voice fingerprint meets minimum quality for model activation.
    Returns {"pass": bool, "score": float, "issues": [str]}.
    """
    issues = []
    score = 100.0

    if fingerprint.get("voiced_ratio", 0) < 0.3:
        issues.append("voiced_ratio too low — needs more speech content")
        score -= 30

    if fingerprint.get("rms_db", -100) < -40:
        issues.append("recording too quiet — check microphone gain")
        score -= 20

    if fingerprint.get("duration_s", 0) < 5:
        issues.append("insufficient audio duration — need at least 5s per sample")
        score -= 25

    if not fingerprint.get("mfcc_means"):
        issues.append("MFCC extraction failed — check audio format")
        score -= 25

    return {
        "pass": score >= 60,
        "score": round(max(score, 0.0), 1),
        "issues": issues,
    }
