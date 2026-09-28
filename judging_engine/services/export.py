import csv
from typing import List

from judging_engine.models.score import Score


def export_scores_to_csv(
    scores: List[Score],
    filename: str,
) -> None:
    """Export judging scores to a CSV file."""

    with open(filename, "w", newline="", encoding="utf-8") as file:
        writer = csv.writer(file)

        writer.writerow([
            "score_id",
            "assignment_id",
            "criterion_id",
            "value",
            "comment",
        ])

        for score in scores:
            writer.writerow([
                score.id,
                score.assignment_id,
                score.criterion_id,
                score.value,
                score.comment,
            ])