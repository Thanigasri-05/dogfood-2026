# Dogfood 2026 - Data Model

## 1. Overview

The Dogfood 2026 platform uses PostgreSQL as its relational database.

SQLAlchemy is used in the FastAPI backend to define and access the database models.

The main entities are:

- User
- Event
- Track
- Prize
- Team
- TeamMember
- TeamInvite
- Submission
- Rubric
- RubricCriterion
- JudgeAssignment
- JudgeScore
- SubmissionScore

---

## 2. Entity Relationships

```text
User
 |
 +--------------------+
 |                    |
 v                    v
Team              JudgeAssignment
 |                    |
 +---- TeamMember     |
 |                    v
 +---- Submission   JudgeScore
                       |
                       v
                 RubricCriterion


Event
 |
 +---- Track
 |      |
 |      +---- Prize
 |      |
 |      +---- Submission
 |
 +---- Team
 |
 +---- Rubric
        |
        +---- RubricCriterion