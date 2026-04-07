from datetime import datetime, timezone

from fastapi import APIRouter

from app.core.config import settings


router = APIRouter()


@router.get("", summary="Health check")
def health_check() -> dict[str, str]:
    return {
        "status": "ok",
        "env": settings.env,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
