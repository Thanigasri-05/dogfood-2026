from fastapi import APIRouter, Query
from sqlalchemy.orm import Session

from database import SessionLocal
from models import Submission, Team, Track



router = APIRouter(
    prefix="/gallery",
    tags=["Public Gallery"]
)


@router.get("/")
def public_gallery(
    search: str | None = Query(default=None),
    track_id: int | None = Query(default=None)
):
    db: Session = SessionLocal()

    try:
        query = (
            db.query(Submission, Team, Track)
            .join(Team, Submission.team_id == Team.id)
            .join(Track, Submission.track_id == Track.id)
            .filter(Submission.status == "submitted")
        )

        if search:
            search_text = f"%{search}%"

            query = query.filter(
                Submission.project_name.ilike(search_text)
                | Submission.description.ilike(search_text)
            )

        if track_id:
            query = query.filter(
                Submission.track_id == track_id
            )

        results = query.all()

        return [
            {
                "submission_id": submission.id,
                "project_name": submission.project_name,
                "description": submission.description,
                "repository_url": submission.repository_url,
                "demo_url": submission.demo_url,
                "team_id": team.id,
                "team_name": team.name,
                "track_id": track.id,
                "track_name": track.name
            }
            for submission, team, track in results
        ]

    finally:
        db.close()