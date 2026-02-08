# MCP Tool Development

**Skill ID:** `mcp-tool-development`
**Category:** MCP Tools Engineering
**Last Updated:** 2026-02-05

## Description

Build production-ready Model Context Protocol (MCP) servers and tool interfaces that enable AI agents to interact with databases, APIs, and external systems safely and reliably. This skill covers:
- MCP server architecture and setup
- Tool schema definitions (input/output)
- Input validation with Pydantic
- Database-safe operations (parameterized queries, no SQL injection)
- Structured output formats
- Error handling and retry strategies

## When to Use This Skill

- Building tools for AI agents to access databases
- Creating interfaces for AI to call external APIs
- Implementing stateless operations for AI workflows
- Designing tool-based architectures (no direct AI→DB access)
- Ensuring security and validation in AI agent actions

## Prerequisites

**Required Knowledge:**
- Python 3.10+ and FastAPI
- Pydantic data validation
- SQLModel or SQLAlchemy ORM
- Database security (SQL injection prevention)
- REST API design principles

**Required Tools:**
- Python environment with FastAPI
- Database (PostgreSQL, MySQL, SQLite)
- Pydantic for schema validation

## MCP Tool Philosophy

### Core Principles

1. **Stateless Operations:**
   - Tools have no memory between calls
   - All context provided in input parameters
   - No global state or caching (unless explicitly designed)

2. **Database as Single Source of Truth:**
   - AI never accesses database directly
   - Tools are the ONLY interface to data
   - Tools enforce authorization and validation

3. **Fail-Safe by Default:**
   - All inputs validated before execution
   - SQL injection impossible (parameterized queries only)
   - Errors returned, never thrown to AI
   - Graceful degradation on failures

4. **Structured Outputs:**
   - Consistent response format (success, data, error)
   - Typed data structures (not raw strings)
   - Machine-readable and parseable

5. **Observable and Debuggable:**
   - All tool calls logged
   - Input/output captured for debugging
   - Performance metrics tracked

---

## MCP Server Architecture

```
┌─────────────────────────────────────┐
│         AI Agent (Claude)           │
└────────────┬────────────────────────┘
             │ Tool Call (JSON)
             │ {"tool": "create_task", "input": {...}}
             ▼
┌─────────────────────────────────────┐
│         MCP Tool Registry           │
│  ┌───────────────────────────────┐  │
│  │  Tool Definitions (Schemas)   │  │
│  │  - create_task                │  │
│  │  - get_tasks                  │  │
│  │  - update_task                │  │
│  └───────────┬───────────────────┘  │
└──────────────┼──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│      Tool Executor (Router)         │
│  - Input Validation (Pydantic)      │
│  - Authorization Checks             │
│  - Function Dispatch                │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│       Tool Implementation           │
│  - Business Logic                   │
│  - Database Operations (ORM)        │
│  - Error Handling                   │
│  - Output Formatting                │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│      Database (PostgreSQL)          │
│  - Data Persistence                 │
│  - Constraints & Validation         │
└─────────────────────────────────────┘
```

**Key Concepts:**
- **Tool Registry:** Central catalog of available tools and their schemas
- **Tool Executor:** Validates input, routes to correct function, formats output
- **Tool Implementation:** Business logic, DB operations, error handling
- **Separation of Concerns:** Schema → Validation → Execution → Response

---

## Tool Design Process

### Step 1: Define Tool Purpose

**Questions to Answer:**
1. What does this tool DO? (one sentence)
2. What INPUT does it need?
3. What OUTPUT does it return?
4. What SIDE EFFECTS does it have?
5. Who can CALL this tool? (authorization)

**Example:**
```markdown
**Tool:** create_task
**Purpose:** Create a new task for a user and store it in the database
**Input:** user_id, title, description (optional), priority (optional), due_at (optional)
**Output:** task_id, created_at timestamp
**Side Effects:** Inserts row in tasks table
**Authorization:** User can only create tasks for themselves
```

---

### Step 2: Design Input Schema

**Template:**
```python
from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime
import uuid

class ToolNameInput(BaseModel):
    """Input schema for tool_name tool"""

    field1: str = Field(..., description="Purpose of field1", min_length=1, max_length=500)
    field2: Optional[int] = Field(None, description="Purpose of field2", ge=0, le=10)
    field3: Optional[datetime] = Field(None, description="Purpose of field3")

    @validator('field1')
    def validate_field1(cls, v):
        """Custom validation for field1"""
        if not v.strip():
            raise ValueError("field1 cannot be empty or whitespace")
        return v.strip()

    class Config:
        json_schema_extra = {
            "example": {
                "field1": "example value",
                "field2": 5,
                "field3": "2026-02-06T10:00:00Z"
            }
        }
```

**Input Schema Design Rules:**
1. **Use Pydantic Field for constraints:**
   - `min_length`, `max_length` for strings
   - `ge` (>=), `le` (<=) for numbers
   - `regex` for pattern matching

2. **Use validators for complex rules:**
   - Cross-field validation
   - Business rule checks
   - Data normalization (trim whitespace, lowercase email)

3. **Provide clear descriptions:**
   - Each field has a docstring
   - Examples provided in Config

4. **Use Optional for optional fields:**
   - Default values where appropriate
   - None for truly optional fields

**Example:**
```python
from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime
import uuid

class CreateTaskInput(BaseModel):
    """Input schema for create_task tool"""

    user_id: uuid.UUID = Field(..., description="User creating the task")
    title: str = Field(..., description="Task title", min_length=1, max_length=500)
    description: Optional[str] = Field(None, description="Detailed description", max_length=5000)
    priority: int = Field(0, description="Priority level (0=low, 10=high)", ge=0, le=10)
    due_at: Optional[datetime] = Field(None, description="Due date (ISO 8601)")
    conversation_id: Optional[uuid.UUID] = Field(None, description="Originating conversation")

    @validator('title')
    def validate_title(cls, v):
        """Ensure title is not empty after stripping"""
        v = v.strip()
        if not v:
            raise ValueError("Title cannot be empty or only whitespace")
        return v

    @validator('due_at')
    def validate_due_at(cls, v):
        """Ensure due_at is in the future"""
        if v and v < datetime.utcnow():
            raise ValueError("Due date must be in the future")
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "550e8400-e29b-41d4-a716-446655440000",
                "title": "Buy groceries",
                "description": "Milk, eggs, bread",
                "priority": 5,
                "due_at": "2026-02-06T18:00:00Z"
            }
        }
```

---

### Step 3: Design Output Schema

**Template:**
```python
from pydantic import BaseModel
from typing import Optional, Any

class ToolResponse(BaseModel):
    """Standard response format for all MCP tools"""

    success: bool
    data: Optional[dict] = None
    error: Optional[str] = None
    warning: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example_success": {
                "success": True,
                "data": {"result_field": "value"},
                "error": None,
                "warning": None
            },
            "example_error": {
                "success": False,
                "data": None,
                "error": "Descriptive error message",
                "warning": None
            }
        }
```

**Output Schema Design Rules:**
1. **Consistent structure across all tools:**
   - Always include `success` boolean
   - `data` contains result on success
   - `error` contains message on failure
   - `warning` for non-fatal issues

2. **Typed data structures:**
   - Use nested Pydantic models for complex data
   - Avoid raw strings or unstructured dicts

3. **No exceptions to AI:**
   - All errors caught and returned in `error` field
   - AI receives valid ToolResponse even on failure

**Example:**
```python
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import uuid

class TaskData(BaseModel):
    """Task data structure"""
    id: uuid.UUID
    title: str
    description: Optional[str]
    status: str
    priority: int
    created_at: datetime
    completed_at: Optional[datetime]
    due_at: Optional[datetime]

class ToolResponse(BaseModel):
    """Standard response for all tools"""
    success: bool
    data: Optional[dict] = None
    error: Optional[str] = None
    warning: Optional[str] = None

class GetTasksResponse(ToolResponse):
    """Specific response for get_tasks"""
    data: Optional[dict] = None  # {"tasks": List[TaskData], "total_count": int}
```

---

### Step 4: Implement Tool Function

**Template:**
```python
from sqlmodel import Session, select
from app.db import get_session
from app.models import ModelName
from typing import Optional

def tool_name_func(input_data: ToolNameInput) -> ToolResponse:
    """
    Tool function implementation

    Args:
        input_data: Validated input schema

    Returns:
        ToolResponse with success/data/error
    """
    try:
        with get_session() as session:
            # 1. Authorization check
            # Verify user has permission to perform operation

            # 2. Business logic
            # Validate business rules, check constraints

            # 3. Database operation (parameterized queries only)
            # Use ORM to prevent SQL injection

            # 4. Format response
            return ToolResponse(
                success=True,
                data={"result_field": "value"},
                error=None
            )

    except ValueError as e:
        # Validation or business rule error
        return ToolResponse(success=False, error=str(e))

    except Exception as e:
        # Unexpected error (log this)
        logger.error(f"Tool tool_name failed: {e}", exc_info=True)
        return ToolResponse(
            success=False,
            error="An unexpected error occurred. Please try again."
        )
```

**Implementation Rules:**
1. **Always use context manager for DB sessions:**
   ```python
   with get_session() as session:
       # operations here
   ```

2. **Never use raw SQL strings:**
   ```python
   # WRONG - SQL injection risk
   query = f"SELECT * FROM tasks WHERE user_id = '{user_id}'"

   # CORRECT - ORM with parameterization
   statement = select(Task).where(Task.user_id == user_id)
   ```

3. **Catch specific exceptions first:**
   ```python
   try:
       # operations
   except ValueError as e:  # Validation error
       return ToolResponse(success=False, error=str(e))
   except IntegrityError as e:  # DB constraint violation
       return ToolResponse(success=False, error="Duplicate entry")
   except Exception as e:  # Catch-all
       logger.error(...)
       return ToolResponse(success=False, error="Unexpected error")
   ```

4. **Log errors but don't expose internals:**
   ```python
   # Log full details
   logger.error(f"Database error: {e}", exc_info=True, extra={"user_id": user_id})

   # Return generic message to AI
   return ToolResponse(success=False, error="Database operation failed")
   ```

**Example:**
```python
from sqlmodel import Session, select
from app.db import get_session
from app.models.task import Task
from app.mcp_tools.schemas import CreateTaskInput, ToolResponse
from datetime import datetime
from sqlalchemy.exc import IntegrityError
import logging

logger = logging.getLogger(__name__)

def create_task_tool(input_data: CreateTaskInput) -> ToolResponse:
    """
    Create a new task for the user

    Args:
        input_data: Validated CreateTaskInput

    Returns:
        ToolResponse with task_id on success
    """
    try:
        with get_session() as session:
            # 1. Authorization check (verify user exists)
            from app.models.user import User
            user = session.get(User, input_data.user_id)
            if not user:
                return ToolResponse(
                    success=False,
                    error=f"User not found: {input_data.user_id}"
                )

            # 2. Business logic - check for duplicate (optional)
            recent_cutoff = datetime.utcnow() - timedelta(hours=24)
            duplicate = session.exec(
                select(Task).where(
                    Task.user_id == input_data.user_id,
                    Task.title == input_data.title,
                    Task.created_at > recent_cutoff,
                    Task.deleted_at.is_(None)
                )
            ).first()

            warning = None
            if duplicate:
                warning = f"Similar task '{input_data.title}' created recently (ID: {duplicate.id})"

            # 3. Database operation - create task
            task = Task(
                user_id=input_data.user_id,
                title=input_data.title,
                description=input_data.description,
                priority=input_data.priority,
                status="pending",
                due_at=input_data.due_at,
                conversation_id=input_data.conversation_id
            )

            session.add(task)
            session.commit()
            session.refresh(task)

            # 4. Format response
            return ToolResponse(
                success=True,
                data={
                    "task_id": str(task.id),
                    "created_at": task.created_at.isoformat()
                },
                error=None,
                warning=warning
            )

    except ValueError as e:
        # Pydantic validation error (shouldn't reach here after input validation)
        return ToolResponse(success=False, error=f"Validation error: {str(e)}")

    except IntegrityError as e:
        # Database constraint violation (e.g., foreign key)
        logger.error(f"Database integrity error: {e}", exc_info=True)
        return ToolResponse(
            success=False,
            error="Database constraint violation. Please check your input."
        )

    except Exception as e:
        # Unexpected error
        logger.error(
            f"create_task failed for user {input_data.user_id}: {e}",
            exc_info=True,
            extra={"user_id": str(input_data.user_id), "title": input_data.title}
        )
        return ToolResponse(
            success=False,
            error="An unexpected error occurred. Please try again later."
        )
```

---

### Step 5: Register Tool in Registry

**Template:**
```python
# app/mcp_tools/registry.py

from typing import Dict, Callable, Any
from app.mcp_tools.task_tools import create_task_tool, get_tasks_tool
from app.mcp_tools.schemas import CreateTaskInput, GetTasksInput

# Tool function registry
MCP_TOOLS: Dict[str, Callable] = {
    "create_task": create_task_tool,
    "get_tasks": get_tasks_tool,
}

# Tool schema registry (for AI to understand available tools)
MCP_TOOL_SCHEMAS = [
    {
        "name": "create_task",
        "description": "Create a new task for the user",
        "input_schema": CreateTaskInput.model_json_schema()
    },
    {
        "name": "get_tasks",
        "description": "Retrieve user's tasks filtered by status",
        "input_schema": GetTasksInput.model_json_schema()
    }
]

def execute_mcp_tool(tool_name: str, tool_input: dict) -> dict:
    """
    Execute an MCP tool by name with given input

    Args:
        tool_name: Name of the tool to execute
        tool_input: Dictionary of tool parameters

    Returns:
        Tool execution result as dictionary
    """
    if tool_name not in MCP_TOOLS:
        return {
            "success": False,
            "data": None,
            "error": f"Tool '{tool_name}' not found. Available tools: {list(MCP_TOOLS.keys())}"
        }

    tool_func = MCP_TOOLS[tool_name]

    # Get input schema class
    if tool_name == "create_task":
        input_schema = CreateTaskInput
    elif tool_name == "get_tasks":
        input_schema = GetTasksInput
    else:
        return {"success": False, "error": f"No schema defined for tool '{tool_name}'"}

    try:
        # Validate input
        input_obj = input_schema(**tool_input)

        # Execute tool
        result = tool_func(input_obj)

        # Return as dict
        return result.dict()

    except ValidationError as e:
        # Pydantic validation error
        return {
            "success": False,
            "data": None,
            "error": f"Input validation failed: {str(e)}"
        }

    except Exception as e:
        # Unexpected error in tool execution
        logger.error(f"Tool execution failed for {tool_name}: {e}", exc_info=True)
        return {
            "success": False,
            "data": None,
            "error": "Tool execution failed"
        }
```

---

## Database-Safe Operations

### Rule 1: Never Use String Formatting in Queries

```python
# ❌ WRONG - SQL Injection Vulnerability
user_id = request.user_id
query = f"SELECT * FROM tasks WHERE user_id = '{user_id}'"
session.execute(query)

# ❌ WRONG - Still vulnerable
query = "SELECT * FROM tasks WHERE user_id = '%s'" % user_id
session.execute(query)

# ✅ CORRECT - ORM with parameterized queries
statement = select(Task).where(Task.user_id == user_id)
tasks = session.exec(statement).all()

# ✅ CORRECT - Raw SQL with parameters (if ORM not suitable)
from sqlalchemy import text
statement = text("SELECT * FROM tasks WHERE user_id = :user_id")
result = session.execute(statement, {"user_id": user_id})
```

### Rule 2: Use ORM for All Operations

```python
# Create
task = Task(user_id=user_id, title="New task")
session.add(task)
session.commit()

# Read
statement = select(Task).where(Task.user_id == user_id)
tasks = session.exec(statement).all()

# Update
task = session.get(Task, task_id)
if task:
    task.status = "completed"
    session.add(task)
    session.commit()

# Delete (soft delete)
task = session.get(Task, task_id)
if task:
    task.deleted_at = datetime.utcnow()
    session.add(task)
    session.commit()
```

### Rule 3: Enforce Authorization at Tool Level

```python
def update_task_tool(input_data: UpdateTaskInput) -> ToolResponse:
    """Update a task - user must own the task"""
    try:
        with get_session() as session:
            # Fetch task
            task = session.get(Task, input_data.task_id)

            if not task:
                return ToolResponse(success=False, error="Task not found")

            # CRITICAL: Authorization check
            if task.user_id != input_data.user_id:
                return ToolResponse(
                    success=False,
                    error="Access denied: You don't own this task"
                )

            # Proceed with update
            if input_data.title:
                task.title = input_data.title
            if input_data.status:
                task.status = input_data.status
                if input_data.status == "completed":
                    task.completed_at = datetime.utcnow()

            session.add(task)
            session.commit()

            return ToolResponse(success=True, data={"task_id": str(task.id)})

    except Exception as e:
        logger.error(f"update_task failed: {e}", exc_info=True)
        return ToolResponse(success=False, error="Update failed")
```

### Rule 4: Use Transactions for Multi-Step Operations

```python
def create_task_with_subtasks(input_data: CreateTaskWithSubtasksInput) -> ToolResponse:
    """Create a task and multiple subtasks atomically"""
    try:
        with get_session() as session:
            # Session automatically starts a transaction

            # Create parent task
            parent_task = Task(
                user_id=input_data.user_id,
                title=input_data.title,
                status="pending"
            )
            session.add(parent_task)
            session.flush()  # Get ID without committing

            # Create subtasks
            for subtask_title in input_data.subtasks:
                subtask = Task(
                    user_id=input_data.user_id,
                    title=subtask_title,
                    parent_id=parent_task.id,  # Link to parent
                    status="pending"
                )
                session.add(subtask)

            # Commit all or nothing
            session.commit()

            return ToolResponse(
                success=True,
                data={"parent_task_id": str(parent_task.id)}
            )

    except Exception as e:
        # Rollback automatic on exception
        logger.error(f"create_task_with_subtasks failed: {e}", exc_info=True)
        return ToolResponse(success=False, error="Failed to create tasks")
```

---

## Input Validation Rules

### Level 1: Pydantic Field Validation

```python
class CreateTaskInput(BaseModel):
    # String constraints
    title: str = Field(..., min_length=1, max_length=500)
    description: Optional[str] = Field(None, max_length=5000)

    # Number constraints
    priority: int = Field(0, ge=0, le=10)  # 0 <= priority <= 10

    # UUID validation
    user_id: uuid.UUID = Field(...)

    # Datetime validation
    due_at: Optional[datetime] = Field(None)

    # Enum validation
    status: str = Field("pending", regex="^(pending|in_progress|completed|cancelled)$")

    # Email validation
    email: str = Field(..., regex=r'^[\w\.-]+@[\w\.-]+\.\w+$')
```

### Level 2: Custom Validators

```python
from pydantic import BaseModel, Field, validator, root_validator
from datetime import datetime

class CreateTaskInput(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    priority: int = Field(0, ge=0, le=10)
    due_at: Optional[datetime] = Field(None)
    notify_before: Optional[int] = Field(None, description="Minutes before due_at")

    @validator('title')
    def validate_title_not_empty(cls, v):
        """Ensure title is not whitespace"""
        if not v.strip():
            raise ValueError("Title cannot be empty or only whitespace")
        return v.strip()

    @validator('due_at')
    def validate_due_at_future(cls, v):
        """Ensure due_at is in the future"""
        if v and v < datetime.utcnow():
            raise ValueError("Due date must be in the future")
        return v

    @root_validator
    def validate_notify_before_requires_due_at(cls, values):
        """Cross-field validation"""
        notify_before = values.get('notify_before')
        due_at = values.get('due_at')

        if notify_before and not due_at:
            raise ValueError("notify_before requires due_at to be set")

        if notify_before and notify_before > 10080:  # 7 days in minutes
            raise ValueError("notify_before cannot exceed 7 days")

        return values
```

### Level 3: Business Rule Validation

```python
def create_task_tool(input_data: CreateTaskInput) -> ToolResponse:
    """Create task with business rule validation"""
    try:
        with get_session() as session:
            # Business rule: Users cannot have more than 100 pending tasks
            pending_count = session.exec(
                select(func.count(Task.id)).where(
                    Task.user_id == input_data.user_id,
                    Task.status == "pending",
                    Task.deleted_at.is_(None)
                )
            ).one()

            if pending_count >= 100:
                return ToolResponse(
                    success=False,
                    error="Task limit reached. You have 100 pending tasks. Please complete or delete some tasks first."
                )

            # Business rule: High priority tasks must have a due date
            if input_data.priority >= 8 and not input_data.due_at:
                return ToolResponse(
                    success=False,
                    error="High priority tasks (8+) must have a due date"
                )

            # Proceed with creation
            task = Task(**input_data.dict())
            session.add(task)
            session.commit()

            return ToolResponse(success=True, data={"task_id": str(task.id)})

    except Exception as e:
        logger.error(f"create_task failed: {e}", exc_info=True)
        return ToolResponse(success=False, error="Task creation failed")
```

---

## Structured Outputs

### Pattern 1: Consistent Response Format

```python
class ToolResponse(BaseModel):
    """All tools return this format"""
    success: bool
    data: Optional[dict] = None
    error: Optional[str] = None
    warning: Optional[str] = None

# Example success
ToolResponse(
    success=True,
    data={"task_id": "uuid", "created_at": "2026-02-05T10:00:00Z"},
    error=None,
    warning=None
)

# Example error
ToolResponse(
    success=False,
    data=None,
    error="Task not found",
    warning=None
)

# Example warning
ToolResponse(
    success=True,
    data={"task_id": "uuid"},
    error=None,
    warning="Duplicate task detected"
)
```

### Pattern 2: Typed Data Structures

```python
from pydantic import BaseModel
from typing import List
from datetime import datetime
import uuid

class TaskData(BaseModel):
    """Structured task data"""
    id: uuid.UUID
    title: str
    description: Optional[str]
    status: str
    priority: int
    created_at: datetime
    due_at: Optional[datetime]

def get_tasks_tool(input_data: GetTasksInput) -> ToolResponse:
    """Return tasks as structured data"""
    try:
        with get_session() as session:
            statement = select(Task).where(
                Task.user_id == input_data.user_id,
                Task.status == input_data.status
            )
            tasks = session.exec(statement).all()

            # Convert to structured data
            task_data = [
                TaskData(
                    id=task.id,
                    title=task.title,
                    description=task.description,
                    status=task.status,
                    priority=task.priority,
                    created_at=task.created_at,
                    due_at=task.due_at
                ).dict()
                for task in tasks
            ]

            return ToolResponse(
                success=True,
                data={
                    "tasks": task_data,
                    "total_count": len(task_data)
                }
            )

    except Exception as e:
        logger.error(f"get_tasks failed: {e}", exc_info=True)
        return ToolResponse(success=False, error="Failed to retrieve tasks")
```

### Pattern 3: Pagination for Large Results

```python
class GetTasksInput(BaseModel):
    user_id: uuid.UUID
    status: str = Field("pending", regex="^(pending|completed|all)$")
    limit: int = Field(50, ge=1, le=100)
    offset: int = Field(0, ge=0)

def get_tasks_tool(input_data: GetTasksInput) -> ToolResponse:
    """Return paginated tasks"""
    try:
        with get_session() as session:
            # Build base query
            statement = select(Task).where(Task.user_id == input_data.user_id)

            if input_data.status != "all":
                statement = statement.where(Task.status == input_data.status)

            # Count total (before pagination)
            count_statement = select(func.count(Task.id)).where(Task.user_id == input_data.user_id)
            if input_data.status != "all":
                count_statement = count_statement.where(Task.status == input_data.status)
            total_count = session.exec(count_statement).one()

            # Apply pagination
            statement = statement.offset(input_data.offset).limit(input_data.limit)
            tasks = session.exec(statement).all()

            return ToolResponse(
                success=True,
                data={
                    "tasks": [task.dict() for task in tasks],
                    "total_count": total_count,
                    "limit": input_data.limit,
                    "offset": input_data.offset,
                    "has_more": (input_data.offset + input_data.limit) < total_count
                }
            )

    except Exception as e:
        logger.error(f"get_tasks failed: {e}", exc_info=True)
        return ToolResponse(success=False, error="Failed to retrieve tasks")
```

---

## Tool Design Validation Checklist

### ✅ Tool Definition
- [ ] Tool has clear, single-purpose function
- [ ] Tool name is descriptive (verb_noun pattern: create_task, get_tasks)
- [ ] Tool description is concise (one sentence)
- [ ] "When to use" criteria documented

### ✅ Input Schema
- [ ] All required fields marked with `...` (Pydantic required)
- [ ] Optional fields use `Optional[Type]` with default
- [ ] Field constraints defined (min_length, max_length, ge, le)
- [ ] Custom validators for complex rules
- [ ] Example provided in Config
- [ ] Input schema class named `{Tool}Input`

### ✅ Output Schema
- [ ] Uses standard ToolResponse format
- [ ] `success` boolean always present
- [ ] `data` contains structured result (not raw strings)
- [ ] `error` contains user-friendly message
- [ ] `warning` used for non-fatal issues
- [ ] Data types match expected structure

### ✅ Database Safety
- [ ] No raw SQL strings with user input
- [ ] ORM used for all queries
- [ ] Parameterized queries if raw SQL needed
- [ ] No string formatting in queries (`f""`, `%`, `+`)
- [ ] SQL injection impossible

### ✅ Authorization
- [ ] User permissions checked before operation
- [ ] User can only access their own data
- [ ] Foreign key relationships validated
- [ ] Error returned on unauthorized access

### ✅ Error Handling
- [ ] All exceptions caught
- [ ] Specific exceptions handled first (ValueError, IntegrityError)
- [ ] Generic Exception catch-all at end
- [ ] Errors logged with context
- [ ] User-friendly error messages (no stack traces)
- [ ] ToolResponse returned even on error

### ✅ Validation
- [ ] Pydantic field validation (level 1)
- [ ] Custom validators for business rules (level 2)
- [ ] Runtime business rule checks (level 3)
- [ ] Cross-field validation where needed

### ✅ Idempotency
- [ ] Idempotency behavior documented
- [ ] Safe to retry on failure (where applicable)
- [ ] Duplicate detection (if relevant)
- [ ] No side effects on repeated calls (for idempotent tools)

### ✅ Observability
- [ ] Tool execution logged (input, output, duration)
- [ ] Errors logged with full context
- [ ] Performance metrics captured
- [ ] Debug information available

### ✅ Testing
- [ ] Unit tests for tool function
- [ ] Test success case
- [ ] Test error cases (DB down, invalid input, unauthorized)
- [ ] Test edge cases (empty results, duplicate detection)
- [ ] Integration test with database

---

## Testing Strategy

### Unit Tests

```python
# tests/mcp_tools/test_task_tools.py
import pytest
from uuid import uuid4
from app.mcp_tools.task_tools import create_task_tool
from app.mcp_tools.schemas import CreateTaskInput

def test_create_task_success(db_session):
    """Test successful task creation"""
    user_id = uuid4()
    create_user(user_id)  # Test fixture

    input_data = CreateTaskInput(
        user_id=user_id,
        title="Test Task",
        priority=5
    )

    result = create_task_tool(input_data)

    assert result.success is True
    assert "task_id" in result.data
    assert result.error is None

def test_create_task_invalid_user(db_session):
    """Test task creation with non-existent user"""
    input_data = CreateTaskInput(
        user_id=uuid4(),  # Non-existent user
        title="Test Task"
    )

    result = create_task_tool(input_data)

    assert result.success is False
    assert "User not found" in result.error

def test_create_task_validation_error(db_session):
    """Test input validation"""
    with pytest.raises(ValidationError):
        CreateTaskInput(
            user_id=uuid4(),
            title="",  # Empty title should fail validation
            priority=11  # Out of range should fail
        )

def test_create_task_duplicate_warning(db_session):
    """Test duplicate detection"""
    user_id = uuid4()
    create_user(user_id)

    input_data = CreateTaskInput(user_id=user_id, title="Duplicate Task")

    # Create first task
    result1 = create_task_tool(input_data)
    assert result1.success is True
    assert result1.warning is None

    # Create duplicate (within 24 hours)
    result2 = create_task_tool(input_data)
    assert result2.success is True
    assert result2.warning is not None
    assert "similar task" in result2.warning.lower()
```

### Integration Tests

```python
# tests/integration/test_tool_execution.py
import pytest
from app.mcp_tools.registry import execute_mcp_tool

def test_tool_execution_end_to_end(db_session):
    """Test full tool execution flow"""
    user_id = str(uuid4())
    create_user(uuid.UUID(user_id))

    # Execute tool via registry
    result = execute_mcp_tool(
        tool_name="create_task",
        tool_input={
            "user_id": user_id,
            "title": "Integration Test Task",
            "priority": 5
        }
    )

    assert result["success"] is True
    assert "task_id" in result["data"]

    # Verify task in database
    task_id = result["data"]["task_id"]
    task = db_session.get(Task, uuid.UUID(task_id))
    assert task is not None
    assert task.title == "Integration Test Task"

def test_tool_not_found(db_session):
    """Test handling of non-existent tool"""
    result = execute_mcp_tool(
        tool_name="nonexistent_tool",
        tool_input={}
    )

    assert result["success"] is False
    assert "not found" in result["error"].lower()
```

---

## Common Patterns

### Pattern 1: CRUD Tool Set

```python
# Create
def create_task_tool(input_data: CreateTaskInput) -> ToolResponse:
    """Create a new task"""
    # Implementation...

# Read (single)
def get_task_tool(input_data: GetTaskInput) -> ToolResponse:
    """Get a single task by ID"""
    # Implementation...

# Read (list)
def get_tasks_tool(input_data: GetTasksInput) -> ToolResponse:
    """Get tasks filtered by criteria"""
    # Implementation...

# Update
def update_task_tool(input_data: UpdateTaskInput) -> ToolResponse:
    """Update task fields"""
    # Implementation...

# Delete (soft delete)
def delete_task_tool(input_data: DeleteTaskInput) -> ToolResponse:
    """Soft delete a task"""
    # Implementation...
```

### Pattern 2: Tool Composition

```python
def complete_task_and_notify_tool(input_data: CompleteTaskInput) -> ToolResponse:
    """Complete a task and send notification (composite operation)"""
    try:
        with get_session() as session:
            # Step 1: Update task status
            task = session.get(Task, input_data.task_id)
            if not task:
                return ToolResponse(success=False, error="Task not found")

            task.status = "completed"
            task.completed_at = datetime.utcnow()
            session.add(task)
            session.commit()

            # Step 2: Send notification (separate service)
            try:
                send_notification(
                    user_id=task.user_id,
                    message=f"Task completed: {task.title}"
                )
            except Exception as e:
                # Notification failure doesn't fail the tool
                logger.warning(f"Notification failed: {e}")

            return ToolResponse(
                success=True,
                data={"task_id": str(task.id)},
                warning="Task completed but notification failed" if notification_failed else None
            )

    except Exception as e:
        logger.error(f"complete_task_and_notify failed: {e}", exc_info=True)
        return ToolResponse(success=False, error="Failed to complete task")
```

### Pattern 3: Bulk Operations

```python
class BulkUpdateTasksInput(BaseModel):
    user_id: uuid.UUID
    task_ids: List[uuid.UUID] = Field(..., min_items=1, max_items=100)
    status: str = Field(..., regex="^(pending|completed|cancelled)$")

def bulk_update_tasks_tool(input_data: BulkUpdateTasksInput) -> ToolResponse:
    """Update multiple tasks at once"""
    try:
        with get_session() as session:
            # Fetch tasks
            statement = select(Task).where(
                Task.id.in_(input_data.task_ids),
                Task.user_id == input_data.user_id  # Authorization
            )
            tasks = session.exec(statement).all()

            if len(tasks) != len(input_data.task_ids):
                return ToolResponse(
                    success=False,
                    error=f"Found {len(tasks)} tasks, expected {len(input_data.task_ids)}"
                )

            # Update all
            for task in tasks:
                task.status = input_data.status
                if input_data.status == "completed":
                    task.completed_at = datetime.utcnow()
                session.add(task)

            session.commit()

            return ToolResponse(
                success=True,
                data={"updated_count": len(tasks)}
            )

    except Exception as e:
        logger.error(f"bulk_update_tasks failed: {e}", exc_info=True)
        return ToolResponse(success=False, error="Bulk update failed")
```

---

## Anti-Patterns

### ❌ Anti-Pattern 1: SQL Injection Vulnerability

```python
# WRONG - Never do this
def get_tasks_by_status(user_id: str, status: str):
    query = f"SELECT * FROM tasks WHERE user_id = '{user_id}' AND status = '{status}'"
    session.execute(query)
```

**Fix:**
```python
# CORRECT
def get_tasks_by_status(user_id: uuid.UUID, status: str):
    statement = select(Task).where(
        Task.user_id == user_id,
        Task.status == status
    )
    tasks = session.exec(statement).all()
```

### ❌ Anti-Pattern 2: Throwing Exceptions to AI

```python
# WRONG - Exception reaches AI
def create_task_tool(input_data):
    task = Task(**input_data.dict())
    session.add(task)
    session.commit()  # If this fails, exception propagates
```

**Fix:**
```python
# CORRECT - All exceptions caught
def create_task_tool(input_data):
    try:
        task = Task(**input_data.dict())
        session.add(task)
        session.commit()
        return ToolResponse(success=True, data={"task_id": str(task.id)})
    except Exception as e:
        logger.error(f"create_task failed: {e}", exc_info=True)
        return ToolResponse(success=False, error="Task creation failed")
```

### ❌ Anti-Pattern 3: Missing Authorization Checks

```python
# WRONG - Any user can update any task
def update_task_tool(input_data):
    task = session.get(Task, input_data.task_id)
    task.status = input_data.status
    session.commit()
```

**Fix:**
```python
# CORRECT - Verify ownership
def update_task_tool(input_data):
    task = session.get(Task, input_data.task_id)
    if not task:
        return ToolResponse(success=False, error="Task not found")

    # CRITICAL: Authorization check
    if task.user_id != input_data.user_id:
        return ToolResponse(success=False, error="Access denied")

    task.status = input_data.status
    session.commit()
    return ToolResponse(success=True, data={"task_id": str(task.id)})
```

### ❌ Anti-Pattern 4: Unstructured Output

```python
# WRONG - Returns raw string
def get_tasks_tool(input_data):
    tasks = session.exec(select(Task)).all()
    return f"You have {len(tasks)} tasks"  # AI has to parse this
```

**Fix:**
```python
# CORRECT - Returns structured data
def get_tasks_tool(input_data):
    tasks = session.exec(select(Task)).all()
    return ToolResponse(
        success=True,
        data={
            "tasks": [task.dict() for task in tasks],
            "total_count": len(tasks)
        }
    )
```

### ❌ Anti-Pattern 5: No Input Validation

```python
# WRONG - No validation
def create_task_tool(user_id: str, title: str):
    task = Task(user_id=user_id, title=title)  # What if title is empty?
    session.add(task)
```

**Fix:**
```python
# CORRECT - Pydantic validation
class CreateTaskInput(BaseModel):
    user_id: uuid.UUID
    title: str = Field(..., min_length=1, max_length=500)

    @validator('title')
    def validate_title(cls, v):
        if not v.strip():
            raise ValueError("Title cannot be empty")
        return v.strip()

def create_task_tool(input_data: CreateTaskInput):
    # Input already validated by Pydantic
    task = Task(**input_data.dict())
    session.add(task)
    session.commit()
```

---

## Success Criteria

### Tool Quality
- ✅ All tools are stateless and idempotent (where applicable)
- ✅ All inputs validated with Pydantic
- ✅ All outputs use ToolResponse format
- ✅ No SQL injection vulnerabilities
- ✅ Authorization enforced at tool level
- ✅ All errors caught and returned gracefully

### Code Quality
- ✅ Type hints on all functions
- ✅ Docstrings on all tools
- ✅ Unit tests for all tools (>80% coverage)
- ✅ Integration tests for tool registry
- ✅ No hardcoded values (use config/env vars)

### Security
- ✅ Parameterized queries only (ORM or text())
- ✅ User authorization on all operations
- ✅ Input sanitization and validation
- ✅ Error messages don't expose internals
- ✅ Audit logging for all tool calls

### Performance
- ✅ Database queries optimized (indexes used)
- ✅ Pagination for large result sets
- ✅ Connection pooling configured
- ✅ Tool execution < 500ms (p95)

---

## References

- [Pydantic Documentation](https://docs.pydantic.dev/)
- [SQLModel Documentation](https://sqlmodel.tiangolo.com/)
- [Model Context Protocol Specification](https://modelcontextprotocol.io/)
- [OWASP SQL Injection Prevention](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)
- [FastAPI Security Best Practices](https://fastapi.tiangolo.com/tutorial/security/)

---

**Last Updated:** 2026-02-05
**Maintained By:** MCP Tools Engineering Team
