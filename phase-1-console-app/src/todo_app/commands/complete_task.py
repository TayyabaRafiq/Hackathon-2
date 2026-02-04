"""Complete task command."""

from .base import Command
from ..services.task_service import TaskService


class CompleteTaskCommand(Command):
    """Command to mark task as complete."""

    def __init__(self, task_service: TaskService) -> None:
        """Initialize command.

        Args:
            task_service: Task service instance
        """
        self._task_service = task_service

    def execute(self, args: list[str]) -> str:
        """Execute complete task command.

        Args:
            args: Task ID

        Returns:
            Success message

        Raises:
            ValueError: If task ID invalid or task not found
        """
        if not args:
            raise ValueError("Usage: complete <task_id>")

        try:
            task_id = int(args[0])
        except ValueError:
            raise ValueError(f"Invalid task ID: '{args[0]}' (must be positive integer)")

        task = self._task_service.mark_complete(task_id)
        return f"[OK] Task {task.id} marked complete"

    def help_text(self) -> str:
        """Get help text.

        Returns:
            Help string
        """
        return "complete <id>      - Mark task as complete"
