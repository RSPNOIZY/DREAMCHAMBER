"""
NOIZY Dreamer Gallery — API Router
Rotating weekly feature of independent Canadian artists.

Endpoints:
  GET /gallery/current       → this week's featured artist
  GET /gallery/archive       → all past features
  GET /gallery/week/{id}     → specific week by id (e.g. week_001)
  POST /gallery/submit       → artist self-submission
"""

import json
import os
from datetime import date, datetime
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/gallery", tags=["gallery"])

# Gallery data lives in /gallery/ at the repo root
GALLERY_DIR = Path(__file__).parents[4] / "gallery"
INDEX_FILE = GALLERY_DIR / "gallery_index.json"
WEEKS_DIR = GALLERY_DIR / "weeks"


# ── Models ────────────────────────────────────────────────────────────────────

class ArtistInfo(BaseModel):
    name: str
    location: str
    bio: str
    instagram: Optional[str] = None
    website: Optional[str] = None
    artsy: Optional[str] = None


class WorkInfo(BaseModel):
    title: str
    medium: str
    year: int
    series: Optional[str] = None
    description: str
    imageUrl: str
    thumbnailUrl: Optional[str] = None
    purchaseUrl: Optional[str] = None


class GalleryFeature(BaseModel):
    id: str
    weekOf: str
    theme: Optional[str] = None
    artist: ArtistInfo
    work: WorkInfo
    noizyAlignment: list[str] = []
    curatorNote: Optional[str] = None
    status: str
    publishedAt: Optional[str] = None


class GalleryIndex(BaseModel):
    gallery: str
    tagline: str
    currentWeek: str
    weeks: list[dict]


class SubmissionRequest(BaseModel):
    artistName: str
    location: str
    email: str
    bio: str
    workTitle: str
    workMedium: str
    workYear: int
    workDescription: str
    imageUrl: str
    instagram: Optional[str] = None
    website: Optional[str] = None
    noizyAlignment: str  # "Why does your work align with NOIZY culture?"


# ── Helpers ───────────────────────────────────────────────────────────────────

def load_week(week_id: str) -> dict:
    week_file = WEEKS_DIR / f"{week_id}.json"
    if not week_file.exists():
        raise HTTPException(status_code=404, detail=f"Week '{week_id}' not found")
    with open(week_file) as f:
        return json.load(f)


def load_index() -> dict:
    if not INDEX_FILE.exists():
        raise HTTPException(status_code=503, detail="Gallery index not found")
    with open(INDEX_FILE) as f:
        return json.load(f)


# ── Routes ────────────────────────────────────────────────────────────────────

@router.get("/current", summary="This week's featured artist")
def get_current_feature():
    """Returns the currently active gallery feature."""
    index = load_index()
    current_id = index.get("currentWeek")
    if not current_id:
        raise HTTPException(status_code=404, detail="No current feature set")
    return load_week(current_id)


@router.get("/archive", summary="All past gallery features")
def get_archive():
    """Returns a list of all gallery weeks (summary, not full detail)."""
    index = load_index()
    return {
        "gallery": index.get("gallery"),
        "tagline": index.get("tagline"),
        "totalWeeks": len(index.get("weeks", [])),
        "weeks": index.get("weeks", []),
    }


@router.get("/week/{week_id}", summary="Specific week by ID")
def get_week(week_id: str):
    """Returns a specific week by ID (e.g. week_001)."""
    return load_week(week_id)


@router.post("/submit", summary="Artist self-submission")
def submit_artist(submission: SubmissionRequest):
    """
    Independent Canadian artists can submit their work for consideration.
    Submissions go into a review queue for Rob to approve.
    """
    submissions_dir = GALLERY_DIR / "submissions"
    submissions_dir.mkdir(exist_ok=True)

    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    slug = submission.artistName.lower().replace(" ", "_")
    filename = submissions_dir / f"submission_{timestamp}_{slug}.json"

    data = submission.model_dump()
    data["submittedAt"] = datetime.utcnow().isoformat()
    data["status"] = "PENDING_REVIEW"

    with open(filename, "w") as f:
        json.dump(data, f, indent=2)

    return {
        "status": "received",
        "message": f"Thank you {submission.artistName}. Rob will review your submission.",
        "reference": f"submission_{timestamp}_{slug}",
    }


@router.get("/submissions", summary="Pending submissions (internal)")
def list_submissions():
    """Returns all pending artist submissions for Rob to review."""
    submissions_dir = GALLERY_DIR / "submissions"
    if not submissions_dir.exists():
        return {"submissions": [], "count": 0}

    submissions = []
    for f in sorted(submissions_dir.glob("submission_*.json")):
        with open(f) as fp:
            data = json.load(fp)
        submissions.append({
            "file": f.name,
            "artistName": data.get("artistName"),
            "location": data.get("location"),
            "submittedAt": data.get("submittedAt"),
            "status": data.get("status"),
        })

    return {"submissions": submissions, "count": len(submissions)}
