from judging_engine.models.judge import Judge
from judging_engine.services.assignment import assign_projects_to_judges


def test_assign_projects_to_judges():
    judges = [
        Judge(id=1, name="Judge 1", email="judge1@test.com"),
        Judge(id=2, name="Judge 2", email="judge2@test.com"),
        Judge(id=3, name="Judge 3", email="judge3@test.com"),
    ]

    project_ids = [101, 102]

    assignments = assign_projects_to_judges(
        judges,
        project_ids,
        assignments_per_project=2,
    )

    assert len(assignments) == 4

    for project_id in project_ids:
        project_judges = [
            a.judge_id
            for a in assignments
            if a.project_id == project_id
        ]

        assert len(project_judges) == 2
        assert len(set(project_judges)) == 2


def test_not_enough_judges_raises_error():
    judges = [
        Judge(id=1, name="Judge 1", email="judge1@test.com"),
    ]

    project_ids = [101]

    try:
        assign_projects_to_judges(
            judges,
            project_ids,
            assignments_per_project=2,
        )
        assert False
    except ValueError:
        assert True