from dataclasses import dataclass


@dataclass
class Score:
    id: int
    assignment_id: int
    criterion_id: int
    value: float
    comment: str = ""