"""Delete task command."""

from .base import Command
from ..services.task_service import TaskService


class DeleteTaskCommand(Command):
    """Command to delete a task."""

    def __init__(self, task_service: TaskService) -> None:
        """Initialize command.

        Args:
            task_service: Task service instance
        """
        self._task_service = task_service

    def execute(self, args: list[str]) -> str:
        """Execute delete task command.

        Args:
            args: Task ID

        Returns:
            Success message

        Raises:
            ValueError: If task ID invalid or task not found
        """
        if not args:
            raise ValueError("Usage: delete <task_id>")

        try:
            task_id = int(args[0])
        except ValueError:
            raise ValueError(f"Invalid task ID: '{args[0]}' (must be positive integer)")

        self._task_service.delete_task(task_id)
        return f"[OK] Task {task_id} deleted"

    def help_text(self) -> str:
        """Get help text.

        Returns:
            Help string
        """
        return "delete <id>        - Delete task"
