from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from app.db.session import get_db
from app.schemas.voices import (
    GenerateVoiceRequest,
    LicensePolicyOut,
    LicensePolicyUpsert,
    RevocationOut,
    RevokeVoiceRequest,
    UsageReceiptOut,
    VoiceProfileCreate,
    VoiceProfileOut,
    VoiceStatusUpdate,
)
from app.security import require_authenticated
from app.services import voices_service


router = APIRouter(dependencies=[Depends(require_authenticated)])


@router.post("/profiles", response_model=VoiceProfileOut, status_code=201, summary="Create voice profile")
def create_voice_profile(payload: VoiceProfileCreate, db: Session = Depends(get_db)) -> VoiceProfileOut:
    return voices_service.create_voice_profile(db, payload)


@router.get("/profiles", response_model=list[VoiceProfileOut], summary="List voice profiles")
def list_voice_profiles(artist_id: Optional[str] = None, db: Session = Depends(get_db)) -> list[VoiceProfileOut]:
    return voices_service.list_voice_profiles(db, artist_id=artist_id)


@router.get("/profiles/{voice_id}", response_model=VoiceProfileOut, summary="Get voice profile")
def get_voice_profile(voice_id: str, db: Session = Depends(get_db)) -> VoiceProfileOut:
    voice = voices_service.get_voice_profile(db, voice_id)
    if voice is None:
        raise HTTPException(status_code=404, detail="Voice profile not found.")
    return voice


@router.patch("/profiles/{voice_id}/status", response_model=VoiceProfileOut, summary="Update voice status")
def update_voice_status(
    voice_id: str,
    payload: VoiceStatusUpdate,
    db: Session = Depends(get_db),
) -> VoiceProfileOut:
    return voices_service.update_voice_status(db, voice_id, payload)


@router.put("/profiles/{voice_id}/license", response_model=LicensePolicyOut, summary="Upsert license policy")
def upsert_license_policy(
    voice_id: str,
    payload: LicensePolicyUpsert,
    db: Session = Depends(get_db),
) -> LicensePolicyOut:
    return voices_service.upsert_license_policy(db, voice_id, payload)


@router.post("/profiles/{voice_id}/revocations", response_model=RevocationOut, status_code=201)
def create_revocation(
    voice_id: str,
    payload: RevokeVoiceRequest,
    db: Session = Depends(get_db),
) -> RevocationOut:
    return voices_service.create_revocation(db, voice_id, payload)


@router.post("/generate", response_model=UsageReceiptOut, status_code=201, summary="Generate with policy checks")
def generate_voice(payload: GenerateVoiceRequest, db: Session = Depends(get_db)) -> UsageReceiptOut:
    return voices_service.generate_voice(db, payload)


@router.get("/receipts", response_model=list[UsageReceiptOut], summary="List usage receipts")
def list_receipts(voice_id: Optional[str] = None, db: Session = Depends(get_db)) -> list[UsageReceiptOut]:
    return voices_service.list_receipts(db, voice_id=voice_id)
