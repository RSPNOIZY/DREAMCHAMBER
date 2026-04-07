from __future__ import annotations

from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class ResearchConsentUpdate(BaseModel):
    caregiver_id: str
    share_outcomes: bool = False
    share_trigger_tags: bool = False
    share_template_metadata: bool = False
    consent_version: str = "1.0"
    opted_in: bool = False


class ResearchConsentOut(BaseModel):
    id: str
    caregiver_id: str
    share_outcomes: bool
    share_trigger_tags: bool
    share_template_metadata: bool
    consent_version: str
    opted_in_at: Optional[datetime]
    opted_out_at: Optional[datetime]
    updated_at: datetime

    model_config = {"from_attributes": True}


class ResearchAggregateOut(BaseModel):
    opted_in_participants: int
    share_outcomes_count: int
    share_trigger_tags_count: int
    share_template_metadata_count: int
