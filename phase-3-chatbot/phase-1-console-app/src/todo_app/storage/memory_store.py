"""In-memory storage for tasks."""

from typing import Optional

from ..models.task import Task


class MemoryStore:
    """In-memory task storage using Python list.

    Provides CRUD operations with auto-incrementing integer IDs.
    Thread-unsafe; single-user only (Phase I constraint).
    """

    def __init__(self) -> None:
        """Initialize empty task storage."""
        self._tasks: list[Task] = []
        self._next_id: int = 1

    def add(self, task: Task) -> None:
        """Add task to storage.

        Args:
            task: Task to add
        """
        self._tasks.append(task)

    def get_all(self) -> list[Task]:
        """Retrieve all tasks in creation order.

        Returns:
            Copy of task list to prevent external mutation
        """
        return self._tasks.copy()

    def get_by_id(self, task_id: int) -> Optional[Task]:
        """Find task by ID.

        Args:
            task_id: ID to search for

        Returns:
            Task if found, None otherwise
        """
        return next((t for t in self._tasks if t.id == task_id), None)

    def delete(self, task_id: int) -> bool:
        """Delete task by ID.

        Args:
            task_id: ID of task to delete

        Returns:
            True if deleted, False if not found
        """
        task = self.get_by_id(task_id)
        if task:
            self._tasks.remove(task)
            return True
        return False

    def generate_id(self) -> int:
        """Generate next unique task ID.

        Returns:
            Next available ID
        """
        task_id = self._next_id
        self._next_id += 1
        return task_id
