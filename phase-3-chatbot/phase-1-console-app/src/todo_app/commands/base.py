"""Base command interface."""

from abc import ABC, abstractmethod


class Command(ABC):
    """Abstract base class for all commands."""

    @abstractmethod
    def execute(self, args: list[str]) -> str:
        """Execute command with given arguments.

        Args:
            args: Command arguments (excludes command name itself)

        Returns:
            Human-readable result message

        Raises:
            ValueError: If arguments are invalid
        """
        pass

    @abstractmethod
    def help_text(self) -> str:
        """Return command help documentation.

        Returns:
            Help text string
        """
        pass
