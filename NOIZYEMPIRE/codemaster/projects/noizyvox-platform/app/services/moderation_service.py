from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.moderation import IncidentReport, ModerationDecision
from app.schemas.moderation import IncidentCreate, DecisionCreate


def create_incident(db: Session, payload: IncidentCreate) -> IncidentReport:
    incident = IncidentReport(**payload.model_dump())
    db.add(incident)
    db.commit()
    db.refresh(incident)
    return incident


def list_incidents(db: Session, status: str | None = None) -> list[IncidentReport]:
    query = select(IncidentReport)
    if status:
        query = query.where(IncidentReport.status == status)
    return list(db.scalars(query.order_by(IncidentReport.created_at.desc())).all())


def add_decision(db: Session, incident_id: str, payload: DecisionCreate) -> ModerationDecision:
    incident = db.get(IncidentReport, incident_id)
    if incident is None:
        raise ValueError("Incident not found.")

    decision = ModerationDecision(incident_id=incident_id, **payload.model_dump())
    db.add(decision)

    if payload.action in {"pause_content", "require_qa", "escalate_advisory"}:
        incident.status = "escalated"
    elif payload.action in {"close_with_explanation", "clear_flag"}:
        incident.status = "closed"
    elif payload.action == "patch_profile":
        incident.status = "resolved"
    else:
        incident.status = "triaged"

    db.commit()
    db.refresh(decision)
    return decision


def list_decisions(db: Session, incident_id: str | None = None) -> list[ModerationDecision]:
    query = select(ModerationDecision)
    if incident_id:
        query = query.where(ModerationDecision.incident_id == incident_id)
    return list(db.scalars(query.order_by(ModerationDecision.created_at.desc())).all())
