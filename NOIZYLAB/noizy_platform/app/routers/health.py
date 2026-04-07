from datetime import datetime, timezone

from fastapi import APIRouter

from ..schemas import HealthResponse


router = APIRouter(tags=["health"])


@router.get("/healthz", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(status="ok", timestamp=datetime.now(timezone.utc).isoformat())

