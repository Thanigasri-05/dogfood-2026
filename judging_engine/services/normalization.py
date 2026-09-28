from typing import Dict, List


def normalize_scores(
    scores_by_judge: Dict[int, List[float]],
) -> Dict[int, List[float]]:
    """Normalize each judge's scores using z-score normalization."""

    normalized = {}

    for judge_id, scores in scores_by_judge.items():
        if not scores:
            normalized[judge_id] = []
            continue

        mean = sum(scores) / len(scores)

        variance = sum(
            (score - mean) ** 2
            for score in scores
        ) / len(scores)

        std_dev = variance ** 0.5

        if std_dev == 0:
            normalized[judge_id] = [50.0 for _ in scores]
            continue

        normalized[judge_id] = [
            round(50 + 10 * ((score - mean) / std_dev), 2)
            for score in scores
        ]

    return normalized