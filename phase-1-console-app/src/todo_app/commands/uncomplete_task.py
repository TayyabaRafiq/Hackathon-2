"""Uncomplete task command."""

from .base import Command
from ..services.task_service import TaskService


class UncompleteTaskCommand(Command):
    """Command to mark task as incomplete."""

    def __init__(self, task_service: TaskService) -> None:
        """Initialize command.

        Args:
            task_service: Task service instance
        """
        self._task_service = task_service

    def execute(self, args: list[str]) -> str:
        """Execute uncomplete task command.

        Args:
            args: Task ID

        Returns:
            Success message

        Raises:
            ValueError: If task ID invalid or task not found
        """
        if not args:
            raise ValueError("Usage: uncomplete <task_id>")

        try:
            task_id = int(args[0])
        except ValueError:
            raise ValueError(f"Invalid task ID: '{args[0]}' (must be positive integer)")

        task = self._task_service.mark_incomplete(task_id)
        return f"[OK] Task {task.id} marked incomplete"

    def help_text(self) -> str:
        """Get help text.

        Returns:
            Help string
        """
        return "uncomplete <id>    - Mark task as incomplete"
