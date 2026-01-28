"""Task model representing a single todo item."""

from dataclasses import dataclass


@dataclass
class Task:
    """Represents a single todo item.

    Attributes:
        id: Unique integer identifier (auto-assigned, immutable)
        description: Task description (1-500 characters, mutable)
        completed: Completion status (default False, mutable)
    """

    id: int
    description: str
    completed: bool = False

    def __post_init__(self) -> None:
        """Validate task invariants after initialization."""
        if not (1 <= len(self.description) <= 500):
            raise ValueError(
                f"Description must be 1-500 characters, got {len(self.description)}"
            )
        if not isinstance(self.id, int) or self.id < 1:
            raise ValueError(f"Task ID must be positive integer, got {self.id}")
