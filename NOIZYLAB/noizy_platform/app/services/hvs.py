"""
NOIZY HVS — Human Voice Signature Engine
-----------------------------------------
The HVS is the living biometric identity of a creator's voice.
It goes far beyond Librosa features into neural territory:

  Layer 1 — Acoustic (Librosa)          → pitch, MFCCs, spectral, temporal
  Layer 2 — Neural (WavLM/wav2vec2)     → 768-dim contextualized embeddings
  Layer 3 — Emotional (SpeechBrain)     → 4-class emotion distribution
  Layer 4 — Vocal Health               → fatigue, strain, breathiness, jitter
  Layer 5 — Identity (ECAPA-TDNN)       → 192-dim speaker verification vector
  Layer 6 — Narrative (Claude API)      → plain-language HVS report

Model sources (all HuggingFace, auto-download on first use):
  microsoft/wavlm-base                          ~360 MB
  speechbrain/emotion-recognition-wav2vec2-IEMOCAP  ~350 MB
  speechbrain/spkrec-ecapa-voxceleb              ~150 MB

Kaggle integration:
  Common Voice dataset accessible via `datasets` library for
  cross-reference validation and accent profiling.
"""
from __future__ import annotations

import json
import os
import statistics
from typing import Any

import librosa
import numpy as np
import soundfile as sf

from .voice_analysis import extract_fingerprint, compute_drift_score


# ─── Layer 2: WavLM / wav2vec2 neural embeddings ──────────────────────────────

def extract_wavlm_embedding(audio_path: str) -> list[float] | None:
    """
    Extract a 768-dim WavLM-Base embedding from audio.
    Mean-pools the last 4 hidden states for robustness.

    Requires: pip install transformers torch torchaudio
    Model:    microsoft/wavlm-base (HuggingFace, ~360 MB)
    """
    try:
        import torch  # noqa: PLC0415
        from transformers import WavLMModel, AutoFeatureExtractor  # noqa: PLC0415

        model_id = "microsoft/wavlm-base"
        cache_dir = os.path.expanduser("~/.noizy/models/wavlm")

        feature_extractor = AutoFeatureExtractor.from_pretrained(model_id, cache_dir=cache_dir)
        model = WavLMModel.from_pretrained(model_id, cache_dir=cache_dir)
        model.eval()

        signal, sr = sf.read(audio_path, dtype="float32")
        if signal.ndim > 1:
            signal = signal.mean(axis=1)

        # Resample to 16kHz (WavLM expectation)
        if sr != 16000:
            signal = librosa.resample(signal, orig_sr=sr, target_sr=16000)

        inputs = feature_extractor(signal, sampling_rate=16000, return_tensors="pt")

        with torch.no_grad():
            outputs = model(**inputs, output_hidden_states=True)

        # Mean-pool last 4 hidden states
        last_4 = torch.stack(outputs.hidden_states[-4:])  # (4, 1, T, 768)
        embedding = last_4.mean(dim=0).mean(dim=1).squeeze(0)  # (768,)
        return embedding.tolist()

    except ImportError:
        return None
    except Exception:  # noqa: BLE001
        return None


# ─── Layer 3: Emotion classification ─────────────────────────────────────────

def classify_emotion(audio_path: str) -> dict[str, float] | None:
    """
    Classify vocal emotion using SpeechBrain's IEMOCAP wav2vec2 model.
    Returns probability distribution over: neutral, happy, angry, sad.

    Requires: pip install speechbrain
    Model:    speechbrain/emotion-recognition-wav2vec2-IEMOCAP (HuggingFace)
    """
    try:
        import torch  # noqa: PLC0415
        from speechbrain.inference.interfaces import foreign_class  # noqa: PLC0415

        cache_dir = os.path.expanduser("~/.noizy/models/emotion")
        classifier = foreign_class(
            source="speechbrain/emotion-recognition-wav2vec2-IEMOCAP",
            pymodule_file="custom_interface.py",
            classname="CustomEncoderWav2vec2Classifier",
            savedir=cache_dir,
            run_opts={"device": "mps" if torch.backends.mps.is_available() else "cpu"},
        )

        signal, sr = sf.read(audio_path, dtype="float32")
        if signal.ndim > 1:
            signal = signal.mean(axis=1)
        if sr != 16000:
            signal = librosa.resample(signal, orig_sr=sr, target_sr=16000)

        signal_tensor = torch.tensor(signal).unsqueeze(0)
        out_prob, score, index, text_lab = classifier.classify_batch(signal_tensor)

        # out_prob shape: (1, n_classes)
        probs = out_prob.squeeze(0).tolist()
        labels = ["neutral", "happy", "angry", "sad"]
        return dict(zip(labels, [round(p, 4) for p in probs]))

    except ImportError:
        return None
    except Exception:  # noqa: BLE001
        return None


# ─── Layer 4: Vocal health scoring ───────────────────────────────────────────

def compute_vocal_health(audio_path: str) -> dict[str, Any]:
    """
    Compute a multi-dimensional vocal health score from acoustic features.
    All metrics normalized to 0.0–1.0 (higher = healthier/better).

    Dimensions:
      pitch_stability   — low jitter = stable, healthy vocal fold vibration
      breathiness       — low spectral tilt = clear phonation (not breathy)
      effort_level      — RMS + spectral centroid composite (0=whisper, 1=belt)
      hnr_approx        — harmonics-to-noise ratio approximation
      dynamic_range     — RMS variance (expressive vs monotone)
      vocal_fatigue     — combined jitter + shimmer proxy (high = fatigued)
    """
    y, sr = librosa.load(audio_path, sr=None, mono=True)

    # Pitch jitter (f0 variance as proxy for fold instability)
    f0, voiced_flag, _ = librosa.pyin(
        y,
        fmin=librosa.note_to_hz("C2"),
        fmax=librosa.note_to_hz("C7"),
        sr=sr,
    )
    f0_voiced = f0[voiced_flag] if voiced_flag is not None else np.array([])
    pitch_std = float(np.nanstd(f0_voiced)) if len(f0_voiced) > 1 else 99.0
    pitch_mean = float(np.nanmean(f0_voiced)) if len(f0_voiced) > 0 else 1.0
    # Normalize: <5% CV = perfect, >30% = very unstable
    cv = pitch_std / max(pitch_mean, 1.0)
    pitch_stability = round(max(0.0, min(1.0, 1.0 - cv * 3.33)), 4)

    # Breathiness via spectral tilt (rolloff vs centroid gap)
    centroid = librosa.feature.spectral_centroid(y=y, sr=sr)[0].mean()
    rolloff  = librosa.feature.spectral_rolloff(y=y, sr=sr)[0].mean()
    tilt = float(rolloff - centroid)
    # High tilt = breathy/airy, low tilt = full/clear
    # Normalize to Nyquist
    max_tilt = sr / 2
    breathiness_raw = min(tilt / max_tilt, 1.0)
    breathiness = round(1.0 - breathiness_raw, 4)  # invert: 1 = clear

    # Effort level (RMS × spectral centroid composite)
    rms = float(librosa.feature.rms(y=y)[0].mean())
    rms_db = float(librosa.amplitude_to_db(np.array([rms]))[0])
    # Map -60dB (whisper) to 0dB (belt) → 0.0–1.0
    effort_level = round(max(0.0, min(1.0, (rms_db + 60) / 60)), 4)

    # HNR approximation via autocorrelation
    # True HNR requires more complex analysis; approximate via ZCR + spectral flatness
    zcr = float(librosa.feature.zero_crossing_rate(y)[0].mean())
    flatness = float(librosa.feature.spectral_flatness(y=y)[0].mean())
    # Low flatness + low ZCR = tonal/harmonic → healthy
    hnr_approx = round(max(0.0, min(1.0, (1.0 - flatness) * (1.0 - min(zcr * 10, 1.0)))), 4)

    # Dynamic range (RMS variance — expressive voice)
    rms_frames = librosa.feature.rms(y=y)[0]
    rms_var = float(rms_frames.std() / max(rms_frames.mean(), 1e-10))
    dynamic_range = round(min(rms_var * 5, 1.0), 4)  # normalize

    # Vocal fatigue proxy: high jitter + low HNR + high ZCR
    fatigue_raw = (cv * 0.5) + ((1.0 - hnr_approx) * 0.3) + (min(zcr * 10, 1.0) * 0.2)
    vocal_fatigue = round(min(fatigue_raw, 1.0), 4)

    # Composite health score (weighted)
    health_score = round(
        pitch_stability * 0.30
        + breathiness * 0.20
        + hnr_approx * 0.25
        + (1.0 - vocal_fatigue) * 0.25,
        4
    )

    return {
        "health_score": health_score,
        "pitch_stability": pitch_stability,
        "breathiness": breathiness,        # 1.0 = clear, 0.0 = very breathy
        "effort_level": effort_level,      # 1.0 = full belt, 0.0 = whisper
        "hnr_approx": hnr_approx,          # harmonics vs noise
        "dynamic_range": dynamic_range,    # expressive range
        "vocal_fatigue": vocal_fatigue,    # 0.0 = fresh, 1.0 = fatigued
        "rms_db": round(rms_db, 2),
        "duration_s": round(len(y) / sr, 3),
    }


# ─── Layer 5: full HVS assembly ───────────────────────────────────────────────

def build_hvs(audio_paths: list[str], existing_fingerprint: dict | None = None) -> dict[str, Any]:
    """
    Assemble a complete Human Voice Signature from multiple audio samples.
    Runs all five acoustic/neural layers and computes drift vs baseline.
    """
    if not audio_paths:
        return {"error": "no audio paths provided"}

    # Layer 1: Librosa acoustic fingerprint
    acoustic = extract_fingerprint(audio_paths)

    # Layer 2: WavLM neural embedding (use first valid sample)
    wavlm_embedding = None
    for p in audio_paths:
        wavlm_embedding = extract_wavlm_embedding(p)
        if wavlm_embedding:
            break

    # Layer 3: Emotion distribution (aggregate across samples)
    emotion_distributions: list[dict] = []
    for p in audio_paths:
        ed = classify_emotion(p)
        if ed:
            emotion_distributions.append(ed)

    emotion_aggregate: dict = {}
    if emotion_distributions:
        for label in ("neutral", "happy", "angry", "sad"):
            vals = [d.get(label, 0.0) for d in emotion_distributions]
            emotion_aggregate[label] = round(statistics.mean(vals), 4)

    # Layer 4: Vocal health (aggregate across samples)
    health_records: list[dict] = []
    for p in audio_paths:
        try:
            h = compute_vocal_health(p)
            health_records.append(h)
        except Exception:  # noqa: BLE001
            continue

    vocal_health: dict = {}
    if health_records:
        for key in ("health_score", "pitch_stability", "breathiness", "effort_level",
                    "hnr_approx", "dynamic_range", "vocal_fatigue", "rms_db"):
            vals = [r.get(key, 0.0) for r in health_records if key in r]
            if vals:
                vocal_health[key] = round(statistics.mean(vals), 4)

    # Drift vs baseline
    drift_score = None
    drift_alert = None
    if existing_fingerprint and existing_fingerprint.get("mfcc_means"):
        drift_score = compute_drift_score(existing_fingerprint, acoustic)
        if drift_score > 0.30:
            drift_alert = {
                "level": "HIGH" if drift_score > 0.50 else "MODERATE",
                "score": drift_score,
                "message": f"Voice DNA deviation {drift_score*100:.1f}% — significant acoustic shift detected. This may indicate vocal fatigue, illness, or identity change.",
            }
        elif drift_score > 0.15:
            drift_alert = {
                "level": "LOW",
                "score": drift_score,
                "message": f"Minor voice drift {drift_score*100:.1f}% — within normal session variation.",
            }

    # Voice type classification from acoustic features
    voice_type = _classify_voice_type(acoustic, vocal_health)

    hvs = {
        "version": "1.0",
        "samples_analyzed": len(audio_paths),
        "voice_type": voice_type,
        "acoustic_fingerprint": acoustic,
        "neural_embedding_dim": len(wavlm_embedding) if wavlm_embedding else 0,
        "neural_embedding_available": wavlm_embedding is not None,
        # Store compressed embedding summary (not the full 768d vector in DB — too large)
        "neural_embedding_norm": round(float(np.linalg.norm(np.array(wavlm_embedding))), 4)
        if wavlm_embedding else None,
        "emotion_distribution": emotion_aggregate or None,
        "dominant_emotion": max(emotion_aggregate, key=lambda k: emotion_aggregate[k])
        if emotion_aggregate else None,
        "vocal_health": vocal_health or None,
        "drift": {
            "score": drift_score,
            "alert": drift_alert,
        } if drift_score is not None else None,
    }

    return hvs


def _classify_voice_type(acoustic: dict, health: dict) -> dict[str, str]:
    """
    Classify voice into type categories from acoustic features.
    Returns a dict with register, character, texture, and energy descriptors.
    """
    pitch_mean = acoustic.get("pitch_mean_hz", 0)
    pitch_std  = acoustic.get("pitch_std_hz", 0)
    centroid   = acoustic.get("spectral_centroid_mean", 0)
    rms_db     = acoustic.get("rms_db", -30)
    breathiness = health.get("breathiness", 0.5) if health else 0.5
    dynamic_range = health.get("dynamic_range", 0.5) if health else 0.5

    # Register
    if pitch_mean < 100:
        register = "Bass"
    elif pitch_mean < 155:
        register = "Baritone" if pitch_mean < 130 else "Tenor"
    elif pitch_mean < 210:
        register = "Contralto"
    elif pitch_mean < 260:
        register = "Mezzo-Soprano"
    else:
        register = "Soprano"

    # Character (brightness)
    if centroid > 3000:
        character = "Bright / Forward"
    elif centroid > 1800:
        character = "Balanced / Present"
    else:
        character = "Dark / Warm"

    # Texture
    if breathiness < 0.4:
        texture = "Breathy / Airy"
    elif breathiness > 0.75:
        texture = "Clear / Full"
    else:
        texture = "Slightly breathy"

    # Energy
    if rms_db > -15:
        energy = "High energy / Commanding"
    elif rms_db > -25:
        energy = "Medium energy / Conversational"
    else:
        energy = "Low energy / Intimate"

    # Expressiveness
    expressiveness = "Expressive" if dynamic_range > 0.6 else "Controlled" if dynamic_range > 0.3 else "Monotone"

    return {
        "register": register,
        "character": character,
        "texture": texture,
        "energy": energy,
        "expressiveness": expressiveness,
    }


# ─── Layer 6: Claude HVS Narrative ───────────────────────────────────────────

def generate_hvs_narrative(hvs: dict, anthropic_api_key: str) -> str:
    """
    Call Claude API to generate a rich, plain-language HVS report.
    Returns a prose narrative describing the voice, its characteristics,
    strengths, use cases, and any health/drift concerns.
    """
    if not anthropic_api_key:
        return _fallback_narrative(hvs)

    try:
        import anthropic  # noqa: PLC0415

        client = anthropic.Anthropic(api_key=anthropic_api_key)

        voice_type = hvs.get("voice_type", {})
        acoustic = hvs.get("acoustic_fingerprint", {})
        health = hvs.get("vocal_health", {}) or {}
        emotion = hvs.get("emotion_distribution", {}) or {}
        drift = hvs.get("drift") or {}
        drift_alert = drift.get("alert")

        prompt = f"""You are the NOIZYVOX Human Voice Signature Analyst.
You have just analyzed a creator's voice and here are the results:

VOICE TYPE:
- Register: {voice_type.get("register", "unknown")}
- Character: {voice_type.get("character", "unknown")}
- Texture: {voice_type.get("texture", "unknown")}
- Energy: {voice_type.get("energy", "unknown")}
- Expressiveness: {voice_type.get("expressiveness", "unknown")}

ACOUSTIC FINGERPRINT:
- Pitch center: {acoustic.get("pitch_mean_hz", 0):.1f} Hz (median {acoustic.get("pitch_median_hz", 0):.1f} Hz)
- Pitch stability: ±{acoustic.get("pitch_std_hz", 0):.1f} Hz
- Voiced ratio: {acoustic.get("voiced_ratio", 0)*100:.1f}% of recording
- Spectral centroid: {acoustic.get("spectral_centroid_mean", 0):.0f} Hz
- Tempo feel: {acoustic.get("tempo_bpm", 0):.0f} BPM speaking cadence

VOCAL HEALTH:
- Overall health score: {health.get("health_score", 0)*100:.0f}/100
- Pitch stability: {health.get("pitch_stability", 0)*100:.0f}%
- Breathiness: {"clear" if health.get("breathiness", 0) > 0.65 else "slightly breathy" if health.get("breathiness", 0) > 0.35 else "very breathy"}
- Effort level: {health.get("effort_level", 0)*100:.0f}% (0=whisper, 100=belt)
- Dynamic range: {health.get("dynamic_range", 0)*100:.0f}% expressiveness
- Vocal fatigue: {health.get("vocal_fatigue", 0)*100:.0f}% (0=fresh, 100=fatigued)

EMOTIONAL PROFILE:
{json.dumps(emotion, indent=2) if emotion else "Not available"}

{f"DNA DRIFT ALERT: {drift_alert['level']} — {drift_alert['message']}" if drift_alert else "DNA DRIFT: Stable (no baseline comparison)"}

SAMPLES ANALYZED: {hvs.get("samples_analyzed", 0)}
NEURAL EMBEDDING: {"Available (WavLM-Base 768-dim)" if hvs.get("neural_embedding_available") else "Not available (install transformers)"}

Write a rich, warm, professional HVS Narrative Report (250–350 words) that:
1. Opens with a vivid, specific description of what this voice SOUNDS like
2. Identifies the 3 strongest characteristics that make it unique
3. Lists the best use cases (narration types, character archetypes, emotional applications)
4. Notes any vocal health observations with actionable advice
5. Ends with a "Voice Estate Value" assessment — what makes this voice commercially valuable
6. Write in second person ("Your voice...") — speak directly to the creator
7. Use the NOIZY language: HVS, Voice Estate, voice DNA, 75/25 split

Do NOT include headers or bullet points — write as flowing prose."""

        message = client.messages.create(
            model="claude-opus-4-6",
            max_tokens=600,
            messages=[{"role": "user", "content": prompt}],
        )
        return message.content[0].text

    except ImportError:
        return _fallback_narrative(hvs)
    except Exception as exc:  # noqa: BLE001
        return _fallback_narrative(hvs) + f"\n\n[Claude API unavailable: {exc}]"


def _fallback_narrative(hvs: dict) -> str:
    vt = hvs.get("voice_type", {})
    health = hvs.get("vocal_health", {}) or {}
    score = health.get("health_score", 0)
    return (
        f"Human Voice Signature Report\n\n"
        f"Voice register: {vt.get('register', 'unknown')} | "
        f"Character: {vt.get('character', 'unknown')} | "
        f"Texture: {vt.get('texture', 'unknown')}\n"
        f"Energy: {vt.get('energy', 'unknown')} | "
        f"Expressiveness: {vt.get('expressiveness', 'unknown')}\n\n"
        f"Vocal health score: {score*100:.0f}/100\n"
        f"Samples analyzed: {hvs.get('samples_analyzed', 0)}\n\n"
        f"Install the Anthropic SDK (pip install anthropic) and set ANTHROPIC_API_KEY "
        f"for a full Claude-powered narrative report."
    )
