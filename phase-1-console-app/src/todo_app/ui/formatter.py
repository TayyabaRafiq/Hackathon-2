"""Task list formatting for console display."""

from ..models.task import Task


class Formatter:
    """Formats task lists for console display."""

    @staticmethod
    def format_task_list(tasks: list[Task]) -> str:
        """Format list of tasks for display.

        Args:
            tasks: List of tasks to format

        Returns:
            Formatted string ready for display
        """
        if not tasks:
            return "No tasks found. Use 'add <description>' to create a task."

        lines = ["Tasks:"]
        for task in tasks:
            status = "[X]" if task.completed else "[ ]"
            lines.append(f"  [{task.id}] {status} {task.description}")

        return "\n".join(lines)
