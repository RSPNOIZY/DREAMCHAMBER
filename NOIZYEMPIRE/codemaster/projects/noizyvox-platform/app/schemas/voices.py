from __future__ import annotations

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class VoiceProfileCreate(BaseModel):
    artist_id: str
    voice_name: str
    modes: list[str] = Field(default_factory=lambda: ["calm", "story"])
    sibilance_softening: str = "mild"
    prosody_bounds: str = "narrow"
    pace: str = "slow"
    breath_texture: str = "subtle"
    mono_default: bool = True
    no_whisper_variant: bool = True


class VoiceProfileOut(BaseModel):
    id: str
    artist_id: str
    voice_name: str
    status: str
    modes: list[str]
    sibilance_softening: str
    prosody_bounds: str
    pace: str
    breath_texture: str
    mono_default: bool
    no_whisper_variant: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class VoiceStatusUpdate(BaseModel):
    status: str


class LicensePolicyUpsert(BaseModel):
    allowed_contexts: list[str] = Field(default_factory=list)
    disallowed_contexts: list[str] = Field(default_factory=list)
    pricing_tier: str = "indie"
    usage_model: str = "per_character"
    notes: Optional[str] = None


class LicensePolicyOut(BaseModel):
    id: str
    voice_id: str
    allowed_contexts: list[str]
    disallowed_contexts: list[str]
    pricing_tier: str
    usage_model: str
    notes: Optional[str]
    updated_at: datetime

    model_config = {"from_attributes": True}


class GenerateVoiceRequest(BaseModel):
    voice_id: str
    buyer_id: str
    context: str
    mode: str = "calm"
    tier: str = "indie"
    characters_generated: int = 0


class UsageReceiptOut(BaseModel):
    id: str
    voice_id: str
    buyer_id: str
    context: str
    mode: str
    tier: str
    characters_generated: int
    generated_at: datetime

    model_config = {"from_attributes": True}


class RevokeVoiceRequest(BaseModel):
    scope: str
    context: Optional[str] = None
    buyer_id: Optional[str] = None
    reason: Optional[str] = None


class RevocationOut(BaseModel):
    id: str
    voice_id: str
    scope: str
    context: Optional[str]
    buyer_id: Optional[str]
    active: bool
    reason: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}
