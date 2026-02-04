"""List tasks command."""

from .base import Command
from ..services.task_service import TaskService
from ..ui.formatter import Formatter


class ListTasksCommand(Command):
    """Command to list all tasks."""

    def __init__(self, task_service: TaskService) -> None:
        """Initialize command.

        Args:
            task_service: Task service instance
        """
        self._task_service = task_service
        self._formatter = Formatter()

    def execute(self, args: list[str]) -> str:
        """Execute list tasks command.

        Args:
            args: Unused

        Returns:
            Formatted task list
        """
        tasks = self._task_service.get_all_tasks()
        return self._formatter.format_task_list(tasks)

    def help_text(self) -> str:
        """Get help text.

        Returns:
            Help string
        """
        return "list               - Show all tasks"
