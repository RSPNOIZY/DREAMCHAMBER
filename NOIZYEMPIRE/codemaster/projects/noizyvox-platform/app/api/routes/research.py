from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.research import ResearchAggregateOut, ResearchConsentOut, ResearchConsentUpdate
from app.security import require_authenticated
from app.services import research_service


router = APIRouter(dependencies=[Depends(require_authenticated)])


@router.put("/consents", response_model=ResearchConsentOut, summary="Upsert research consent")
def upsert_consent(payload: ResearchConsentUpdate, db: Session = Depends(get_db)) -> ResearchConsentOut:
    return research_service.upsert_consent(db, payload)


@router.get("/consents/{caregiver_id}", response_model=ResearchConsentOut, summary="Get caregiver consent")
def get_consent(caregiver_id: str, db: Session = Depends(get_db)) -> ResearchConsentOut:
    consent = research_service.get_consent(db, caregiver_id)
    if consent is None:
        raise HTTPException(status_code=404, detail="Research consent not found.")
    return consent


@router.get("/aggregate", response_model=ResearchAggregateOut, summary="Get aggregate research counts")
def get_aggregate(db: Session = Depends(get_db)) -> ResearchAggregateOut:
    return research_service.aggregate(db)
