from __future__ import annotations

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class CalmProfileCreate(BaseModel):
    caregiver_id: str
    name: str
    sensitivity_level: str = "medium"
    startle_response: str = "sometimes"
    preferred_voice_feel: str = "neutral"
    trigger_toggles: dict = Field(default_factory=dict)


class CalmProfileOut(BaseModel):
    id: str
    caregiver_id: str
    name: str
    sensitivity_level: str
    startle_response: str
    preferred_voice_feel: str
    trigger_toggles: dict
    created_at: datetime

    model_config = {"from_attributes": True}


class CalmSessionCreate(BaseModel):
    profile_id: str
    goal: str
    intensity: str = "low_stimulation"
    duration_seconds: int
    outcome: str
    trigger_tags: list[str] = Field(default_factory=list)
    notes: Optional[str] = None


class CalmSessionOut(BaseModel):
    id: str
    profile_id: str
    goal: str
    intensity: str
    duration_seconds: int
    outcome: str
    trigger_tags: list[str]
    notes: Optional[str]
    started_at: datetime
    ended_at: datetime

    model_config = {"from_attributes": True}


class CalmRecommendation(BaseModel):
    profile_id: str
    recommended_intensity: str
    suggested_duration_seconds: int
    rationale: str
