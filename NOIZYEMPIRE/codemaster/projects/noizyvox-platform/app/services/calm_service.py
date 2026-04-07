from __future__ import annotations

from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.models.calm import CalmProfile, CalmSession
from app.schemas.calm import CalmProfileCreate, CalmSessionCreate, CalmRecommendation


def create_profile(db: Session, payload: CalmProfileCreate) -> CalmProfile:
    profile = CalmProfile(**payload.model_dump())
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile


def list_profiles(db: Session, caregiver_id: str | None = None) -> list[CalmProfile]:
    query = select(CalmProfile)
    if caregiver_id:
        query = query.where(CalmProfile.caregiver_id == caregiver_id)
    return list(db.scalars(query.order_by(CalmProfile.created_at.desc())).all())


def create_session(db: Session, payload: CalmSessionCreate) -> CalmSession:
    session = CalmSession(**payload.model_dump())
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


def list_sessions(db: Session, profile_id: str | None = None) -> list[CalmSession]:
    query = select(CalmSession)
    if profile_id:
        query = query.where(CalmSession.profile_id == profile_id)
    return list(db.scalars(query.order_by(CalmSession.started_at.desc())).all())


def get_recommendation(db: Session, profile_id: str) -> CalmRecommendation:
    totals = db.execute(
        select(
            func.count(CalmSession.id),
            func.count().filter(CalmSession.outcome == "overload"),
            func.count().filter(CalmSession.outcome == "activated"),
        ).where(CalmSession.profile_id == profile_id)
    ).one()
    total_count, overload_count, activated_count = totals

    if total_count == 0:
        return CalmRecommendation(
            profile_id=profile_id,
            recommended_intensity="low_stimulation",
            suggested_duration_seconds=300,
            rationale="No session history yet; start with safest defaults.",
        )

    distress_rate = (overload_count + activated_count) / max(total_count, 1)
    if distress_rate >= 0.4:
        return CalmRecommendation(
            profile_id=profile_id,
            recommended_intensity="low_stimulation",
            suggested_duration_seconds=240,
            rationale="Recent distress signals detected; reduce intensity and duration.",
        )
    if distress_rate >= 0.2:
        return CalmRecommendation(
            profile_id=profile_id,
            recommended_intensity="balanced",
            suggested_duration_seconds=300,
            rationale="Mixed outcomes detected; keep session moderate.",
        )
    return CalmRecommendation(
        profile_id=profile_id,
        recommended_intensity="gentle_expressive",
        suggested_duration_seconds=420,
        rationale="Strong tolerance trend detected; safe to gently increase depth.",
    )
