# Spec-Driven Development Architecture

**Skill ID:** `spec-driven-architecture`
**Category:** SDD Architecture
**Last Updated:** 2026-02-05

## Description

Design and build software systems using Spec-Driven Development (SDD), a methodology that separates business understanding from technical planning and ensures all implementation is grounded in written specifications. This skill covers the complete SDD lifecycle:
- Establishing project constitution (principles)
- Writing feature specifications (requirements)
- Creating architectural plans (design decisions)
- Breaking down into testable tasks
- Executing implementation with traceability

## When to Use This Skill

- Starting a new project or feature
- Establishing coding standards and principles
- Designing complex systems that require planning
- Ensuring team alignment on requirements and approach
- Maintaining architectural documentation
- Creating traceable implementation records

## Prerequisites

**Required Knowledge:**
- Software architecture patterns
- Requirements gathering and analysis
- Technical writing skills
- Understanding of ADRs (Architecture Decision Records)
- Familiarity with Markdown documentation

**Tools:**
- `.specify/` directory structure
- Markdown editor
- Version control (Git)
- Understanding of MCP tools (for AI-assisted development)

## SDD Philosophy

### Core Principles

1. **Separation of Concerns:**
   - Business requirements (spec) separate from technical design (plan)
   - Planning separate from implementation
   - Documentation separate from code

2. **Written Before Built:**
   - Specification written before planning
   - Plan written before implementation
   - Tasks defined before coding
   - No code without a spec

3. **Single Source of Truth:**
   - Constitution defines project-wide principles
   - Spec defines what to build
   - Plan defines how to build it
   - Tasks define the work breakdown
   - Code implements the tasks

4. **Traceability:**
   - Every feature has a spec
   - Every implementation references a task
   - Every architectural decision documented in ADR
   - Every user interaction captured in PHR

---

## SDD Process Overview

```
┌─────────────────────────────────────────────────────┐
│                  SDD Lifecycle                      │
└─────────────────────────────────────────────────────┘

1. CONSTITUTION
   └─> Define project principles, standards, constraints
       Output: .specify/memory/constitution.md

2. SPECIFICATION
   └─> Capture business requirements and acceptance criteria
       Output: specs/<feature>/spec.md

3. PLANNING
   └─> Design architecture, evaluate options, make decisions
       Output: specs/<feature>/plan.md
       Output: history/adr/<decision>.md (if significant)

4. TASK BREAKDOWN
   └─> Define testable units of work with acceptance criteria
       Output: specs/<feature>/tasks.md

5. IMPLEMENTATION
   └─> Execute tasks, write code, run tests
       Output: Code changes + tests
       Output: history/prompts/<feature>/*.phr.md

6. VALIDATION
   └─> Cross-artifact consistency check
       Verify: spec ↔ plan ↔ tasks ↔ code alignment

┌─────────────────────────────────────────────────────┐
│            Continuous Documentation                 │
│  - PHR: Record every user interaction               │
│  - ADR: Document significant decisions              │
│  - Tests: Validate acceptance criteria              │
└─────────────────────────────────────────────────────┘
```

---

## Phase 1: Constitution

**Purpose:** Establish project-wide principles, standards, and constraints that guide all development work.

### Constitution Structure

```markdown
# Project Constitution

## Vision
[High-level project purpose and goals]

## Principles
1. **Code Quality**
   - Principle statement
   - Rationale
   - Measurement

2. **Testing Standards**
   - Required coverage
   - Test types
   - Quality gates

3. **Architecture Guidelines**
   - Patterns to follow
   - Anti-patterns to avoid
   - Technology stack

4. **Security & Privacy**
   - Data handling rules
   - Authentication requirements
   - Compliance needs

5. **Performance Budgets**
   - Response time targets
   - Resource limits
   - Scalability goals

6. **Documentation Standards**
   - What to document
   - When to document
   - Format requirements

## Non-Negotiables
- Hard constraints that cannot be violated
- Compliance requirements
- Platform limitations

## Decision Framework
- How to make architectural decisions
- When to create ADRs
- Approval process
```

### Constitution Example

```markdown
# AI Chat Application Constitution

## Vision
Build a production-ready, privacy-first AI chat platform that prioritizes user experience and system reliability.

## Principles

### 1. Code Quality
**Principle:** All code must be type-safe, tested, and reviewed.

**Rationale:** Type safety prevents runtime errors; tests ensure correctness; reviews catch issues early.

**Measurement:**
- 100% TypeScript (no `any` types)
- 80%+ test coverage
- All PRs require approval

### 2. Testing Standards
**Principle:** Test-driven development with comprehensive coverage.

**Requirements:**
- Unit tests for all business logic
- Integration tests for API endpoints
- E2E tests for critical user flows
- All tests pass before merge

### 3. Architecture Guidelines
**Patterns:**
- Stateless backend (database as source of truth)
- MCP tools for AI agent operations
- Repository pattern for data access
- API-first design

**Anti-Patterns:**
- No in-memory session state
- No direct DB access from AI agents
- No hardcoded secrets
- No global mutable state

### 4. Security & Privacy
**Rules:**
- All user data encrypted at rest
- HTTPS only in production
- API keys in environment variables
- No PII in logs
- GDPR-compliant data deletion

### 5. Performance Budgets
**Targets:**
- API response time: p95 < 2s
- First token (streaming): < 500ms
- Database queries: < 100ms
- Frontend bundle: < 200KB gzipped

## Non-Negotiables
- No deployment without passing tests
- No credentials in version control
- No breaking changes without migration plan
- All data changes must be reversible
```

**Quality Checks:**
- ✅ Constitution exists at `.specify/memory/constitution.md`
- ✅ All team members have read and acknowledged
- ✅ Principles are measurable and testable
- ✅ Updated when new patterns emerge
- ✅ Referenced in PR reviews and code discussions

---

## Phase 2: Specification

**Purpose:** Define WHAT to build from the user's perspective, without prescribing HOW to build it.

### Specification Template

```markdown
# Feature Name

**Feature ID:** `<unique-identifier>`
**Status:** Draft | Review | Approved | Implemented
**Owner:** [Name/Team]
**Created:** YYYY-MM-DD
**Updated:** YYYY-MM-DD

## Overview
[2-3 sentence summary of the feature]

## Goals
- Primary goal
- Secondary goals
- Success metrics

## Non-Goals
- Explicitly out of scope
- Future considerations
- Related but separate work

## User Stories

### Story 1: [User Action]
**As a** [user role]
**I want to** [action]
**So that** [benefit]

**Acceptance Criteria:**
- [ ] Given [context], when [action], then [outcome]
- [ ] Given [context], when [action], then [outcome]

### Story 2: [Another Action]
[Repeat structure]

## Functional Requirements

### FR-1: [Requirement Name]
**Description:** Detailed requirement statement

**Input:** What the user provides
**Output:** What the system returns
**Behavior:** How it should work

**Edge Cases:**
- Empty input
- Invalid data
- Maximum limits
- Concurrent access

### FR-2: [Another Requirement]
[Repeat structure]

## Non-Functional Requirements

### Performance
- Response time targets
- Throughput requirements
- Scalability needs

### Security
- Authentication requirements
- Authorization rules
- Data protection

### Usability
- User experience expectations
- Accessibility standards
- Mobile support

## Data Model (Conceptual)
- Entities involved (not schema)
- Relationships
- Data lifecycle

## API Contracts (If Applicable)

### POST /api/endpoint
**Request:**
```json
{
  "field": "type"
}
```

**Response:**
```json
{
  "field": "type"
}
```

**Errors:**
- 400: Invalid input
- 401: Unauthorized
- 500: Server error

## UI/UX Requirements (If Applicable)
- Wireframes or mockups
- User flow diagrams
- Interaction patterns

## Dependencies
- External services required
- Internal features needed first
- Third-party libraries

## Open Questions
- [ ] Question 1?
- [ ] Question 2?

## Acceptance Criteria (Overall)
- [ ] All user stories satisfied
- [ ] All functional requirements met
- [ ] All NFRs validated
- [ ] Tests passing
- [ ] Documentation complete

## Appendix
- References
- Research notes
- Alternative approaches considered
```

### Specification Example

```markdown
# User Task Management via Chat

**Feature ID:** `chat-task-management`
**Status:** Approved
**Owner:** Product Team
**Created:** 2026-02-01

## Overview
Allow users to create, view, update, and delete tasks through natural conversation with the AI assistant, with tasks persisted in the database.

## Goals
- Enable task creation via chat without UI forms
- Provide natural language task queries
- Maintain task history linked to conversations
- Success metric: 80% of users create at least one task via chat

## Non-Goals
- Task sharing between users (future)
- Recurring tasks (future)
- Task templates (future)

## User Stories

### Story 1: Create Task via Chat
**As a** user
**I want to** create tasks by telling the AI
**So that** I can quickly capture todos without leaving the chat

**Acceptance Criteria:**
- [ ] Given I'm in a chat, when I say "Create task: Buy groceries", then a task is created
- [ ] Given task is created, when I ask "What tasks do I have?", then I see the new task
- [ ] Given invalid task input, when I try to create, then I get a helpful error message

### Story 2: View Tasks
**As a** user
**I want to** ask the AI about my tasks
**So that** I can remember what I need to do

**Acceptance Criteria:**
- [ ] Given I have tasks, when I ask "What tasks do I have?", then I see all active tasks
- [ ] Given I have no tasks, when I ask, then I get a friendly "no tasks" message
- [ ] Given I have completed tasks, when I ask for completed tasks, then I see them separately

## Functional Requirements

### FR-1: Task Creation
**Description:** AI assistant can create tasks on behalf of the user

**Input:**
- User message containing task intent (e.g., "Create task: Buy milk")
- Task title (required)
- Task description (optional)

**Output:**
- Confirmation message with task ID
- Task stored in database

**Behavior:**
- AI extracts task details from natural language
- AI calls MCP tool `create_task` with extracted data
- Task assigned to current user
- Task linked to current conversation

**Edge Cases:**
- Empty title: Request clarification
- Duplicate detection: Warn user
- Maximum title length: 500 chars

### FR-2: Task Retrieval
**Description:** AI assistant can query and display user's tasks

**Input:** User query (e.g., "Show my tasks", "What do I need to do?")
**Output:** Formatted list of tasks

**Behavior:**
- AI calls MCP tool `get_tasks` with filters
- Results formatted in readable list
- Grouped by status (pending, completed)

### FR-3: Task Update
**Description:** AI assistant can update task status and details

**Input:** Update command (e.g., "Mark 'Buy groceries' as done")
**Output:** Confirmation of update

**Behavior:**
- AI identifies task by title or ID
- AI calls MCP tool `update_task`
- Timestamps updated automatically

### FR-4: Task Deletion
**Description:** AI assistant can delete tasks (soft delete)

**Input:** Delete command (e.g., "Delete my grocery task")
**Output:** Confirmation of deletion

**Behavior:**
- AI confirms deletion intent
- AI calls MCP tool `delete_task`
- Task marked deleted (not hard deleted)

## Non-Functional Requirements

### Performance
- Task creation: < 2s end-to-end
- Task retrieval: < 1s for 100 tasks
- Concurrent task operations supported

### Security
- Users can only access their own tasks
- Task data encrypted at rest
- Audit trail for all task operations

### Usability
- Natural language understanding for task operations
- Helpful error messages
- Confirmation for destructive actions

## Data Model (Conceptual)

**Entities:**
- Task (id, user_id, conversation_id, title, description, status, timestamps)
- Linked to User and Conversation

**Relationships:**
- User has many Tasks
- Conversation has many Tasks (optional linkage)
- Task created_by Message (audit trail)

## API Contracts

### MCP Tool: create_task
**Input:**
```json
{
  "user_id": "uuid",
  "title": "string",
  "description": "string?",
  "conversation_id": "uuid?"
}
```

**Output:**
```json
{
  "success": true,
  "task_id": "uuid"
}
```

### MCP Tool: get_tasks
**Input:**
```json
{
  "user_id": "uuid",
  "status": "pending|completed|all",
  "limit": 50
}
```

**Output:**
```json
{
  "success": true,
  "tasks": [
    {
      "id": "uuid",
      "title": "string",
      "status": "string",
      "created_at": "iso-datetime"
    }
  ]
}
```

## Dependencies
- Database schema for tasks table
- MCP tools implementation
- AI agent with tool-use capability
- Chat backend integration

## Open Questions
- [x] Should tasks have due dates? → Yes, optional field
- [x] Should tasks have priorities? → Yes, 0-10 scale
- [ ] Should we support task attachments?

## Acceptance Criteria
- [x] All user stories passing
- [x] All functional requirements implemented
- [x] Performance targets met
- [ ] Security audit complete
- [ ] User testing done (5+ users)
```

**Quality Checks:**
- ✅ Spec exists at `specs/<feature>/spec.md`
- ✅ All user stories have acceptance criteria
- ✅ Functional requirements are testable
- ✅ Non-functional requirements are measurable
- ✅ No implementation details (those go in plan)
- ✅ Open questions resolved before planning

---

## Phase 3: Planning

**Purpose:** Define HOW to build the feature, making architectural decisions and evaluating tradeoffs.

### Planning Template

```markdown
# Feature Name - Implementation Plan

**Feature:** [Link to spec.md]
**Status:** Draft | Review | Approved
**Architect:** [Name]
**Created:** YYYY-MM-DD

## Architecture Overview
[High-level description of the approach]

## Key Decisions

### Decision 1: [Decision Name]
**Options Considered:**
1. Option A: [Description]
   - Pros: [List]
   - Cons: [List]
   - Complexity: Low | Medium | High

2. Option B: [Description]
   - Pros: [List]
   - Cons: [List]
   - Complexity: Low | Medium | High

**Decision:** Option [X] chosen

**Rationale:** [Why this option was selected]

**ADR:** [Link to ADR if architecturally significant]

### Decision 2: [Another Decision]
[Repeat structure]

## System Design

### Component Architecture
```
[ASCII diagram or description of components]
```

### Data Flow
```
1. User action
2. Frontend validates
3. API receives request
4. Business logic processes
5. Database updated
6. Response returned
```

### Database Schema Changes
```sql
-- New tables or columns
CREATE TABLE tasks (
  id UUID PRIMARY KEY,
  ...
);

-- Indexes
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
```

### API Design

#### New Endpoints
- `POST /api/tasks` - Create task
- `GET /api/tasks` - List tasks
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

#### Modified Endpoints
- `POST /api/chat` - Add task tool support

### MCP Tools Design

#### Tool: create_task
**Schema:**
```json
{
  "name": "create_task",
  "description": "Create a new task",
  "input_schema": {
    "type": "object",
    "properties": {
      "title": {"type": "string"},
      "description": {"type": "string"}
    },
    "required": ["title"]
  }
}
```

**Implementation:** `app/mcp_tools/task_tools.py::create_task()`

## Technical Approach

### Backend Changes
- **Files:** `app/models/task.py`, `app/routers/tasks.py`, `app/mcp_tools/task_tools.py`
- **Patterns:** Repository pattern for task data access
- **Testing:** Unit tests for MCP tools, integration tests for API

### Frontend Changes
- **Files:** `components/TaskList.tsx`, `hooks/useTasks.ts`
- **Patterns:** React Query for server state
- **Testing:** Component tests with React Testing Library

### Database Changes
- **Migration:** `alembic/versions/xxx_add_tasks_table.py`
- **Rollback:** Drop tasks table, remove foreign keys
- **Data:** No seed data required

## Non-Functional Requirements

### Performance
- Task creation: Use async operations, no blocking
- Task retrieval: Index on user_id, status
- Pagination: Limit 50 tasks per page

### Security
- Authorization: Verify user_id matches authenticated user
- Input validation: Pydantic schemas
- SQL injection: SQLModel parameterized queries

### Reliability
- Error handling: Return user-friendly messages
- Transactions: Atomic task operations
- Idempotency: Support retry on create_task

## Dependencies

### Must Complete First
- Database migration deployed
- MCP tools framework available

### Can Develop in Parallel
- Frontend task list component
- Backend task API endpoints

### External Dependencies
- None

## Risks and Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| AI fails to extract task details | High | Medium | Add confirmation step, allow manual input |
| Duplicate task creation | Low | High | Add duplicate detection logic |
| Performance with 1000+ tasks | Medium | Low | Implement pagination, add indexes |

## Rollback Plan
1. Disable task feature flag
2. Revert code changes
3. Run down migration (optional, if no data)

## Testing Strategy

### Unit Tests
- MCP tool functions (create, get, update, delete)
- Task model validations
- Business logic for duplicate detection

### Integration Tests
- API endpoints with database
- AI agent calling MCP tools
- Full chat-to-task workflow

### E2E Tests
- User creates task via chat
- User views tasks via chat
- User completes task via chat

## Success Metrics
- All acceptance criteria from spec.md met
- Test coverage > 80%
- Performance targets hit
- Zero critical bugs in first week

## Open Issues
- [ ] Define behavior when conversation is deleted
- [ ] Clarify task priority sorting logic

## Timeline Estimate
- Database schema: 1 day
- MCP tools: 2 days
- API endpoints: 2 days
- Frontend: 3 days
- Testing: 2 days
- **Total:** ~2 weeks (estimate only, not commitment)
```

### ADR Creation Trigger

**Create an ADR when:**
1. **Impact:** Decision has long-term architectural consequences
2. **Alternatives:** Multiple viable options with significant tradeoffs
3. **Scope:** Decision is cross-cutting (affects multiple parts of system)

**Example ADR Triggers:**
- Choosing database (PostgreSQL vs MongoDB)
- Authentication approach (JWT vs sessions)
- State management (Redux vs Context)
- Deployment platform (AWS vs GCP vs Azure)
- API style (REST vs GraphQL)

**Quality Checks:**
- ✅ Plan exists at `specs/<feature>/plan.md`
- ✅ All key decisions documented with rationale
- ✅ Component architecture clear
- ✅ Database schema changes specified
- ✅ API contracts defined
- ✅ Risks identified with mitigations
- ✅ Testing strategy comprehensive
- ✅ ADRs created for significant decisions

---

## Phase 4: Task Breakdown

**Purpose:** Decompose the plan into testable, atomic units of work.

### Tasks Template

```markdown
# Feature Name - Task Breakdown

**Feature:** [Link to spec.md]
**Plan:** [Link to plan.md]
**Status:** Not Started | In Progress | Complete
**Created:** YYYY-MM-DD

## Task Overview
Total tasks: X
Estimated effort: Y days

## Task Dependencies
```
graph TD
  T1[Task 1] --> T3[Task 3]
  T2[Task 2] --> T3
  T3 --> T4[Task 4]
```

## Tasks

### T1: Database Schema Migration
**Status:** Not Started | In Progress | Complete
**Owner:** [Name]
**Estimate:** 4 hours
**Priority:** P0 (Blocker)

**Description:**
Create Alembic migration to add tasks table with required columns and indexes.

**Acceptance Criteria:**
- [ ] Migration file created in `alembic/versions/`
- [ ] Tasks table created with columns: id, user_id, title, description, status, priority, timestamps
- [ ] Foreign key to users table with CASCADE delete
- [ ] Indexes on user_id and status
- [ ] Migration runs successfully on dev database
- [ ] Rollback migration tested

**Test Cases:**
```python
def test_tasks_table_exists():
    # Verify table created
    assert table_exists('tasks')

def test_foreign_key_cascade():
    # Delete user, verify tasks deleted
    user = create_user()
    task = create_task(user_id=user.id)
    delete_user(user.id)
    assert task_not_exists(task.id)
```

**Files Changed:**
- `alembic/versions/xxx_add_tasks_table.py`

**Dependencies:**
- None (foundational task)

---

### T2: Task Model Definition
**Status:** Not Started
**Owner:** [Name]
**Estimate:** 2 hours
**Priority:** P0 (Blocker)

**Description:**
Define SQLModel Task model with validation and relationships.

**Acceptance Criteria:**
- [ ] Task model created in `app/models/task.py`
- [ ] All fields defined with proper types
- [ ] Validation constraints added (title length, status enum, priority range)
- [ ] Relationships to User and Conversation defined
- [ ] Unit tests passing

**Test Cases:**
```python
def test_task_model_validation():
    # Valid task
    task = Task(title="Valid", user_id=uuid4(), status="pending")
    assert task.title == "Valid"

    # Invalid status
    with pytest.raises(ValidationError):
        Task(title="Test", user_id=uuid4(), status="invalid")

    # Title too long
    with pytest.raises(ValidationError):
        Task(title="x" * 501, user_id=uuid4())
```

**Files Changed:**
- `app/models/task.py`
- `tests/models/test_task.py`

**Dependencies:**
- T1 (Migration must exist)

---

### T3: MCP Tools Implementation
**Status:** Not Started
**Owner:** [Name]
**Estimate:** 6 hours
**Priority:** P0 (Critical)

**Description:**
Implement MCP tools for task CRUD operations.

**Acceptance Criteria:**
- [ ] `create_task` tool implemented
- [ ] `get_tasks` tool implemented
- [ ] `update_task` tool implemented
- [ ] `delete_task` tool implemented
- [ ] All tools registered in MCP registry
- [ ] Input validation via Pydantic schemas
- [ ] Error handling returns ToolResponse with success flag
- [ ] Unit tests for all tools passing

**Test Cases:**
```python
def test_create_task_tool():
    input_data = CreateTaskInput(user_id=user_id, title="Test")
    result = create_task_tool(input_data)
    assert result.success == True
    assert "task_id" in result.data

def test_create_task_duplicate_detection():
    # Create task
    create_task_tool(CreateTaskInput(user_id=user_id, title="Test"))
    # Try duplicate
    result = create_task_tool(CreateTaskInput(user_id=user_id, title="Test"))
    assert "already exists" in result.data.get("warning", "")
```

**Files Changed:**
- `app/mcp_tools/task_tools.py`
- `app/mcp_tools/schemas.py`
- `app/mcp_tools/registry.py`
- `tests/mcp_tools/test_task_tools.py`

**Dependencies:**
- T1 (Database schema)
- T2 (Task model)

---

### T4: Chat Backend Integration
**Status:** Not Started
**Owner:** [Name]
**Estimate:** 4 hours
**Priority:** P1 (Important)

**Description:**
Integrate task MCP tools with chat endpoint, allowing AI agent to manage tasks.

**Acceptance Criteria:**
- [ ] Task tools added to MCP_TOOL_DEFINITIONS
- [ ] AI agent can call task tools during chat
- [ ] Tool execution results included in AI context
- [ ] Integration tests passing

**Test Cases:**
```python
@pytest.mark.asyncio
async def test_chat_creates_task():
    # User says "Create task: Buy milk"
    response = await client.post(
        "/api/user123/chat",
        json={"message": "Create task: Buy milk"}
    )
    assert response.status_code == 200

    # Verify task created in database
    tasks = get_tasks(user_id="user123")
    assert len(tasks) == 1
    assert tasks[0].title == "Buy milk"
```

**Files Changed:**
- `app/routers/chat.py`
- `tests/routers/test_chat_integration.py`

**Dependencies:**
- T3 (MCP tools must exist)

---

### T5: Frontend Task List Component
**Status:** Not Started
**Owner:** [Name]
**Estimate:** 6 hours
**Priority:** P2 (Nice to have)

**Description:**
Create React component to display tasks (optional UI, main interface is chat).

**Acceptance Criteria:**
- [ ] TaskList component created
- [ ] Loads tasks from API
- [ ] Displays task title, status, priority
- [ ] Shows loading and error states
- [ ] Component tests passing

**Test Cases:**
```typescript
test('TaskList displays tasks', async () => {
  const mockTasks = [
    { id: '1', title: 'Task 1', status: 'pending' }
  ];

  render(<TaskList tasks={mockTasks} />);

  expect(screen.getByText('Task 1')).toBeInTheDocument();
});
```

**Files Changed:**
- `components/TaskList.tsx`
- `hooks/useTasks.ts`
- `tests/components/TaskList.test.tsx`

**Dependencies:**
- T4 (Backend must be ready)

---

## Task Summary

| ID | Task | Priority | Estimate | Status | Blocks |
|----|------|----------|----------|--------|--------|
| T1 | Database Migration | P0 | 4h | Not Started | T2, T3 |
| T2 | Task Model | P0 | 2h | Not Started | T3 |
| T3 | MCP Tools | P0 | 6h | Not Started | T4 |
| T4 | Chat Integration | P1 | 4h | Not Started | T5 |
| T5 | Frontend Component | P2 | 6h | Not Started | - |

**Total Estimate:** 22 hours (~3 days)

## Definition of Done
- [ ] All tasks completed
- [ ] All test cases passing
- [ ] Code reviewed and approved
- [ ] Documentation updated
- [ ] Deployed to staging
- [ ] Acceptance criteria from spec.md verified
```

**Quality Checks:**
- ✅ Tasks exist at `specs/<feature>/tasks.md`
- ✅ Every task has acceptance criteria
- ✅ Every task has test cases
- ✅ Dependencies clearly mapped
- ✅ Estimates provided (for planning, not commitments)
- ✅ Each task is independently testable
- ✅ Tasks reference specific files to change

---

## Phase 5: Implementation

**Purpose:** Execute the tasks, write code, run tests, and maintain traceability.

### Implementation Principles

1. **One Task at a Time:**
   - Complete T1 fully before starting T2
   - Update task status (Not Started → In Progress → Complete)
   - Run tests after each task

2. **Test-Driven Development:**
   - Write test cases from task first
   - Implement code to pass tests
   - Refactor with tests as safety net

3. **Traceability:**
   - Commit messages reference task ID (e.g., "T3: Implement MCP tools")
   - PR descriptions link to spec and task
   - PHR created after significant work

4. **No Deviation:**
   - If task unclear, update task.md first
   - If implementation differs from plan, update plan.md
   - If requirements change, update spec.md

### Implementation Workflow

```
For each task in tasks.md:

1. READ TASK
   - Review acceptance criteria
   - Review test cases
   - Identify files to change

2. WRITE TESTS
   - Create test file if needed
   - Write failing tests from task test cases
   - Run tests (should fail)

3. IMPLEMENT
   - Write minimal code to pass tests
   - Follow constitution principles
   - Reference plan.md for approach

4. VERIFY
   - Run tests (should pass)
   - Run linter/formatter
   - Check acceptance criteria

5. COMMIT
   - Commit message: "T<ID>: <Task name>"
   - Include task acceptance criteria in commit body

6. UPDATE TASK
   - Mark task as Complete in tasks.md
   - Note any deviations or learnings

7. CREATE PHR (if significant)
   - Capture implementation decisions
   - Record any challenges faced
   - Link to spec, plan, task
```

### Example Implementation Flow

**Task T3: MCP Tools Implementation**

**Step 1: Read Task**
```markdown
Reading specs/chat-task-management/tasks.md → T3

Acceptance Criteria:
- [ ] create_task tool implemented
- [ ] get_tasks tool implemented
- [ ] ...

Files to change:
- app/mcp_tools/task_tools.py
- app/mcp_tools/schemas.py
- tests/mcp_tools/test_task_tools.py
```

**Step 2: Write Tests**
```python
# tests/mcp_tools/test_task_tools.py

def test_create_task_tool():
    """Test create_task tool returns success and task_id"""
    input_data = CreateTaskInput(
        user_id=uuid4(),
        title="Test Task"
    )
    result = create_task_tool(input_data)

    assert result.success == True
    assert "task_id" in result.data

# Run: pytest tests/mcp_tools/test_task_tools.py
# Result: FAILED (function not implemented)
```

**Step 3: Implement**
```python
# app/mcp_tools/task_tools.py

def create_task_tool(input_data: CreateTaskInput) -> ToolResponse:
    """Create a new task for the user"""
    try:
        with get_session() as session:
            task = Task(
                user_id=input_data.user_id,
                title=input_data.title,
                description=input_data.description,
                status="pending"
            )
            session.add(task)
            session.commit()
            session.refresh(task)

            return ToolResponse(
                success=True,
                data={"task_id": str(task.id)}
            )
    except Exception as e:
        return ToolResponse(success=False, error=str(e))
```

**Step 4: Verify**
```bash
# Run tests
pytest tests/mcp_tools/test_task_tools.py
# Result: PASSED

# Check acceptance criteria
✓ create_task tool implemented
□ get_tasks tool implemented (continue to next test case)
```

**Step 5: Commit**
```bash
git add app/mcp_tools/task_tools.py tests/mcp_tools/test_task_tools.py
git commit -m "T3: Implement create_task MCP tool

Acceptance criteria:
- [x] create_task tool implemented
- [x] Input validation via Pydantic
- [x] Error handling returns ToolResponse
- [x] Unit test passing

Ref: specs/chat-task-management/tasks.md#T3"
```

**Step 6: Update Task**
```markdown
# In tasks.md

### T3: MCP Tools Implementation
**Status:** In Progress → Complete (when all parts done)

Acceptance Criteria:
- [x] create_task tool implemented
- [ ] get_tasks tool implemented
- [ ] update_task tool implemented
- [ ] delete_task tool implemented

Implementation Notes:
- Used SQLModel session management pattern
- Added duplicate detection logic (not in original plan, but helpful)
```

**Quality Checks:**
- ✅ Tests written before implementation
- ✅ All acceptance criteria checked off
- ✅ Commit message references task ID
- ✅ Code follows constitution principles
- ✅ No deviations from plan (or plan updated)

---

## Phase 6: Validation

**Purpose:** Ensure cross-artifact consistency and completeness.

### Validation Checklist

#### Spec ↔ Plan Alignment
- [ ] All functional requirements from spec addressed in plan
- [ ] All user stories covered by technical approach
- [ ] All acceptance criteria from spec testable in plan
- [ ] All dependencies from spec considered in plan
- [ ] All open questions from spec resolved in plan

#### Plan ↔ Tasks Alignment
- [ ] All components from plan have corresponding tasks
- [ ] All database changes from plan have migration tasks
- [ ] All API endpoints from plan have implementation tasks
- [ ] All MCP tools from plan have tool implementation tasks
- [ ] All testing requirements from plan covered in task test cases

#### Tasks ↔ Code Alignment
- [ ] All tasks have status (Not Started | In Progress | Complete)
- [ ] All complete tasks have passing tests
- [ ] All files mentioned in tasks exist and were modified
- [ ] All acceptance criteria from tasks verified
- [ ] All test cases from tasks implemented

#### Constitution Alignment
- [ ] Code follows principles from constitution
- [ ] Tests meet coverage requirements from constitution
- [ ] Performance budgets from constitution satisfied
- [ ] Security requirements from constitution met
- [ ] Documentation standards from constitution followed

### Validation Tools

**Automated Checks:**
```bash
# Verify all tasks have status
grep -L "Status:" specs/*/tasks.md

# Verify all specs have corresponding plans
for spec in specs/*/spec.md; do
  plan="${spec/spec.md/plan.md}"
  [[ -f "$plan" ]] || echo "Missing plan: $plan"
done

# Verify all completed tasks have tests
# (custom script to parse tasks.md and check test files)
```

**Manual Review Questions:**
1. Can someone unfamiliar with the feature read the spec and understand WHAT to build?
2. Can a developer read the plan and understand HOW to build it?
3. Can a developer pick any task and implement it independently?
4. Are all architectural decisions documented and justified?
5. Is there traceability from spec → plan → tasks → code?

---

## Prompt History Records (PHR)

**Purpose:** Capture AI-assisted development interactions for learning and traceability.

### When to Create PHRs

Create a PHR after:
- Completing a specification
- Finishing an architectural plan
- Implementing a task (or group of tasks)
- Debugging a complex issue
- Making a significant refactoring
- Any interaction that produced valuable insights

### PHR Structure

```markdown
---
id: 001
title: "Implement Task MCP Tools"
stage: green
date: 2026-02-05
surface: agent
model: claude-sonnet-4.5
feature: chat-task-management
branch: feature/task-management
user: developer@company.com
command: implement
labels: [mcp-tools, backend, testing]
links:
  spec: specs/chat-task-management/spec.md
  ticket: null
  adr: null
  pr: null
files_created:
  - app/mcp_tools/task_tools.py
  - tests/mcp_tools/test_task_tools.py
files_modified:
  - app/mcp_tools/registry.py
  - app/mcp_tools/schemas.py
tests_run:
  - pytest tests/mcp_tools/test_task_tools.py
---

## Prompt

Implement the MCP tools for task management as specified in T3 of tasks.md:
- create_task
- get_tasks
- update_task
- delete_task

Follow the test cases defined in the task and ensure proper error handling.

## Response

[AI assistant's implementation approach, code, and explanations]

## Outcome

Successfully implemented all four MCP tools with:
- Pydantic input validation
- SQLModel database operations
- Comprehensive error handling
- Unit tests with 95% coverage

All acceptance criteria from T3 met.

## Evaluation

**What Went Well:**
- Test-driven approach caught edge cases early
- Duplicate detection logic added proactively
- Clear separation between tool logic and database access

**What Could Improve:**
- Initial tests missed soft-delete scenario
- Tool schema could be more descriptive

**Learnings:**
- MCP tool pattern works well for stateless operations
- Pydantic validation prevents most input errors at the edge
```

### PHR Routing

PHRs are automatically routed based on stage and feature:

```
history/prompts/
├── constitution/
│   └── 001-define-code-standards.constitution.prompt.md
├── chat-task-management/
│   ├── 001-write-feature-spec.spec.prompt.md
│   ├── 002-design-architecture.plan.prompt.md
│   ├── 003-implement-mcp-tools.green.prompt.md
│   └── 004-add-task-list-ui.green.prompt.md
└── general/
    └── 001-setup-project.general.prompt.md
```

**Quality Checks:**
- ✅ PHR created after significant implementation work
- ✅ All placeholders filled (no {{FIELD}} remaining)
- ✅ Prompt text captured verbatim
- ✅ Response summarized (key decisions, not full output)
- ✅ Files created/modified listed
- ✅ Tests run documented
- ✅ Outcome and learnings recorded

---

## Architecture Decision Records (ADR)

**Purpose:** Document architecturally significant decisions with context and rationale.

### ADR Template

```markdown
# ADR-XXX: [Decision Title]

**Status:** Proposed | Accepted | Deprecated | Superseded
**Date:** YYYY-MM-DD
**Deciders:** [Names]
**Context:** [Feature or project context]

## Context and Problem Statement

[Describe the problem or decision that needs to be made]

## Decision Drivers

- [Driver 1: e.g., Performance requirements]
- [Driver 2: e.g., Team expertise]
- [Driver 3: e.g., Cost constraints]

## Considered Options

### Option 1: [Option Name]
**Description:** [What this option entails]

**Pros:**
- Pro 1
- Pro 2

**Cons:**
- Con 1
- Con 2

**Complexity:** Low | Medium | High

### Option 2: [Option Name]
[Repeat structure]

### Option 3: [Option Name]
[Repeat structure]

## Decision Outcome

**Chosen Option:** [Option X]

**Rationale:** [Why this option was chosen over others]

**Consequences:**
- **Positive:**
  - Consequence 1
  - Consequence 2
- **Negative:**
  - Consequence 1
  - Consequence 2
- **Neutral:**
  - Consequence 1

## Implementation Notes

- [Implementation detail 1]
- [Implementation detail 2]

## Validation

**How to verify this decision was correct:**
- Metric 1 (e.g., Response time < 2s)
- Metric 2 (e.g., Developer satisfaction survey)

**When to revisit:**
- If [condition 1]
- If [condition 2]

## Related Decisions

- [Link to related ADR 1]
- [Link to related ADR 2]

## References

- [Link to research 1]
- [Link to research 2]
```

### ADR Example

```markdown
# ADR-001: Use PostgreSQL for Chat Database

**Status:** Accepted
**Date:** 2026-02-01
**Deciders:** Architecture Team
**Context:** AI Chat Application - Data persistence layer

## Context and Problem Statement

The chat application needs a database to store users, conversations, messages, and tasks. We need to choose a database that supports:
- Structured data with relationships
- ACID transactions
- Efficient querying of conversation history
- Scalability to 100K+ users

## Decision Drivers

- Strong consistency requirements (messages must be in order)
- Complex queries (filter by user, conversation, date ranges)
- Team expertise (team has PostgreSQL experience)
- JSON storage for tool_calls and tool_results
- Open-source and cost-effective

## Considered Options

### Option 1: PostgreSQL (Relational)
**Description:** Use PostgreSQL with SQLModel ORM

**Pros:**
- ACID compliance ensures message ordering
- JSONB support for flexible tool data
- Excellent indexing for query performance
- Team has strong PostgreSQL expertise
- Mature ecosystem (Alembic, SQLModel, psycopg2)
- Free and open-source

**Cons:**
- Requires schema migrations for changes
- Vertical scaling limits (need sharding at massive scale)
- Slightly more complex setup than document DBs

**Complexity:** Medium

### Option 2: MongoDB (Document)
**Description:** Use MongoDB with PyMongo

**Pros:**
- Flexible schema (no migrations needed)
- Native JSON storage
- Horizontal scaling built-in
- Good for rapid prototyping

**Cons:**
- No ACID transactions (without replica sets)
- Weaker querying compared to SQL
- Team less familiar with MongoDB
- Message ordering could be inconsistent
- Requires additional sharding setup

**Complexity:** Medium-High

### Option 3: DynamoDB (Managed NoSQL)
**Description:** Use AWS DynamoDB

**Pros:**
- Fully managed (no ops burden)
- Automatic scaling
- Pay-per-use pricing

**Cons:**
- Vendor lock-in (AWS only)
- Complex querying (requires careful index design)
- Higher cost at scale
- Limited local development options
- Team has no DynamoDB experience

**Complexity:** High

## Decision Outcome

**Chosen Option:** PostgreSQL

**Rationale:**
- Strong consistency is critical for message ordering
- Team expertise reduces implementation risk
- JSONB support gives us flexibility for tool data
- Open-source avoids vendor lock-in
- Proven at scale for similar applications

**Consequences:**
- **Positive:**
  - Reliable message ordering
  - Fast development due to team familiarity
  - Rich querying capabilities for chat history
  - Cost-effective at our scale
- **Negative:**
  - Schema migrations required for changes
  - May need to consider sharding if we reach millions of users
- **Neutral:**
  - Need to set up Alembic for migrations
  - Need PostgreSQL hosting (but many options available)

## Implementation Notes

- Use SQLModel for ORM (integrates with FastAPI)
- Set up Alembic for migrations
- Use JSONB columns for tool_calls and tool_results
- Create indexes on user_id, conversation_id, created_at
- Use connection pooling (SQLAlchemy pool)
- Host on managed PostgreSQL (Railway, Neon, or Supabase for MVP)

## Validation

**How to verify:**
- Query performance: p95 < 100ms for message loading
- Developer velocity: Schema changes deployed within 1 day
- Data consistency: Zero out-of-order messages in production

**When to revisit:**
- If we exceed 1M active users (consider sharding)
- If query performance degrades below targets
- If schema migration becomes a bottleneck

## Related Decisions

- ADR-002: Use SQLModel ORM (not raw SQL)
- ADR-003: Use Alembic for migrations

## References

- [PostgreSQL JSONB Documentation](https://www.postgresql.org/docs/current/datatype-json.html)
- [SQLModel Documentation](https://sqlmodel.tiangolo.com/)
- [Comparison: PostgreSQL vs MongoDB](https://www.mongodb.com/compare/mongodb-postgresql)
```

**Quality Checks:**
- ✅ ADR created for all architecturally significant decisions
- ✅ All options considered and evaluated
- ✅ Decision rationale clearly stated
- ✅ Consequences (positive and negative) documented
- ✅ Validation criteria defined
- ✅ Linked from plan.md

---

## Common Patterns

### Pattern 1: Starting a New Feature

```bash
# 1. Create feature directory
mkdir -p specs/feature-name

# 2. Write specification
# → specs/feature-name/spec.md
# - Define user stories
# - Define functional requirements
# - Define acceptance criteria

# 3. Write architectural plan
# → specs/feature-name/plan.md
# - Design components
# - Make key decisions
# - Create ADRs for significant decisions

# 4. Break down into tasks
# → specs/feature-name/tasks.md
# - Define tasks with acceptance criteria
# - Add test cases
# - Identify dependencies

# 5. Implement tasks
# → Code changes
# - Follow TDD
# - Update task status
# - Create PHRs

# 6. Validate
# - Check spec ↔ plan ↔ tasks ↔ code alignment
# - Verify all acceptance criteria met
```

### Pattern 2: Updating Existing Feature

```bash
# 1. Update spec.md
# - Add new requirements
# - Update acceptance criteria

# 2. Update plan.md
# - Modify architecture if needed
# - Document new decisions

# 3. Update tasks.md
# - Add new tasks
# - Mark old tasks as deprecated if replaced

# 4. Implement changes
# - Follow existing task workflow
# - Create PHRs for significant changes

# 5. Update ADRs if decisions change
# - Mark old ADRs as Superseded
# - Create new ADRs
```

### Pattern 3: Refactoring Without Feature Changes

```bash
# 1. Update plan.md (if architecture changes)
# - Document refactoring approach
# - Create ADR if significant

# 2. Create refactoring tasks in tasks.md
# - Define acceptance criteria (tests still pass)
# - Identify files to change

# 3. Implement refactoring
# - Ensure all existing tests still pass
# - Add new tests if needed
# - Create PHR documenting refactoring decisions

# Note: spec.md unchanged (behavior same)
```

---

## Anti-Patterns

### ❌ Anti-Pattern 1: Coding Without a Spec

```
WRONG:
User: "Can you add task management?"
Agent: [Writes code directly]
```

**Fix:**
```
CORRECT:
User: "Can you add task management?"
Agent: "Let me write a spec first to clarify requirements."
→ Creates specs/task-management/spec.md
→ Reviews with user
→ Then creates plan.md and tasks.md
→ Then implements
```

### ❌ Anti-Pattern 2: Implementation Details in Spec

```markdown
<!-- WRONG: spec.md -->
## Functional Requirements
- Use PostgreSQL database
- Create FastAPI endpoint /api/tasks
- Use MCP tools pattern
```

**Fix:**
```markdown
<!-- CORRECT: spec.md -->
## Functional Requirements
- FR-1: System must persist tasks across sessions
- FR-2: Users must be able to create tasks via API
- FR-3: Task operations must be atomic

<!-- Implementation details go in plan.md -->
```

### ❌ Anti-Pattern 3: Tasks Without Acceptance Criteria

```markdown
<!-- WRONG: tasks.md -->
### T1: Implement Task Model
**Description:** Create the task model
```

**Fix:**
```markdown
<!-- CORRECT: tasks.md -->
### T1: Implement Task Model
**Description:** Define SQLModel Task model with validation

**Acceptance Criteria:**
- [ ] Task model created in app/models/task.py
- [ ] All fields defined with proper types
- [ ] Validation constraints added
- [ ] Unit tests passing

**Test Cases:**
[Specific test cases...]
```

### ❌ Anti-Pattern 4: No ADR for Significant Decisions

```markdown
<!-- WRONG: plan.md -->
## Database
We'll use PostgreSQL.
```

**Fix:**
```markdown
<!-- CORRECT: plan.md -->
## Database
We'll use PostgreSQL (see ADR-001).

Decision rationale:
- [Brief summary of tradeoffs]
- Full decision context in ADR-001

**ADR:** history/adr/001-use-postgresql.md
```

### ❌ Anti-Pattern 5: PHRs Not Created

```
WRONG:
[Implements feature]
[No PHR created]
[Context lost]
```

**Fix:**
```
CORRECT:
[Implements feature]
→ Creates PHR documenting:
  - What was implemented
  - Key decisions made
  - Challenges faced
  - Learnings captured
```

---

## Success Criteria

### Process Compliance
- ✅ Every feature has spec.md, plan.md, tasks.md
- ✅ Constitution exists and is followed
- ✅ No code written without corresponding task
- ✅ All significant decisions have ADRs
- ✅ PHRs created for implementation work

### Quality Indicators
- ✅ Specs are readable by non-technical stakeholders
- ✅ Plans are implementable by any developer on team
- ✅ Tasks are independently executable
- ✅ Tests verify all acceptance criteria
- ✅ Code follows constitution principles

### Traceability
- ✅ Can trace code → task → plan → spec
- ✅ Can trace decision → ADR
- ✅ Can trace implementation → PHR
- ✅ All artifacts version controlled
- ✅ All artifacts linked to each other

### Team Alignment
- ✅ All team members understand SDD process
- ✅ New features start with spec, not code
- ✅ Planning happens before implementation
- ✅ Documentation is up-to-date
- ✅ Decisions are documented and searchable

---

## Tools and Automation

### Directory Structure

```
project/
├── .specify/
│   ├── memory/
│   │   └── constitution.md
│   ├── templates/
│   │   ├── spec-template.md
│   │   ├── plan-template.md
│   │   ├── tasks-template.md
│   │   └── phr-template.prompt.md
│   └── scripts/
│       ├── create-phr.sh
│       └── validate-artifacts.sh
├── specs/
│   └── <feature-name>/
│       ├── spec.md
│       ├── plan.md
│       └── tasks.md
├── history/
│   ├── prompts/
│   │   ├── constitution/
│   │   ├── <feature-name>/
│   │   └── general/
│   └── adr/
│       ├── 001-decision.md
│       └── 002-decision.md
└── [source code]
```

### Validation Script

```bash
#!/bin/bash
# .specify/scripts/validate-artifacts.sh

echo "Validating SDD artifacts..."

# Check constitution exists
if [[ ! -f ".specify/memory/constitution.md" ]]; then
  echo "❌ Constitution missing"
  exit 1
fi

# Check all specs have plans and tasks
for spec in specs/*/spec.md; do
  feature=$(dirname "$spec")
  plan="$feature/plan.md"
  tasks="$feature/tasks.md"

  if [[ ! -f "$plan" ]]; then
    echo "❌ Missing plan: $plan"
    exit 1
  fi

  if [[ ! -f "$tasks" ]]; then
    echo "❌ Missing tasks: $tasks"
    exit 1
  fi
done

# Check for unresolved placeholders
if grep -r "{{.*}}" specs/ history/; then
  echo "❌ Found unresolved placeholders"
  exit 1
fi

echo "✅ All artifacts valid"
```

---

## References

- [Architecture Decision Records](https://adr.github.io/)
- [Gherkin Syntax (for acceptance criteria)](https://cucumber.io/docs/gherkin/)
- [Y-Statements for ADRs](https://medium.com/olzzio/y-statements-10eb07b5a177)
- [TDD Best Practices](https://martinfowler.com/bliki/TestDrivenDevelopment.html)
- [Documentation-Driven Development](https://documentation-driven-development.readthedocs.io/)

---

**Last Updated:** 2026-02-05
**Maintained By:** SDD Architecture Team
