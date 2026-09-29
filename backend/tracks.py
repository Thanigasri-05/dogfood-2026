from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import SessionLocal
from models import Event, Track, Prize
from auth import get_current_user, require_role


router = APIRouter(
    prefix="/tracks",
    tags=["Tracks & Prizes"]
)


# =========================
# Track Request
# =========================

class TrackCreate(BaseModel):
    event_id: int
    name: str
    description: str | None = None


# =========================
# Prize Request
# =========================

class PrizeCreate(BaseModel):
    track_id: int
    name: str
    amount: int | None = None


# =========================
# Create Track
# =========================

@router.post("/")
def create_track(
    data: TrackCreate,
    current_user=Depends(
        require_role("organizer", "admin")
    )
):
    db: Session = SessionLocal()

    try:
        event = (
            db.query(Event)
            .filter(Event.id == data.event_id)
            .first()
        )

        if not event:
            raise HTTPException(
                status_code=404,
                detail="Event not found"
            )

        track = Track(
            event_id=data.event_id,
            name=data.name,
            description=data.description
        )

        db.add(track)
        db.commit()
        db.refresh(track)

        return {
            "message": "Track created successfully",
            "track_id": track.id,
            "event_id": track.event_id,
            "name": track.name,
            "description": track.description
        }

    finally:
        db.close()


# =========================
# List Tracks
# =========================

@router.get("/event/{event_id}")
def list_tracks(
    event_id: int,
    current_user=Depends(get_current_user)
):
    db: Session = SessionLocal()

    try:
        tracks = (
            db.query(Track)
            .filter(Track.event_id == event_id)
            .all()
        )

        return [
            {
                "id": track.id,
                "event_id": track.event_id,
                "name": track.name,
                "description": track.description
            }
            for track in tracks
        ]

    finally:
        db.close()


# =========================
# Create Prize
# =========================

@router.post("/prizes")
def create_prize(
    data: PrizeCreate,
    current_user=Depends(
        require_role("organizer", "admin")
    )
):
    db: Session = SessionLocal()

    try:
        track = (
            db.query(Track)
            .filter(Track.id == data.track_id)
            .first()
        )

        if not track:
            raise HTTPException(
                status_code=404,
                detail="Track not found"
            )

        prize = Prize(
            track_id=data.track_id,
            name=data.name,
            amount=data.amount
        )

        db.add(prize)
        db.commit()
        db.refresh(prize)

        return {
            "message": "Prize created successfully",
            "prize_id": prize.id,
            "track_id": prize.track_id,
            "name": prize.name,
            "amount": prize.amount
        }

    finally:
        db.close()


# =========================
# List Prizes
# =========================

@router.get("/{track_id}/prizes")
def list_prizes(
    track_id: int,
    current_user=Depends(get_current_user)
):
    db: Session = SessionLocal()

    try:
        track = (
            db.query(Track)
            .filter(Track.id == track_id)
            .first()
        )

        if not track:
            raise HTTPException(
                status_code=404,
                detail="Track not found"
            )

        prizes = (
            db.query(Prize)
            .filter(Prize.track_id == track_id)
            .all()
        )

        return [
            {
                "id": prize.id,
                "track_id": prize.track_id,
                "name": prize.name,
                "amount": prize.amount
            }
            for prize in prizes
        ]

    finally:
        db.close()