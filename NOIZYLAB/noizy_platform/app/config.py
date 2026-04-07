from functools import lru_cache

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    noizy_api_key: str = "change-me-now"
    database_url: str = "sqlite:///./noizy_platform.db"
    allowed_origins: str = "http://localhost:3000"

    stt_provider: str = "whisper"
    tts_provider: str = "piper"
    n8n_webhook_url: str = ""
    ffmpeg_bin: str = "ffmpeg"
    ffprobe_bin: str = "ffprobe"

    whisper_model: str = "tiny"
    whisper_bin: str = "whisper"
    deepspeech_bin: str = "deepspeech"
    deepspeech_model_path: str = ""

    piper_bin: str = "piper"
    piper_model_path: str = ""
    coqui_server_url: str = "http://localhost:5002"

    av_audio_engine_bin: str = ""
    av_audio_engine_config: str = ""

    audio_quality_profile: str = "future_ready_v1"
    analysis_sample_rate: int = 22050
    analysis_channels: int = 1
    analysis_sample_fmt: str = "s16"
    archival_sample_rate: int = 48000
    archival_channels: int = 2
    archival_sample_fmt: str = "flt"
    immersive_sample_rate: int = 48000
    immersive_channels: int = 2
    immersive_sample_fmt: str = "flt"
    enable_archival_derivative: bool = True
    enable_immersive_derivative: bool = True

    @field_validator("stt_provider")
    @classmethod
    def validate_stt_provider(cls, value: str) -> str:
        normalized = value.lower().strip()
        if normalized not in {"whisper", "deepspeech"}:
            raise ValueError("stt_provider must be 'whisper' or 'deepspeech'")
        return normalized

    @field_validator("tts_provider")
    @classmethod
    def validate_tts_provider(cls, value: str) -> str:
        normalized = value.lower().strip()
        if normalized not in {"piper", "coqui"}:
            raise ValueError("tts_provider must be 'piper' or 'coqui'")
        return normalized

    @field_validator("audio_quality_profile")
    @classmethod
    def validate_audio_quality_profile(cls, value: str) -> str:
        normalized = value.lower().strip()
        if normalized not in {"future_ready_v1", "legacy_v1"}:
            raise ValueError("audio_quality_profile must be 'future_ready_v1' or 'legacy_v1'")
        return normalized

    @property
    def cors_origins(self) -> list[str]:
        origins = [o.strip() for o in self.allowed_origins.split(",") if o.strip()]
        if "*" in origins:
            raise ValueError("Wildcard CORS is blocked. Provide explicit allowlisted origins.")
        return origins


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
