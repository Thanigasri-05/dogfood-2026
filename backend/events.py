from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import SessionLocal
from models import Event
from auth import get_current_user, require_role


router = APIRouter(
    prefix="/events",
    tags=["Events"]
)


class EventCreate(BaseModel):
    name: str
    description: str | None = None
    submission_deadline: str | None = None


class DeadlineUpdate(BaseModel):
    submission_deadline: str


@router.post("/")
def create_event(
    data: EventCreate,
    current_user=Depends(
        require_role("organizer", "admin")
    )
):
    db: Session = SessionLocal()

    try:
        event = Event(
            name=data.name,
            description=data.description,
            status="draft",
            submission_deadline=data.submission_deadline
        )

        db.add(event)
        db.commit()
        db.refresh(event)

        return {
            "message": "Event created successfully",
            "event_id": event.id,
            "name": event.name,
            "description": event.description,
            "status": event.status,
            "submission_deadline": event.submission_deadline
        }

    finally:
        db.close()


@router.get("/")
def list_events(
    current_user=Depends(get_current_user)
):
    db: Session = SessionLocal()

    try:
        events = db.query(Event).all()

        return [
            {
                "id": event.id,
                "name": event.name,
                "description": event.description,
                "status": event.status,
                "submission_deadline": event.submission_deadline
            }
            for event in events
        ]

    finally:
        db.close()


@router.get("/{event_id}")
def get_event(
    event_id: int,
    current_user=Depends(get_current_user)
):
    db: Session = SessionLocal()

    try:
        event = (
            db.query(Event)
            .filter(Event.id == event_id)
            .first()
        )

        if not event:
            raise HTTPException(
                status_code=404,
                detail="Event not found"
            )

        return {
            "id": event.id,
            "name": event.name,
            "description": event.description,
            "status": event.status,
            "submission_deadline": event.submission_deadline
        }

    finally:
        db.close()


@router.put("/{event_id}/deadline")
def update_deadline(
    event_id: int,
    data: DeadlineUpdate,
    current_user=Depends(
        require_role("organizer", "admin")
    )
):
    db: Session = SessionLocal()

    try:
        event = (
            db.query(Event)
            .filter(Event.id == event_id)
            .first()
        )

        if not event:
            raise HTTPException(
                status_code=404,
                detail="Event not found"
            )

        event.submission_deadline = data.submission_deadline

        db.commit()
        db.refresh(event)

        return {
            "message": "Submission deadline updated successfully",
            "event_id": event.id,
            "submission_deadline": event.submission_deadline
        }

    finally:
        db.close()