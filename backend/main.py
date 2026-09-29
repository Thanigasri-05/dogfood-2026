from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware

from auth import router as auth_router, get_current_user
from events import router as events_router
from tracks import router as tracks_router
from teams import router as teams_router
from submissions import router as submissions_router
from gallery import router as gallery_router
from judging import router as judging_router


app = FastAPI(title="Dogfood 2026")


# =========================================================
# CORS - allow React frontend to access FastAPI
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# ROUTERS
# =========================================================

app.include_router(auth_router)
app.include_router(events_router)
app.include_router(tracks_router)
app.include_router(teams_router)
app.include_router(submissions_router)
app.include_router(gallery_router)
app.include_router(judging_router)


# =========================================================
# BASIC ROUTES
# =========================================================

@app.get("/")
def root():
    return {"message": "Dogfood 2026 API is running"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/me")
def me(current_user=Depends(get_current_user)):
    return current_user