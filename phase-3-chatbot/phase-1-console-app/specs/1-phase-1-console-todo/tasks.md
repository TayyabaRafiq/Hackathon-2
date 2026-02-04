# Task Breakdown: Phase I Console Todo Application

**Feature**: Phase I Console Todo Application
**Branch**: `1-phase-1-console-todo`
**Created**: 2026-01-04
**Spec**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)

## Overview

This document breaks down the implementation of the Phase I console todo application into executable tasks organized by user story. Each user story represents an independently testable increment of functionality, following test-driven development (TDD) principles.

**Total Tasks**: 44
**Test-Driven**: Yes (≥80% coverage target)
**Organization**: By user story priority (P1 → P2 → P3)

## User Story Mapping

| User Story | Priority | Tasks | Independent Test Criteria |
|------------|----------|-------|---------------------------|
| US1: Add New Task | P1 | 8 | Launch app → add task → verify task created with ID |
| US2: View All Tasks | P1 | 5 | Pre-populate tasks → list → verify all displayed |
| US7: Exit Application | P1 | 3 | Launch app → exit → verify clean termination |
| US3: Mark Task Complete | P2 | 4 | Create task → mark complete → verify status changed |
| US6: Delete Task | P2 | 4 | Create task → delete → verify removal |
| US4: Mark Task Incomplete | P3 | 3 | Complete task → mark incomplete → verify status |
| US5: Update Task Description | P3 | 4 | Create task → update → verify description changed |

**MVP Scope** (Minimum Viable Product): User Stories 1, 2, 7 (Add, View, Exit) = 16 tasks

## Phase 1: Setup & Project Initialization

**Goal**: Initialize Python project structure with all required tooling and dependencies.

### Tasks

- [ ] T001 Verify Python 3.13+ and UV are installed and accessible
- [ ] T002 [P] Create src/todo_app package structure with __init__.py
- [ ] T003 [P] Create tests package structure (unit/, integration/, contract/)
- [ ] T004 [P] Create pytest configuration in pyproject.toml with testpaths and coverage settings
- [ ] T005 [P] Create mypy configuration in pyproject.toml with strict mode settings
- [ ] T006 [P] Create ruff configuration in pyproject.toml with linting rules
- [ ] T007 [P] Create black configuration in pyproject.toml with formatting rules
- [ ] T008 Verify all dev tools work: pytest --version, mypy --version, ruff --version, black --version

**Acceptance**: All tools installed, directory structure matches plan.md, configuration files validate successfully.

## Phase 2: Foundational Components

**Goal**: Implement core domain layer components that all user stories depend on.

### Tasks

- [ ] T009 [P] Write unit tests for Task model in tests/unit/test_task_model.py
- [ ] T010 [P] Implement Task dataclass in src/todo_app/models/task.py with id, description, completed fields
- [ ] T011 [P] Add Task validation in __post_init__ (1-500 char description, positive ID)
- [ ] T012 [P] Write unit tests for MemoryStore in tests/unit/test_memory_store.py
- [ ] T013 [P] Implement MemoryStore in src/todo_app/storage/memory_store.py with list storage
- [ ] T014 [P] Implement ID generation with auto-incrementing counter in MemoryStore
- [ ] T015 [P] Write unit tests for validators in tests/unit/test_validators.py
- [ ] T016 [P] Implement validate_description() in src/todo_app/utils/validators.py
- [ ] T017 [P] Implement validate_task_id() in src/todo_app/utils/validators.py
- [ ] T018 [P] Create Command base class in src/todo_app/commands/base.py with execute() and help_text() abstract methods

**Acceptance**: All foundational components pass unit tests with ≥80% coverage; Task model validates correctly; MemoryStore generates unique IDs.

## Phase 3: User Story 1 - Add New Task (P1)

**Goal**: Enable users to add tasks with descriptions, creating the foundational capability.

**Independent Test**: Launch application → enter "add Buy groceries" → verify task 1 created → exit

### Tasks

- [ ] T019 [US1] Write unit tests for TaskService.create_task() in tests/unit/test_task_service.py
- [ ] T020 [US1] Implement TaskService class in src/todo_app/services/task_service.py with constructor accepting MemoryStore
- [ ] T021 [US1] Implement TaskService.create_task(description) method with validation and storage
- [ ] T022 [P] [US1] Write unit tests for AddTaskCommand in tests/unit/test_commands.py
- [ ] T023 [P] [US1] Implement AddTaskCommand in src/todo_app/commands/add_task.py with execute() and help_text()
- [ ] T024 [US1] Write contract test for US1 acceptance scenarios in tests/contract/test_acceptance_scenarios.py
- [ ] T025 [P] [US1] Implement Console class in src/todo_app/ui/console.py with print_message() and read_input() methods
- [ ] T026 [US1] Run contract tests and verify US1 acceptance scenarios pass

**Acceptance**: Users can add tasks; empty descriptions rejected; special characters preserved; task created with unique ID and incomplete status.

## Phase 4: User Story 2 - View All Tasks (P1)

**Goal**: Enable users to view all tasks in a readable format.

**Independent Test**: Add 3 tasks → enter "list" → verify all tasks displayed with ID, description, status

### Tasks

- [ ] T027 [US2] Write unit tests for TaskService.get_all_tasks() in tests/unit/test_task_service.py
- [ ] T028 [US2] Implement TaskService.get_all_tasks() method returning list of tasks in creation order
- [ ] T029 [P] [US2] Write unit tests for Formatter class in tests/unit/test_formatter.py
- [ ] T030 [P] [US2] Implement Formatter class in src/todo_app/ui/formatter.py with format_task_list() method
- [ ] T031 [P] [US2] Implement ListTasksCommand in src/todo_app/commands/list_tasks.py using Formatter
- [ ] T032 [US2] Write contract test for US2 acceptance scenarios (3 tasks, empty list, 10 tasks) in tests/contract/test_acceptance_scenarios.py
- [ ] T033 [US2] Run contract tests and verify US2 acceptance scenarios pass

**Acceptance**: All tasks displayed with ID, description, completion status; empty list shows appropriate message; creation order preserved.

## Phase 5: User Story 7 - Exit Application (P1)

**Goal**: Provide clean application termination.

**Independent Test**: Launch application → enter "exit" → verify goodbye message and clean termination

### Tasks

- [ ] T034 [P] [US7] Implement ExitCommand in src/todo_app/commands/exit_cmd.py returning exit signal
- [ ] T035 [P] [US7] Implement HelpCommand in src/todo_app/commands/help_cmd.py listing all commands
- [ ] T036 [US7] Write contract test for US7 acceptance scenarios in tests/contract/test_acceptance_scenarios.py
- [ ] T037 [US7] Run contract tests and verify US7 acceptance scenarios pass

**Acceptance**: Exit command terminates application cleanly; goodbye message displayed; no errors or warnings.

## Phase 6: Main Application Loop (P1 Foundation)

**Goal**: Implement REPL main loop that ties all P1 user stories together.

**Independent Test**: Launch app → add task → list tasks → exit → verify full workflow

### Tasks

- [ ] T038 Write tests for main loop in tests/integration/test_command_flow.py (add → list → exit sequence)
- [ ] T039 Implement build_command_registry() in src/todo_app/main.py creating command dict
- [ ] T040 Implement main REPL loop in src/todo_app/main.py (prompt → parse → execute → display)
- [ ] T041 Add welcome message and error handling to main loop
- [ ] T042 Add __main__ entry point to src/todo_app/main.py
- [ ] T043 Update pyproject.toml [project.scripts] to define 'todo' command
- [ ] T044 Run integration tests for P1 user stories (US1 + US2 + US7 flow)

**Acceptance**: Application launches; displays welcome; accepts commands; executes add/list/exit; handles invalid input gracefully; terminates cleanly.

**MVP CHECKPOINT**: At this point, US1 + US2 + US7 provide a working minimal product.

## Phase 7: User Story 3 - Mark Task Complete (P2)

**Goal**: Enable completion status tracking.

**Independent Test**: Add task → enter "complete 1" → list → verify task 1 marked complete

### Tasks

- [ ] T045 [US3] Write unit tests for TaskService.mark_complete(task_id) in tests/unit/test_task_service.py
- [ ] T046 [US3] Implement TaskService.mark_complete(task_id) method with validation
- [ ] T047 [P] [US3] Implement CompleteTaskCommand in src/todo_app/commands/complete_task.py
- [ ] T048 [US3] Write contract test for US3 acceptance scenarios in tests/contract/test_acceptance_scenarios.py
- [ ] T049 [US3] Register CompleteTaskCommand in main.py command registry
- [ ] T050 [US3] Run contract tests and verify US3 acceptance scenarios pass

**Acceptance**: Tasks marked complete successfully; already-complete tasks report status; non-existent IDs report error; completion status visible in list.

## Phase 8: User Story 6 - Delete Task (P2)

**Goal**: Enable task removal.

**Independent Test**: Add task → enter "delete 1" → list → verify task removed

### Tasks

- [ ] T051 [US6] Write unit tests for TaskService.delete_task(task_id) in tests/unit/test_task_service.py
- [ ] T052 [US6] Implement TaskService.delete_task(task_id) method with validation
- [ ] T053 [P] [US6] Implement DeleteTaskCommand in src/todo_app/commands/delete_task.py
- [ ] T054 [US6] Write contract test for US6 acceptance scenarios (including double-delete) in tests/contract/test_acceptance_scenarios.py
- [ ] T055 [US6] Register DeleteTaskCommand in main.py command registry
- [ ] T056 [US6] Run contract tests and verify US6 acceptance scenarios pass

**Acceptance**: Tasks deleted permanently; non-existent IDs report error; double-delete handled gracefully; deleted tasks don't appear in list.

## Phase 9: User Story 4 - Mark Task Incomplete (P3)

**Goal**: Enable reopening completed tasks.

**Independent Test**: Add task → complete → enter "uncomplete 1" → list → verify task 1 incomplete

### Tasks

- [ ] T057 [US4] Write unit tests for TaskService.mark_incomplete(task_id) in tests/unit/test_task_service.py
- [ ] T058 [US4] Implement TaskService.mark_incomplete(task_id) method with validation
- [ ] T059 [P] [US4] Implement UncompleteTaskCommand in src/todo_app/commands/uncomplete_task.py
- [ ] T060 [US4] Write contract test for US4 acceptance scenarios in tests/contract/test_acceptance_scenarios.py
- [ ] T061 [US4] Register UncompleteTaskCommand in main.py command registry
- [ ] T062 [US4] Run contract tests and verify US4 acceptance scenarios pass

**Acceptance**: Completed tasks can be marked incomplete; already-incomplete tasks report status; non-existent IDs report error.

## Phase 10: User Story 5 - Update Task Description (P3)

**Goal**: Enable task description editing.

**Independent Test**: Add task "Buy groceries" → enter "update 1 Buy groceries and milk" → list → verify updated description

### Tasks

- [ ] T063 [US5] Write unit tests for TaskService.update_description(task_id, new_description) in tests/unit/test_task_service.py
- [ ] T064 [US5] Implement TaskService.update_description(task_id, new_description) method preserving completion status
- [ ] T065 [P] [US5] Implement UpdateTaskCommand in src/todo_app/commands/update_task.py
- [ ] T066 [US5] Write contract test for US5 acceptance scenarios in tests/contract/test_acceptance_scenarios.py
- [ ] T067 [US5] Register UpdateTaskCommand in main.py command registry
- [ ] T068 [US5] Run contract tests and verify US5 acceptance scenarios pass

**Acceptance**: Task descriptions updated successfully; empty descriptions rejected; completion status preserved; non-existent IDs report error.

## Phase 11: Polish & Quality Gates

**Goal**: Ensure all quality gates pass and application meets production standards.

### Tasks

- [ ] T069 [P] Run full test suite and verify ≥80% code coverage
- [ ] T070 [P] Run mypy in strict mode and fix all type errors
- [ ] T071 [P] Run ruff linter and fix all warnings
- [ ] T072 [P] Run black formatter on all source files
- [ ] T073 Write integration test for edge case: ID uniqueness after deletion in tests/integration/test_command_flow.py
- [ ] T074 Write integration test for edge case: 500 character description limit in tests/integration/test_command_flow.py
- [ ] T075 [P] Manual console test: Happy path workflow (add → list → complete → update → delete → list → exit)
- [ ] T076 [P] Manual console test: Error handling workflow (empty input, invalid IDs, unknown commands)
- [ ] T077 [P] Performance test: Add 100 tasks and verify <1s list time
- [ ] T078 [P] Performance test: Verify application startup <3s
- [ ] T079 Update README.md with complete usage instructions and examples
- [ ] T080 Verify all 10 success criteria from spec.md are satisfied

**Acceptance**: All tests pass; coverage ≥80%; type checking passes; linting passes; formatting consistent; README complete; all quality gates satisfied.

## Dependencies and Execution Order

### Dependency Graph (User Story Level)

```
Phase 1 (Setup) → Phase 2 (Foundational)
                       ↓
           ┌───────────┼───────────┐
           ↓           ↓           ↓
        US1 (Add)   US2 (View)  US7 (Exit)  ← P1 Stories (MVP)
           ↓           ↓           ↓
           └───────────┴───────────┘
                       ↓
              Phase 6 (Main Loop)
                       ↓
           ┌───────────┴───────────┐
           ↓                       ↓
        US3 (Complete)          US6 (Delete)  ← P2 Stories
                       ↓
           ┌───────────┴───────────┐
           ↓                       ↓
    US4 (Uncomplete)         US5 (Update)  ← P3 Stories
           ↓                       ↓
           └───────────┬───────────┘
                       ↓
              Phase 11 (Polish)
```

### Parallel Execution Opportunities

**Phase 1 (Setup)**: T002-T007 can run in parallel (all [P] marked)
**Phase 2 (Foundational)**: T009-T017 can run in parallel (independent components)
**Phase 3 (US1)**: T022-T023, T025 can run in parallel (different files)
**Phase 4 (US2)**: T029-T031 can run in parallel (different files)
**Phase 5 (US7)**: T034-T035 can run in parallel (different files)
**Phase 7-10**: Command implementations can be developed in parallel (different files)
**Phase 11 (Polish)**: T069-T072, T073-T074, T075-T078 can run in parallel

### Recommended Execution Strategy

**Strategy 1: MVP First (Fastest Path to Working Product)**
1. Phase 1 → Phase 2 (Foundation)
2. Phase 3 (US1: Add) + Phase 4 (US2: View) + Phase 5 (US7: Exit) in parallel
3. Phase 6 (Main Loop)
4. **CHECKPOINT**: Working MVP - add, view, exit functionality
5. Phase 7-10 (P2 and P3 stories) - can be done in any order or parallel
6. Phase 11 (Polish)

**Strategy 2: Complete by Priority (Follows Spec Priorities)**
1. Phase 1 → Phase 2
2. All P1 stories (US1, US2, US7) → Phase 6 (Main Loop)
3. All P2 stories (US3, US6) in parallel
4. All P3 stories (US4, US5) in parallel
5. Phase 11 (Polish)

**Strategy 3: Full Parallel (Maximum Parallelization)**
1. Phase 1 → Phase 2
2. US1, US2, US3, US4, US5, US6, US7 all in parallel (requires coordination on shared TaskService methods)
3. Phase 6 (Main Loop)
4. Phase 11 (Polish)

**Recommended**: Strategy 1 (MVP First) - delivers working product fastest, validates architecture early, reduces integration risk.

## Testing Strategy

### Test Coverage Requirements

- **Overall Target**: ≥80% code coverage
- **Unit Tests**: 70-80% of test effort (T009-T017, T019-T023, T027-T031, T045-T068)
- **Integration Tests**: 15-20% of test effort (T038, T044, T073-T074)
- **Contract Tests**: 10-15% of test effort (T024, T026, T032-T033, T036-T037, T048-T050, T054-T056, T060-T062, T066-T068)

### Test Organization

```
tests/
├── unit/
│   ├── test_task_model.py         # T009: Task dataclass tests
│   ├── test_memory_store.py       # T012: Storage tests
│   ├── test_validators.py         # T015: Validation tests
│   ├── test_task_service.py       # T019, T027, T045, T051, T057, T063: Business logic
│   ├── test_commands.py           # T022: Command tests
│   └── test_formatter.py          # T029: Formatter tests
├── integration/
│   └── test_command_flow.py       # T038, T044, T073, T074: End-to-end flows
└── contract/
    └── test_acceptance_scenarios.py # T024, T032, T036, T048, T054, T060, T066: Spec acceptance
```

### TDD Workflow (Red-Green-Refactor)

For each task group:
1. **Red**: Write failing tests (T009, T012, T015, T019, etc.)
2. **Green**: Implement minimum code to pass (T010-T011, T013-T014, T016-T017, T020-T021, etc.)
3. **Refactor**: Clean up while keeping tests green
4. **Verify**: Run full suite + coverage + linting + type checking
5. **Commit**: Git commit with task reference

## Implementation Workflow

### Task Execution Template

For each task:
1. Read task description and file path
2. If test task: Write tests based on spec acceptance scenarios
3. If implementation task: Implement to satisfy tests
4. Run tests for this component: `uv run pytest tests/unit/test_<module>.py -v`
5. Run linting: `uv run ruff check src/todo_app/<module>.py`
6. Run type checking: `uv run mypy src/todo_app/<module>.py`
7. Mark task complete: Update checkbox to `[x]`
8. Commit: `git commit -m "T00X: <task description>"`

### Quality Checks Per Task

- Tests pass for modified component
- Type hints present for all functions
- Docstrings present for all classes and public methods
- No linting warnings
- Code formatted with black

### Milestone Checkpoints

- **Checkpoint 1 (MVP)**: After T044 - US1, US2, US7 working
- **Checkpoint 2 (P2 Complete)**: After T056 - US3, US6 added
- **Checkpoint 3 (Full Feature Set)**: After T068 - US4, US5 added
- **Checkpoint 4 (Production Ready)**: After T080 - All quality gates passed

## Success Criteria Validation

Each phase validates specific success criteria from spec.md:

| Phase | Success Criteria Validated |
|-------|---------------------------|
| Phase 3 (US1) | SC-001: Add task <2s |
| Phase 4 (US2) | SC-002: View 100 tasks <1s |
| Phase 5 (US7) | SC-010: Clean start/exit |
| Phase 6 (Main Loop) | SC-004: All 5 operations <5min first use |
| Phase 7 (US3) | SC-003: Mark complete <2s |
| Phase 11 (Polish) | SC-005: 100 tasks no degradation |
| Phase 11 (Polish) | SC-006: 100% valid commands succeed |
| Phase 11 (Polish) | SC-007: 100% invalid inputs clear errors |
| Phase 11 (Polish) | SC-008: Help text documents all features |
| Phase 11 (Polish) | SC-009: Task IDs stable and unique |

## Notes

- **Task IDs**: Sequential T001-T080 for easy reference
- **[P] Marker**: Indicates parallelizable tasks (different files, no dependencies)
- **[USX] Marker**: Links task to user story for traceability
- **File Paths**: All tasks include explicit file paths from plan.md
- **Test-Driven**: Tests written before implementation for all components
- **Independent Stories**: Each user story (US1-US7) can be tested independently
- **MVP Scope**: US1 + US2 + US7 = 16 tasks for minimum viable product
- **Incremental Delivery**: Each phase delivers working, testable increment

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-04 | Claude Code | Initial task breakdown created |
