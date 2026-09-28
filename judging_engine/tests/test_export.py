from pathlib import Path

from judging_engine.models.score import Score
from judging_engine.services.export import export_scores_to_csv


def test_export_scores_to_csv(tmp_path: Path):
    scores = [
        Score(
            id=1,
            assignment_id=10,
            criterion_id=1,
            value=8.5,
            comment="Good idea",
        ),
        Score(
            id=2,
            assignment_id=10,
            criterion_id=2,
            value=9.0,
            comment="Strong implementation",
        ),
    ]

    output_file = tmp_path / "scores.csv"

    export_scores_to_csv(scores, str(output_file))

    content = output_file.read_text(encoding="utf-8")

    assert "score_id,assignment_id,criterion_id,value,comment" in content
    assert "1,10,1,8.5,Good idea" in content
    assert "2,10,2,9.0,Strong implementation" in content