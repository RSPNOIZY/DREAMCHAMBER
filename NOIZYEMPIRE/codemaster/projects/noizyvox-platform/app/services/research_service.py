from __future__ import annotations

from datetime import datetime, timezone
from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.models.research import ResearchConsent
from app.schemas.research import ResearchConsentUpdate, ResearchAggregateOut


def upsert_consent(db: Session, payload: ResearchConsentUpdate) -> ResearchConsent:
    consent = db.scalar(select(ResearchConsent).where(ResearchConsent.caregiver_id == payload.caregiver_id))
    values = payload.model_dump()

    if consent is None:
        consent = ResearchConsent(
            caregiver_id=payload.caregiver_id,
            share_outcomes=payload.share_outcomes,
            share_trigger_tags=payload.share_trigger_tags,
            share_template_metadata=payload.share_template_metadata,
            consent_version=payload.consent_version,
        )
        db.add(consent)
    else:
        consent.share_outcomes = values["share_outcomes"]
        consent.share_trigger_tags = values["share_trigger_tags"]
        consent.share_template_metadata = values["share_template_metadata"]
        consent.consent_version = values["consent_version"]

    now = datetime.now(timezone.utc)
    if payload.opted_in:
        consent.opted_in_at = consent.opted_in_at or now
        consent.opted_out_at = None
    else:
        consent.opted_out_at = now

    consent.updated_at = now
    db.commit()
    db.refresh(consent)
    return consent


def get_consent(db: Session, caregiver_id: str) -> ResearchConsent | None:
    return db.scalar(select(ResearchConsent).where(ResearchConsent.caregiver_id == caregiver_id))


def aggregate(db: Session) -> ResearchAggregateOut:
    opted_in_count = db.scalar(
        select(func.count(ResearchConsent.id)).where(ResearchConsent.opted_out_at.is_(None))
    ) or 0
    outcomes_count = db.scalar(
        select(func.count(ResearchConsent.id)).where(
            ResearchConsent.opted_out_at.is_(None), ResearchConsent.share_outcomes == True  # noqa: E712
        )
    ) or 0
    trigger_count = db.scalar(
        select(func.count(ResearchConsent.id)).where(
            ResearchConsent.opted_out_at.is_(None), ResearchConsent.share_trigger_tags == True  # noqa: E712
        )
    ) or 0
    template_count = db.scalar(
        select(func.count(ResearchConsent.id)).where(
            ResearchConsent.opted_out_at.is_(None), ResearchConsent.share_template_metadata == True  # noqa: E712
        )
    ) or 0

    return ResearchAggregateOut(
        opted_in_participants=opted_in_count,
        share_outcomes_count=outcomes_count,
        share_trigger_tags_count=trigger_count,
        share_template_metadata_count=template_count,
    )
