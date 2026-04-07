import os
from dataclasses import dataclass


def _env_bool(name: str, default: bool) -> bool:
    raw = os.getenv(name)
    if raw is None:
        return default
    return raw.strip().lower() in {"1", "true", "yes", "on"}


def _env_csv(name: str, default: str) -> list[str]:
    raw = os.getenv(name, default)
    return [item.strip() for item in raw.split(",") if item.strip()]


@dataclass(frozen=True)
class Settings:
    env: str = os.getenv("NOIZYVOX_ENV", "development")
    db_url: str = os.getenv("NOIZYVOX_DB_URL", "sqlite:///./data/noizyvox.db")
    api_prefix: str = os.getenv("NOIZYVOX_API_PREFIX", "/api/v1")
    debug: bool = _env_bool("NOIZYVOX_DEBUG", True)
    auth_enabled: bool = _env_bool("NOIZYVOX_AUTH_ENABLED", True)
    force_https: bool = _env_bool("NOIZYVOX_FORCE_HTTPS", False)
    max_body_bytes: int = int(os.getenv("NOIZYVOX_MAX_BODY_BYTES", "1048576"))
    api_tokens: tuple[str, ...] = tuple(_env_csv("NOIZYVOX_API_TOKENS", "local-dev-token"))
    admin_tokens: tuple[str, ...] = tuple(_env_csv("NOIZYVOX_ADMIN_TOKENS", ""))
    cors_origins: tuple[str, ...] = tuple(
        _env_csv("NOIZYVOX_CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
    )
    allowed_hosts: tuple[str, ...] = tuple(
        _env_csv("NOIZYVOX_ALLOWED_HOSTS", "localhost,127.0.0.1,testserver")
    )


settings = Settings()
