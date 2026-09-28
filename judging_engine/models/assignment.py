from dataclasses import dataclass


@dataclass
class Assignment:
    id: int
    judge_id: int
    project_id: int
    completed: bool = False