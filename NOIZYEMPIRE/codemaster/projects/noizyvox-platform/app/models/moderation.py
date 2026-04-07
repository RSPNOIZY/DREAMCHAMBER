from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import DateTime, Enum, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.utils.ids import new_id


class IncidentReport(Base):
    __tablename__ = "incident_reports"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    product: Mapped[str] = mapped_column(
        Enum("calm_studio", "regulation_voices", name="incident_product"), index=True
    )
    report_type: Mapped[str] = mapped_column(
        Enum("overload", "activation", "licensing_misuse", "other", name="incident_type"), index=True
    )
    content_id: Mapped[Optional[str]] = mapped_column(String(128), nullable=True, index=True)
    severity: Mapped[str] = mapped_column(Enum("mild", "moderate", "high", name="incident_severity"), index=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(
        Enum("open", "triaged", "escalated", "resolved", "closed", name="incident_status"),
        default="open",
        index=True,
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    decisions: Mapped[list["ModerationDecision"]] = relationship(
        back_populates="incident", cascade="all,delete-orphan"
    )


class ModerationDecision(Base):
    __tablename__ = "moderation_decisions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    incident_id: Mapped[str] = mapped_column(ForeignKey("incident_reports.id", ondelete="CASCADE"), index=True)
    action: Mapped[str] = mapped_column(
        Enum(
            "pause_content",
            "require_qa",
            "escalate_advisory",
            "close_with_explanation",
            "patch_profile",
            "restrict_modes",
            "clear_flag",
            name="moderation_action",
        )
    )
    reason: Mapped[str] = mapped_column(Text)
    actor_id: Mapped[str] = mapped_column(String(128))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    incident: Mapped[IncidentReport] = relationship(back_populates="decisions")
