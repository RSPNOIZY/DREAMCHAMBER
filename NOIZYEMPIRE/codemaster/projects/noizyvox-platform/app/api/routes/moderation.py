from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.moderation import DecisionCreate, DecisionOut, IncidentCreate, IncidentOut
from app.security import require_admin, require_authenticated
from app.services import moderation_service


router = APIRouter()


@router.post("/incidents", response_model=IncidentOut, status_code=201, summary="Create incident report")
def create_incident(
    payload: IncidentCreate,
    db: Session = Depends(get_db),
    _: str = Depends(require_authenticated),
) -> IncidentOut:
    return moderation_service.create_incident(db, payload)


@router.get("/incidents", response_model=list[IncidentOut], summary="List incidents")
def list_incidents(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    _: str = Depends(require_admin),
) -> list[IncidentOut]:
    return moderation_service.list_incidents(db, status=status)


@router.post(
    "/incidents/{incident_id}/decisions",
    response_model=DecisionOut,
    status_code=201,
    summary="Add moderation decision",
)
def add_decision(
    incident_id: str,
    payload: DecisionCreate,
    db: Session = Depends(get_db),
    _: str = Depends(require_admin),
) -> DecisionOut:
    return moderation_service.add_decision(db, incident_id, payload)


@router.get("/decisions", response_model=list[DecisionOut], summary="List moderation decisions")
def list_decisions(
    incident_id: Optional[str] = None,
    db: Session = Depends(get_db),
    _: str = Depends(require_admin),
) -> list[DecisionOut]:
    return moderation_service.list_decisions(db, incident_id=incident_id)

