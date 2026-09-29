# Dogfood 2026 - Judging System

## 1. Overview

The Dogfood 2026 judging system provides a configurable and role-isolated evaluation workflow for hackathon submissions.

The system supports:

- Configurable judging rubrics
- Weighted criteria
- Judge assignment
- Judge score submission
- Normalized scoring
- Final weighted scores
- Leaderboard generation
- CSV export

---

## 2. Judging Workflow

The judging process follows these steps:

```text
Organizer
    |
    v
Create Rubric
    |
    v
Add Criteria
    |
    v
Assign Judges
    |
    v
Judge Views Assignment
    |
    v
Judge Scores Submission
    |
    v
Backend Calculates Score
    |
    v
Leaderboard
    |
    v
CSV Export