from judging_engine.models.rubric import Criterion, Rubric
from judging_engine.services.scoring import calculate_weighted_score


def test_calculate_weighted_score():
    rubric = Rubric(
        id=1,
        name="Hackathon Evaluation",
        criteria=[
            Criterion(id=1, name="Innovation", weight=0.30),
            Criterion(id=2, name="Technical", weight=0.30),
            Criterion(id=3, name="Impact", weight=0.20),
            Criterion(id=4, name="Presentation", weight=0.20),
        ],
    )

    scores = {
        1: 8,
        2: 9,
        3: 7,
        4: 8,
    }

    result = calculate_weighted_score(rubric, scores)

    assert result == 81.0


def test_invalid_score_raises_error():
    rubric = Rubric(
        id=1,
        name="Hackathon Evaluation",
        criteria=[
            Criterion(id=1, name="Innovation", weight=1.0),
        ],
    )

    scores = {
        1: 11,
    }

    try:
        calculate_weighted_score(rubric, scores)
        assert False
    except ValueError:
        assert True