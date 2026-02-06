---
description: "Actionable tasks for AI-Powered Todo Chatbot implementation"
input: "specs/1-ai-chatbot/spec.md, specs/1-ai-chatbot/plan.md (Plan agent output)"
architecture: "Option B: Separate FastAPI AI Service"
generated: "2026-02-05"
---

# Tasks: AI-Powered Todo Chatbot

**Input**: Design documents from `specs/1-ai-chatbot/`
**Prerequisites**: spec.md (6 user stories), plan.md (Option B architecture), constitution.md (v2.0.0)

**Architecture**: Option B - Separate FastAPI AI Service with Express backend as API gateway

**Tests**: Not explicitly requested in specification - test tasks omitted per constitution

**Organization**: Tasks grouped by user story to enable independent implementation and testing

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US6)
- File paths use actual project structure (backend/, ai-service/, frontend/)

## Path Conventions

- **Backend**: `backend/src/` (Express + TypeScript + MCP tools)
- **AI Service**: `ai-service/app/` (FastAPI + Python + AI agent)
- **Frontend**: `frontend/app/` (Next.js 14 + React + ChatKit UI)
- **Database**: `backend/prisma/` (Prisma schema + migrations)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and AI service structure

- [x] T001 Verify Phase-2 backend structure (backend/src/, backend/prisma/) is intact
- [x] T002 Create ai-service directory structure (ai-service/app/, ai-service/requirements.txt)
- [ ] T003 [P] Initialize Python virtual environment for ai-service (python -m venv ai-service/venv)
- [x] T004 [P] Install FastAPI dependencies in ai-service/requirements.txt (fastapi, uvicorn, openai-agents-sdk, cohere, pydantic, httpx)
- [x] T005 [P] Configure environment variables (.env.example with DATABASE_URL, COHERE_API_KEY, BETTER_AUTH_SECRET, AI_SERVICE_URL, BACKEND_URL)
- [x] T006 [P] Install ChatKit UI in frontend (npm install @chatscope/chat-ui-kit-react @chatscope/chat-ui-kit-styles)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core database schema, MCP tools, and AI agent infrastructure - MUST complete before ANY user story

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Database Schema Extensions

- [x] T007 Extend Prisma schema with Conversation model in backend/prisma/schema.prisma (id, userId, title, createdAt, lastMessageAt)
- [x] T008 Extend Prisma schema with Message model in backend/prisma/schema.prisma (id, conversationId, userId, role, content, createdAt)
- [x] T009 Add Conversation and Message relations to User model in backend/prisma/schema.prisma
- [x] T010 Add database indexes in backend/prisma/schema.prisma (@@index([userId, lastMessageAt]) for Conversation, @@index([conversationId, createdAt]) for Message)
- [x] T011 Create Prisma migration for conversations and messages tables (npx prisma migrate dev --name add_conversations_and_messages)
- [x] T012 Generate Prisma client (npx prisma generate)

### MCP Tool Infrastructure (Express Backend)

- [x] T013 [P] Create MCP tool input schemas with Zod in backend/src/schemas/mcpTools.ts (AddTaskInput, ListTasksInput, UpdateTaskInput, DeleteTaskInput, CompleteTaskInput)
- [x] T014 [P] Create ToolResponse interface in backend/src/types/mcpTools.ts (success, data, error, warning fields)
- [x] T015 Create MCP tool service layer in backend/src/services/mcpTools.ts with authorization validation helper (verifyUserOwnership function)

### AI Agent Infrastructure (FastAPI Service)

- [x] T016 [P] Create FastAPI app entry point in ai-service/app/main.py with CORS and health check endpoint
- [x] T017 [P] Create Cohere API configuration in ai-service/app/agent/config.py (API key, model selection: Command R or R+)
- [x] T018 [P] Create Pydantic schemas for chat requests in ai-service/app/models/schemas.py (ChatRequest, ChatMessage, ChatResponse)
- [x] T019 Create MCP HTTP client service in ai-service/app/services/mcp_client.py (httpx.AsyncClient for calling Express /mcp/* endpoints)

### Backend Chat API Infrastructure

- [x] T020 [P] Create chat route handler skeleton in backend/src/routes/chat.ts (POST /api/chat/:userId, GET /api/conversations/:userId)
- [x] T021 [P] Create conversation service in backend/src/services/conversationService.ts (loadConversationContext function to load last 50 messages)
- [x] T022 Implement SSE streaming helper in backend/src/lib/sseStreaming.ts (setSSEHeaders, writeSSEEvent, endSSEStream functions)
- [x] T023 Create AI service HTTP client in backend/src/services/aiServiceClient.ts (proxy requests to FastAPI with fetch + SSE forwarding)

**Checkpoint**: Foundation ready - all infrastructure in place, user story implementation can begin in parallel

---

## Phase 3: User Story 6 - Conversation History Persistence (Priority: P1) 🎯 Foundational for Chat

**Goal**: Enable conversation persistence across sessions so chat history is saved and loaded from database

**Why First**: US6 is P1 and foundational - all other chat-based stories (US1-US5) depend on conversation persistence working. Without this, every chat interaction starts fresh with no context.

**Independent Test**: Create a conversation with 3 messages, close chat window, reopen, and verify all 3 messages display correctly. Log out, log back in, verify conversation still persists.

### Implementation for User Story 6

- [x] T024 [US6] Implement conversation creation logic in backend/src/services/conversationService.ts (createConversation function with title auto-generation from first message)
- [x] T025 [US6] Implement message persistence logic in backend/src/services/conversationService.ts (saveMessage function for user and assistant messages)
- [x] T026 [US6] Implement conversation loading with pagination in backend/src/services/conversationService.ts (loadConversationContext loads last 50 messages ordered by createdAt ASC)
- [x] T027 [US6] Implement GET /api/conversations/:userId endpoint in backend/src/routes/chat.ts (returns user's conversations with message counts, ordered by lastMessageAt DESC)
- [x] T028 [US6] Add Better Auth session validation middleware to chat routes in backend/src/routes/chat.ts (verify user is authenticated)
- [x] T029 [US6] Create ChatbotIcon component in frontend/app/components/ChatbotIcon.tsx (floating button, bottom-right position, MessageCircle icon)
- [x] T030 [US6] Create ChatWindow component in frontend/app/components/ChatWindow.tsx (ChatKit ChatContainer with ConversationHeader, MessageList, MessageInput)
- [x] T031 [US6] Create MessageList component in frontend/app/components/MessageList.tsx (maps messages to ChatKit Message components with role-based styling)
- [x] T032 [US6] Implement conversation history loading in frontend/lib/chatApi.ts (fetchConversationHistory function calling GET /api/conversations/:userId)
- [x] T033 [US6] Implement conversation context loading in ChatWindow component (useEffect to load messages when conversation_id changes)
- [x] T034 [US6] Add ChatbotIcon to dashboard page in frontend/app/dashboard/page.tsx (conditionally render when user is logged in)
- [x] T035 [US6] Implement conversation list UI in ChatWindow (show past conversations in sidebar with titles and timestamps)
- [x] T036 [US6] Implement "New Conversation" button in ChatWindow (creates new conversation_id, clears message history)

**Checkpoint**: At this point, users can open chat window, see past conversations, start new conversations, and UI persists across sessions (no AI integration yet, but foundation is complete)

---

## Phase 4: User Story 1 - Create Task via Chat (Priority: P1) 🎯 MVP Core

**Goal**: Enable users to create tasks by typing natural language commands like "Add task: Buy groceries"

**Independent Test**: Type "Add task: Buy groceries" in chat, verify task appears in task list via traditional UI, verify chatbot confirms creation with task ID

### MCP Tool: add_task

- [x] T037 [P] [US1] Implement add_task MCP endpoint in backend/src/routes/mcp.ts (POST /mcp/add-task with Zod validation)
- [x] T038 [US1] Implement add_task service logic in backend/src/services/mcpTools.ts (Prisma task.create with user ownership validation)
- [x] T039 [US1] Add error handling for add_task (duplicate title detection, validation errors, database errors return ToolResponse with error field)

### AI Agent: add_task Tool Integration

- [x] T040 [P] [US1] Define add_task MCP tool in ai-service/app/agent/tools.py (@function_tool decorator with docstring, parameters: user_id, title, description, priority, due_date)
- [x] T041 [US1] Implement add_task tool logic in ai-service/app/agent/tools.py (calls mcp_client.post("/mcp/add-task") with httpx, returns ToolResponse)
- [x] T042 [US1] Create AI agent with OpenAI Agents SDK in ai-service/app/agent/runner.py (Agent with system prompt, Cohere model via AsyncOpenAI, tools=[add_task])
- [x] T043 [US1] Write system prompt for task creation in ai-service/app/agent/runner.py (instructions: "You help users manage tasks. When user says 'Add task: X', call add_task tool. Ask for clarification if title is missing.")

### Backend Chat API: Route to AI Agent

- [x] T044 [US1] Implement POST /api/chat/:userId request handling in backend/src/routes/chat.ts (parse message, load conversation context, proxy to FastAPI)
- [x] T045 [US1] Implement AI service proxy with SSE forwarding in backend/src/services/aiServiceClient.ts (fetch POST /ai/chat with streaming, forward SSE events to Express response)
- [x] T046 [US1] Implement conversation context passing in backend/src/routes/chat.ts (load last 50 messages, format as array of {role, content}, pass to AI service)
- [x] T047 [US1] Implement message persistence after AI response in backend/src/routes/chat.ts (save user message and assistant response to messages table, update conversation.lastMessageAt)

### AI Service: Chat Endpoint

- [x] T048 [US1] Implement POST /ai/chat endpoint in ai-service/app/routes/chat.py (FastAPI route accepting ChatRequest with user_id, message, context)
- [x] T049 [US1] Implement agent execution with Runner.run_stream in ai-service/app/agent/runner.py (construct message list: system + context + current message, RunConfig with max_turns=5, stream=True)
- [x] T050 [US1] Implement SSE token streaming in ai-service/app/routes/chat.py (async for chunk in Runner.run_stream, yield f"data: {json.dumps({'type': 'token', 'content': chunk})}\n\n")
- [x] T051 [US1] Add error handling with retry logic in ai-service/app/agent/runner.py (try 3 times with exponential backoff on CohereAPIError, return SSE error event on failure)

### Frontend: Chat Input and Streaming

- [x] T052 [US1] Implement sendMessage function in frontend/lib/chatApi.ts (POST /api/chat/:userId with message and conversation_id, returns ReadableStream)
- [x] T053 [US1] Implement SSE parsing in frontend/lib/chatApi.ts (read stream with TextDecoder, split by \n\n, parse "data: " lines as JSON)
- [x] T054 [US1] Implement streaming message display in ChatWindow component (show "..." typing indicator, append tokens to streaming message as they arrive)
- [x] T055 [US1] Implement message finalization in ChatWindow component (on "done" event, finalize message with message_id, add to conversation history)
- [x] T056 [US1] Implement error display in ChatWindow component (on "error" event, show error message with retry button)
- [x] T057 [US1] Add message input validation in ChatWindow component (max 5000 chars, disable send button during streaming, clear input after send)

**Checkpoint**: Users can type "Add task: Buy groceries" and chatbot creates task via MCP tool, responds with confirmation, and persists conversation

---

## Phase 5: User Story 2 - List Tasks via Chat (Priority: P1) 🎯 MVP Core

**Goal**: Enable users to view tasks by asking "What tasks do I have?" or "Show my todos"

**Independent Test**: Create 3 tasks via traditional UI, ask chatbot "What tasks do I have?", verify chatbot lists all 3 tasks with titles

### MCP Tool: list_tasks

- [x] T058 [P] [US2] Implement list_tasks MCP endpoint in backend/src/routes/mcp.ts (POST /mcp/list-tasks with optional filters: status, priority, limit)
- [x] T059 [US2] Implement list_tasks service logic in backend/src/services/mcpTools.ts (Prisma task.findMany with user ownership filter, support status/priority filters, default limit=50)
- [x] T060 [US2] Add error handling for list_tasks (empty result handling, database errors return ToolResponse)

### AI Agent: list_tasks Tool Integration

- [x] T061 [P] [US2] Define list_tasks MCP tool in ai-service/app/agent/tools.py (@function_tool decorator with parameters: user_id, status, priority, limit)
- [x] T062 [US2] Implement list_tasks tool logic in ai-service/app/agent/tools.py (calls mcp_client.post("/mcp/list-tasks"), returns ToolResponse with tasks array)
- [x] T063 [US2] Update AI agent system prompt in ai-service/app/agent/runner.py (add instructions: "When user asks 'What tasks do I have?', call list_tasks. Format results as numbered list.")
- [x] T064 [US2] Update AI agent tools list in ai-service/app/agent/runner.py (add list_tasks to agent tools=[add_task, list_tasks])

### Frontend: Task List Formatting

- [x] T065 [US2] Implement task list formatting in ChatWindow component (render chatbot responses with numbered lists for task arrays)
- [x] T066 [US2] Add support for empty task list message (detect "no tasks" response, render friendly message: "You don't have any tasks yet")

**Checkpoint**: Users can ask "What tasks do I have?" and chatbot calls list_tasks tool, formats results as numbered list, displays in chat

---

## Phase 6: User Story 3 - Mark Task Complete via Chat (Priority: P2)

**Goal**: Enable users to mark tasks complete by saying "Mark 'Buy groceries' as done"

**Independent Test**: Create task via chat, ask "Mark Buy groceries as done", verify task status changes to completed in traditional UI

### MCP Tool: complete_task

- [x] T067 [P] [US3] Implement complete_task MCP endpoint in backend/src/routes/mcp.ts (POST /mcp/complete-task with task_id parameter)
- [x] T068 [US3] Implement complete_task service logic in backend/src/services/mcpTools.ts (Prisma task.update set status='completed', verify user ownership, check task exists)
- [x] T069 [US3] Add error handling for complete_task (task not found, already completed warning, unauthorized access)

### AI Agent: complete_task Tool Integration

- [x] T070 [P] [US3] Define complete_task MCP tool in ai-service/app/agent/tools.py (@function_tool decorator with parameters: user_id, task_id)
- [x] T071 [US3] Implement complete_task tool logic in ai-service/app/agent/tools.py (calls mcp_client.post("/mcp/complete-task"), handles task identification from user message)
- [x] T072 [US3] Update AI agent system prompt in ai-service/app/agent/runner.py (add instructions: "When user says 'Mark X as done', first list_tasks to find task_id by title match, then call complete_task. Confirm completion to user.")
- [x] T073 [US3] Update AI agent tools list in ai-service/app/agent/runner.py (add complete_task to tools=[add_task, list_tasks, complete_task])

### AI Agent: Task Identification Logic

- [x] T074 [US3] Implement fuzzy task matching in ai-service/app/agent/runner.py (when user says "Mark Buy groceries as done", match against task titles from list_tasks result)
- [x] T075 [US3] Implement ambiguity handling in AI agent system prompt (if multiple tasks match, ask user to clarify which task)

**Checkpoint**: Users can say "Mark Buy groceries as done" and chatbot identifies task by title, calls complete_task, confirms completion

---

## Phase 7: User Story 4 - Update Task via Chat (Priority: P2)

**Goal**: Enable users to modify task details by saying "Change priority of 'Buy groceries' to high"

**Independent Test**: Create task, say "Change priority to high for Buy groceries", verify priority updates in traditional UI

### MCP Tool: update_task

- [x] T076 [P] [US4] Implement update_task MCP endpoint in backend/src/routes/mcp.ts (POST /mcp/update-task with task_id, optional fields: title, description, priority, status, due_date)
- [x] T077 [US4] Implement update_task service logic in backend/src/services/mcpTools.ts (Prisma task.update with partial fields, verify user ownership, validate enum values)
- [x] T078 [US4] Add error handling for update_task (task not found, validation errors for priority/status enums, unauthorized access)

### AI Agent: update_task Tool Integration

- [x] T079 [P] [US4] Define update_task MCP tool in ai-service/app/agent/tools.py (@function_tool decorator with parameters: user_id, task_id, title, description, priority, status, due_date - all optional except user_id and task_id)
- [x] T080 [US4] Implement update_task tool logic in ai-service/app/agent/tools.py (calls mcp_client.post("/mcp/update-task") with only changed fields)
- [x] T081 [US4] Update AI agent system prompt in ai-service/app/agent/runner.py (add instructions: "When user says 'Change X of task Y to Z', identify task_id via list_tasks, call update_task with changed field, confirm update.")
- [x] T082 [US4] Update AI agent tools list in ai-service/app/agent/runner.py (add update_task to tools=[add_task, list_tasks, complete_task, update_task])

### AI Agent: Field Extraction Logic

- [x] T083 [US4] Implement field extraction in AI agent (parse "Change priority to high" → extract field='priority', value='high')
- [x] T084 [US4] Add validation for update commands (if user says "Change title to [blank]", ask for non-empty title)

**Checkpoint**: Users can say "Change priority to high" and chatbot updates task field, confirms change

---

## Phase 8: User Story 5 - Delete Task via Chat (Priority: P3)

**Goal**: Enable users to delete tasks by saying "Delete my grocery task"

**Independent Test**: Create task, say "Delete Buy groceries task", verify chatbot asks for confirmation, confirm, verify task deleted from traditional UI

### MCP Tool: delete_task

- [x] T085 [P] [US5] Implement delete_task MCP endpoint in backend/src/routes/mcp.ts (POST /mcp/delete-task with task_id parameter)
- [x] T086 [US5] Implement delete_task service logic in backend/src/services/mcpTools.ts (Prisma task.delete, verify user ownership, check task exists before deletion)
- [x] T087 [US5] Add error handling for delete_task (task not found, unauthorized access, database constraint errors)

### AI Agent: delete_task Tool Integration

- [x] T088 [P] [US5] Define delete_task MCP tool in ai-service/app/agent/tools.py (@function_tool decorator with parameters: user_id, task_id)
- [x] T089 [US5] Implement delete_task tool logic in ai-service/app/agent/tools.py (calls mcp_client.post("/mcp/delete-task"))
- [x] T090 [US5] Update AI agent system prompt in ai-service/app/agent/runner.py (add instructions: "When user says 'Delete task X', first confirm with user before calling delete_task. Say 'Are you sure you want to delete X?' and wait for confirmation.")
- [x] T091 [US5] Update AI agent tools list in ai-service/app/agent/runner.py (add delete_task to tools=[add_task, list_tasks, complete_task, update_task, delete_task])

### AI Agent: Confirmation Flow

- [x] T092 [US5] Implement confirmation state handling in AI agent (detect user confirmation: "yes", "confirm", "delete it", vs. cancellation: "no", "cancel", "nevermind")
- [x] T093 [US5] Add multi-turn conversation support for delete confirmation (agent remembers it asked for confirmation in previous message via conversation context)

**Checkpoint**: Users can say "Delete task" and chatbot asks for confirmation, waits for user response, deletes only after confirmation

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements affecting multiple user stories, production readiness

### Performance & Optimization

- [x] T094 [P] Implement rate limiting middleware in backend/src/middleware/rateLimit.ts (30 requests per minute per user using express-rate-limit)
- [x] T095 [P] Add database query optimization (verify indexes are being used with EXPLAIN queries, add missing indexes if needed)
- [x] T096 [P] Implement conversation context truncation in backend/src/services/conversationService.ts (if message count >50, load last 50 only with LIMIT clause)

### Error Handling & Logging

- [x] T097 [P] Add comprehensive error logging in backend/src/routes/chat.ts (log user_id, message, error details with timestamps)
- [x] T098 [P] Implement graceful AI service downtime handling in backend/src/services/aiServiceClient.ts (detect connection refused, return user-friendly error message)
- [x] T099 [P] Add frontend error boundary in ChatWindow component (catch React errors, display fallback UI with reload button)

### Security Hardening

- [x] T100 [P] Verify all MCP tools check user_id matches session user in backend/src/services/mcpTools.ts (add unit tests for authorization checks)
- [x] T101 [P] Add Content-Type validation in backend/src/routes/mcp.ts (reject non-JSON requests with 415 Unsupported Media Type)
- [x] T102 [P] Implement API key rotation documentation in .env.example (add comments about quarterly Cohere API key rotation)

### Documentation

- [x] T103 [P] Create quickstart guide in specs/1-ai-chatbot/quickstart.md (setup instructions for local development: environment variables, database setup, service startup)
- [x] T104 [P] Document MCP tool contracts in specs/1-ai-chatbot/contracts/mcp-tools.md (input schemas, output format, error cases for all 5 tools)
- [ ] T105 [P] Create deployment guide in specs/1-ai-chatbot/deployment.md (Docker Compose for Option B, Hugging Face Space + Vercel deployment steps)

### Testing & Validation

- [ ] T106 [P] Create end-to-end test script (manual test checklist: create task via chat, list tasks, complete task, update task, delete task, verify persistence)
- [ ] T107 [P] Validate constitution compliance (verify all 9 principles: stateless design, MCP tools only, layer separation, etc.)
- [ ] T108 [P] Performance validation (measure p95 latency for POST /api/chat/:userId, target <2s for first token)

### Docker & Deployment

- [ ] T109 Create Dockerfile for backend in backend/Dockerfile (Node.js 18, copy src/, install dependencies, expose port 8000)
- [ ] T110 Create Dockerfile for ai-service in ai-service/Dockerfile (Python 3.11, copy app/, install requirements.txt, expose port 8001)
- [ ] T111 Create docker-compose.yml at repository root (services: backend, ai-service, postgres; network: shared; environment variables from .env)
- [ ] T112 Test docker-compose up locally (verify all services start, backend can reach ai-service, ai-service can reach backend MCP endpoints)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - **BLOCKS all user stories**
- **User Story 6 (Phase 3)**: Depends on Foundational - **Foundational for all chat interactions**
- **User Stories 1, 2 (Phase 4-5)**: Depend on Foundational + US6 - **MVP Core (P1 stories)**
- **User Stories 3, 4 (Phase 6-7)**: Depend on Foundational + US6 - **P2 stories, can run in parallel**
- **User Story 5 (Phase 8)**: Depends on Foundational + US6 - **P3 story (lowest priority)**
- **Polish (Phase 9)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US6 (Conversation Persistence)**: No dependencies on other stories - **FOUNDATIONAL** (all chat features need this)
- **US1 (Create Task)**: Depends on US6 only - Can start after US6 complete
- **US2 (List Tasks)**: Depends on US6 only - Can start after US6 complete (parallel with US1)
- **US3 (Complete Task)**: Depends on US6 only - Can start after US6 complete (parallel with US1, US2)
- **US4 (Update Task)**: Depends on US6 only - Can start after US6 complete (parallel with US1, US2, US3)
- **US5 (Delete Task)**: Depends on US6 only - Can start after US6 complete (parallel with US1-US4)

### Within Each User Story

- MCP tool endpoint before AI agent tool integration
- AI agent tool definition can be parallel with MCP endpoint
- System prompt updates sequential (append to existing prompt)
- Frontend components can be parallel with backend work
- Testing happens after story implementation complete

### Parallel Opportunities

**Phase 1 (Setup)**: All tasks marked [P] can run in parallel (T003-T006)

**Phase 2 (Foundational)**:
- Database tasks T007-T010 sequential (schema changes), then T011-T012 sequential (migration)
- MCP tool schema tasks T013-T015 can run in parallel
- AI agent infrastructure tasks T016-T019 can run in parallel
- Backend chat infrastructure tasks T020-T023 can run in parallel with AI agent tasks

**Phase 3 (US6)**: T024-T028 backend tasks can be parallel with T029-T036 frontend tasks

**Phase 4 (US1)**: T037-T039 (MCP endpoint) parallel with T040-T043 (AI tool), then T044-T047 (backend integration) parallel with T048-T051 (AI service), then T052-T057 (frontend)

**Phase 5 (US2)**: T058-T060 parallel with T061-T064, then T065-T066

**Phase 6 (US3)**: T067-T069 parallel with T070-T073, then T074-T075

**Phase 7 (US4)**: T076-T078 parallel with T079-T082, then T083-T084

**Phase 8 (US5)**: T085-T087 parallel with T088-T091, then T092-T093

**Phase 9 (Polish)**: All tasks marked [P] can run in parallel (T094-T108)

**After Foundational + US6 complete**: US1, US2, US3, US4, US5 can all run in parallel (different team members can work on different MCP tools simultaneously)

---

## Parallel Example: User Story 1

```bash
# Parallel work within US1:
Task T037: "Implement add_task MCP endpoint in backend/src/routes/mcp.ts"
  (Backend Developer A)
Task T040: "Define add_task MCP tool in ai-service/app/agent/tools.py"
  (AI Engineer B)

# Then parallel work:
Task T044: "Implement POST /api/chat/:userId in backend/src/routes/chat.ts"
  (Backend Developer A)
Task T048: "Implement POST /ai/chat in ai-service/app/routes/chat.py"
  (AI Engineer B)

# Then parallel work:
Task T052: "Implement sendMessage in frontend/lib/chatApi.ts"
  (Frontend Developer C)
```

---

## Implementation Strategy

### MVP First (User Stories 6, 1, 2 Only)

1. Complete **Phase 1: Setup** (T001-T006) - ~1 day
2. Complete **Phase 2: Foundational** (T007-T023) - **CRITICAL** - ~3-5 days
3. Complete **Phase 3: US6** (T024-T036) - Conversation persistence - ~2-3 days
4. Complete **Phase 4: US1** (T037-T057) - Create task via chat - ~3-4 days
5. Complete **Phase 5: US2** (T058-T066) - List tasks via chat - ~1-2 days
6. **STOP and VALIDATE**: Test US6+US1+US2 independently - ~1 day
7. Deploy/demo **MVP** (conversation persistence + create + list tasks)

**MVP Scope**: US6 (persistence) + US1 (create) + US2 (list) = Core chat functionality
**MVP Duration**: ~11-16 days (2-3 weeks)

### Incremental Delivery (Add P2 Stories)

1. Complete Setup + Foundational + US6 → Foundation ready
2. Add US1 (Create) → Test independently → Deploy/Demo (MVP!)
3. Add US2 (List) → Test independently → Deploy/Demo
4. Add US3 (Complete) → Test independently → Deploy/Demo
5. Add US4 (Update) → Test independently → Deploy/Demo
6. Each story adds value without breaking previous stories

**Full P1+P2 Scope**: US6 + US1 + US2 + US3 + US4
**Full P1+P2 Duration**: ~18-24 days (3-4 weeks)

### Parallel Team Strategy

With 3 developers after Foundational phase completes:

1. Team completes **Setup + Foundational + US6** together (~6-9 days)
2. Once US6 is done, split work:
   - **Developer A**: US1 (Create task) + US3 (Complete task)
   - **Developer B**: US2 (List tasks) + US4 (Update task)
   - **Developer C**: US5 (Delete task) + Polish tasks
3. Stories complete and integrate independently (~7-10 days parallel work)

**Parallel Team Duration**: ~13-19 days (2-3 weeks) for all 5 user stories

---

## Notes

- **[P] marker**: Different files, no dependencies - safe to parallelize
- **[Story] label**: Maps task to specific user story for traceability
- **Architecture**: Option B (Separate FastAPI AI Service) per plan recommendation
- **Tests**: Omitted per spec (not explicitly requested) and constitution (simplicity)
- **Stateless design**: All conversation state in PostgreSQL (FR-035, FR-036, FR-037)
- **MCP tools**: ONLY interface between AI and database (Constitution Principle VII)
- **Tool authorization**: ALWAYS verify user_id matches session (FR-028, Constitution Principle IX)
- **SSE streaming**: Real-time token streaming for better UX (FR-009, FR-018)
- **Context window**: Last 50 messages per conversation (FR-031, Constitution Principle VIII)
- **Commit strategy**: Commit after each task or logical group
- **Validation**: Stop at checkpoints to test stories independently
- **Avoid**: Cross-story dependencies that break independence, same-file conflicts in parallel work

---

## Success Criteria

**MVP Success** (US6 + US1 + US2):
- ✅ User can open chat window and see past conversations
- ✅ User can type "Add task: Buy groceries" and task is created
- ✅ User can ask "What tasks do I have?" and see task list
- ✅ Conversation persists across sessions (log out/in, refresh page)
- ✅ AI responses stream in real-time (tokens appear progressively)
- ✅ All operations use MCP tools (no direct DB access from AI)
- ✅ Backend is stateless (any server can handle any request)

**Full Success** (All P1+P2 Stories):
- ✅ All MVP success criteria
- ✅ User can mark tasks complete via chat
- ✅ User can update task details via chat
- ✅ Error handling is graceful (Cohere API down, AI misinterpretation)
- ✅ Rate limiting prevents abuse (30 req/min per user)
- ✅ Authorization enforced (users only access own tasks)

**Optional P3** (US5):
- ✅ User can delete tasks with confirmation flow
- ✅ AI handles multi-turn confirmation (remembers context)
