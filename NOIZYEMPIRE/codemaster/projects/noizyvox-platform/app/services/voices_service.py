from __future__ import annotations

from datetime import datetime, timezone
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.voices import VoiceProfile, VoiceLicensePolicy, UsageReceipt, RevocationRule
from app.schemas.voices import (
    VoiceProfileCreate,
    VoiceStatusUpdate,
    LicensePolicyUpsert,
    GenerateVoiceRequest,
    RevokeVoiceRequest,
)


def create_voice_profile(db: Session, payload: VoiceProfileCreate) -> VoiceProfile:
    voice = VoiceProfile(**payload.model_dump())
    db.add(voice)
    db.commit()
    db.refresh(voice)
    return voice


def get_voice_profile(db: Session, voice_id: str) -> VoiceProfile | None:
    return db.get(VoiceProfile, voice_id)


def list_voice_profiles(db: Session, artist_id: str | None = None) -> list[VoiceProfile]:
    query = select(VoiceProfile)
    if artist_id:
        query = query.where(VoiceProfile.artist_id == artist_id)
    return list(db.scalars(query.order_by(VoiceProfile.created_at.desc())).all())


def update_voice_status(db: Session, voice_id: str, payload: VoiceStatusUpdate) -> VoiceProfile:
    voice = db.get(VoiceProfile, voice_id)
    if voice is None:
        raise ValueError("Voice profile not found.")
    voice.status = payload.status
    db.commit()
    db.refresh(voice)
    return voice


def upsert_license_policy(db: Session, voice_id: str, payload: LicensePolicyUpsert) -> VoiceLicensePolicy:
    voice = db.get(VoiceProfile, voice_id)
    if voice is None:
        raise ValueError("Voice profile not found.")

    policy = db.scalar(select(VoiceLicensePolicy).where(VoiceLicensePolicy.voice_id == voice_id))
    values = payload.model_dump()
    if policy is None:
        policy = VoiceLicensePolicy(voice_id=voice_id, **values)
        db.add(policy)
    else:
        for key, value in values.items():
            setattr(policy, key, value)
        policy.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(policy)
    return policy


def generate_voice(db: Session, payload: GenerateVoiceRequest) -> UsageReceipt:
    voice = db.get(VoiceProfile, payload.voice_id)
    if voice is None:
        raise ValueError("Voice profile not found.")
    if voice.status != "published":
        raise ValueError("Voice profile is not published.")

    policy = db.scalar(select(VoiceLicensePolicy).where(VoiceLicensePolicy.voice_id == payload.voice_id))
    if policy is None:
        raise ValueError("Voice profile has no license policy.")

    if payload.context in set(policy.disallowed_contexts):
        raise ValueError("Context is explicitly disallowed by creator policy.")
    if policy.allowed_contexts and payload.context not in set(policy.allowed_contexts):
        raise ValueError("Context is not in creator allowed contexts.")

    revocations = list(
        db.scalars(
            select(RevocationRule).where(
                RevocationRule.voice_id == payload.voice_id,
                RevocationRule.active == True,  # noqa: E712
            )
        ).all()
    )
    for rule in revocations:
        if rule.scope == "global":
            raise ValueError("Voice is globally revoked.")
        if rule.scope == "context" and rule.context == payload.context:
            raise ValueError("Voice is revoked for this context.")
        if rule.scope == "buyer" and rule.buyer_id == payload.buyer_id:
            raise ValueError("Voice is revoked for this buyer.")

    receipt = UsageReceipt(**payload.model_dump())
    db.add(receipt)
    db.commit()
    db.refresh(receipt)
    return receipt


def create_revocation(db: Session, voice_id: str, payload: RevokeVoiceRequest) -> RevocationRule:
    rule = RevocationRule(voice_id=voice_id, **payload.model_dump())
    db.add(rule)
    db.commit()
    db.refresh(rule)
    return rule


def list_receipts(db: Session, voice_id: str | None = None) -> list[UsageReceipt]:
    query = select(UsageReceipt)
    if voice_id:
        query = query.where(UsageReceipt.voice_id == voice_id)
    return list(db.scalars(query.order_by(UsageReceipt.generated_at.desc())).all())
