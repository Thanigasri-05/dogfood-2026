from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import SessionLocal
from models import Submission, Team, TeamMember, Track, Event
from auth import get_current_user


router = APIRouter(
    prefix="/submissions",
    tags=["Submissions"]
)


class SubmissionCreate(BaseModel):
    team_id: int
    track_id: int
    project_name: str
    description: str
    repository_url: str
    demo_url: str | None = None


@router.post("/")
def create_submission(
    data: SubmissionCreate,
    current_user=Depends(get_current_user)
):
    db: Session = SessionLocal()

    try:
        user_id = current_user["user_id"]

        team = (
            db.query(Team)
            .filter(Team.id == data.team_id)
            .first()
        )

        if not team:
            raise HTTPException(
                status_code=404,
                detail="Team not found"
            )

        member = (
            db.query(TeamMember)
            .filter(
                TeamMember.team_id == data.team_id,
                TeamMember.user_id == user_id
            )
            .first()
        )

        if not member:
            raise HTTPException(
                status_code=403,
                detail="You are not a member of this team"
            )

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

        if track.event_id != team.event_id:
            raise HTTPException(
                status_code=400,
                detail="Track does not belong to this event"
            )

        event = (
            db.query(Event)
            .filter(Event.id == team.event_id)
            .first()
        )

        if not event:
            raise HTTPException(
                status_code=404,
                detail="Event not found"
            )

        # Check submission deadline
        if event.submission_deadline:
            try:
                deadline = datetime.fromisoformat(
                    event.submission_deadline
                )

                if deadline.tzinfo is None:
                    deadline = deadline.replace(
                        tzinfo=timezone.utc
                    )

                now = datetime.now(timezone.utc)

                if now > deadline:
                    raise HTTPException(
                        status_code=400,
                        detail="Submission deadline has passed"
                    )

            except ValueError:
                raise HTTPException(
                    status_code=500,
                    detail="Invalid event submission deadline"
                )

        existing_submission = (
            db.query(Submission)
            .filter(
                Submission.team_id == data.team_id
            )
            .first()
        )

        if existing_submission:
            raise HTTPException(
                status_code=400,
                detail="Team already has a submission"
            )

        submission = Submission(
            team_id=data.team_id,
            track_id=data.track_id,
            project_name=data.project_name,
            description=data.description,
            repository_url=data.repository_url,
            demo_url=data.demo_url,
            status="submitted"
        )

        db.add(submission)
        db.commit()
        db.refresh(submission)

        return {
            "message": "Submission created successfully",
            "submission_id": submission.id,
            "team_id": submission.team_id,
            "track_id": submission.track_id,
            "project_name": submission.project_name,
            "description": submission.description,
            "repository_url": submission.repository_url,
            "demo_url": submission.demo_url,
            "status": submission.status
        }

    finally:
        db.close()


@router.get("/my")
def my_submissions(
    current_user=Depends(get_current_user)
):
    db: Session = SessionLocal()

    try:
        user_id = current_user["user_id"]

        memberships = (
            db.query(TeamMember)
            .filter(
                TeamMember.user_id == user_id
            )
            .all()
        )

        team_ids = [
            member.team_id
            for member in memberships
        ]

        if not team_ids:
            return []

        submissions = (
            db.query(Submission)
            .filter(
                Submission.team_id.in_(team_ids)
            )
            .all()
        )

        return [
            {
                "id": submission.id,
                "team_id": submission.team_id,
                "track_id": submission.track_id,
                "project_name": submission.project_name,
                "description": submission.description,
                "repository_url": submission.repository_url,
                "demo_url": submission.demo_url,
                "status": submission.status
            }
            for submission in submissions
        ]

    finally:
        db.close()


@router.get("/{submission_id}")
def get_submission(
    submission_id: int,
    current_user=Depends(get_current_user)
):
    db: Session = SessionLocal()

    try:
        submission = (
            db.query(Submission)
            .filter(
                Submission.id == submission_id
            )
            .first()
        )

        if not submission:
            raise HTTPException(
                status_code=404,
                detail="Submission not found"
            )

        return {
            "id": submission.id,
            "team_id": submission.team_id,
            "track_id": submission.track_id,
            "project_name": submission.project_name,
            "description": submission.description,
            "repository_url": submission.repository_url,
            "demo_url": submission.demo_url,
            "status": submission.status
        }

    finally:
        db.close()