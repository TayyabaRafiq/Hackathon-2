"""Help command."""

from .base import Command


class HelpCommand(Command):
    """Command to show help information."""

    def __init__(self, commands: dict[str, Command] | None = None) -> None:
        """Initialize command.

        Args:
            commands: Dictionary of available commands (set later)
        """
        self._commands = commands or {}

    def set_commands(self, commands: dict[str, Command]) -> None:
        """Set command registry for help display.

        Args:
            commands: Available commands
        """
        self._commands = commands

    def execute(self, args: list[str]) -> str:
        """Execute help command.

        Args:
            args: Unused

        Returns:
            Help text for all commands
        """
        lines = ["Available commands:"]
        for name, cmd in sorted(self._commands.items()):
            lines.append(f"  {cmd.help_text()}")
        return "\n".join(lines)

    def help_text(self) -> str:
        """Get help text.

        Returns:
            Help string
        """
        return "help               - Show this help message"
