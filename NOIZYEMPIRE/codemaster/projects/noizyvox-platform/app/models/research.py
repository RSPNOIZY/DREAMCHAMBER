from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import Boolean, DateTime, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.utils.ids import new_id


class ResearchConsent(Base):
    __tablename__ = "research_consents"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    caregiver_id: Mapped[str] = mapped_column(String(128), unique=True, index=True)
    share_outcomes: Mapped[bool] = mapped_column(Boolean, default=False)
    share_trigger_tags: Mapped[bool] = mapped_column(Boolean, default=False)
    share_template_metadata: Mapped[bool] = mapped_column(Boolean, default=False)
    consent_version: Mapped[str] = mapped_column(String(32), default="1.0")
    opted_in_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    opted_out_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
