"""Exit command."""

from .base import Command


class ExitCommand(Command):
    """Command to exit the application."""

    def execute(self, args: list[str]) -> str:
        """Execute exit command.

        Args:
            args: Unused

        Returns:
            Goodbye message
        """
        return "EXIT_SIGNAL"  # Special signal for main loop

    def help_text(self) -> str:
        """Get help text.

        Returns:
            Help string
        """
        return "exit               - Exit application"
