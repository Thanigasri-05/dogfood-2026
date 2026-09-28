from typing import Dict

from judging_engine.models.rubric import Rubric


def calculate_weighted_score(
    rubric: Rubric,
    scores: Dict[int, float],
) -> float:
    """
    Calculate the weighted score for a project.

    scores maps criterion_id -> score.
    """

    total = 0.0

    for criterion in rubric.criteria:
        score = scores.get(criterion.id, 0.0)

        if score < 0 or score > criterion.max_score:
            raise ValueError(
                f"Score for '{criterion.name}' must be "
                f"between 0 and {criterion.max_score}"
            )

        total += (score / criterion.max_score) * criterion.weight

    return round(total * 100, 2)