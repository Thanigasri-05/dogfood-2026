
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from database import SessionLocal
from models import User
import os
from dotenv import load_dotenv


# =========================
# Configuration
# =========================

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"

security = HTTPBearer()


# =========================
# JWT
# =========================

def create_access_token(user_id: int, role: str):
    payload = {
        "user_id": user_id,
        "role": role,
    }

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_id = payload.get("user_id")

        if user_id is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid token"
            )

        return payload

    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )


# =========================
# Role Based Access Control
# =========================

def require_role(*allowed_roles):
    def role_checker(
        current_user=Depends(get_current_user)
    ):
        if current_user["role"] not in allowed_roles:
            raise HTTPException(
                status_code=403,
                detail="You do not have permission"
            )

        return current_user

    return role_checker


# =========================
# Router
# =========================

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


# =========================
# Register
# =========================

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


@router.post("/register")
def register(data: RegisterRequest):
    db: Session = SessionLocal()

    try:
        existing_user = (
            db.query(User)
            .filter(User.email == data.email)
            .first()
        )

        if existing_user:
            return {
                "error": "Email already registered"
            }

        password_hash = pwd_context.hash(data.password)

        user = User(
            name=data.name,
            email=data.email,
            password_hash=password_hash,
            role="participant",
        )

        db.add(user)
        db.commit()
        db.refresh(user)

        return {
            "message": "Registration successful",
            "user_id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
        }

    finally:
        db.close()


# =========================
# Login
# =========================

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


@router.post("/login")
def login(data: LoginRequest):
    db: Session = SessionLocal()

    try:
        user = (
            db.query(User)
            .filter(User.email == data.email)
            .first()
        )

        if not user:
            return {
                "error": "Invalid email or password"
            }

        if not pwd_context.verify(
            data.password,
            user.password_hash
        ):
            return {
                "error": "Invalid email or password"
            }

        token = create_access_token(
            user.id,
            user.role
        )

        return {
            "message": "Login successful",
            "access_token": token,
            "token_type": "bearer",
            "user_id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
        }

    finally:
        db.close()