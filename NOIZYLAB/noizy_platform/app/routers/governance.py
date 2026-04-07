from fastapi import APIRouter, Depends
from pydantic import BaseModel

from ..security import rate_limit_guard, require_api_key


class CovenantResponse(BaseModel):
    mission: str
    principles: list[str]
    enforcement: list[str]


router = APIRouter(
    prefix="/governance",
    tags=["governance"],
    dependencies=[Depends(require_api_key), Depends(rate_limit_guard)],
)


@router.get("/creative-covenant", response_model=CovenantResponse)
def creative_covenant() -> CovenantResponse:
    return CovenantResponse(
        mission=(
            "Protect, nurture, and expand creative partnership between humans and AI."
        ),
        principles=[
            "Human creativity is primary; AI is a collaborator.",
            "Creator consent is required for training and deployment.",
            "Attribution and provenance must remain auditable.",
            "NOIZYKIDZ learning pathways must remain safe and transparent.",
        ],
        enforcement=[
            "API key protection on all non-public endpoints.",
            "Allowlisted CORS origins only; no wildcard origins.",
            "No arbitrary command execution surfaces exposed by API design.",
            "Promotion and guild roles are tracked as explicit database events.",
        ],
    )

