from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.utils.ids import new_id


class CalmProfile(Base):
    __tablename__ = "calm_profiles"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    caregiver_id: Mapped[str] = mapped_column(String(128), index=True)
    name: Mapped[str] = mapped_column(String(120))
    sensitivity_level: Mapped[str] = mapped_column(
        Enum("low", "medium", "high", name="sensitivity_level"), default="medium"
    )
    startle_response: Mapped[str] = mapped_column(
        Enum("rare", "sometimes", "frequent", name="startle_response"), default="sometimes"
    )
    preferred_voice_feel: Mapped[str] = mapped_column(
        Enum("neutral", "warm", "minimal_prosody", name="preferred_voice_feel"), default="neutral"
    )
    trigger_toggles: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    sessions: Mapped[list["CalmSession"]] = relationship(back_populates="profile", cascade="all,delete-orphan")


class CalmSession(Base):
    __tablename__ = "calm_sessions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    profile_id: Mapped[str] = mapped_column(ForeignKey("calm_profiles.id", ondelete="CASCADE"), index=True)
    goal: Mapped[str] = mapped_column(
        Enum("calm", "focus", "wind_down", "sleep_support", name="session_goal"), index=True
    )
    intensity: Mapped[str] = mapped_column(
        Enum("low_stimulation", "balanced", "gentle_expressive", name="session_intensity"), default="low_stimulation"
    )
    duration_seconds: Mapped[int] = mapped_column(Integer)
    outcome: Mapped[str] = mapped_column(
        Enum("calmer", "same", "activated", "overload", name="session_outcome"), index=True
    )
    trigger_tags: Mapped[list[str]] = mapped_column(JSON, default=list)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    ended_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    profile: Mapped[CalmProfile] = relationship(back_populates="sessions")
