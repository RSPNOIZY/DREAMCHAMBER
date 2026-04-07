from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from ..deps import get_db
from ..models import MediaIngest, PipelineJob
from ..schemas import (
    GenericMessage,
    MediaIngestCreate,
    MediaIngestRead,
    OrchestrateRequest,
    SynthesizeRequest,
    SynthesizeResponse,
    TranscribeRequest,
    TranscribeResponse,
)
from ..security import rate_limit_guard, require_api_key
from ..services.audio_engine import process_with_av_audio_engine
from ..services.orchestrator import trigger_n8n
from ..services.stt import transcribe_audio
from ..services.tts import synthesize_speech


router = APIRouter(
    prefix="/pipeline",
    tags=["pipeline"],
    dependencies=[Depends(require_api_key), Depends(rate_limit_guard)],
)


@router.post("/ingest", response_model=MediaIngestRead, status_code=status.HTTP_201_CREATED)
def ingest_media(payload: MediaIngestCreate, db: Session = Depends(get_db)) -> MediaIngest:
    record = MediaIngest(**payload.model_dump(), status="queued")
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.post("/transcribe", response_model=TranscribeResponse)
def transcribe(payload: TranscribeRequest, db: Session = Depends(get_db)) -> TranscribeResponse:
    provider, transcript = transcribe_audio(payload.input_path)
    job = PipelineJob(job_type="transcribe", provider=provider, input_ref=payload.input_path, output_ref=transcript, status="done")
    db.add(job)
    db.commit()
    return TranscribeResponse(provider=provider, input_path=payload.input_path, transcript=transcript)


@router.post("/synthesize", response_model=SynthesizeResponse)
def synthesize(payload: SynthesizeRequest, db: Session = Depends(get_db)) -> SynthesizeResponse:
    provider, detail = synthesize_speech(payload.text, payload.voice_id, payload.output_path)
    job = PipelineJob(job_type="synthesize", provider=provider, input_ref=payload.voice_id, output_ref=payload.output_path, status="done")
    db.add(job)
    db.commit()
    return SynthesizeResponse(provider=provider, output_path=payload.output_path, detail=detail)


@router.post("/audio-engine", response_model=GenericMessage)
def run_audio_engine(input_path: str, output_path: str, preset: str = "cinematic") -> GenericMessage:
    result = process_with_av_audio_engine(input_path=input_path, output_path=output_path, preset=preset)
    return GenericMessage(message=result)


@router.post("/orchestrate", response_model=GenericMessage)
def orchestrate(payload: OrchestrateRequest) -> GenericMessage:
    result = trigger_n8n(event=payload.event, payload=payload.payload)
    return GenericMessage(message=result)

