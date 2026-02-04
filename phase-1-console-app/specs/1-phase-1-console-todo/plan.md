# Implementation Plan: Phase I Console Todo Application

**Branch**: `1-phase-1-console-todo` | **Date**: 2026-01-04 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/1-phase-1-console-todo/spec.md`

## Summary

Implement a console-based todo management system with in-memory storage supporting core CRUD operations (Create, Read, Update, Delete) and completion status tracking. The system will provide a command-line interface for managing tasks through typed commands, with all data stored in memory during the application session. This implementation demonstrates spec-driven development with AI-generated code (Claude Code) following strict test-first principles.

**Primary Requirements**:
- 7 core user operations: add task, view tasks, mark complete/incomplete, update description, delete task, exit
- In-memory task storage with auto-incrementing integer IDs
- Console-based interaction with clear prompts and error messages
- Input validation and error handling for all edge cases
- Performance targets: <2s per operation, <3s startup, <50MB memory for 100 tasks

**Technical Approach**:
- Clean architecture with separation of concerns (domain, application, presentation layers)
- Command pattern for extensible command handling
- Type-safe Python 3.13+ with strict mypy checking
- Comprehensive test coverage (≥80%) using pytest
- Test-driven development: write tests before implementation

## Technical Context

**Language/Version**: Python 3.13+
**Primary Dependencies**:
  - UV (package manager)
  - pytest 9.0.2+ (testing framework)
  - mypy 1.19.1+ (type checking)
  - ruff 0.14.10+ (linting)
  - black 25.12.0+ (code formatting)

**Storage**: In-memory only (Python list/dict, no persistence)
**Testing**: pytest with ≥80% code coverage; contract, integration, and unit tests
**Target Platform**: Cross-platform console (Windows, macOS, Linux) via standard Python runtime
**Project Type**: Single project (console application)
**Performance Goals**:
  - Startup time: <3 seconds
  - Command execution: <2 seconds per operation
  - Memory usage: <50MB for 100 tasks

**Constraints**:
  - No persistence between sessions (in-memory only)
  - Console-only interface (no GUI, no web)
  - Phase I technology constraints (no database, no web frameworks, no AI/NLP)
  - Single-user operation (no concurrency concerns)

**Scale/Scope**:
  - Support minimum 100 concurrent tasks
  - 7 user-facing commands + help/exit
  - ~8-12 Python modules
  - ~500-800 lines of production code (estimated)
  - ~400-600 lines of test code (estimated)

## Constitution Check

*GATE: Must pass before proceeding with implementation.*

### Alignment with Constitution Principles

✅ **I. Specification-First Development**
- Complete specification created (`spec.md`) before any implementation
- All behavior defined with testable acceptance criteria
- No code written yet; planning phase only

✅ **II. Human Authority, AI Execution**
- Human authored specification and this plan
- Implementation will be 100% AI-generated via Claude Code
- Plan documents decisions for AI to execute

✅ **III. Specifications Override Implementations**
- Spec contains 24 functional requirements as source of truth
- Implementation must satisfy all FR-001 through FR-024
- Bugs will require spec clarification then regeneration

✅ **IV. Test-First via Specification**
- Test cases defined in spec user stories (Given-When-Then scenarios)
- Tests will be generated from acceptance criteria before implementation
- Red-Green-Refactor cycle enforced

✅ **V. Phase Isolation and Progressive Enhancement**
- Only Phase I technologies used (Python, UV, console)
- No Phase II-V features (web, database, AI, Kubernetes, cloud)
- Explicit constraints prevent technology leakage

✅ **VI. Observability and Determinism**
- Text-based I/O ensures complete debuggability
- All operations produce observable output (confirmations/errors)
- No hidden state changes

✅ **VII. Simplicity and Incremental Complexity**
- Minimal viable architecture (3 layers, 8-12 modules)
- No premature abstractions
- YAGNI: only features from Phase I spec implemented

### Quality Gates (Phase I)

- ✅ All console commands execute successfully
- ✅ Test coverage ≥ 80% (pytest)
- ✅ Type checking passes (mypy strict mode)
- ✅ Linting passes (ruff with zero warnings)
- ✅ No hardcoded values (all configuration via constants/enums)
- ✅ README complete with usage instructions

**Status**: ✅ **PASSED** - Plan aligns with all constitutional principles

## Project Structure

### Documentation (this feature)

```text
specs/1-phase-1-console-todo/
├── spec.md              # Feature specification (DONE)
├── plan.md              # This file - Implementation plan (IN PROGRESS)
├── tasks.md             # Task breakdown (NEXT - created by /sp.tasks)
└── checklists/
    └── requirements.md  # Specification quality checklist (DONE)
```

### Source Code (repository root)

```text
src/
└── todo_app/
    ├── __init__.py           # Package initialization, version
    ├── main.py               # Application entry point, main loop
    ├── models/
    │   ├── __init__.py
    │   └── task.py           # Task dataclass with ID, description, status
    ├── services/
    │   ├── __init__.py
    │   └── task_service.py   # Business logic: CRUD operations, ID generation
    ├── storage/
    │   ├── __init__.py
    │   └── memory_store.py   # In-memory task storage (list-based)
    ├── commands/
    │   ├── __init__.py
    │   ├── base.py           # Abstract Command base class
    │   ├── add_task.py       # AddTaskCommand
    │   ├── list_tasks.py     # ListTasksCommand
    │   ├── complete_task.py  # CompleteTaskCommand
    │   ├── uncomplete_task.py# UncompleteTaskCommand
    │   ├── update_task.py    # UpdateTaskCommand
    │   ├── delete_task.py    # DeleteTaskCommand
    │   ├── help_cmd.py       # HelpCommand
    │   └── exit_cmd.py       # ExitCommand
    ├── ui/
    │   ├── __init__.py
    │   ├── console.py        # Console I/O abstraction (print, input)
    │   └── formatter.py      # Task list formatting for display
    └── utils/
        ├── __init__.py
        └── validators.py     # Input validation (description, task ID)

tests/
├── __init__.py
├── unit/
│   ├── __init__.py
│   ├── test_task_model.py         # Task dataclass tests
│   ├── test_task_service.py       # Business logic tests
│   ├── test_memory_store.py       # Storage tests
│   ├── test_commands.py           # Individual command tests
│   └── test_validators.py         # Validation function tests
├── integration/
│   ├── __init__.py
│   └── test_command_flow.py       # End-to-end command execution tests
└── contract/
    ├── __init__.py
    └── test_acceptance_scenarios.py # Spec acceptance criteria tests
```

**Structure Decision**: Single project layout selected because:
- Console application has no frontend/backend separation
- Simple enough for flat module organization under `src/todo_app/`
- Clear separation of concerns via subdirectories (models, services, commands, ui, storage)
- Aligns with Python best practices for installable packages

## Complexity Tracking

> No constitutional violations. This section intentionally left minimal.

| Aspect | Complexity Level | Justification |
|--------|------------------|---------------|
| Module Count | 8-12 modules | Justified by separation of concerns (models, services, storage, commands, UI) |
| Layers | 3 (domain, application, presentation) | Clean architecture pattern appropriate for maintainability |
| Command Pattern | 8 command classes | Extensibility for future phases; clear single responsibility |

**No violations requiring justification** - all complexity aligned with simplicity principle and Phase I scope.

## High-Level Architecture

### Architecture Diagram

```text
┌─────────────────────────────────────────────────────────────┐
│                        USER (Console)                        │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                   PRESENTATION LAYER                         │
│  ┌────────────────┐  ┌──────────────────┐                  │
│  │   main.py      │  │   ui/console.py  │                  │
│  │ (Main Loop)    │◄─┤  (I/O Wrapper)   │                  │
│  └────────┬───────┘  └──────────────────┘                  │
│           │              │                                   │
│           │              │ ui/formatter.py                   │
│           │              │ (Display Logic)                   │
└───────────┼──────────────┼───────────────────────────────────┘
            │              │
            ▼              ▼
┌─────────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER                          │
│  ┌─────────────────────────────────────────────────┐        │
│  │            commands/* (Command Pattern)          │        │
│  │  AddTask │ ListTasks │ Complete │ Update │ ... │        │
│  └────────────────────────┬────────────────────────┘        │
│                           │                                  │
│                           ▼                                  │
│  ┌──────────────────────────────────────┐                   │
│  │   services/task_service.py           │                   │
│  │   (Business Logic & Orchestration)   │                   │
│  └────────────────┬─────────────────────┘                   │
└───────────────────┼──────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│                     DOMAIN LAYER                             │
│  ┌──────────────────┐  ┌──────────────────────┐            │
│  │ models/task.py   │  │ storage/memory_store  │            │
│  │ (Task Entity)    │  │ (In-Memory Store)     │            │
│  └──────────────────┘  └──────────────────────┘            │
│                                                              │
│  ┌──────────────────────────────────────┐                   │
│  │    utils/validators.py                │                   │
│  │    (Input Validation)                 │                   │
│  └──────────────────────────────────────┘                   │
└─────────────────────────────────────────────────────────────┘
```

### Layer Responsibilities

**Presentation Layer** (`main.py`, `ui/*`):
- Main application loop (REPL: Read-Eval-Print Loop)
- Console I/O abstraction (input/output operations)
- User prompts and output formatting
- Command dispatch to application layer
- No business logic

**Application Layer** (`commands/*`, `services/*`):
- Command pattern implementation (8 concrete commands)
- Business logic orchestration (`TaskService`)
- Coordination between domain models and storage
- Input validation before domain operations
- Error handling and user feedback

**Domain Layer** (`models/*`, `storage/*`, `utils/*`):
- Task entity definition (dataclass)
- In-memory storage operations (CRUD)
- Core validation rules
- Domain invariants enforcement

### Key Design Patterns

1. **Command Pattern**: Each user action encapsulated as command object
   - Extensibility for new commands
   - Clear single responsibility
   - Testable in isolation

2. **Repository Pattern**: `MemoryStore` abstracts data access
   - Future Phase II can swap to database without changing business logic
   - Clear interface for storage operations

3. **Service Layer**: `TaskService` contains business logic
   - Coordinates task operations
   - Manages ID generation
   - Enforces business rules

4. **Dependency Injection**: Components receive dependencies via constructor
   - Testability (mock injection)
   - Loose coupling
   - Clear dependencies

## Data Models and Storage Strategy

### Task Data Model

**File**: `src/todo_app/models/task.py`

```python
from dataclasses import dataclass
from typing import Optional

@dataclass
class Task:
    """Represents a single todo item.

    Attributes:
        id: Unique integer identifier (auto-assigned, immutable)
        description: Task description (1-500 characters, mutable)
        completed: Completion status (default False, mutable)
    """
    id: int
    description: str
    completed: bool = False

    def __post_init__(self) -> None:
        """Validate task invariants after initialization."""
        if not (1 <= len(self.description) <= 500):
            raise ValueError(f"Description must be 1-500 characters, got {len(self.description)}")
        if not isinstance(self.id, int) or self.id < 1:
            raise ValueError(f"Task ID must be positive integer, got {self.id}")
```

**Design Decisions**:
- **Dataclass**: Immutable-by-default, automatic `__eq__`, `__repr__`, `__hash__`
- **Type Hints**: Full typing for mypy strict mode
- **Validation**: Post-init hook enforces invariants (1-500 char description, positive ID)
- **Simplicity**: No methods beyond validation; pure data structure

### Storage Strategy: In-Memory List with ID Counter

**File**: `src/todo_app/storage/memory_store.py`

```python
from typing import List, Optional
from ..models.task import Task

class MemoryStore:
    """In-memory task storage using Python list.

    Provides CRUD operations with auto-incrementing integer IDs.
    Thread-unsafe; single-user only (Phase I constraint).
    """

    def __init__(self) -> None:
        self._tasks: List[Task] = []
        self._next_id: int = 1

    def add(self, task: Task) -> None:
        """Add task to storage."""
        self._tasks.append(task)

    def get_all(self) -> List[Task]:
        """Retrieve all tasks in creation order."""
        return self._tasks.copy()  # Return copy to prevent external mutation

    def get_by_id(self, task_id: int) -> Optional[Task]:
        """Find task by ID, return None if not found."""
        return next((t for t in self._tasks if t.id == task_id), None)

    def delete(self, task_id: int) -> bool:
        """Delete task by ID. Return True if deleted, False if not found."""
        task = self.get_by_id(task_id)
        if task:
            self._tasks.remove(task)
            return True
        return False

    def generate_id(self) -> int:
        """Generate next unique task ID."""
        task_id = self._next_id
        self._next_id += 1
        return task_id
```

**Design Decisions**:
- **List Storage**: Simple, preserves insertion order (FR-005: creation order)
- **ID Counter**: Auto-incrementing integer starting at 1
- **ID Persistence After Deletion**: Counter never decrements (IDs stay unique even after deletions)
- **Copy-on-Read**: `get_all()` returns copy to prevent external mutation
- **No Threading**: Single-user Phase I constraint allows simple implementation

**Alternatives Considered**:
- **Dict Storage** (`{id: Task}`): Rejected - list simpler, order preservation explicit
- **UUID IDs**: Rejected - spec requires integer IDs; auto-increment sufficient for Phase I
- **Reuse Deleted IDs**: Rejected - violates spec requirement for stable unique IDs

## Command Handling Pattern

### Command Interface

**File**: `src/todo_app/commands/base.py`

```python
from abc import ABC, abstractmethod
from typing import List

class Command(ABC):
    """Abstract base class for all commands."""

    @abstractmethod
    def execute(self, args: List[str]) -> str:
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
        """Return command help documentation."""
        pass
```

### Command Implementations

Each command follows this pattern (example: `AddTaskCommand`):

**File**: `src/todo_app/commands/add_task.py`

```python
from typing import List
from .base import Command
from ..services.task_service import TaskService
from ..utils.validators import validate_description

class AddTaskCommand(Command):
    """Command to add a new task."""

    def __init__(self, task_service: TaskService) -> None:
        self._task_service = task_service

    def execute(self, args: List[str]) -> str:
        # Join args to support multi-word descriptions
        description = " ".join(args).strip()

        # Validate input (raises ValueError if invalid)
        validate_description(description)

        # Create task via service
        task = self._task_service.create_task(description)

        return f"✓ Task {task.id} created: {task.description}"

    def help_text(self) -> str:
        return "add <description>  - Add a new task"
```

**Other Commands**:
- `ListTasksCommand`: Calls `task_service.get_all_tasks()`, formats via `Formatter`
- `CompleteTaskCommand`: Calls `task_service.mark_complete(task_id)`
- `UncompleteTaskCommand`: Calls `task_service.mark_incomplete(task_id)`
- `UpdateTaskCommand`: Calls `task_service.update_description(task_id, new_desc)`
- `DeleteTaskCommand`: Calls `task_service.delete_task(task_id)`
- `HelpCommand`: Lists all available commands with help text
- `ExitCommand`: Returns signal to terminate main loop

### Command Registry

**File**: `src/todo_app/main.py` (excerpt)

```python
def build_command_registry(task_service: TaskService) -> Dict[str, Command]:
    """Build command name -> Command object mapping."""
    return {
        "add": AddTaskCommand(task_service),
        "list": ListTasksCommand(task_service),
        "complete": CompleteTaskCommand(task_service),
        "uncomplete": UncompleteTaskCommand(task_service),
        "update": UpdateTaskCommand(task_service),
        "delete": DeleteTaskCommand(task_service),
        "help": HelpCommand(),
        "exit": ExitCommand(),
    }
```

**Design Decisions**:
- **Command Pattern**: Each operation is a class implementing `Command` interface
- **Dependency Injection**: Commands receive `TaskService` in constructor
- **String Returns**: Commands return human-readable messages (not status codes)
- **ValueError for Errors**: Invalid input raises `ValueError` caught by main loop
- **Registry Dict**: Simple string -> Command mapping for dispatch

## Execution Flow

### Application Startup

```text
1. main.py entry point
2. Initialize MemoryStore()
3. Initialize TaskService(store)
4. Build command registry
5. Display welcome message
6. Enter main loop
```

### Main Loop (REPL)

```text
┌─────────────────────────────────────────────┐
│ LOOP START                                   │
│  1. Display prompt: "todo> "                │
│  2. Read user input (strip whitespace)      │
│  3. Parse: split into [command, ...args]    │
│  4. Lookup command in registry              │
│  5a. If found:                              │
│      - Try: command.execute(args)           │
│      - Catch ValueError:                    │
│          → Display error message            │
│      - Success: Display result              │
│  5b. If not found:                          │
│      → Display "Unknown command" + hint     │
│  6. If command was "exit": break loop       │
│  7. Otherwise: continue loop                │
└─────────────────────────────────────────────┘
```

### Example: Add Task Flow

```text
USER INPUT: "add Buy groceries and milk"

1. main.py: Parse → command="add", args=["Buy", "groceries", "and", "milk"]
2. main.py: Lookup registry["add"] → AddTaskCommand instance
3. AddTaskCommand.execute(args):
   a. Join args → "Buy groceries and milk"
   b. validate_description(desc) → passes (non-empty, <500 chars)
   c. task_service.create_task(desc)
      i.   task_id = store.generate_id() → 1
      ii.  task = Task(id=1, description=desc, completed=False)
      iii. task validation (post_init) → passes
      iv.  store.add(task)
      v.   return task
   d. Format success message → "✓ Task 1 created: Buy groceries and milk"
4. main.py: Display result message
5. main.py: Return to prompt
```

### Example: Invalid Input Flow

```text
USER INPUT: "add "  (empty description)

1. main.py: Parse → command="add", args=[]
2. main.py: Lookup registry["add"] → AddTaskCommand instance
3. AddTaskCommand.execute(args):
   a. Join args → ""
   b. validate_description("") → raises ValueError("Description cannot be empty")
4. main.py: Catch ValueError
5. main.py: Display "✗ Error: Description cannot be empty"
6. main.py: Return to prompt
```

## Error Handling and Input Validation Strategy

### Validation Layers

**Layer 1: Input Parsing** (main.py)
- Empty input → prompt again (no error)
- Unknown command → "Unknown command: {cmd}. Type 'help' for available commands."

**Layer 2: Command Validation** (utils/validators.py)
```python
def validate_description(description: str) -> None:
    """Validate task description meets requirements.

    Raises:
        ValueError: If description invalid (empty, whitespace-only, >500 chars)
    """
    if not description or not description.strip():
        raise ValueError("Description cannot be empty")
    if len(description) > 500:
        raise ValueError(f"Description too long ({len(description)} chars, max 500)")

def validate_task_id(task_id_str: str) -> int:
    """Parse and validate task ID.

    Returns:
        int: Validated task ID

    Raises:
        ValueError: If not a positive integer
    """
    try:
        task_id = int(task_id_str)
        if task_id < 1:
            raise ValueError("Task ID must be positive")
        return task_id
    except ValueError:
        raise ValueError(f"Invalid task ID: '{task_id_str}' (must be positive integer)")
```

**Layer 3: Business Logic Validation** (services/task_service.py)
- Task ID not found → raise `ValueError("Task {id} not found. Use 'list' to see valid IDs.")`
- Task already in target state → raise `ValueError("Task {id} is already complete/incomplete")`

**Layer 4: Domain Validation** (models/task.py)
- `__post_init__` validates description length and ID positivity
- Catches programmer errors (should never reach user if Layers 1-3 work)

### Error Message Format

All error messages follow this pattern:
```
✗ Error: <Clear description of what's wrong>
         <Optional: Suggestion for correction>
```

Examples:
- `✗ Error: Description cannot be empty`
- `✗ Error: Task 99 not found. Use 'list' to see valid IDs.`
- `✗ Error: Task 5 is already complete`
- `✗ Error: Invalid task ID: 'abc' (must be positive integer)`

### Success Message Format

```
✓ <Action completed>: <Details>
```

Examples:
- `✓ Task 1 created: Buy groceries`
- `✓ Task 3 marked complete`
- `✓ Task 2 deleted`
- `✓ Task 4 updated: New description here`

## Testing Strategy

### Test Coverage Requirements

**Overall Target**: ≥80% code coverage
- **Unit Tests**: 70-80% of test effort
- **Integration Tests**: 15-20% of test effort
- **Contract Tests**: 10-15% of test effort (acceptance scenarios)

### Test Organization

**Unit Tests** (`tests/unit/`):
- `test_task_model.py`: Task dataclass validation, equality, repr
- `test_memory_store.py`: Storage CRUD operations, ID generation
- `test_task_service.py`: Business logic, error handling
- `test_commands.py`: Individual command execution, argument parsing
- `test_validators.py`: Input validation functions
- **Coverage**: All functions, branches, error paths

**Integration Tests** (`tests/integration/`):
- `test_command_flow.py`: End-to-end command sequences
  - Test: Add → List → Complete → List (verify state changes)
  - Test: Add → Update → List (verify description change)
  - Test: Add → Delete → List (verify removal)
  - Test: Error recovery (invalid input doesn't crash loop)

**Contract Tests** (`tests/contract/`):
- `test_acceptance_scenarios.py`: Direct mapping from spec user stories
  - Test each Given-When-Then scenario from spec.md
  - Ensures implementation satisfies specification exactly

### Test Cases Mapped to Acceptance Criteria

**User Story 1: Add New Task**
```python
def test_add_task_with_valid_description():
    """Acceptance: User provides 'Buy groceries', task created with unique ID."""
    # Given: application running
    service = TaskService(MemoryStore())

    # When: user provides description
    task = service.create_task("Buy groceries")

    # Then: task created with unique ID, incomplete status
    assert task.id == 1
    assert task.description == "Buy groceries"
    assert task.completed == False

def test_add_task_with_special_characters():
    """Acceptance: Description 'Fix bug #42 & deploy' preserved exactly."""
    service = TaskService(MemoryStore())
    task = service.create_task("Fix bug #42 & deploy")
    assert task.description == "Fix bug #42 & deploy"

def test_add_task_with_empty_description_rejected():
    """Acceptance: Empty description rejected with error."""
    service = TaskService(MemoryStore())
    with pytest.raises(ValueError, match="Description cannot be empty"):
        service.create_task("")
```

**User Story 2: View All Tasks**
```python
def test_view_all_tasks_displays_all():
    """Acceptance: 3 tasks in system, all displayed with ID, desc, status."""
    service = TaskService(MemoryStore())
    service.create_task("Task 1")
    service.create_task("Task 2")
    service.create_task("Task 3")

    tasks = service.get_all_tasks()
    assert len(tasks) == 3
    assert [t.id for t in tasks] == [1, 2, 3]

def test_view_empty_task_list():
    """Acceptance: No tasks, appropriate message returned."""
    service = TaskService(MemoryStore())
    tasks = service.get_all_tasks()
    assert len(tasks) == 0  # Formatter will handle "No tasks" message
```

**Edge Cases**:
```python
def test_task_id_unique_after_deletion():
    """Edge case: IDs remain unique even after deletions."""
    service = TaskService(MemoryStore())
    t1 = service.create_task("Task 1")
    service.delete_task(t1.id)
    t2 = service.create_task("Task 2")
    assert t2.id != t1.id  # IDs never reused

def test_description_length_limit():
    """Edge case: 500 char description accepted, 501 rejected."""
    service = TaskService(MemoryStore())
    desc_500 = "a" * 500
    desc_501 = "a" * 501

    task = service.create_task(desc_500)  # Should succeed
    assert len(task.description) == 500

    with pytest.raises(ValueError, match="too long"):
        service.create_task(desc_501)  # Should fail
```

### Manual Console Testing Scenarios

**Scenario 1: Happy Path - Full Workflow**
```
$ uv run todo
Welcome to Todo App!
Type 'help' for available commands.

todo> add Buy groceries
✓ Task 1 created: Buy groceries

todo> add Write report
✓ Task 2 created: Write report

todo> list
Tasks:
  [1] [ ] Buy groceries
  [2] [ ] Write report

todo> complete 1
✓ Task 1 marked complete

todo> list
Tasks:
  [1] [✓] Buy groceries
  [2] [ ] Write report

todo> update 2 Write quarterly report
✓ Task 2 updated: Write quarterly report

todo> delete 1
✓ Task 1 deleted

todo> list
Tasks:
  [2] [ ] Write quarterly report

todo> exit
Goodbye!
```

**Scenario 2: Error Handling**
```
todo> add
✗ Error: Description cannot be empty

todo> complete 999
✗ Error: Task 999 not found. Use 'list' to see valid IDs.

todo> unknown command
✗ Error: Unknown command: 'unknown'. Type 'help' for available commands.

todo> help
Available commands:
  add <description>        - Add a new task
  list                     - Show all tasks
  complete <id>            - Mark task as complete
  uncomplete <id>          - Mark task as incomplete
  update <id> <new_desc>   - Update task description
  delete <id>              - Delete task
  help                     - Show this help
  exit                     - Exit application
```

## Architectural Decisions Requiring Documentation

The following architectural decisions meet the significance criteria (Impact + Alternatives + Scope) and should be documented as ADRs:

### 1. Command Pattern for User Operations
**Decision**: Use Command pattern with abstract base class and concrete command implementations
**Impact**: Extensibility for future phases; clear separation of concerns; testability
**Alternatives**:
- Single dispatcher function with if/elif chain
- Dictionary mapping command names to functions
**Scope**: Cross-cutting - affects all user interactions
**Recommendation**: Document as ADR

### 2. In-Memory List Storage with Auto-Incrementing IDs
**Decision**: Use Python list for storage with separate ID counter
**Impact**: Simple, order-preserving, sufficient for Phase I
**Alternatives**:
- Dict storage (`{id: Task}`)
- UUID-based IDs
- Reuse deleted IDs
**Scope**: Core data management strategy
**Recommendation**: Document as ADR

### 3. Three-Layer Architecture (Domain, Application, Presentation)
**Decision**: Clean architecture with layered separation
**Impact**: Maintainability, testability, Phase II migration path
**Alternatives**:
- Flat structure (all code in main.py)
- Two-layer (combine domain + application)
**Scope**: Overall system architecture
**Recommendation**: Document as ADR

**Next Step After Planning**: Run `/sp.adr <decision-title>` for each of the 3 architectural decisions above.

## Implementation Workflow

### Phase 0: Planning (Current)
- ✅ Create specification (`/sp.specify`)
- ✅ Run clarification (`/sp.clarify`)
- ⏳ Create plan (`/sp.plan` - this document)
- ⏳ Document architectural decisions (`/sp.adr`)

### Phase 1: Task Breakdown
- Run `/sp.tasks` to generate `tasks.md`
- Break implementation into testable, incremental tasks
- Order tasks by dependency (models → storage → services → commands → UI → main)

### Phase 2: Implementation (Test-Driven)
For each task in `tasks.md`:
1. **Red**: Write failing test(s) based on acceptance criteria
2. **Green**: Implement minimum code to pass tests
3. **Refactor**: Clean up while keeping tests green
4. **Verify**: Run full test suite + linting + type checking
5. **Commit**: Git commit with task reference

### Phase 3: Integration and Validation
- Run all tests (unit + integration + contract)
- Verify test coverage ≥80%
- Manual console testing (happy path + error scenarios)
- Performance validation (<2s operations, <3s startup)
- Quality gates (mypy strict, ruff, black)

### Phase 4: Documentation and Delivery
- Update README with usage instructions
- Create PHR (Prompt History Record)
- Prepare demo for hackathon evaluation
- Phase I completion review

## Dependencies and Risks

### External Dependencies

| Dependency | Version | Purpose | Risk Level |
|------------|---------|---------|------------|
| Python | 3.13+ | Runtime | Low (stable release) |
| UV | 0.6.6+ | Package management | Low (working in project) |
| pytest | 9.0.2+ | Testing framework | Low (industry standard) |
| mypy | 1.19.1+ | Type checking | Low (mature tool) |
| ruff | 0.14.10+ | Linting | Low (fast, reliable) |
| black | 25.12.0+ | Code formatting | Low (deterministic) |

### Internal Dependencies

- **None**: Phase I has no dependencies on other features
- **Future**: Phase II will depend on Phase I task model design

### Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Test coverage falls below 80% | Low | Medium | TDD enforced; coverage tracked per commit |
| Performance targets missed | Very Low | Low | Simple operations; Python fast enough |
| Scope creep (Phase II features) | Medium | High | Constitution enforces phase boundaries; explicit out-of-scope list |
| Type checking failures | Low | Low | Strict mypy from start; incremental validation |
| Command parsing ambiguity | Low | Medium | Clear command syntax in help text; comprehensive tests |
| ID collision after deletion | Very Low | High | Never reuse IDs; monotonic counter; tested explicitly |

**Overall Risk**: **LOW** - Well-scoped project with mature tooling and clear constraints.

## Success Criteria Validation

### Measurable Outcomes (from spec.md)

| Criterion | How Validated | Status |
|-----------|---------------|--------|
| SC-001: Add task confirmation <2s | Manual timing during console tests | Planned |
| SC-002: View 100 tasks <1s | Performance test with 100 tasks | Planned |
| SC-003: Mark complete <2s | Manual timing | Planned |
| SC-004: All 5 operations in <5min first use | Manual walkthrough timing | Planned |
| SC-005: 100 tasks no degradation | Load test with 100 tasks | Planned |
| SC-006: 100% valid commands succeed | Contract tests for all commands | Planned |
| SC-007: 100% invalid inputs have clear errors | Error path tests | Planned |
| SC-008: Help text documents all features | Manual review of help command | Planned |
| SC-009: Task IDs stable and unique | Unit tests for ID generation | Planned |
| SC-010: Clean start/exit 100% | Integration tests | Planned |

### User Experience Goals

| Goal | How Validated |
|------|---------------|
| UX-001: Intuitive first task add | User walkthrough (no docs) |
| UX-002: Error messages guide users | Review all error message text |
| UX-003: Immediate feedback | All commands return result message |
| UX-004: Consistent command patterns | Review command interface consistency |

**Next Step**: Generate `tasks.md` via `/sp.tasks` to break down implementation into executable units.

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-04 | Claude Code | Initial architecture plan created |
