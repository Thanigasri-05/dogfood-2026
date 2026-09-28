from dataclasses import dataclass


@dataclass
class Judge:
    id: int
    name: str
    email: str
    active: bool = True