from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import SessionLocal
from models import (
    Rubric,
    RubricCriterion,
    JudgeAssignment,
    JudgeScore,
    Submission,
    SubmissionScore,
    Team,
    Track,
)
from auth import require_role, get_current_user
import sys
from pathlib import Path

sys.path.insert(
    0,
    str(Path(__file__).resolve().parent.parent)
)

from judging_engine.services.normalization import normalize_scores
import csv
from io import StringIO


router = APIRouter(
    prefix="/judging",
    tags=["Judging"]
)


# ============================================================
# REQUEST MODELS
# ============================================================

class RubricCreate(BaseModel):
    event_id: int
    name: str
    description: str | None = None


class CriterionCreate(BaseModel):
    name: str
    description: str | None = None
    weight: float
    max_score: float = 10.0


class JudgeAssignmentCreate(BaseModel):
    event_id: int
    judge_id: int


class JudgeScoreCreate(BaseModel):
    submission_id: int
    criterion_id: int
    score: float
    comment: str | None = None


# ============================================================
# CREATE RUBRIC
# ORGANIZER / ADMIN ONLY
# ============================================================

@router.post("/rubrics")
def create_rubric(
    data: RubricCreate,
    current_user=Depends(require_role("organizer", "admin"))
):
    db: Session = SessionLocal()

    try:
        rubric = Rubric(
            event_id=data.event_id,
            name=data.name,
            description=data.description,
            is_active=True,
        )

        db.add(rubric)
        db.commit()
        db.refresh(rubric)

        return {
            "message": "Rubric created successfully",
            "rubric_id": rubric.id,
            "event_id": rubric.event_id,
            "name": rubric.name,
            "description": rubric.description,
        }

    finally:
        db.close()


# ============================================================
# ADD CRITERION
# ORGANIZER / ADMIN ONLY
# ============================================================

@router.post("/rubrics/{rubric_id}/criteria")
def create_criterion(
    rubric_id: int,
    data: CriterionCreate,
    current_user=Depends(require_role("organizer", "admin"))
):
    db: Session = SessionLocal()

    try:
        rubric = (
            db.query(Rubric)
            .filter(Rubric.id == rubric_id)
            .first()
        )

        if not rubric:
            raise HTTPException(
                status_code=404,
                detail="Rubric not found"
            )

        if data.weight <= 0:
            raise HTTPException(
                status_code=400,
                detail="Weight must be greater than 0"
            )

        if data.max_score <= 0:
            raise HTTPException(
                status_code=400,
                detail="Max score must be greater than 0"
            )

        criterion = RubricCriterion(
            rubric_id=rubric_id,
            name=data.name,
            description=data.description,
            weight=data.weight,
            max_score=data.max_score,
        )

        db.add(criterion)
        db.commit()
        db.refresh(criterion)

        return {
            "message": "Criterion created successfully",
            "criterion_id": criterion.id,
            "rubric_id": criterion.rubric_id,
            "name": criterion.name,
            "weight": criterion.weight,
            "max_score": criterion.max_score,
        }

    finally:
        db.close()


# ============================================================
# GET RUBRIC + CRITERIA
# AUTHENTICATED USERS
# ============================================================

@router.get("/rubrics/{rubric_id}")
def get_rubric(
    rubric_id: int,
    current_user=Depends(get_current_user)
):
    db: Session = SessionLocal()

    try:
        rubric = (
            db.query(Rubric)
            .filter(Rubric.id == rubric_id)
            .first()
        )

        if not rubric:
            raise HTTPException(
                status_code=404,
                detail="Rubric not found"
            )

        criteria = (
            db.query(RubricCriterion)
            .filter(RubricCriterion.rubric_id == rubric_id)
            .all()
        )

        return {
            "rubric": {
                "id": rubric.id,
                "event_id": rubric.event_id,
                "name": rubric.name,
                "description": rubric.description,
                "is_active": rubric.is_active,
            },
            "criteria": [
                {
                    "id": c.id,
                    "name": c.name,
                    "description": c.description,
                    "weight": c.weight,
                    "max_score": c.max_score,
                }
                for c in criteria
            ],
        }

    finally:
        db.close()


# ============================================================
# ASSIGN JUDGE TO EVENT
# ORGANIZER / ADMIN ONLY
# ============================================================

@router.post("/assign")
def assign_judge(
    data: JudgeAssignmentCreate,
    current_user=Depends(require_role("organizer", "admin"))
):
    db: Session = SessionLocal()

    try:
        existing = (
            db.query(JudgeAssignment)
            .filter(
                JudgeAssignment.event_id == data.event_id,
                JudgeAssignment.judge_id == data.judge_id,
            )
            .first()
        )

        if existing:
            return {
                "message": "Judge already assigned",
                "assignment_id": existing.id,
            }

        assignment = JudgeAssignment(
            event_id=data.event_id,
            judge_id=data.judge_id,
            status="active",
        )

        db.add(assignment)
        db.commit()
        db.refresh(assignment)

        return {
            "message": "Judge assigned successfully",
            "assignment_id": assignment.id,
            "event_id": assignment.event_id,
            "judge_id": assignment.judge_id,
            "status": assignment.status,
        }

    finally:
        db.close()


# ============================================================
# MY JUDGE ASSIGNMENTS
# JUDGE ONLY
# ============================================================

@router.get("/assignments/my")
def my_assignments(
    current_user=Depends(require_role("judge"))
):
    db: Session = SessionLocal()

    try:
        judge_id = current_user["user_id"]

        assignments = (
            db.query(JudgeAssignment)
            .filter(
                JudgeAssignment.judge_id == judge_id,
                JudgeAssignment.status == "active",
            )
            .all()
        )

        return [
            {
                "assignment_id": a.id,
                "event_id": a.event_id,
                "judge_id": a.judge_id,
                "status": a.status,
            }
            for a in assignments
        ]

    finally:
        db.close()


# ============================================================
# SUBMIT SCORE
# JUDGE ONLY
# ============================================================

@router.post("/score")
def submit_score(
    data: JudgeScoreCreate,
    current_user=Depends(require_role("judge"))
):
    db: Session = SessionLocal()

    try:
        judge_id = current_user["user_id"]

        # ----------------------------------------------------
        # CHECK SUBMISSION
        # ----------------------------------------------------

        submission = (
            db.query(Submission)
            .filter(Submission.id == data.submission_id)
            .first()
        )

        if not submission:
            raise HTTPException(
                status_code=404,
                detail="Submission not found"
            )

        # ----------------------------------------------------
        # CHECK CRITERION
        # ----------------------------------------------------

        criterion = (
            db.query(RubricCriterion)
            .filter(RubricCriterion.id == data.criterion_id)
            .first()
        )

        if not criterion:
            raise HTTPException(
                status_code=404,
                detail="Criterion not found"
            )

        # ----------------------------------------------------
        # GET RUBRIC
        # ----------------------------------------------------

        rubric = (
            db.query(Rubric)
            .filter(Rubric.id == criterion.rubric_id)
            .first()
        )

        if not rubric:
            raise HTTPException(
                status_code=404,
                detail="Rubric not found"
            )

        # ----------------------------------------------------
        # GET TEAM
        # ----------------------------------------------------

        team = (
            db.query(Team)
            .filter(Team.id == submission.team_id)
            .first()
        )

        if not team:
            raise HTTPException(
                status_code=404,
                detail="Team not found"
            )

        # ----------------------------------------------------
        # CHECK JUDGE ASSIGNMENT
        # ----------------------------------------------------

        assignment = (
            db.query(JudgeAssignment)
            .filter(
                JudgeAssignment.judge_id == judge_id,
                JudgeAssignment.event_id == team.event_id,
                JudgeAssignment.status == "active",
            )
            .first()
        )

        if not assignment:
            raise HTTPException(
                status_code=403,
                detail="You are not assigned to this event"
            )

        # ----------------------------------------------------
        # CHECK RUBRIC EVENT
        # ----------------------------------------------------

        if rubric.event_id != team.event_id:
            raise HTTPException(
                status_code=400,
                detail="Criterion does not belong to this event"
            )

        # ----------------------------------------------------
        # VALIDATE SCORE
        # ----------------------------------------------------

        if data.score < 0 or data.score > criterion.max_score:
            raise HTTPException(
                status_code=400,
                detail=f"Score must be between 0 and {criterion.max_score}"
            )

        # ----------------------------------------------------
        # CHECK EXISTING SCORE
        # ----------------------------------------------------

        existing_score = (
            db.query(JudgeScore)
            .filter(
                JudgeScore.judge_id == judge_id,
                JudgeScore.submission_id == data.submission_id,
                JudgeScore.criterion_id == data.criterion_id,
            )
            .first()
        )

        if existing_score:
            existing_score.score = data.score
            existing_score.comment = data.comment

            db.commit()
            db.refresh(existing_score)

            return {
                "message": "Score updated successfully",
                "score_id": existing_score.id,
                "score": existing_score.score,
                "comment": existing_score.comment,
            }

        # ----------------------------------------------------
        # CREATE SCORE
        # ----------------------------------------------------

        score = JudgeScore(
            judge_id=judge_id,
            submission_id=data.submission_id,
            criterion_id=data.criterion_id,
            score=data.score,
            comment=data.comment,
        )

        db.add(score)
        db.commit()
        db.refresh(score)

        return {
            "message": "Score submitted successfully",
            "score_id": score.id,
            "submission_id": score.submission_id,
            "criterion_id": score.criterion_id,
            "score": score.score,
            "comment": score.comment,
        }

    finally:
        db.close()


# ============================================================
# CALCULATE SUBMISSION RESULT
# ORGANIZER / ADMIN ONLY
# ============================================================

@router.get("/submission/{submission_id}/result")
def submission_result(
    submission_id: int,
    current_user=Depends(require_role("organizer", "admin"))
):
    db: Session = SessionLocal()

    try:
        submission = (
            db.query(Submission)
            .filter(Submission.id == submission_id)
            .first()
        )

        if not submission:
            raise HTTPException(
                status_code=404,
                detail="Submission not found"
            )

        scores = (
            db.query(JudgeScore, RubricCriterion)
            .join(
                RubricCriterion,
                JudgeScore.criterion_id == RubricCriterion.id
            )
            .filter(
                JudgeScore.submission_id == submission_id
            )
            .all()
        )

        if not scores:
            return {
                "submission_id": submission_id,
                "project_name": submission.project_name,
                "final_score": 0,
                "message": "No scores yet",
            }

        weighted_total = 0
        total_weight = 0

        criterion_results = []

        for score, criterion in scores:

            normalized_score = (
                score.score / criterion.max_score
            ) * 100

            weighted_score = (
                normalized_score * criterion.weight / 100
            )

            weighted_total += weighted_score
            total_weight += criterion.weight

            criterion_results.append({
                "criterion_id": criterion.id,
                "criterion": criterion.name,
                "score": score.score,
                "max_score": criterion.max_score,
                "weight": criterion.weight,
                "weighted_score": round(weighted_score, 2),
                "comment": score.comment,
            })

        if total_weight > 0:
            final_score = (
                weighted_total / total_weight
            ) * 100
        else:
            final_score = 0

        return {
            "submission_id": submission_id,
            "project_name": submission.project_name,
            "final_score": round(final_score, 2),
            "criteria": criterion_results,
        }

    finally:
        db.close()


# ============================================================
# LEADERBOARD
# ORGANIZER / ADMIN ONLY
# ============================================================
def get_normalized_scores(
    scores_by_judge,
):
    """
    Normalize each judge's project-level scores
    so judges with different scoring patterns can be compared.
    """
    return normalize_scores(scores_by_judge)
@router.get("/leaderboard/{event_id}")
def leaderboard(
    event_id: int,
    current_user=Depends(require_role("organizer", "admin"))
):
    db: Session = SessionLocal()

    try:
        submissions = (
            db.query(Submission)
            .join(
                Team,
                Submission.team_id == Team.id
            )
            .filter(
                Team.event_id == event_id
            )
            .all()
        )

        results = []

        for submission in submissions:

            scores = (
                db.query(JudgeScore, RubricCriterion)
                .join(
                    RubricCriterion,
                    JudgeScore.criterion_id == RubricCriterion.id
                )
                .filter(
                    JudgeScore.submission_id == submission.id
                )
                .all()
            )

            if not scores:
                continue

            weighted_total = 0
            total_weight = 0

            for score, criterion in scores:

                normalized_score = (
                    score.score / criterion.max_score
                ) * 100

                weighted_score = (
                    normalized_score * criterion.weight / 100
                )

                weighted_total += weighted_score
                total_weight += criterion.weight

            if total_weight > 0:
                final_score = (
                    weighted_total / total_weight
                ) * 100
            else:
                final_score = 0

            team = (
                db.query(Team)
                .filter(Team.id == submission.team_id)
                .first()
            )

            results.append({
                "submission_id": submission.id,
                "project_name": submission.project_name,
                "team_name": team.name if team else None,
                "final_score": round(final_score, 2),
            })

        # Highest score first
        results.sort(
            key=lambda x: x["final_score"],
            reverse=True
        )

        # Add rank
        for index, result in enumerate(results, start=1):
            result["rank"] = index

        return {
            "event_id": event_id,
            "leaderboard": results,
        }

    finally:
        db.close()


# ============================================================
# LEADERBOARD CSV EXPORT
# ORGANIZER / ADMIN ONLY
# ============================================================

@router.get("/leaderboard/{event_id}/csv")
def leaderboard_csv(
    event_id: int,
    current_user=Depends(require_role("organizer", "admin"))
):
    db: Session = SessionLocal()

    try:
        submissions = (
            db.query(Submission)
            .join(
                Team,
                Submission.team_id == Team.id
            )
            .filter(
                Team.event_id == event_id
            )
            .all()
        )

        results = []

        for submission in submissions:

            scores = (
                db.query(JudgeScore, RubricCriterion)
                .join(
                    RubricCriterion,
                    JudgeScore.criterion_id == RubricCriterion.id
                )
                .filter(
                    JudgeScore.submission_id == submission.id
                )
                .all()
            )

            if not scores:
                continue

            weighted_total = 0
            total_weight = 0

            for score, criterion in scores:

                normalized_score = (
                    score.score / criterion.max_score
                ) * 100

                weighted_score = (
                    normalized_score * criterion.weight / 100
                )

                weighted_total += weighted_score
                total_weight += criterion.weight

            if total_weight > 0:
                final_score = (
                    weighted_total / total_weight
                ) * 100
            else:
                final_score = 0

            team = (
                db.query(Team)
                .filter(Team.id == submission.team_id)
                .first()
            )

            results.append({
                "project_name": submission.project_name,
                "team_name": team.name if team else "",
                "final_score": round(final_score, 2),
            })

        # Sort highest score first
        results.sort(
            key=lambda x: x["final_score"],
            reverse=True
        )

        # ----------------------------------------------------
        # CREATE CSV
        # ----------------------------------------------------

        output = StringIO()

        writer = csv.writer(output)

        writer.writerow([
            "Rank",
            "Project",
            "Team",
            "Score"
        ])

        for index, result in enumerate(results, start=1):

            writer.writerow([
                index,
                result["project_name"],
                result["team_name"],
                result["final_score"],
            ])

        output.seek(0)

        filename = (
            f"event_{event_id}_leaderboard.csv"
        )

        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={
                "Content-Disposition":
                f"attachment; filename={filename}"
            }
        )

    finally:
        db.close()