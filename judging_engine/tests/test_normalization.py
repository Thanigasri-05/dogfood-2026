from judging_engine.services.normalization import normalize_scores


def test_normalize_scores():
    scores = {
        1: [60, 70, 80],
        2: [30, 40, 50],
    }

    result = normalize_scores(scores)

    assert len(result) == 2
    assert len(result[1]) == 3
    assert len(result[2]) == 3

    # Each judge's normalized scores should have an average of 50.
    assert round(sum(result[1]) / 3, 2) == 50.0
    assert round(sum(result[2]) / 3, 2) == 50.0