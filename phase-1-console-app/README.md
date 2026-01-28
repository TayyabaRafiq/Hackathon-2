# The Evolution of Todo - Phase I

**In-Memory Python Console Todo Application**

A spec-driven development hackathon project demonstrating AI-generated implementation (Claude Code) from human-authored specifications.

## Phase I Scope

Console-based todo management system with core features:
- Add tasks
- View task list
- Update task details
- Delete tasks
- Mark tasks complete/incomplete

**Constraints:**
- Python 3.13+
- In-memory storage (no persistence)
- Console interface only
- UV package manager

## Project Structure

```
todo-hack2/
├── src/
│   └── todo_app/          # Application source code (AI-generated)
│       └── __init__.py
├── tests/                  # Test suite (AI-generated)
│   └── __init__.py
├── specs/                  # Feature specifications (human-authored)
│   └── 1-phase-1-console-todo/
│       ├── spec.md         # Feature specification
│       ├── plan.md         # Architecture plan (to be created)
│       └── tasks.md        # Task breakdown (to be created)
├── history/                # Development history
│   ├── prompts/            # Prompt History Records (PHRs)
│   └── adr/                # Architecture Decision Records
├── .specify/               # Spec-Kit Plus framework
│   ├── memory/
│   │   └── constitution.md # Project constitution
│   └── templates/          # Specification templates
└── pyproject.toml          # Python project configuration
```

## Setup

1. **Install UV** (if not already installed):
   ```bash
   curl -LsSf https://astral.sh/uv/install.sh | sh
   ```

2. **Install dependencies**:
   ```bash
   uv sync
   ```

3. **Verify installation**:
   ```bash
   uv run python --version  # Should show Python 3.13.2
   uv run pytest --version
   ```

## Development Workflow

This project follows **Spec-Driven Development (SDD)**:

1. **Specification** (`/sp.specify`) - Define feature requirements ✅ DONE
2. **Clarification** (`/sp.clarify`) - Resolve ambiguities (if needed)
3. **Planning** (`/sp.plan`) - Design architecture
4. **Task Breakdown** (`/sp.tasks`) - Create implementation tasks
5. **Implementation** (`/sp.implement`) - AI-generated code via Claude Code
6. **Testing** - Validate against specifications

## Current Status

- ✅ Constitution ratified (v1.0.0)
- ✅ Phase I specification created
- ✅ Python project initialized (UV + Python 3.13)
- ✅ Development tools configured (pytest, ruff, mypy, black)
- ⏳ Next: Architecture planning (`/sp.plan`)

## Quality Gates (Phase I)

- All console commands execute successfully
- Test coverage ≥ 80% (pytest)
- Type checking passes (mypy strict mode)
- Linting passes (ruff)
- No hardcoded configuration values
- All behavior matches specification

## Technology Stack

- **Language**: Python 3.13+
- **Package Manager**: UV 0.6.6
- **Testing**: pytest 9.0.2
- **Linting**: ruff 0.14.10
- **Type Checking**: mypy 1.19.1
- **Formatting**: black 25.12.0

## Hackathon Context

This is **Phase I** of a 5-phase evolution:

- **Phase I**: Console app (in-memory) ← **Current**
- **Phase II**: Web app (Next.js, FastAPI, Neon DB)
- **Phase III**: AI chatbot (OpenAI, MCP SDK)
- **Phase IV**: Kubernetes (Docker, Minikube, Helm)
- **Phase V**: Cloud-native (Kafka, Dapr, DOKS)

## Documentation

- [Constitution](.specify/memory/constitution.md) - Project principles and governance
- [Specification](specs/1-phase-1-console-todo/spec.md) - Phase I feature spec
- [Claude Code Rules](CLAUDE.md) - AI assistant instructions

## License

This project is for educational and hackathon purposes.
