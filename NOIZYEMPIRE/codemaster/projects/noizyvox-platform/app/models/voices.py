from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.utils.ids import new_id


class VoiceProfile(Base):
    __tablename__ = "voice_profiles"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    artist_id: Mapped[str] = mapped_column(String(128), index=True)
    voice_name: Mapped[str] = mapped_column(String(120), unique=True)
    status: Mapped[str] = mapped_column(Enum("draft", "published", "paused", name="voice_status"), default="draft")
    modes: Mapped[list[str]] = mapped_column(JSON, default=list)
    sibilance_softening: Mapped[str] = mapped_column(
        Enum("off", "mild", "strong", name="sibilance_softening"), default="mild"
    )
    prosody_bounds: Mapped[str] = mapped_column(
        Enum("narrow", "medium", name="prosody_bounds"), default="narrow"
    )
    pace: Mapped[str] = mapped_column(Enum("slow", "normal", name="voice_pace"), default="slow")
    breath_texture: Mapped[str] = mapped_column(
        Enum("off", "subtle", "natural", name="breath_texture"), default="subtle"
    )
    mono_default: Mapped[bool] = mapped_column(Boolean, default=True)
    no_whisper_variant: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    license_policy: Mapped["VoiceLicensePolicy"] = relationship(
        back_populates="voice", uselist=False, cascade="all,delete-orphan"
    )
    revocations: Mapped[list["RevocationRule"]] = relationship(back_populates="voice", cascade="all,delete-orphan")
    receipts: Mapped[list["UsageReceipt"]] = relationship(back_populates="voice", cascade="all,delete-orphan")


class VoiceLicensePolicy(Base):
    __tablename__ = "voice_license_policies"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    voice_id: Mapped[str] = mapped_column(ForeignKey("voice_profiles.id", ondelete="CASCADE"), unique=True, index=True)
    allowed_contexts: Mapped[list[str]] = mapped_column(JSON, default=list)
    disallowed_contexts: Mapped[list[str]] = mapped_column(JSON, default=list)
    pricing_tier: Mapped[str] = mapped_column(
        Enum("indie", "studio", "enterprise", name="pricing_tier"), default="indie"
    )
    usage_model: Mapped[str] = mapped_column(
        Enum("per_character", "per_minute", "per_project", name="usage_model"), default="per_character"
    )
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    voice: Mapped[VoiceProfile] = relationship(back_populates="license_policy")


class RevocationRule(Base):
    __tablename__ = "voice_revocations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    voice_id: Mapped[str] = mapped_column(ForeignKey("voice_profiles.id", ondelete="CASCADE"), index=True)
    scope: Mapped[str] = mapped_column(Enum("global", "context", "buyer", name="revocation_scope"), index=True)
    context: Mapped[Optional[str]] = mapped_column(String(120), nullable=True)
    buyer_id: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    voice: Mapped[VoiceProfile] = relationship(back_populates="revocations")


class UsageReceipt(Base):
    __tablename__ = "usage_receipts"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    voice_id: Mapped[str] = mapped_column(ForeignKey("voice_profiles.id", ondelete="CASCADE"), index=True)
    buyer_id: Mapped[str] = mapped_column(String(128), index=True)
    context: Mapped[str] = mapped_column(String(120), index=True)
    mode: Mapped[str] = mapped_column(
        Enum("calm", "story", "focus", "sleep", name="voice_mode"), default="calm"
    )
    tier: Mapped[str] = mapped_column(Enum("indie", "studio", "enterprise", name="receipt_tier"), default="indie")
    characters_generated: Mapped[int] = mapped_column(Integer, default=0)
    generated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    voice: Mapped[VoiceProfile] = relationship(back_populates="receipts")
