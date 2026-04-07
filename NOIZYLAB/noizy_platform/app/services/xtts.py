"""
NOIZY XTTS v2 Voice Cloning Service
------------------------------------
Wraps Coqui XTTS v2 (via HuggingFace / TTS library) for:
  - Voice model creation from reference audio samples
  - Speaker embedding extraction (gpt_cond_latent + speaker_embedding)
  - Inference: synthesize speech in a cloned voice
  - Streaming-ready inference loop

Model source: tts_models/multilingual/multi-dataset/xtts_v2
HuggingFace: https://huggingface.co/coqui/XTTS-v2

Requires:
  pip install TTS torch torchaudio

Runs locally on M2 Ultra — no cloud dependency.
"""
from __future__ import annotations

import json
import os
import tempfile
from pathlib import Path
from typing import Optional

# Lazy-imported so the service starts even if TTS isn't installed yet
_tts = None
_torch = None


def _get_torch():
    global _torch
    if _torch is None:
        import torch as _t  # noqa: PLC0415
        _torch = _t
    return _torch


def _get_tts_model():
    """Lazy-load XTTS v2. Downloads on first call (~1.8 GB to ~/.local/share/tts)."""
    global _tts
    if _tts is None:
        from TTS.api import TTS  # noqa: PLC0415
        torch = _get_torch()
        device = "mps" if torch.backends.mps.is_available() else "cpu"
        _tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2").to(device)
    return _tts


# ─── Voice embedding extraction ──────────────────────────────────────────────

def extract_speaker_embeddings(
    sample_paths: list[str],
    output_dir: str,
    slug: str,
) -> dict:
    """
    Extract XTTS speaker conditioning tensors from reference audio files.
    Saves gpt_cond_latent + speaker_embedding as .pt files.
    Returns dict with paths and status.
    """
    torch = _get_torch()
    tts = _get_tts_model()

    os.makedirs(output_dir, exist_ok=True)

    # XTTS uses the first valid sample for conditioning
    # We average embeddings from all samples for robustness
    gpt_latents = []
    speaker_embeds = []

    for path in sample_paths:
        if not os.path.exists(path):
            continue
        try:
            gpt_cond, spk_emb = tts.synthesizer.tts_model.get_conditioning_latents(
                audio_path=[path],
                gpt_cond_len=tts.synthesizer.tts_model.config.gpt_cond_len,
                gpt_cond_chunk_len=tts.synthesizer.tts_model.config.gpt_cond_chunk_len,
                max_ref_length=tts.synthesizer.tts_model.config.max_ref_len,
                sound_norm_refs=tts.synthesizer.tts_model.config.sound_norm_refs,
            )
            gpt_latents.append(gpt_cond)
            speaker_embeds.append(spk_emb)
        except Exception as exc:  # noqa: BLE001
            # Skip bad samples, continue with rest
            continue

    if not gpt_latents:
        raise ValueError(f"No valid audio samples processed for slug='{slug}'")

    # Average across samples
    gpt_cond_avg = torch.stack(gpt_latents).mean(dim=0)
    spk_emb_avg = torch.stack(speaker_embeds).mean(dim=0)
    # L2-normalize speaker embedding
    spk_emb_avg = spk_emb_avg / spk_emb_avg.norm()

    gpt_path = os.path.join(output_dir, f"{slug}_gpt_cond.pt")
    spk_path = os.path.join(output_dir, f"{slug}_speaker.pt")

    torch.save(gpt_cond_avg, gpt_path)
    torch.save(spk_emb_avg, spk_path)

    return {
        "gpt_cond_latent_path": gpt_path,
        "speaker_embedding_path": spk_path,
        "samples_used": len(gpt_latents),
        "samples_supplied": len(sample_paths),
    }


# ─── Inference ───────────────────────────────────────────────────────────────

def synthesize_with_clone(
    text: str,
    gpt_cond_latent_path: str,
    speaker_embedding_path: str,
    output_path: str,
    language: str = "en",
    speed: float = 1.0,
) -> dict:
    """
    Synthesize speech using pre-extracted XTTS speaker embeddings.
    Returns dict with output_path and duration_seconds.
    """
    torch = _get_torch()
    tts = _get_tts_model()

    gpt_cond = torch.load(gpt_cond_latent_path, map_location="cpu", weights_only=True)
    spk_emb = torch.load(speaker_embedding_path, map_location="cpu", weights_only=True)

    # Ensure output dir exists
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)

    # XTTS inference
    device = next(tts.synthesizer.tts_model.parameters()).device
    gpt_cond = gpt_cond.to(device)
    spk_emb = spk_emb.to(device)

    out = tts.synthesizer.tts_model.inference(
        text=text,
        language=language,
        gpt_cond_latent=gpt_cond,
        speaker_embedding=spk_emb,
        speed=speed,
        enable_text_splitting=True,
    )

    # out["wav"] is a numpy array or tensor at 24kHz
    import soundfile as sf  # noqa: PLC0415
    import numpy as np  # noqa: PLC0415

    wav = out["wav"]
    if hasattr(wav, "cpu"):
        wav = wav.cpu().numpy()
    wav = np.array(wav, dtype=np.float32)

    sample_rate = 24000  # XTTS v2 native sample rate
    sf.write(output_path, wav, sample_rate)

    duration_seconds = len(wav) / sample_rate

    return {
        "output_path": output_path,
        "duration_seconds": round(duration_seconds, 3),
        "sample_rate": sample_rate,
        "language": language,
    }


# ─── Quick-clone synthesis (reference audio provided directly) ────────────────

def synthesize_from_reference(
    text: str,
    reference_wav_paths: list[str],
    output_path: str,
    language: str = "en",
    speed: float = 1.0,
) -> dict:
    """
    One-shot synthesis: clone voice from reference paths without saving embeddings.
    Useful for quick demos. For registered voices, prefer synthesize_with_clone.
    """
    tts = _get_tts_model()
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)

    tts.tts_to_file(
        text=text,
        speaker_wav=reference_wav_paths,
        language=language,
        file_path=output_path,
        speed=speed,
    )

    import soundfile as sf  # noqa: PLC0415
    info = sf.info(output_path)
    return {
        "output_path": output_path,
        "duration_seconds": round(info.duration, 3),
        "sample_rate": info.samplerate,
        "language": language,
    }


# ─── Model availability check ─────────────────────────────────────────────────

def xtts_available() -> dict:
    """Check if TTS + XTTS v2 is installed. Non-fatal."""
    try:
        import TTS  # noqa: PLC0415, F401
        torch = _get_torch()
        device = "mps" if torch.backends.mps.is_available() else "cpu"
        return {"available": True, "device": device, "version": TTS.__version__}
    except ImportError:
        return {
            "available": False,
            "device": "none",
            "install": "pip install TTS torch torchaudio",
        }
