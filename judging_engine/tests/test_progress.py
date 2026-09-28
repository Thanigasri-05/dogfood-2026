from judging_engine.models.assignment import Assignment
from judging_engine.services.progress import get_judge_progress


def test_get_judge_progress():
    assignments = [
        Assignment(id=1, judge_id=1, project_id=101, completed=True),
        Assignment(id=2, judge_id=1, project_id=102, completed=False),
        Assignment(id=3, judge_id=2, project_id=101, completed=True),
    ]

    result = get_judge_progress(assignments)

    assert result[1] == {
        "total": 2,
        "completed": 1,
    }

    assert result[2] == {
        "total": 1,
        "completed": 1,
    }