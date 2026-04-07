from __future__ import annotations

import hmac
import threading
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import APIKeyHeader

from .config import get_settings


api_key_header = APIKeyHeader(name="x-noizy-api-key", auto_error=False)

# Thread-safe in-memory rate limiter — guards against concurrent request races.
_lock = threading.Lock()
_window_start = datetime.now(timezone.utc)
_requests_in_window = 0
_MAX_REQUESTS_PER_MINUTE = 600

# Minimum acceptable API key length — rejects the "change-me-now" default at startup.
_MIN_KEY_LENGTH = 32


def validate_api_key_strength(key: str) -> None:
    """Raises at startup if the configured API key is too weak."""
    if len(key) < _MIN_KEY_LENGTH or key == "change-me-now":
        raise RuntimeError(
            f"NOIZY API key is too weak or still set to default. "
            f"Set NOIZY_API_KEY to a random string of at least {_MIN_KEY_LENGTH} characters."
        )


def require_api_key(provided_key: Optional[str] = Depends(api_key_header)) -> None:
    settings = get_settings()
    if not provided_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing API key",
        )
    if not hmac.compare_digest(provided_key, settings.noizy_api_key):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key",
        )


def rate_limit_guard() -> None:
    global _window_start, _requests_in_window
    now = datetime.now(timezone.utc)
    with _lock:
        if now - _window_start >= timedelta(minutes=1):
            _window_start = now
            _requests_in_window = 0
        _requests_in_window += 1
        if _requests_in_window > _MAX_REQUESTS_PER_MINUTE:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Rate limit exceeded",
            )

