<!--
=============================================================================
SYNC IMPACT REPORT
=============================================================================
Version Change: 1.0.0 → 2.0.0 (MAJOR - AI Agent Architecture Addition)

Modified Principles:
- Principle I: Extended to include AI specification requirements
- Principle II: Extended to include AI agent layer and MCP tool boundary
- Principle IV: Extended to include MCP tool contracts
- Principle V: Extended to include AI behavior testing requirements

Added Sections:
- AI Agent Architecture (new principle VII)
- Stateless Conversation Management (new principle VIII)
- MCP Tool Contracts (new principle IX)
- AI Chatbot Capabilities & Limitations (new section)
- Cohere API Integration (under Technology Stack)
- Tool Execution Rules (under Agent Governance)
- AI-Specific Quality Standards
- Phase-3 Success Criteria

Removed Sections: None

Templates Requiring Updates:
- .specify/templates/plan-template.md ✅ compatible (AI architecture planning)
- .specify/templates/spec-template.md ✅ compatible (AI behavior specs)
- .specify/templates/tasks-template.md ✅ compatible (MCP tool tasks)
- skills/mcp-tools-engineer/mcp-tool-development.md ✅ created
- skills/spec-writer/ai-spec-writing.md ✅ created
- skills/backend-engineer/ai-fastapi-chat-backend.md ✅ created

Follow-up TODOs:
- Create MCP tool implementation specs after constitution approval
- Define exact Cohere model selection (Command R+ vs Command R)
=============================================================================
-->

# Phase III – AI-Powered Todo Chatbot Constitution

## Core Principles

### I. Spec-Driven Development (Mandatory)

All development MUST follow strict Spec-Driven Development principles:

- No frontend, backend, database, or **AI agent code** without approved specifications
- Specifications are the single source of truth for all implementation
- Implementation MUST exactly match specifications without deviation
- **AI behavior specifications** MUST define expected patterns, not exact outputs
- Changes to behavior require specification updates first, then implementation

**Rationale**: Specifications ensure alignment between stakeholders and prevent
scope creep. For AI systems, specs define capabilities and boundaries while
allowing for non-deterministic responses within defined patterns.

### II. Layered Architecture Discipline

The system MUST maintain strict separation between layers:

- Frontend, backend, **AI agent**, and database MUST be clearly separated
- No business logic in the frontend layer
- No UI concerns in the backend layer
- **AI agent MUST NOT access database directly** (MCP tools only)
- Each layer communicates only through defined interfaces

**Rationale**: Layer separation enables independent testing, deployment, and
scaling. The AI agent operates as a distinct layer with MCP tools as its
exclusive interface to system state.

### III. Extension, Not Rewrite

Phase III MUST extend Phase II concepts rather than replacing them:

- Core Todo behaviors (add, update, delete, complete) remain consistent
- AI chatbot layer **extends** existing REST API functionality
- Data models and business rules carry forward from Phase II design
- **Conversational interface complements, not replaces**, traditional UI
- New features build upon, not replace, existing functionality

**Rationale**: Continuity ensures stability and reduces risk. Users can choose
between traditional UI and conversational interface based on preference.

### IV. API-First Design

All inter-layer communication MUST follow API-First principles:

- API contracts MUST be defined before implementation begins
- Frontend consumes backend only via documented REST APIs
- **AI agent consumes backend only via MCP tool contracts**
- No direct database access from frontend or AI agent under any circumstance
- API versioning strategy MUST be defined for future compatibility

**Rationale**: API and MCP tool contracts enable parallel development and
provide clear integration points. Tool contracts ensure AI operations are
safe, validated, and auditable.

### V. Test-First Development

Testing MUST be integrated into the development workflow:

- Contract tests validate API and MCP tool boundaries
- Integration tests verify layer interactions
- Unit tests cover business logic in isolation
- **AI behavior tests validate tool usage patterns and error handling**
- Tests MUST be written before implementation when feasible

**Rationale**: Tests provide confidence in refactoring and catch regressions
early. AI behavior tests verify the agent uses tools correctly and handles
failures gracefully.

### VI. Simplicity and YAGNI

Development MUST prioritize simplicity:

- Start with the simplest viable implementation
- Do not build features not explicitly in the specification
- Avoid premature optimization and over-engineering
- **AI prompts MUST be minimal and focused** (no over-instruction)
- Add complexity only when justified by concrete requirements

**Rationale**: Simplicity reduces bugs, speeds development, and improves
maintainability. Simple AI prompts perform better and are easier to debug.

### VII. AI Agent Architecture (Phase III)

The AI agent MUST operate within strict architectural boundaries:

- **Stateless Design**: AI agent MUST NOT maintain session state in memory
- **Database as Truth**: All conversation history stored in PostgreSQL
- **MCP Tool Mediation**: AI accesses tasks ONLY via MCP tools (add_task, list_tasks, update_task, delete_task, complete_task)
- **No Direct DB Access**: AI MUST NEVER query database directly
- **Tool Contract Enforcement**: All tool inputs validated via Pydantic schemas
- **Graceful Degradation**: AI errors MUST NOT crash the system

**Rationale**: Stateless architecture enables horizontal scaling and recovery
from failures. MCP tools enforce validation, authorization, and audit trails
that direct DB access cannot guarantee.

### VIII. Stateless Conversation Management (Phase III)

Conversation state MUST be managed without server memory:

- **Conversation History**: All messages stored in `conversations` and `messages` tables
- **Context Loading**: On each request, load last N messages from database
- **Session Identification**: Conversation identified by `conversation_id` in database
- **No In-Memory Cache**: Backend servers MUST NOT cache conversation state
- **Horizontal Scalability**: Any server can handle any conversation request

**Rationale**: Stateless design allows backend to scale horizontally and
recover from restarts without losing conversation context. Database becomes
the single source of truth for all state.

### IX. MCP Tool Contracts (Phase III)

All AI-to-backend operations MUST follow MCP tool contract principles:

- **Structured Input**: All tools accept Pydantic-validated input schemas
- **Structured Output**: All tools return consistent `ToolResponse` format (success, data, error, warning)
- **Authorization**: Tools MUST verify user ownership before operations
- **Database-Safe**: Tools MUST use ORM parameterized queries (no SQL injection possible)
- **Idempotency**: Tools MUST document idempotency behavior
- **Error Handling**: Tools MUST catch all exceptions and return errors (never throw to AI)

**Rationale**: Tool contracts provide safety, validation, and audit trails.
Structured outputs enable AI to parse results reliably. Authorization at the
tool level prevents unauthorized access.

## Technology Stack

The following technology choices are FIXED for Phase III:

**Frontend**:
- Next.js 14 (App Router) – React framework with server-side rendering
- TypeScript – Static typing for reliability
- Tailwind CSS – Utility-first styling
- **OpenAI ChatKit UI** – Pre-built chat interface components

**Backend** (Extended from Phase II):
- Node.js + Express + TypeScript – Existing Phase-2 backend
- Prisma ORM – Database ORM (from Phase-2)
- PostgreSQL (Neon) – Serverless Postgres database (from Phase-2)
- Better Auth – Session-based authentication (from Phase-2)
- RESTful API design – Standard HTTP methods and status codes

**AI Agent**:
- **OpenAI Agents SDK** – Agent orchestration framework
- **Cohere API** – LLM provider (Command R+ or Command R model)
- **MCP (Model Context Protocol)** – Tool execution standard
- Pydantic – Input/output validation for tools

**Database Schema** (Extended from Phase II):
- `users` table – User accounts (existing from Phase-2)
- `tasks` table – Todo items (existing from Phase-2)
- **`conversations` table** – Chat conversation metadata (new)
- **`messages` table** – Individual chat messages (new)

**Deployment**:
- Backend: Hugging Face Space (Docker container)
- Frontend: Vercel (Next.js optimized hosting)

## AI Chatbot Capabilities & Limitations

### Capabilities

The AI chatbot MUST support these natural language operations:

1. **Task Creation**: "Add task: Buy groceries", "Create todo for meeting tomorrow"
2. **Task Listing**: "What tasks do I have?", "Show my pending todos"
3. **Task Update**: "Update my grocery task to add milk", "Change priority to high"
4. **Task Completion**: "Mark 'Buy groceries' as done", "Complete my first task"
5. **Task Deletion**: "Delete the meeting task", "Remove completed tasks"
6. **Conversational Context**: Remember previous messages in conversation
7. **Clarification**: Ask for details when request is ambiguous

### Limitations

The AI chatbot MUST NOT:

- Access tasks belonging to other users (enforced by tool authorization)
- Make assumptions about missing task details (must ask user)
- Perform operations without user confirmation (if destructive or ambiguous)
- Access database directly (tools only)
- Maintain state in memory (database only)
- Generate code, answer non-task-related queries, or deviate from task management

**Rationale**: Clear boundaries prevent security issues and scope creep. The
chatbot is a task management assistant, not a general-purpose AI.

## Functional Requirements

### Core Features (Phase I & II Parity)

- **Add Todo**: Create new todo items with title and optional details
- **Update Todo**: Modify existing todo item properties
- **Delete Todo**: Remove todo items permanently
- **View Todo List**: Display all todos with current state
- **Mark Complete/Incomplete**: Toggle todo completion status

### Enhanced Features (Phase II)

- **Priority Levels**: Support low, medium, and high priority values
- **Tags/Categories**: Classify todos (e.g., work, personal)
- **Search**: Find todos by keyword in title or description
- **Filter**: View subsets by status, priority, or category
- **Sort**: Order by due date, priority, or title

### AI Chatbot Features (Phase III)

- **Natural Language Understanding**: Parse task operations from user messages
- **Conversation History**: Load and display previous messages in conversation
- **Tool Execution**: Call MCP tools to perform task operations
- **Streaming Responses**: Stream AI response tokens in real-time
- **Error Handling**: Gracefully handle AI failures and tool errors
- **Context Management**: Limit conversation history to fit context window

## Agent Governance

Agents MUST operate within their defined roles:

| Agent | Responsibility | Phase III Additions |
|-------|---------------|---------------------|
| Architecture Planner | System design & service boundaries | AI agent architecture, MCP tool design |
| Spec Writer | Feature and API specifications | AI behavior specs, tool contracts |
| Backend Engineer | Express routes & business logic | MCP tool implementation |
| Database Engineer | Schema design & migrations | Conversation/message schema |
| Frontend Engineer | Next.js UI & API consumption | ChatKit UI integration |
| Integration Tester | End-to-end validation | AI-to-backend tool execution tests |
| **MCP Tools Engineer** (new) | **MCP tool development** | **Tool schemas, validation, DB operations** |

**Agent Rules**:
- Agents MUST follow specifications strictly
- Agents MUST escalate ambiguity rather than assume
- Agents MUST NOT invent features not in specifications
- Agents MUST document decisions requiring ADR consideration
- **AI Agent MUST use only defined MCP tools** (no direct API calls)

**Tool Execution Rules** (Phase III):
- All MCP tools MUST validate input with Pydantic schemas
- All MCP tools MUST return ToolResponse format (success, data, error, warning)
- All MCP tools MUST check user authorization before DB operations
- All MCP tools MUST use Prisma ORM (no raw SQL strings)
- All MCP tools MUST handle errors gracefully (no exceptions to AI)
- All MCP tool calls MUST be logged for audit and debugging

## Quality Standards

All implementations MUST meet these quality gates:

### General Quality (Phase I & II)

- **Input Validation**: All API endpoints MUST validate input
- **Error Handling**: Meaningful error messages with appropriate HTTP codes
- **Data Consistency**: Models MUST be consistent across all layers
- **Determinism**: Same input MUST always produce same output (non-AI code)
- **Code Review**: All changes require review before merge

### AI-Specific Quality (Phase III)

- **AI Behavior Specs**: Define expected patterns, not exact responses
- **Tool Safety**: All tools MUST prevent SQL injection (ORM only)
- **Context Window**: Limit conversation history to avoid token limits
- **Streaming**: Support real-time token streaming for better UX
- **Error Recovery**: AI failures MUST NOT break the user experience
- **Semantic Testing**: Validate AI tool usage, not response wording

## Security & Error Handling

### Security Requirements (Phase III)

- **Authentication**: Better Auth enforces user identity on all requests
- **Authorization**: MCP tools verify user_id matches authenticated user
- **No Credential Exposure**: Cohere API key in environment variables only
- **Input Sanitization**: Pydantic validation prevents malicious input
- **SQL Injection Prevention**: Prisma ORM parameterized queries only
- **Rate Limiting**: Prevent abuse (30 requests/minute per user)

### Error Handling Hierarchy

1. **Tool-Level Errors**: Database failures, validation errors → Return ToolResponse with error field
2. **AI-Level Errors**: Cohere API down, token limit exceeded → Retry with backoff, inform user
3. **API-Level Errors**: Invalid requests, unauthorized access → HTTP status codes (400, 401, 429, 500)
4. **Frontend Errors**: Display user-friendly messages, show retry button

**Error Message Principles**:
- User-facing messages MUST be helpful and actionable
- MUST NOT expose internal details (stack traces, DB connection strings)
- MUST suggest next steps ("Please try again", "Check your input")

## Integration & Deployment

### Backend Integration (Phase III extends Phase II)

- Phase-3 chatbot **extends** existing Phase-2 Express backend
- New routes: `POST /api/chat/:userId`, `GET /api/conversations/:userId`
- Existing task routes remain unchanged (backward compatible)
- Better Auth session middleware applies to all routes
- MCP tools use existing Prisma models and database connection

### Database Migration

- Add `conversations` and `messages` tables via Prisma migration
- Add foreign keys: `messages.conversation_id` → `conversations.id`
- Add foreign keys: `messages.user_id` → `users.id`
- Add indexes: `messages(conversation_id, created_at)`, `conversations(user_id, last_message_at)`

### Deployment Strategy

**Backend** (Hugging Face Space):
- Docker container with Node.js + Express + Prisma
- Environment variables: `DATABASE_URL`, `COHERE_API_KEY`, `BETTER_AUTH_SECRET`
- Health check endpoint: `GET /health`
- Port: 8000 (exposed)

**Frontend** (Vercel):
- Next.js 14 App Router
- Environment variables: `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_AUTH_URL`
- API proxy via Next.js server actions (if needed)

### Stateless Deployment Requirements

- Backend containers MUST be ephemeral (no persistent local state)
- All state in PostgreSQL (conversations, messages, tasks, users)
- Any backend instance can handle any request (no session affinity)
- Horizontal scaling supported (multiple backend instances)

## Extension / Scalability Notes

### Future Extensions (Out of Scope for Phase III)

- Multi-language support (currently English only)
- Voice interface (speech-to-text)
- Task sharing between users
- Advanced scheduling (recurring tasks, reminders)
- Analytics dashboard (task completion trends)

### Scalability Considerations

**Current Design Supports**:
- Horizontal scaling (stateless backend)
- Database connection pooling (Prisma)
- Conversation pagination (limit history to last 50 messages)
- Rate limiting per user

**Future Optimizations** (if needed):
- Redis cache for conversation summaries
- Cohere API request queuing
- Database read replicas
- CDN for frontend assets

### Model Selection Notes

**Current**: Cohere Command R+ or Command R (to be decided in spec phase)

**Selection Criteria**:
- Command R+: Better reasoning, longer context (128K tokens), higher cost
- Command R: Faster, lower cost, sufficient for task management
- **Recommendation**: Start with Command R, upgrade if needed

## Constraints

The following are explicitly OUT OF SCOPE for Phase III:

- No general-purpose AI chatbot (task management only)
- No AI code generation or execution
- No user authentication changes (Better Auth remains)
- No Phase-2 backend rewrite (extend only)
- No container orchestration (single Docker container)
- No hardcoded credentials (environment variables only)
- No skipping specification steps in the workflow
- No direct database queries from frontend or AI agent

## Success Criteria

Phase III is considered successful when:

- [ ] AI chatbot can create tasks via natural language
- [ ] AI chatbot can list user's tasks with filters
- [ ] AI chatbot can update task details (title, priority, status)
- [ ] AI chatbot can mark tasks complete
- [ ] AI chatbot can delete tasks (with confirmation)
- [ ] Conversation history persists across sessions
- [ ] AI uses only MCP tools (no direct DB access)
- [ ] All MCP tools validate input and enforce authorization
- [ ] Backend remains stateless (any server handles any request)
- [ ] Streaming responses work in real-time
- [ ] Error handling is graceful (no crashes)
- [ ] All specifications match implementation exactly
- [ ] Integration tests verify AI-to-backend tool execution
- [ ] Documentation covers AI setup, deployment, and usage

## Governance

### Amendment Process

1. Propose changes via pull request to this document
2. Document rationale for each proposed change
3. Obtain stakeholder approval before merge
4. Update version number according to semantic versioning
5. Propagate changes to dependent templates and documents

### Versioning Policy

- **MAJOR**: Backward-incompatible principle changes or removals
- **MINOR**: New principles, sections, or material expansions
- **PATCH**: Clarifications, typo fixes, non-semantic refinements

### Compliance Review

- All pull requests MUST verify constitution compliance
- Complexity additions MUST be justified in PR description
- Runtime guidance follows `.specify/memory/constitution.md`
- AI behavior MUST align with defined capabilities and limitations

**Version**: 2.0.0 | **Ratified**: 2025-01-15 | **Last Amended**: 2026-02-05
