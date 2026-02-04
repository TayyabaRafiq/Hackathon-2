"""Console I/O abstraction."""


class Console:
    """Handles console input/output operations."""

    @staticmethod
    def print_message(message: str) -> None:
        """Print message to console.

        Args:
            message: Message to display
        """
        print(message)

    @staticmethod
    def read_input(prompt: str = "") -> str:
        """Read input from console.

        Args:
            prompt: Prompt to display

        Returns:
            User input string
        """
        return input(prompt)
