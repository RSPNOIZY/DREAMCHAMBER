from __future__ import annotations

from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class IncidentCreate(BaseModel):
    product: str
    report_type: str
    content_id: Optional[str] = None
    severity: str
    notes: Optional[str] = None


class IncidentOut(BaseModel):
    id: str
    product: str
    report_type: str
    content_id: Optional[str]
    severity: str
    notes: Optional[str]
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class DecisionCreate(BaseModel):
    action: str
    reason: str
    actor_id: str


class DecisionOut(BaseModel):
    id: str
    incident_id: str
    action: str
    reason: str
    actor_id: str
    created_at: datetime

    model_config = {"from_attributes": True}
