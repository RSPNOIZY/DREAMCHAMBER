from __future__ import annotations

from typing import Optional

from fastapi import Header, HTTPException, status

from app.core.config import settings


def _extract_token(authorization: Optional[str], x_api_key: Optional[str]) -> Optional[str]:
    if x_api_key:
        return x_api_key.strip()
    if authorization and authorization.lower().startswith("bearer "):
        return authorization[7:].strip()
    return None


def require_authenticated(
    authorization: Optional[str] = Header(default=None),
    x_api_key: Optional[str] = Header(default=None, alias="X-API-Key"),
) -> str:
    if not settings.auth_enabled:
        return "auth-disabled"

    token = _extract_token(authorization=authorization, x_api_key=x_api_key)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication token.",
        )

    if token in settings.api_tokens or token in settings.admin_tokens:
        return token

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid authentication token.",
    )


def require_admin(
    authorization: Optional[str] = Header(default=None),
    x_api_key: Optional[str] = Header(default=None, alias="X-API-Key"),
) -> str:
    token = require_authenticated(authorization=authorization, x_api_key=x_api_key)
    if not settings.auth_enabled:
        return token
    if token in settings.admin_tokens:
        return token
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Admin token required.",
    )

