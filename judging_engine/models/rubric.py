from dataclasses import dataclass
from typing import List


@dataclass
class Criterion:
    id: int
    name: str
    weight: float
    max_score: float = 10.0


@dataclass
class Rubric:
    id: int
    name: str
    criteria: List[Criterion]