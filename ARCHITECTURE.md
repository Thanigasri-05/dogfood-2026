# Dogfood 2026 - Architecture

## 1. Overview

Dogfood 2026 is a self-hosted hackathon management platform.

The platform supports:

- User authentication
- Role-based access
- Hackathon events
- Tracks and prizes
- Team management
- Project submissions
- Public project gallery
- Judge assignments
- Configurable judging rubrics
- Weighted scoring
- Leaderboard
- CSV export

The system is designed as a simple local-first web application using React, FastAPI, and PostgreSQL.

---

## 2. System Architecture

The application follows a three-layer architecture:

```text
+----------------------+
|      React Frontend  |
|      Vite + React    |
+----------+-----------+
           |
           | HTTP / JSON
           |
+----------v-----------+
|     FastAPI Backend  |
| Authentication       |
| Events               |
| Teams                |
| Submissions          |
| Judging              |
| Gallery              |
+----------+-----------+
           |
           | SQLAlchemy
           |
+----------v-----------+
|      PostgreSQL      |
|      Database        |
+----------------------+