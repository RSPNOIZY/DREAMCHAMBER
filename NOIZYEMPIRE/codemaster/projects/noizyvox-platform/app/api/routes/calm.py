from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Optional

from app.db.session import get_db
from app.schemas.calm import (
    CalmProfileCreate,
    CalmProfileOut,
    CalmRecommendation,
    CalmSessionCreate,
    CalmSessionOut,
)
from app.security import require_authenticated
from app.services import calm_service


router = APIRouter(dependencies=[Depends(require_authenticated)])


@router.post("/profiles", response_model=CalmProfileOut, status_code=201, summary="Create calm profile")
def create_profile(payload: CalmProfileCreate, db: Session = Depends(get_db)) -> CalmProfileOut:
    return calm_service.create_profile(db, payload)


@router.get("/profiles", response_model=list[CalmProfileOut], summary="List calm profiles")
def list_profiles(caregiver_id: Optional[str] = None, db: Session = Depends(get_db)) -> list[CalmProfileOut]:
    return calm_service.list_profiles(db, caregiver_id=caregiver_id)


@router.post("/sessions", response_model=CalmSessionOut, status_code=201, summary="Create calm session")
def create_session(payload: CalmSessionCreate, db: Session = Depends(get_db)) -> CalmSessionOut:
    return calm_service.create_session(db, payload)


@router.get("/sessions", response_model=list[CalmSessionOut], summary="List calm sessions")
def list_sessions(profile_id: Optional[str] = None, db: Session = Depends(get_db)) -> list[CalmSessionOut]:
    return calm_service.list_sessions(db, profile_id=profile_id)


@router.get(
    "/recommendations/{profile_id}",
    response_model=CalmRecommendation,
    summary="Get calm session recommendation",
)
def get_recommendation(profile_id: str, db: Session = Depends(get_db)) -> CalmRecommendation:
    return calm_service.get_recommendation(db, profile_id=profile_id)
