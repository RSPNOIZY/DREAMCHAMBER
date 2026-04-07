from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..deps import get_db
from ..models import AVAProfile, ActorJourneyProgress
from ..schemas import (
    ActorLaunchJourneyMap,
    ActorLaunchJourneyPhase,
    ActorJourneyPathway,
    ActorJourneyProgressRead,
    ActorJourneyProgressUpsert,
    ActorJourneyStep,
    CommunityStarterPack,
    CommunityStarterTask,
    OnboardingInitializeResponse,
)
from ..security import rate_limit_guard, require_api_key


router = APIRouter(
    prefix="/onboarding",
    tags=["onboarding"],
    dependencies=[Depends(require_api_key), Depends(rate_limit_guard)],
)


JOURNEY_STEPS = [
    "meet-aiva",
    "record-capture-pack",
    "review-preview",
    "tune-controls",
    "publish-voice-card",
    "monitor-and-evolve",
]


@router.get("/voice-actor-pathway", response_model=ActorJourneyPathway)
def voice_actor_pathway() -> ActorJourneyPathway:
    return ActorJourneyPathway(
        mission="Voice actors perform, refine, and guide. NOIZY handles the technical pipeline.",
        steps=[
            ActorJourneyStep(
                key="meet-aiva",
                title="Meet Your AI Partner",
                summary="Create AVA profile and define tone/licensing defaults.",
            ),
            ActorJourneyStep(
                key="record-capture-pack",
                title="Capture Performance Pack",
                summary="Record calm, narrative, dramatic, and conversational lines.",
            ),
            ActorJourneyStep(
                key="review-preview",
                title="Review AI Preview",
                summary="Approve or reject generated samples and add notes.",
            ),
            ActorJourneyStep(
                key="tune-controls",
                title="Tune Voice Controls",
                summary="Adjust pace, dynamics, emotion profile, and pronunciation.",
            ),
            ActorJourneyStep(
                key="publish-voice-card",
                title="Publish Voice Card",
                summary="Enable approved contexts and pricing tiers.",
            ),
            ActorJourneyStep(
                key="monitor-and-evolve",
                title="Monitor and Evolve",
                summary="Track usage, revoke contexts, and update dataset over time.",
            ),
        ],
    )


@router.get("/community-starter-pack", response_model=CommunityStarterPack)
def community_starter_pack() -> CommunityStarterPack:
    return CommunityStarterPack(
        title="NOIZY Community Starter Place",
        objective="Give every actor a prepared, low-friction path to bond with NOIZY.AI creators and mentors.",
        first_7_days=[
            CommunityStarterTask(
                key="day-1-welcome",
                title="Welcome + Covenant",
                why="Set trust, ownership, and consent norms up front.",
                action="Review Creative Covenant and activate AVA profile.",
            ),
            CommunityStarterTask(
                key="day-2-capture",
                title="Capture Pack Session",
                why="Create first usable model quickly with quality voice data.",
                action="Record guided calm/narrative/dramatic/conversational set.",
            ),
            CommunityStarterTask(
                key="day-3-preview",
                title="Preview + Corrections",
                why="Actors shape quality and authenticity from the first model pass.",
                action="Approve/reject generated lines and annotate corrections.",
            ),
            CommunityStarterTask(
                key="day-4-community",
                title="Composer Guild Intro",
                why="Build relationships early with collaborative creators.",
                action="Join guild channel and post one creative prompt or scene.",
            ),
            CommunityStarterTask(
                key="day-5-collab",
                title="First Co-Creation",
                why="Bond forms through shared making, not passive orientation.",
                action="Run one actor+composer mini session in DreamChamber.",
            ),
            CommunityStarterTask(
                key="day-6-publish",
                title="Publish Voice Card",
                why="Move from prototype to protected, licensed creative asset.",
                action="Set allowed contexts and publish first voice card.",
            ),
            CommunityStarterTask(
                key="day-7-reflect",
                title="Reflect + Mentor Loop",
                why="Retention improves when actors see growth and next steps.",
                action="Log feedback and schedule mentor check-in.",
            ),
        ],
        support_channels=[
            "DreamChamber onboarding room",
            "Composer Guild collaboration channel",
            "NOIZYKIDZ teacher pipeline office hours",
        ],
    )


@router.get("/actor-launch-journey-map", response_model=ActorLaunchJourneyMap)
def actor_launch_journey_map() -> ActorLaunchJourneyMap:
    return ActorLaunchJourneyMap(
        title="NOIZY Actor Launch Journey",
        promise=(
            "First login to community collaboration in one guided orbit: "
            "actors stay focused on performance while NOIZY handles technical complexity."
        ),
        phases=[
            ActorLaunchJourneyPhase(
                phase="First Login",
                outcome="Actor feels oriented and safe.",
                key_actions=[
                    "Review Creative Covenant",
                    "Activate AVA profile",
                    "Confirm consent and usage controls",
                ],
            ),
            ActorLaunchJourneyPhase(
                phase="Persona Foundation",
                outcome="Actor gets a usable AI partner quickly.",
                key_actions=[
                    "Run capture pack session",
                    "Generate first preview lines",
                    "Save pronunciation and tone notes",
                ],
            ),
            ActorLaunchJourneyPhase(
                phase="DreamChamber Mastery",
                outcome="Actor can direct AI outputs with confidence.",
                key_actions=[
                    "Tune emotional range",
                    "Test character templates",
                    "Refine pace and delivery settings",
                ],
            ),
            ActorLaunchJourneyPhase(
                phase="Community Integration",
                outcome="Actor forms creative bonds from day one.",
                key_actions=[
                    "Join Composer Guild intro",
                    "Run first actor+composer co-creation",
                    "Publish one community challenge output",
                ],
            ),
            ActorLaunchJourneyPhase(
                phase="Multi-Character Expansion",
                outcome="Actor scales creativity across projects.",
                key_actions=[
                    "Publish first voice card",
                    "Enable additional character modes",
                    "Track usage and iterate dataset",
                ],
            ),
        ],
    )


@router.get("/{ava_slug}/progress", response_model=list[ActorJourneyProgressRead])
def list_progress(ava_slug: str, db: Session = Depends(get_db)) -> list[ActorJourneyProgress]:
    ava = db.scalar(select(AVAProfile).where(AVAProfile.slug == ava_slug))
    if not ava:
        raise HTTPException(status_code=404, detail="AVA profile not found")
    return db.scalars(
        select(ActorJourneyProgress)
        .where(ActorJourneyProgress.ava_id == ava.id)
        .order_by(ActorJourneyProgress.updated_at.desc())
    ).all()


@router.post("/{ava_slug}/progress", response_model=ActorJourneyProgressRead, status_code=status.HTTP_201_CREATED)
def upsert_progress(
    ava_slug: str, payload: ActorJourneyProgressUpsert, db: Session = Depends(get_db)
) -> ActorJourneyProgress:
    ava = db.scalar(select(AVAProfile).where(AVAProfile.slug == ava_slug))
    if not ava:
        raise HTTPException(status_code=404, detail="AVA profile not found")

    row = db.scalar(
        select(ActorJourneyProgress).where(
            ActorJourneyProgress.ava_id == ava.id,
            ActorJourneyProgress.step_key == payload.step_key,
        )
    )
    if row:
        row.status = payload.status
        row.notes = payload.notes
    else:
        row = ActorJourneyProgress(
            ava_id=ava.id,
            step_key=payload.step_key,
            status=payload.status,
            notes=payload.notes,
        )
        db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.post("/{ava_slug}/initialize", response_model=OnboardingInitializeResponse)
def initialize_pathway(ava_slug: str, db: Session = Depends(get_db)) -> OnboardingInitializeResponse:
    ava = db.scalar(select(AVAProfile).where(AVAProfile.slug == ava_slug))
    if not ava:
        raise HTTPException(status_code=404, detail="AVA profile not found")

    created_steps = 0
    existing_steps = 0
    for idx, step in enumerate(JOURNEY_STEPS):
        existing = db.scalar(
            select(ActorJourneyProgress).where(
                ActorJourneyProgress.ava_id == ava.id,
                ActorJourneyProgress.step_key == step,
            )
        )
        if existing:
            existing_steps += 1
            continue
        row = ActorJourneyProgress(
            ava_id=ava.id,
            step_key=step,
            status="in_progress" if idx == 0 else "not_started",
            notes="Initialized from NOIZY Community Starter Place",
        )
        db.add(row)
        created_steps += 1

    db.commit()
    return OnboardingInitializeResponse(
        ava_slug=ava.slug,
        created_steps=created_steps,
        existing_steps=existing_steps,
        next_action="Complete step 'meet-aiva' and run first capture pack session.",
    )
