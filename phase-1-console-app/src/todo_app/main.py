"""Main application entry point."""

from .commands import (
    AddTaskCommand,
    CompleteTaskCommand,
    DeleteTaskCommand,
    ExitCommand,
    HelpCommand,
    ListTasksCommand,
    UncompleteTaskCommand,
    UpdateTaskCommand,
)
from .commands.base import Command
from .services.task_service import TaskService
from .storage.memory_store import MemoryStore


def build_command_registry(task_service: TaskService) -> dict[str, Command]:
    """Build command name -> Command object mapping.

    Args:
        task_service: Task service instance

    Returns:
        Dictionary mapping command names to command objects
    """
    help_cmd = HelpCommand()

    commands = {
        "add": AddTaskCommand(task_service),
        "list": ListTasksCommand(task_service),
        "complete": CompleteTaskCommand(task_service),
        "uncomplete": UncompleteTaskCommand(task_service),
        "update": UpdateTaskCommand(task_service),
        "delete": DeleteTaskCommand(task_service),
        "help": help_cmd,
        "exit": ExitCommand(),
    }

    # Let help command know about all commands
    help_cmd.set_commands(commands)

    return commands


def main() -> None:
    """Main application loop (REPL)."""
    # Initialize storage and services
    store = MemoryStore()
    task_service = TaskService(store)

    # Build command registry
    commands = build_command_registry(task_service)

    # Display welcome message
    print("=" * 60)
    print("Welcome to Todo App - Phase I Console Edition")
    print("=" * 60)
    print("Type 'help' for available commands or 'exit' to quit.\n")

    # Main REPL loop
    while True:
        try:
            # Read user input
            user_input = input("todo> ").strip()

            # Skip empty input
            if not user_input:
                continue

            # Parse command and arguments
            parts = user_input.split()
            command_name = parts[0].lower()
            args = parts[1:] if len(parts) > 1 else []

            # Lookup command
            if command_name not in commands:
                print(
                    f"[ERROR] Unknown command '{command_name}'. "
                    "Type 'help' for available commands."
                )
                continue

            # Execute command
            command = commands[command_name]
            result = command.execute(args)

            # Check for exit signal
            if result == "EXIT_SIGNAL":
                print("\nGoodbye! Your tasks are cleared (in-memory storage).")
                break

            # Display result
            print(result)

        except ValueError as e:
            # Display user-friendly error messages
            print(f"[ERROR] {e}")

        except KeyboardInterrupt:
            # Handle Ctrl+C gracefully
            print("\n\nGoodbye! (Interrupted)")
            break

        except Exception as e:
            # Catch unexpected errors
            print(f"[ERROR] Unexpected error: {e}")


if __name__ == "__main__":
    main()
