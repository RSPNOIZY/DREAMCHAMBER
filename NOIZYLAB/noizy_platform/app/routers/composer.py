from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..deps import get_db
from ..models import Composer, TeacherAssignment
from ..schemas import ComposerCreate, ComposerRead, GenericMessage, TeacherRead
from ..security import rate_limit_guard, require_api_key


router = APIRouter(
    prefix="/composer",
    tags=["composer"],
    dependencies=[Depends(require_api_key), Depends(rate_limit_guard)],
)


@router.get("/guild", response_model=list[ComposerRead])
def list_composers(db: Session = Depends(get_db)) -> list[Composer]:
    return db.scalars(select(Composer).order_by(Composer.id.desc())).all()


@router.post("/guild", response_model=ComposerRead, status_code=status.HTTP_201_CREATED)
def join_guild(payload: ComposerCreate, db: Session = Depends(get_db)) -> Composer:
    existing = db.scalar(select(Composer).where(Composer.handle == payload.handle))
    if existing:
        raise HTTPException(status_code=409, detail="Composer handle already exists")
    composer = Composer(**payload.model_dump())
    db.add(composer)
    db.commit()
    db.refresh(composer)
    return composer


@router.post("/promote/{handle}", response_model=TeacherRead)
def promote_to_teacher(handle: str, db: Session = Depends(get_db)) -> TeacherAssignment:
    composer = db.scalar(select(Composer).where(Composer.handle == handle))
    if not composer:
        raise HTTPException(status_code=404, detail="Composer not found")
    composer.status = "teacher"
    assignment = db.scalar(select(TeacherAssignment).where(TeacherAssignment.composer_id == composer.id))
    if not assignment:
        assignment = TeacherAssignment(composer_id=composer.id, track="noizykidz_music_ai")
        db.add(assignment)
    db.commit()
    db.refresh(assignment)
    return assignment


@router.get("/teachers", response_model=list[TeacherRead])
def list_teachers(db: Session = Depends(get_db)) -> list[TeacherAssignment]:
    return db.scalars(select(TeacherAssignment).order_by(TeacherAssignment.id.desc())).all()


@router.post("/vision", response_model=GenericMessage)
def partnership_guardrail() -> GenericMessage:
    return GenericMessage(
        message=(
            "NOIZY composer network is configured as creator-first: "
            "guild contribution, transparent promotion, and teachable outputs for NOIZYKIDZ."
        )
    )

