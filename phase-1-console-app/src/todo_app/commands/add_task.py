"""Add task command."""

from .base import Command
from ..services.task_service import TaskService


class AddTaskCommand(Command):
    """Command to add a new task."""

    def __init__(self, task_service: TaskService) -> None:
        """Initialize command.

        Args:
            task_service: Task service instance
        """
        self._task_service = task_service

    def execute(self, args: list[str]) -> str:
        """Execute add task command.

        Args:
            args: Description words

        Returns:
            Success message

        Raises:
            ValueError: If description is invalid
        """
        description = " ".join(args).strip()
        task = self._task_service.create_task(description)
        return f"[OK] Task {task.id} created: {task.description}"

    def help_text(self) -> str:
        """Get help text.

        Returns:
            Help string
        """
        return "add <description>  - Add a new task"
