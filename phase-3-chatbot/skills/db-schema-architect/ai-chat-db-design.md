# AI Chat Database Schema Design

**Skill ID:** `ai-chat-db-design`
**Category:** Database Schema Architecture
**Last Updated:** 2026-02-05

## Description

Design production-ready database schemas for AI chat systems that support:
- Multi-user conversations with persistent message history
- Task management within chat contexts
- Stateless backend architectures (all state in DB)
- Efficient querying and pagination
- Audit trails and timestamps
- Scalability for thousands of concurrent users

## When to Use This Skill

- Building AI chatbot systems with conversation persistence
- Designing schemas for task-oriented conversational AI
- Planning databases that support MCP tool-based architectures
- Creating multi-tenant chat applications
- Migrating from in-memory to database-backed chat state

## Prerequisites

**Required Knowledge:**
- Relational database fundamentals (PostgreSQL preferred)
- Normalization principles (1NF, 2NF, 3NF)
- Index optimization strategies
- Foreign key constraints and cascading
- SQL query performance analysis

**Tools:**
- PostgreSQL 14+ (or compatible RDBMS)
- SQLModel/SQLAlchemy (Python ORM)
- Database migration tool (Alembic recommended)

## Design Philosophy

### Core Principles

1. **Single Source of Truth:** Database is the authoritative source for all conversation state
2. **Stateless Backend:** No in-memory session state; backend servers are ephemeral
3. **Audit Trail:** Every message and action has a timestamp and creator
4. **Scalable Queries:** Indexes support common access patterns without table scans
5. **Data Integrity:** Foreign keys and constraints prevent orphaned records
6. **Privacy by Design:** User data isolation through proper indexing and queries

### Key Constraints

- **No Circular Dependencies:** Clean hierarchy (users → conversations → messages)
- **Immutable Messages:** Messages never updated after creation (append-only log)
- **Soft Deletes:** Preserve data for audit; use `deleted_at` instead of DELETE
- **UUID Primary Keys:** Enable distributed systems and avoid ID enumeration attacks

---

## Schema Design Process

### Phase 1: Core Entity Modeling

#### Step 1.1: Users Table

**Purpose:** Store user identities and metadata

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identity
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,

    -- Metadata
    display_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,

    -- Constraints
    CONSTRAINT users_username_length CHECK (char_length(username) >= 3),
    CONSTRAINT users_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Indexes
CREATE INDEX idx_users_username ON users(username) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_created_at ON users(created_at DESC);
```

**SQLModel Equivalent:**

```python
from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional
import uuid

class User(SQLModel, table=True):
    __tablename__ = "users"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    username: str = Field(unique=True, index=True, min_length=3, max_length=255)
    email: Optional[str] = Field(default=None, unique=True, index=True)
    display_name: Optional[str] = Field(default=None, max_length=255)

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    deleted_at: Optional[datetime] = Field(default=None)
```

**Design Decisions:**
- ✅ UUID primary key (avoids enumeration, supports distributed ID generation)
- ✅ Unique constraints on username and email
- ✅ Soft delete with `deleted_at` (preserves audit trail)
- ✅ Partial indexes for active users only (WHERE deleted_at IS NULL)
- ✅ Email regex validation at DB level

---

#### Step 1.2: Conversations Table

**Purpose:** Group related messages into conversation contexts

```sql
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Ownership
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Metadata
    title VARCHAR(500),
    system_prompt TEXT,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    last_message_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE,

    -- Constraints
    CONSTRAINT conversations_title_length CHECK (char_length(title) <= 500)
);

-- Indexes
CREATE INDEX idx_conversations_user_id ON conversations(user_id)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_conversations_user_recent ON conversations(user_id, last_message_at DESC)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_conversations_created_at ON conversations(created_at DESC);
```

**SQLModel Equivalent:**

```python
class Conversation(SQLModel, table=True):
    __tablename__ = "conversations"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="users.id", index=True)

    title: Optional[str] = Field(default=None, max_length=500)
    system_prompt: Optional[str] = Field(default=None)

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_message_at: Optional[datetime] = Field(default=None)
    deleted_at: Optional[datetime] = Field(default=None)
```

**Design Decisions:**
- ✅ Foreign key to users with CASCADE delete (deleting user removes their conversations)
- ✅ `last_message_at` denormalized for efficient "recent conversations" queries
- ✅ Composite index on (user_id, last_message_at) for common access pattern
- ✅ Optional title (auto-generated from first message if null)
- ✅ System prompt stored per conversation (allows customization)

---

#### Step 1.3: Messages Table

**Purpose:** Store individual messages in conversations (append-only log)

```sql
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Relationships
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Content
    role VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,

    -- Metadata
    token_count INTEGER,
    model VARCHAR(100),

    -- Tool execution tracking
    tool_calls JSONB,
    tool_results JSONB,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    -- Constraints
    CONSTRAINT messages_role_valid CHECK (role IN ('user', 'assistant', 'system', 'tool')),
    CONSTRAINT messages_content_not_empty CHECK (char_length(content) > 0),
    CONSTRAINT messages_token_count_positive CHECK (token_count IS NULL OR token_count > 0)
);

-- Indexes
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id, created_at ASC);
CREATE INDEX idx_messages_user_id ON messages(user_id, created_at DESC);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- Partial index for tool calls
CREATE INDEX idx_messages_with_tools ON messages(conversation_id)
    WHERE tool_calls IS NOT NULL;

-- GIN index for JSONB tool_calls (if querying tool data)
CREATE INDEX idx_messages_tool_calls_gin ON messages USING GIN (tool_calls);
```

**SQLModel Equivalent:**

```python
from sqlmodel import Column
from sqlalchemy import JSON

class Message(SQLModel, table=True):
    __tablename__ = "messages"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    conversation_id: uuid.UUID = Field(foreign_key="conversations.id", index=True)
    user_id: uuid.UUID = Field(foreign_key="users.id", index=True)

    role: str = Field(max_length=50)  # user, assistant, system, tool
    content: str = Field(min_length=1)

    token_count: Optional[int] = Field(default=None, gt=0)
    model: Optional[str] = Field(default=None, max_length=100)

    tool_calls: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    tool_results: Optional[dict] = Field(default=None, sa_column=Column(JSON))

    created_at: datetime = Field(default_factory=datetime.utcnow)
```

**Design Decisions:**
- ✅ **No updated_at or deleted_at** (messages are immutable - append-only)
- ✅ Composite index (conversation_id, created_at) for chronological message loading
- ✅ CHECK constraint on role (prevents invalid values)
- ✅ JSONB for tool_calls and tool_results (flexible schema, queryable)
- ✅ GIN index on tool_calls for searching tool usage patterns
- ✅ Token count tracking for cost analysis
- ✅ Model field to track which AI model generated the response

---

#### Step 1.4: Tasks Table

**Purpose:** Manage user tasks created/modified through chat conversations

```sql
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Relationships
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
    created_by_message_id UUID REFERENCES messages(id) ON DELETE SET NULL,

    -- Task details
    title VARCHAR(500) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    priority INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    due_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE,

    -- Constraints
    CONSTRAINT tasks_title_not_empty CHECK (char_length(title) > 0),
    CONSTRAINT tasks_status_valid CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    CONSTRAINT tasks_priority_range CHECK (priority BETWEEN 0 AND 10)
);

-- Indexes
CREATE INDEX idx_tasks_user_status ON tasks(user_id, status, created_at DESC)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_tasks_conversation ON tasks(conversation_id)
    WHERE conversation_id IS NOT NULL AND deleted_at IS NULL;

CREATE INDEX idx_tasks_due_at ON tasks(due_at ASC)
    WHERE due_at IS NOT NULL AND status != 'completed' AND deleted_at IS NULL;

CREATE INDEX idx_tasks_completed ON tasks(user_id, completed_at DESC)
    WHERE completed_at IS NOT NULL;
```

**SQLModel Equivalent:**

```python
class Task(SQLModel, table=True):
    __tablename__ = "tasks"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="users.id", index=True)
    conversation_id: Optional[uuid.UUID] = Field(default=None, foreign_key="conversations.id")
    created_by_message_id: Optional[uuid.UUID] = Field(default=None, foreign_key="messages.id")

    title: str = Field(min_length=1, max_length=500)
    description: Optional[str] = Field(default=None)
    status: str = Field(default="pending", max_length=50)
    priority: int = Field(default=0, ge=0, le=10)

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = Field(default=None)
    due_at: Optional[datetime] = Field(default=None)
    deleted_at: Optional[datetime] = Field(default=None)
```

**Design Decisions:**
- ✅ Tracks which conversation/message created the task (audit trail)
- ✅ ON DELETE SET NULL for conversation_id (tasks survive conversation deletion)
- ✅ Composite index (user_id, status, created_at) for "my pending tasks" queries
- ✅ Partial index on due_at for incomplete tasks with deadlines
- ✅ Status enum constraint (prevents invalid states)
- ✅ Priority range 0-10 with CHECK constraint
- ✅ Separate completed_at for analytics (when task was marked complete)

---

### Phase 2: Relationship Mapping

#### Entity-Relationship Diagram

```
┌─────────────┐
│   users     │
│  (id: UUID) │
└──────┬──────┘
       │
       │ 1:N
       │
       ▼
┌──────────────────┐         ┌─────────────────┐
│  conversations   │ 1:N     │     tasks       │
│   (id: UUID)     ├────────>│   (id: UUID)    │
│                  │         │                 │
│ user_id: FK      │         │ user_id: FK     │
└────────┬─────────┘         │ conversation_id │
         │                   │ (nullable)      │
         │ 1:N               └─────────────────┘
         │
         ▼
┌──────────────────┐
│    messages      │
│   (id: UUID)     │
│                  │
│ conversation_id  │
│ user_id: FK      │
└──────────────────┘
```

#### Cascade Behavior

| Parent Table    | Child Table      | ON DELETE Behavior | Rationale |
|-----------------|------------------|-------------------|-----------|
| users           | conversations    | CASCADE           | User owns conversations; delete all when user deleted |
| users           | messages         | CASCADE           | User owns messages; delete all when user deleted |
| users           | tasks            | CASCADE           | User owns tasks; delete all when user deleted |
| conversations   | messages         | CASCADE           | Messages belong to conversation; delete when conversation deleted |
| conversations   | tasks            | SET NULL          | Tasks survive conversation deletion (task exists independently) |
| messages        | tasks            | SET NULL          | Preserve task if originating message deleted |

**Design Decisions:**
- ✅ Clean hierarchy prevents circular dependencies
- ✅ CASCADE deletes simplify user data removal (GDPR compliance)
- ✅ SET NULL preserves task history even if conversation deleted
- ✅ All foreign keys indexed for join performance

---

### Phase 3: Indexing Strategy

#### Primary Access Patterns

1. **Load conversation history** (most frequent)
   ```sql
   SELECT * FROM messages
   WHERE conversation_id = $1
   ORDER BY created_at ASC
   LIMIT 50;
   ```
   **Index:** `idx_messages_conversation_id` (conversation_id, created_at)

2. **List user's recent conversations**
   ```sql
   SELECT * FROM conversations
   WHERE user_id = $1 AND deleted_at IS NULL
   ORDER BY last_message_at DESC
   LIMIT 20;
   ```
   **Index:** `idx_conversations_user_recent` (user_id, last_message_at DESC)

3. **Get user's active tasks**
   ```sql
   SELECT * FROM tasks
   WHERE user_id = $1 AND status = 'pending' AND deleted_at IS NULL
   ORDER BY created_at DESC;
   ```
   **Index:** `idx_tasks_user_status` (user_id, status, created_at DESC)

4. **Find tasks due soon**
   ```sql
   SELECT * FROM tasks
   WHERE due_at < NOW() + INTERVAL '24 hours'
     AND status != 'completed'
     AND deleted_at IS NULL
   ORDER BY due_at ASC;
   ```
   **Index:** `idx_tasks_due_at` (due_at) WHERE clause

#### Index Maintenance

```sql
-- Regular index health check
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan ASC;

-- Identify unused indexes (idx_scan = 0)
-- Consider dropping if confirmed unused
```

**Quality Checks:**
- ✅ Every foreign key has an index
- ✅ Composite indexes match query WHERE + ORDER BY clauses
- ✅ Partial indexes used for soft-deleted tables (WHERE deleted_at IS NULL)
- ✅ No redundant indexes (covered by composite indexes)
- ✅ GIN indexes on JSONB columns only if querying JSON content

---

### Phase 4: Timestamp Strategy

#### Timestamp Columns by Table

| Table          | created_at | updated_at | deleted_at | Additional Timestamps |
|----------------|------------|------------|------------|----------------------|
| users          | ✅         | ✅         | ✅         | -                    |
| conversations  | ✅         | ✅         | ✅         | last_message_at      |
| messages       | ✅         | ❌         | ❌         | -                    |
| tasks          | ✅         | ✅         | ✅         | completed_at, due_at |

#### Timestamp Rules

1. **created_at:**
   - Present on ALL tables
   - DEFAULT NOW() at database level
   - NEVER updated after insertion
   - Type: `TIMESTAMP WITH TIME ZONE` (UTC)

2. **updated_at:**
   - Present on mutable tables (users, conversations, tasks)
   - Automatically updated via trigger
   - NOT present on immutable tables (messages)

3. **deleted_at:**
   - Null = active record
   - Non-null = soft-deleted record
   - Partial indexes use `WHERE deleted_at IS NULL`

4. **Domain-specific timestamps:**
   - `last_message_at` (conversations): Denormalized for performance
   - `completed_at` (tasks): Separate from updated_at for analytics
   - `due_at` (tasks): User-defined deadline

#### Auto-Update Trigger for updated_at

```sql
-- Trigger function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables with updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

**Quality Checks:**
- ✅ All timestamps use TIMESTAMP WITH TIME ZONE (not TIMESTAMP)
- ✅ Application stores/retrieves in UTC
- ✅ updated_at triggers prevent manual timestamp management
- ✅ Messages table omits updated_at (immutable by design)

---

### Phase 5: Support for Stateless Backends

#### Design Patterns for Stateless Architecture

1. **No Session State in Application Memory**
   - Backend servers store ZERO conversation state
   - Every request reconstructs context from database
   - Servers are ephemeral and can restart without data loss

2. **Database as Single Source of Truth**
   ```python
   # CORRECT: Load from DB on every request
   def handle_chat_request(user_id: str, message: str):
       conversation = get_or_create_conversation(user_id)
       messages = load_message_history(conversation.id)
       response = call_ai_agent(messages + [message])
       save_message(conversation.id, "user", message)
       save_message(conversation.id, "assistant", response)
       return response

   # WRONG: Storing conversation in memory
   # conversations_cache = {}  # ❌ Breaks stateless design
   ```

3. **Efficient Context Loading**
   ```sql
   -- Load last N messages (e.g., 50) for context window
   SELECT role, content, created_at
   FROM messages
   WHERE conversation_id = $1
   ORDER BY created_at DESC
   LIMIT 50;
   ```

4. **Denormalization for Performance**
   ```sql
   -- Update last_message_at on conversations for fast sorting
   CREATE OR REPLACE FUNCTION update_conversation_last_message()
   RETURNS TRIGGER AS $$
   BEGIN
       UPDATE conversations
       SET last_message_at = NEW.created_at
       WHERE id = NEW.conversation_id;
       RETURN NEW;
   END;
   $$ LANGUAGE plpgsql;

   CREATE TRIGGER update_last_message_at
       AFTER INSERT ON messages
       FOR EACH ROW
       EXECUTE FUNCTION update_conversation_last_message();
   ```

5. **Pagination for Large Conversations**
   ```python
   # Load messages in chunks (avoid loading entire history)
   def load_recent_messages(conversation_id: UUID, limit: int = 50, offset: int = 0):
       return session.query(Message)\
           .filter(Message.conversation_id == conversation_id)\
           .order_by(Message.created_at.desc())\
           .limit(limit)\
           .offset(offset)\
           .all()
   ```

**Quality Checks:**
- ✅ No in-memory caches of conversation state
- ✅ All queries use indexes (no table scans)
- ✅ Message history limited to context window size
- ✅ Denormalized fields updated via triggers (not application code)
- ✅ Horizontal scaling possible (any server can handle any request)

---

### Phase 6: Migration and Evolution

#### Initial Migration (Alembic)

```python
# alembic/versions/001_initial_schema.py
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

def upgrade():
    # Users table
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(), primary_key=True),
        sa.Column('username', sa.String(255), nullable=False, unique=True),
        sa.Column('email', sa.String(255), unique=True),
        sa.Column('display_name', sa.String(255)),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.func.now()),
        sa.Column('deleted_at', sa.TIMESTAMP(timezone=True)),
    )
    op.create_index('idx_users_username', 'users', ['username'])

    # Conversations table
    op.create_table(
        'conversations',
        sa.Column('id', postgresql.UUID(), primary_key=True),
        sa.Column('user_id', postgresql.UUID(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('title', sa.String(500)),
        sa.Column('system_prompt', sa.Text()),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.func.now()),
        sa.Column('last_message_at', sa.TIMESTAMP(timezone=True)),
        sa.Column('deleted_at', sa.TIMESTAMP(timezone=True)),
    )
    op.create_index('idx_conversations_user_id', 'conversations', ['user_id'])

    # Messages table
    op.create_table(
        'messages',
        sa.Column('id', postgresql.UUID(), primary_key=True),
        sa.Column('conversation_id', postgresql.UUID(), sa.ForeignKey('conversations.id', ondelete='CASCADE'), nullable=False),
        sa.Column('user_id', postgresql.UUID(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('role', sa.String(50), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('token_count', sa.Integer()),
        sa.Column('model', sa.String(100)),
        sa.Column('tool_calls', postgresql.JSONB()),
        sa.Column('tool_results', postgresql.JSONB()),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.func.now()),
    )
    op.create_index('idx_messages_conversation_id', 'messages', ['conversation_id', 'created_at'])

    # Tasks table
    op.create_table(
        'tasks',
        sa.Column('id', postgresql.UUID(), primary_key=True),
        sa.Column('user_id', postgresql.UUID(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('conversation_id', postgresql.UUID(), sa.ForeignKey('conversations.id', ondelete='SET NULL')),
        sa.Column('created_by_message_id', postgresql.UUID(), sa.ForeignKey('messages.id', ondelete='SET NULL')),
        sa.Column('title', sa.String(500), nullable=False),
        sa.Column('description', sa.Text()),
        sa.Column('status', sa.String(50), server_default='pending'),
        sa.Column('priority', sa.Integer(), server_default='0'),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.func.now()),
        sa.Column('completed_at', sa.TIMESTAMP(timezone=True)),
        sa.Column('due_at', sa.TIMESTAMP(timezone=True)),
        sa.Column('deleted_at', sa.TIMESTAMP(timezone=True)),
    )
    op.create_index('idx_tasks_user_status', 'tasks', ['user_id', 'status', 'created_at'])

def downgrade():
    op.drop_table('tasks')
    op.drop_table('messages')
    op.drop_table('conversations')
    op.drop_table('users')
```

#### Schema Evolution Best Practices

1. **Backward-Compatible Changes:**
   - ✅ Adding nullable columns
   - ✅ Adding new tables
   - ✅ Adding indexes
   - ⚠️ Adding NOT NULL columns (requires default or backfill)
   - ❌ Renaming columns (breaking change)
   - ❌ Dropping columns (breaking change)

2. **Safe Column Addition:**
   ```sql
   -- Step 1: Add column as nullable
   ALTER TABLE messages ADD COLUMN sentiment VARCHAR(50);

   -- Step 2: Backfill existing rows (if needed)
   UPDATE messages SET sentiment = 'neutral' WHERE sentiment IS NULL;

   -- Step 3: Add NOT NULL constraint (optional, after backfill)
   ALTER TABLE messages ALTER COLUMN sentiment SET NOT NULL;
   ```

3. **Zero-Downtime Migrations:**
   - Deploy code that works with both old and new schema
   - Run migration
   - Deploy code that uses new schema only
   - Clean up old columns/indexes in next migration

**Quality Checks:**
- ✅ Every migration has a corresponding downgrade
- ✅ Migrations tested on staging data before production
- ✅ Large migrations run during low-traffic periods
- ✅ Indexes created CONCURRENTLY in production
- ✅ Foreign keys validated before adding NOT VALID, then validated separately

---

## Validation Checklist

### Schema Design Validation

#### ✅ Table Structure
- [ ] Every table has a UUID primary key
- [ ] All foreign keys have indexes
- [ ] Every table has `created_at` timestamp
- [ ] Mutable tables have `updated_at` timestamp
- [ ] Soft-delete tables have `deleted_at` timestamp
- [ ] No circular foreign key dependencies

#### ✅ Data Integrity
- [ ] All foreign keys defined with appropriate ON DELETE behavior
- [ ] CHECK constraints on enum-like columns (role, status, etc.)
- [ ] NOT NULL constraints on required fields
- [ ] UNIQUE constraints on natural keys (username, email)
- [ ] String length constraints to prevent abuse

#### ✅ Indexing
- [ ] Every foreign key column has an index
- [ ] Composite indexes match query patterns (WHERE + ORDER BY)
- [ ] Partial indexes used for soft-deleted tables
- [ ] GIN/GiST indexes on JSONB/array columns if queried
- [ ] No redundant indexes (covered by composite indexes)

#### ✅ Stateless Support
- [ ] No application-level session state required
- [ ] All conversation context loadable from DB
- [ ] Queries optimized with LIMIT clauses
- [ ] Denormalized fields updated via triggers
- [ ] Horizontal scaling possible

#### ✅ Performance
- [ ] All common queries use indexes (verified with EXPLAIN)
- [ ] No N+1 query patterns
- [ ] Message loading limited to context window size
- [ ] Pagination implemented for large result sets
- [ ] Connection pooling configured

#### ✅ Security & Privacy
- [ ] User data isolated per user_id
- [ ] Soft deletes preserve audit trail
- [ ] No sensitive data in logs (passwords, tokens)
- [ ] Foreign keys prevent orphaned records
- [ ] Email/username validation at DB level

#### ✅ Observability
- [ ] Timestamps on all tables for audit
- [ ] tool_calls and tool_results tracked in messages
- [ ] token_count and model tracked for cost analysis
- [ ] created_by_message_id tracked on tasks for provenance

---

## Common Patterns

### Pattern 1: Load Conversation with Messages

```python
from sqlmodel import Session, select
from typing import List

def load_conversation_context(
    session: Session,
    user_id: uuid.UUID,
    conversation_id: uuid.UUID,
    limit: int = 50
) -> List[Message]:
    """
    Load recent messages for a conversation

    Verifies user owns the conversation before loading messages
    """
    # Verify ownership
    conversation = session.exec(
        select(Conversation)
        .where(
            Conversation.id == conversation_id,
            Conversation.user_id == user_id,
            Conversation.deleted_at.is_(None)
        )
    ).first()

    if not conversation:
        raise ValueError("Conversation not found or access denied")

    # Load messages in chronological order
    messages = session.exec(
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.asc())
        .limit(limit)
    ).all()

    return list(messages)
```

### Pattern 2: Create Task from Chat Message

```python
def create_task_from_message(
    session: Session,
    user_id: uuid.UUID,
    conversation_id: uuid.UUID,
    message_id: uuid.UUID,
    title: str,
    description: str = None
) -> Task:
    """
    Create a task linked to a specific message in a conversation
    """
    task = Task(
        user_id=user_id,
        conversation_id=conversation_id,
        created_by_message_id=message_id,
        title=title,
        description=description,
        status="pending"
    )

    session.add(task)
    session.commit()
    session.refresh(task)

    return task
```

### Pattern 3: Get or Create Conversation

```python
def get_or_create_conversation(
    session: Session,
    user_id: uuid.UUID,
    title: str = None,
    system_prompt: str = None
) -> Conversation:
    """
    Get user's active conversation or create new one

    For single-conversation-per-user apps
    """
    # Check for existing active conversation
    conversation = session.exec(
        select(Conversation)
        .where(
            Conversation.user_id == user_id,
            Conversation.deleted_at.is_(None)
        )
        .order_by(Conversation.last_message_at.desc())
    ).first()

    if conversation:
        return conversation

    # Create new conversation
    conversation = Conversation(
        user_id=user_id,
        title=title or "New Conversation",
        system_prompt=system_prompt
    )

    session.add(conversation)
    session.commit()
    session.refresh(conversation)

    return conversation
```

---

## Anti-Patterns to Avoid

### ❌ Anti-Pattern 1: Storing Conversation State in Memory

```python
# WRONG: Session-based state
user_conversations = {}  # ❌ Breaks stateless design

def handle_message(user_id, message):
    if user_id not in user_conversations:
        user_conversations[user_id] = []
    user_conversations[user_id].append(message)
```

**Fix:** Always load from database

```python
# CORRECT: Database-backed state
def handle_message(user_id, message):
    conversation = get_conversation(user_id)
    save_message(conversation.id, "user", message)
    messages = load_messages(conversation.id)
```

### ❌ Anti-Pattern 2: Not Indexing Foreign Keys

```sql
-- WRONG: Missing index on conversation_id
CREATE TABLE messages (
    id UUID PRIMARY KEY,
    conversation_id UUID REFERENCES conversations(id),
    -- No index on conversation_id ❌
);
```

**Fix:** Index all foreign keys

```sql
-- CORRECT: Indexed foreign key
CREATE INDEX idx_messages_conversation_id
ON messages(conversation_id, created_at);
```

### ❌ Anti-Pattern 3: Loading Entire Message History

```python
# WRONG: Load all messages (could be thousands)
messages = session.query(Message)\
    .filter(Message.conversation_id == conv_id)\
    .all()  # ❌ No limit
```

**Fix:** Limit to context window size

```python
# CORRECT: Load recent messages only
messages = session.query(Message)\
    .filter(Message.conversation_id == conv_id)\
    .order_by(Message.created_at.desc())\
    .limit(50)\
    .all()
```

### ❌ Anti-Pattern 4: Hard Deletes Without Audit Trail

```sql
-- WRONG: Permanent deletion
DELETE FROM messages WHERE id = $1;  -- ❌ Lost forever
```

**Fix:** Soft delete with deleted_at

```sql
-- CORRECT: Soft delete
UPDATE messages SET deleted_at = NOW() WHERE id = $1;
```

### ❌ Anti-Pattern 5: Not Using TIMESTAMP WITH TIME ZONE

```sql
-- WRONG: Ambiguous timezone
created_at TIMESTAMP DEFAULT NOW()  -- ❌ What timezone?
```

**Fix:** Always use WITH TIME ZONE

```sql
-- CORRECT: Explicit timezone
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()  -- ✅ UTC
```

---

## Complete Schema Example

```sql
-- Complete AI Chat Database Schema
-- PostgreSQL 14+

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    display_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT users_username_length CHECK (char_length(username) >= 3)
);

CREATE INDEX idx_users_username ON users(username) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;

-- Conversations table
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(500),
    system_prompt TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    last_message_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_conversations_user_recent
ON conversations(user_id, last_message_at DESC)
WHERE deleted_at IS NULL;

-- Messages table (immutable, append-only)
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    token_count INTEGER,
    model VARCHAR(100),
    tool_calls JSONB,
    tool_results JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT messages_role_valid CHECK (role IN ('user', 'assistant', 'system', 'tool')),
    CONSTRAINT messages_content_not_empty CHECK (char_length(content) > 0)
);

CREATE INDEX idx_messages_conversation_id
ON messages(conversation_id, created_at ASC);

CREATE INDEX idx_messages_tool_calls_gin
ON messages USING GIN (tool_calls);

-- Tasks table
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
    created_by_message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    due_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT tasks_title_not_empty CHECK (char_length(title) > 0),
    CONSTRAINT tasks_status_valid CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    CONSTRAINT tasks_priority_range CHECK (priority BETWEEN 0 AND 10)
);

CREATE INDEX idx_tasks_user_status
ON tasks(user_id, status, created_at DESC)
WHERE deleted_at IS NULL;

CREATE INDEX idx_tasks_due_at
ON tasks(due_at ASC)
WHERE due_at IS NOT NULL AND status != 'completed' AND deleted_at IS NULL;

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update last_message_at on conversations
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations
    SET last_message_at = NEW.created_at
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_last_message_at
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_last_message();
```

---

## Success Criteria

Your AI chat database schema is production-ready when:

### Functional Requirements
- ✅ Supports multi-user conversations with isolated data
- ✅ Messages stored in chronological order (append-only)
- ✅ Tasks linked to conversations and messages for audit
- ✅ Soft deletes preserve data for compliance
- ✅ All timestamps in UTC with timezone

### Performance Requirements
- ✅ Message loading < 100ms for 50 messages
- ✅ All foreign key queries use indexes (EXPLAIN shows index scans)
- ✅ Handles 1000+ concurrent users without table scans
- ✅ Conversation list sorted by last_message_at < 50ms

### Stateless Backend Support
- ✅ No in-memory state required
- ✅ Any server can handle any request
- ✅ Horizontal scaling possible
- ✅ Context loadable from DB in single query

### Data Integrity
- ✅ All foreign keys enforced
- ✅ CHECK constraints on enums
- ✅ No orphaned records possible
- ✅ Cascade behavior documented and tested

---

## References

- [PostgreSQL Documentation - Indexes](https://www.postgresql.org/docs/current/indexes.html)
- [SQLModel Documentation](https://sqlmodel.tiangolo.com/)
- [Database Normalization Best Practices](https://en.wikipedia.org/wiki/Database_normalization)
- [Alembic Migration Guide](https://alembic.sqlalchemy.org/en/latest/)
- [Soft Delete Pattern](https://www.martinfowler.com/eaaCatalog/soft-delete.html)

---

**Last Updated:** 2026-02-05
**Maintained By:** Database Architecture Team
