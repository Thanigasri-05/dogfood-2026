from typing import Dict, List

from judging_engine.models.assignment import Assignment


def get_judge_progress(
    assignments: List[Assignment],
) -> Dict[int, Dict[str, int]]:
    """Return total and completed assignment counts for each judge."""

    progress: Dict[int, Dict[str, int]] = {}

    for assignment in assignments:
        if assignment.judge_id not in progress:
            progress[assignment.judge_id] = {
                "total": 0,
                "completed": 0,
            }

        progress[assignment.judge_id]["total"] += 1

        if assignment.completed:
            progress[assignment.judge_id]["completed"] += 1

    return progress