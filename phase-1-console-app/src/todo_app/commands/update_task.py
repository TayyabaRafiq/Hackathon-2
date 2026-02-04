"""Update task command."""

from .base import Command
from ..services.task_service import TaskService


class UpdateTaskCommand(Command):
    """Command to update task description."""

    def __init__(self, task_service: TaskService) -> None:
        """Initialize command.

        Args:
            task_service: Task service instance
        """
        self._task_service = task_service

    def execute(self, args: list[str]) -> str:
        """Execute update task command.

        Args:
            args: Task ID and new description

        Returns:
            Success message

        Raises:
            ValueError: If arguments invalid
        """
        if len(args) < 2:
            raise ValueError("Usage: update <task_id> <new_description>")

        try:
            task_id = int(args[0])
        except ValueError:
            raise ValueError(f"Invalid task ID: '{args[0]}' (must be positive integer)")

        new_description = " ".join(args[1:])
        task = self._task_service.update_description(task_id, new_description)
        return f"[OK] Task {task.id} updated: {task.description}"

    def help_text(self) -> str:
        """Get help text.

        Returns:
            Help string
        """
        return "update <id> <desc> - Update task description"
