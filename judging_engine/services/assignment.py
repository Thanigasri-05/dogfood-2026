from typing import List

from judging_engine.models.assignment import Assignment
from judging_engine.models.judge import Judge


def assign_projects_to_judges(
    judges: List[Judge],
    project_ids: List[int],
    assignments_per_project: int = 2,
) -> List[Assignment]:
    """Assign each project to multiple active judges."""

    active_judges = [judge for judge in judges if judge.active]

    if len(active_judges) < assignments_per_project:
        raise ValueError("Not enough active judges")

    assignments = []
    assignment_id = 1
    judge_index = 0

    for project_id in project_ids:
        assigned_judge_ids = set()

        while len(assigned_judge_ids) < assignments_per_project:
            judge = active_judges[judge_index % len(active_judges)]
            judge_index += 1

            if judge.id not in assigned_judge_ids:
                assignments.append(
                    Assignment(
                        id=assignment_id,
                        judge_id=judge.id,
                        project_id=project_id,
                    )
                )
                assignment_id += 1
                assigned_judge_ids.add(judge.id)

    return assignments