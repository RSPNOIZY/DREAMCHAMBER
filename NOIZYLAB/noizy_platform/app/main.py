from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Install uvloop for 2-4x faster async event loop (falls back gracefully)
try:
    import uvloop
    uvloop.install()
except ImportError:
    pass

from .config import get_settings
from .database import Base, engine
from .routers import ava, composer, gallery, governance, health, noizyvox, onboarding, pipeline, profile
from .security import validate_api_key_strength


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    settings = get_settings()
    validate_api_key_strength(settings.noizy_api_key)
    Base.metadata.create_all(bind=engine)
    yield


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title="NOIZY Self-Hosted Voice Platform",
        version="0.1.0",
        description=(
            "Creator-first voice infrastructure using local-first STT/TTS "
            "(Whisper/DeepSpeech + Piper/Coqui), AV audio engine adapters, and n8n orchestration."
        ),
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=False,
        allow_methods=["GET", "POST", "PUT", "DELETE"],
        allow_headers=["Content-Type", "x-noizy-api-key"],
    )

    app.include_router(health.router)
    app.include_router(gallery.router)
    app.include_router(ava.router)
    app.include_router(composer.router)
    app.include_router(pipeline.router)
    app.include_router(governance.router)
    app.include_router(onboarding.router)
    app.include_router(profile.router)
    app.include_router(noizyvox.router)
    return app


app = create_app()
