"""Task service containing business logic."""

from ..models.task import Task
from ..storage.memory_store import MemoryStore


class TaskService:
    """Business logic for task operations."""

    def __init__(self, store: MemoryStore) -> None:
        """Initialize task service.

        Args:
            store: Storage backend for tasks
        """
        self._store = store

    def create_task(self, description: str) -> Task:
        """Create a new task.

        Args:
            description: Task description

        Returns:
            Created task

        Raises:
            ValueError: If description is invalid
        """
        description = description.strip()
        if not description:
            raise ValueError("Description cannot be empty")
        if len(description) > 500:
            raise ValueError(f"Description too long ({len(description)} chars, max 500)")

        task_id = self._store.generate_id()
        task = Task(id=task_id, description=description, completed=False)
        self._store.add(task)
        return task

    def get_all_tasks(self) -> list[Task]:
        """Get all tasks.

        Returns:
            List of all tasks in creation order
        """
        return self._store.get_all()

    def mark_complete(self, task_id: int) -> Task:
        """Mark task as complete.

        Args:
            task_id: ID of task to complete

        Returns:
            Updated task

        Raises:
            ValueError: If task not found or already complete
        """
        task = self._store.get_by_id(task_id)
        if not task:
            raise ValueError(
                f"Task {task_id} not found. Use 'list' to see valid task IDs."
            )
        if task.completed:
            raise ValueError(f"Task {task_id} is already complete")
        task.completed = True
        return task

    def mark_incomplete(self, task_id: int) -> Task:
        """Mark task as incomplete.

        Args:
            task_id: ID of task to mark incomplete

        Returns:
            Updated task

        Raises:
            ValueError: If task not found or already incomplete
        """
        task = self._store.get_by_id(task_id)
        if not task:
            raise ValueError(
                f"Task {task_id} not found. Use 'list' to see valid task IDs."
            )
        if not task.completed:
            raise ValueError(f"Task {task_id} is already incomplete")
        task.completed = False
        return task

    def update_description(self, task_id: int, new_description: str) -> Task:
        """Update task description.

        Args:
            task_id: ID of task to update
            new_description: New description

        Returns:
            Updated task

        Raises:
            ValueError: If task not found or description invalid
        """
        task = self._store.get_by_id(task_id)
        if not task:
            raise ValueError(
                f"Task {task_id} not found. Use 'list' to see valid task IDs."
            )

        new_description = new_description.strip()
        if not new_description:
            raise ValueError("Description cannot be empty")
        if len(new_description) > 500:
            raise ValueError(
                f"Description too long ({len(new_description)} chars, max 500)"
            )

        task.description = new_description
        return task

    def delete_task(self, task_id: int) -> None:
        """Delete a task.

        Args:
            task_id: ID of task to delete

        Raises:
            ValueError: If task not found
        """
        if not self._store.delete(task_id):
            raise ValueError(
                f"Task {task_id} not found. Use 'list' to see valid task IDs."
            )
