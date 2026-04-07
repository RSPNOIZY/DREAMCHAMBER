from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..deps import get_db
from ..models import AVAProfile
from ..schemas import AVAProfileCreate, AVAProfileRead
from ..security import rate_limit_guard, require_api_key


router = APIRouter(prefix="/ava", tags=["ava"], dependencies=[Depends(require_api_key), Depends(rate_limit_guard)])


@router.get("/", response_model=list[AVAProfileRead])
def list_ava_profiles(db: Session = Depends(get_db)) -> list[AVAProfile]:
    return db.scalars(select(AVAProfile).order_by(AVAProfile.id.desc())).all()


@router.post("/", response_model=AVAProfileRead, status_code=status.HTTP_201_CREATED)
def create_ava_profile(payload: AVAProfileCreate, db: Session = Depends(get_db)) -> AVAProfile:
    existing = db.scalar(select(AVAProfile).where(AVAProfile.slug == payload.slug))
    if existing:
        raise HTTPException(status_code=409, detail="AVA slug already exists")
    model = AVAProfile(**payload.model_dump())
    db.add(model)
    db.commit()
    db.refresh(model)
    return model

