from fastapi import APIRouter

from app.api.routes import calm, health, moderation, research, voices


api_router = APIRouter()
api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(calm.router, prefix="/calm", tags=["calm"])
api_router.include_router(voices.router, prefix="/voices", tags=["voices"])
api_router.include_router(moderation.router, prefix="/moderation", tags=["moderation"])
api_router.include_router(research.router, prefix="/research", tags=["research"])

