from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import SessionLocal
from models import (
    User,
    Event,
    Team,
    TeamMember,
    TeamInvite
)
from auth import get_current_user


router = APIRouter(
    prefix="/teams",
    tags=["Teams"]
)


# =========================
# Request Models
# =========================

class TeamCreate(BaseModel):
    event_id: int
    name: str


class InviteCreate(BaseModel):
    team_id: int
    email: str


# =========================
# Create Team
# =========================

@router.post("/")
def create_team(
    data: TeamCreate,
    current_user=Depends(get_current_user)
):
    db: Session = SessionLocal()

    try:
        user_id = current_user["user_id"]

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

        # Check whether user already owns a team
        existing_team = (
            db.query(Team)
            .filter(
                Team.event_id == data.event_id,
                Team.owner_id == user_id
            )
            .first()
        )

        if existing_team:
            raise HTTPException(
                status_code=400,
                detail="You already own a team for this event"
            )

        team = Team(
            event_id=data.event_id,
            name=data.name,
            owner_id=user_id
        )

        db.add(team)
        db.commit()
        db.refresh(team)

        # Automatically add owner as team member
        member = TeamMember(
            team_id=team.id,
            user_id=user_id,
            role="owner"
        )

        db.add(member)
        db.commit()

        return {
            "message": "Team created successfully",
            "team_id": team.id,
            "event_id": team.event_id,
            "name": team.name,
            "owner_id": team.owner_id
        }

    finally:
        db.close()


# =========================
# List My Teams
# =========================

@router.get("/my")
def my_teams(
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
            membership.team_id
            for membership in memberships
        ]

        if not team_ids:
            return []

        teams = (
            db.query(Team)
            .filter(Team.id.in_(team_ids))
            .all()
        )

        return [
            {
                "id": team.id,
                "event_id": team.event_id,
                "name": team.name,
                "owner_id": team.owner_id
            }
            for team in teams
        ]

    finally:
        db.close()


# =========================
# Get Team
# =========================

@router.get("/{team_id}")
def get_team(
    team_id: int,
    current_user=Depends(get_current_user)
):
    db: Session = SessionLocal()

    try:
        team = (
            db.query(Team)
            .filter(Team.id == team_id)
            .first()
        )

        if not team:
            raise HTTPException(
                status_code=404,
                detail="Team not found"
            )

        members = (
            db.query(TeamMember)
            .filter(
                TeamMember.team_id == team_id
            )
            .all()
        )

        member_list = []

        for member in members:
            user = (
                db.query(User)
                .filter(User.id == member.user_id)
                .first()
            )

            if user:
                member_list.append({
                    "user_id": user.id,
                    "name": user.name,
                    "email": user.email,
                    "role": member.role
                })

        return {
            "id": team.id,
            "event_id": team.event_id,
            "name": team.name,
            "owner_id": team.owner_id,
            "members": member_list
        }

    finally:
        db.close()


# =========================
# Invite User
# =========================

@router.post("/invite")
def invite_user(
    data: InviteCreate,
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

        # Only owner can invite
        if team.owner_id != user_id:
            raise HTTPException(
                status_code=403,
                detail="Only team owner can invite members"
            )

        invited_user = (
            db.query(User)
            .filter(User.email == data.email)
            .first()
        )

        if not invited_user:
            raise HTTPException(
                status_code=404,
                detail="User not found"
            )

        if invited_user.id == user_id:
            raise HTTPException(
                status_code=400,
                detail="You cannot invite yourself"
            )

        existing_member = (
            db.query(TeamMember)
            .filter(
                TeamMember.team_id == data.team_id,
                TeamMember.user_id == invited_user.id
            )
            .first()
        )

        if existing_member:
            raise HTTPException(
                status_code=400,
                detail="User is already a team member"
            )

        existing_invite = (
            db.query(TeamInvite)
            .filter(
                TeamInvite.team_id == data.team_id,
                TeamInvite.invited_user_id == invited_user.id,
                TeamInvite.status == "pending"
            )
            .first()
        )

        if existing_invite:
            raise HTTPException(
                status_code=400,
                detail="Invitation already pending"
            )

        invite = TeamInvite(
            team_id=data.team_id,
            invited_user_id=invited_user.id,
            status="pending"
        )

        db.add(invite)
        db.commit()
        db.refresh(invite)

        return {
            "message": "Invitation sent successfully",
            "invite_id": invite.id,
            "team_id": invite.team_id,
            "invited_user_id": invite.invited_user_id,
            "status": invite.status
        }

    finally:
        db.close()


# =========================
# My Invitations
# =========================

@router.get("/invites/my")
def my_invites(
    current_user=Depends(get_current_user)
):
    db: Session = SessionLocal()

    try:
        user_id = current_user["user_id"]

        invites = (
            db.query(TeamInvite)
            .filter(
                TeamInvite.invited_user_id == user_id,
                TeamInvite.status == "pending"
            )
            .all()
        )

        return [
            {
                "invite_id": invite.id,
                "team_id": invite.team_id,
                "status": invite.status
            }
            for invite in invites
        ]

    finally:
        db.close()


# =========================
# Accept Invitation
# =========================

@router.post("/invites/{invite_id}/accept")
def accept_invite(
    invite_id: int,
    current_user=Depends(get_current_user)
):
    db: Session = SessionLocal()

    try:
        user_id = current_user["user_id"]

        invite = (
            db.query(TeamInvite)
            .filter(
                TeamInvite.id == invite_id,
                TeamInvite.invited_user_id == user_id,
                TeamInvite.status == "pending"
            )
            .first()
        )

        if not invite:
            raise HTTPException(
                status_code=404,
                detail="Invitation not found"
            )

        existing_member = (
            db.query(TeamMember)
            .filter(
                TeamMember.team_id == invite.team_id,
                TeamMember.user_id == user_id
            )
            .first()
        )

        if existing_member:
            invite.status = "accepted"
            db.commit()

            return {
                "message": "Already a team member"
            }

        member = TeamMember(
            team_id=invite.team_id,
            user_id=user_id,
            role="member"
        )

        db.add(member)

        invite.status = "accepted"

        db.commit()

        return {
            "message": "Invitation accepted",
            "team_id": invite.team_id,
            "user_id": user_id
        }

    finally:
        db.close()