---
id: 004
title: Generate Actionable Tasks from Spec and Plan
stage: tasks
date: 2026-02-05
surface: agent
model: claude-sonnet-4.5
feature: 1-ai-chatbot
branch: 1-ai-chatbot
user: developer
command: /sp.tasks
labels: ["phase-3", "ai-chatbot", "task-generation", "user-stories", "mcp-tools", "option-b-architecture", "mvp-strategy"]
links:
  spec: specs/1-ai-chatbot/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/1-ai-chatbot/tasks.md
  - history/prompts/1-ai-chatbot/004-generate-actionable-tasks-from-spec-and-plan.tasks.prompt.md
tests:
  - null
---

## Prompt

/sp.tasks

(No additional user input provided - executed skill command directly)

## Response snapshot

Generated comprehensive tasks.md (112 tasks total) organized by 6 user stories from specification:

**Task Organization Strategy:**
- Phase 1: Setup (6 tasks) - Project initialization, dependencies, environment setup
- Phase 2: Foundational (17 tasks) - Database schema, MCP tools infrastructure, AI agent infrastructure, Backend chat API infrastructure
- Phase 3: US6 - Conversation History Persistence (13 tasks, P1) - **Foundational for all chat interactions**
- Phase 4: US1 - Create Task via Chat (21 tasks, P1) - **MVP Core**
- Phase 5: US2 - List Tasks via Chat (9 tasks, P1) - **MVP Core**
- Phase 6: US3 - Mark Task Complete (9 tasks, P2)
- Phase 7: US4 - Update Task via Chat (9 tasks, P2)
- Phase 8: US5 - Delete Task via Chat (9 tasks, P3)
- Phase 9: Polish & Cross-Cutting Concerns (19 tasks) - Performance, security, documentation, deployment

**Architecture Decision Applied:**
- Based tasks on **Option B: Separate FastAPI AI Service** from plan agent's recommendation
- File paths use actual project structure: backend/src/, ai-service/app/, frontend/app/
- MCP tools as HTTP endpoints in Express (POST /mcp/add-task, etc.)
- AI service calls Express MCP endpoints via httpx

**User Story Mapping:**
- **US6 (Conversation Persistence, P1)**: Placed FIRST despite being User Story 6 - it's foundational for all chat interactions (US1-US5 depend on conversation context working)
- **US1 (Create Task, P1)**: 21 tasks covering MCP tool (add_task), AI agent integration, backend chat API routing, AI service endpoint, frontend SSE streaming
- **US2 (List Tasks, P1)**: 9 tasks for read-only query feature (list_tasks MCP tool + AI integration)
- **US3 (Complete Task, P2)**: 9 tasks including task identification logic and confirmation
- **US4 (Update Task, P2)**: 9 tasks including field extraction logic for partial updates
- **US5 (Delete Task, P3)**: 9 tasks with multi-turn confirmation flow (lowest priority)

**Key Implementation Details:**

1. **Foundational Phase (T007-T023)** - BLOCKS all user stories:
   - Database schema: Conversation and Message models with indexes (T007-T012)
   - MCP tool infrastructure: Zod schemas, ToolResponse interface, authorization helper (T013-T015)
   - AI agent infrastructure: FastAPI app, Cohere config, Pydantic schemas, MCP HTTP client (T016-T019)
   - Backend chat API: Route handlers, conversation service, SSE streaming helper, AI service client (T020-T023)

2. **US6 - Conversation Persistence (T024-T036)**:
   - Backend: createConversation, saveMessage, loadConversationContext (last 50 messages), GET /api/conversations/:userId (T024-T028)
   - Frontend: ChatbotIcon (floating button), ChatWindow (ChatKit UI), MessageList, conversation history loading, "New Conversation" button (T029-T036)

3. **US1 - Create Task (T037-T057)** - MVP Core:
   - MCP tool: POST /mcp/add-task endpoint with Zod validation, Prisma task.create, error handling (T037-T039)
   - AI agent: @function_tool add_task, system prompt for task creation, OpenAI Agents SDK setup with Cohere (T040-T043)
   - Backend: POST /api/chat/:userId with SSE forwarding, conversation context passing, message persistence (T044-T047)
   - AI service: POST /ai/chat endpoint, Runner.run_stream with SSE tokens, retry logic (T048-T051)
   - Frontend: sendMessage with SSE parsing, streaming display, error handling, input validation (T052-T057)

4. **US2 - List Tasks (T058-T066)** - MVP Core:
   - MCP tool: POST /mcp/list-tasks with filters (status, priority, limit=50) (T058-T060)
   - AI agent: list_tasks tool, system prompt update for formatting numbered lists (T061-T064)
   - Frontend: Task list formatting, empty state handling (T065-T066)

5. **US3 - Complete Task (T067-T075)** - P2:
   - MCP tool: POST /mcp/complete-task with status update (T067-T069)
   - AI agent: complete_task tool, fuzzy task matching logic, ambiguity handling (T070-T075)

6. **US4 - Update Task (T076-T084)** - P2:
   - MCP tool: POST /mcp/update-task with partial field updates (T076-T078)
   - AI agent: update_task tool, field extraction logic ("Change priority to high" → field='priority', value='high') (T079-T084)

7. **US5 - Delete Task (T085-T093)** - P3:
   - MCP tool: POST /mcp/delete-task with Prisma task.delete (T085-T087)
   - AI agent: delete_task tool with confirmation flow, multi-turn conversation support (T088-T093)

8. **Polish Phase (T094-T112)**:
   - Performance: Rate limiting (30 req/min), query optimization, context truncation (T094-T096)
   - Error handling: Logging, graceful AI downtime, React error boundary (T097-T099)
   - Security: Authorization validation, Content-Type checks, API key rotation docs (T100-T102)
   - Documentation: quickstart.md, MCP contracts, deployment guide (T103-T105)
   - Testing: E2E test script, constitution compliance, p95 latency validation (T106-T108)
   - Docker: backend Dockerfile, ai-service Dockerfile, docker-compose.yml (T109-T112)

**Parallel Execution Opportunities:**
- Phase 1 (Setup): 4 parallel tasks (T003-T006)
- Phase 2 (Foundational): MCP tools (T013-T015), AI agent (T016-T019), Backend chat (T020-T023) can run in parallel blocks
- US6: Backend tasks (T024-T028) parallel with Frontend tasks (T029-T036)
- US1: MCP endpoint (T037-T039) parallel with AI tool (T040-T043)
- After Foundational + US6 complete: **All remaining user stories (US1-US5) can run in parallel** with different team members
- Phase 9 (Polish): 15 parallel tasks (T094-T108)

**MVP Strategy:**
- **MVP Scope**: US6 (persistence) + US1 (create) + US2 (list) = 43 tasks
- **MVP Duration**: 11-16 days (2-3 weeks)
- **MVP Value**: Core chat functionality - users can create tasks via chat, see task lists, and conversations persist
- **Validation**: Stop after US2 complete, test independently, deploy/demo before adding P2 stories

**Incremental Delivery Path:**
1. Foundation (Setup + Foundational + US6) → ~6-9 days → Chat UI with persistence works
2. Add US1 (Create) → ~3-4 days → Users can create tasks via chat (MVP!)
3. Add US2 (List) → ~1-2 days → Users can query tasks (Complete MVP)
4. Add US3 (Complete) → ~2-3 days → Users can mark tasks done
5. Add US4 (Update) → ~2-3 days → Users can modify tasks
6. Add US5 (Delete) → ~2-3 days → Users can delete with confirmation
7. Polish → ~3-5 days → Production-ready

**Total Duration Estimates:**
- MVP (P1 stories): 11-16 days (2-3 weeks)
- P1 + P2 stories: 18-24 days (3-4 weeks)
- P1 + P2 + P3 + Polish: 22-33 days (4-7 weeks) - matches plan estimate

**Dependencies Documented:**
- Phase 2 (Foundational) BLOCKS all user stories
- US6 is FOUNDATIONAL for US1-US5 (all chat features need conversation persistence)
- US1-US5 are independent after US6 complete (no cross-story dependencies)
- MCP endpoint implementation before AI agent tool integration
- System prompt updates sequential (append to existing)

**Checklist Format Validation:**
- ✅ All 112 tasks use checkbox format: `- [ ] [ID] [P?] [Story?] Description`
- ✅ Task IDs sequential: T001-T112
- ✅ [P] marker applied to 41 parallelizable tasks
- ✅ [Story] labels applied correctly: [US1] through [US6]
- ✅ Setup/Foundational/Polish phases have NO story labels
- ✅ All tasks include exact file paths (backend/src/routes/chat.ts, ai-service/app/agent/tools.py, etc.)

## Outcome

- ✅ Impact: Comprehensive tasks.md ready for implementation - 112 actionable tasks organized by user story, MVP strategy defined (43 tasks for P1 stories), parallel execution opportunities identified (41 [P] tasks)
- 🧪 Tests: No test tasks generated (not explicitly requested in spec per constitution Principle VI - Simplicity)
- 📁 Files: specs/1-ai-chatbot/tasks.md (5,600+ lines with all task details, dependencies, execution strategy)
- 🔁 Next prompts:
  - /sp.implement to execute tasks sequentially or in parallel
  - Start with MVP scope: Phase 1 (Setup) → Phase 2 (Foundational) → Phase 3 (US6) → Phase 4 (US1) → Phase 5 (US2)
  - After MVP validation, continue with P2 stories (US3, US4) or deploy
- 🧠 Reflection: Tasks successfully organized by user story to enable independent implementation and testing. US6 (Conversation Persistence) strategically placed first despite being "User Story 6" because it's foundational for all chat interactions. MVP scope clearly defined (43 tasks) with validation checkpoint before adding P2/P3 features. All tasks follow strict checklist format with exact file paths based on Option B architecture.

## Evaluation notes (flywheel)

- Failure modes observed: None - tasks.md generated successfully
- Graders run and results (PASS/FAIL):
  - ✅ PASS: All 112 tasks follow checklist format (checkbox + ID + optional [P] + optional [Story] + description + file path)
  - ✅ PASS: User stories organized by priority (US6 first as foundational, then US1-US2 P1, US3-US4 P2, US5 P3)
  - ✅ PASS: Phase structure correct (Setup → Foundational → User Stories → Polish)
  - ✅ PASS: Foundational phase clearly marked as blocking all user stories
  - ✅ PASS: User story dependencies documented (all depend on US6 completion, otherwise independent)
  - ✅ PASS: Parallel opportunities identified (41 [P] tasks across all phases)
  - ✅ PASS: MVP scope defined (43 tasks: Setup + Foundational + US6 + US1 + US2)
  - ✅ PASS: File paths use actual project structure from Option B architecture
  - ✅ PASS: Independent test criteria provided for each user story
  - ✅ PASS: Checkpoints after each user story for validation
  - ✅ PASS: Implementation strategy section with MVP-first, incremental delivery, parallel team approaches
  - ✅ PASS: Duration estimates match plan (11-16 days MVP, 22-33 days full scope)
  - ✅ PASS: Success criteria section defines MVP and full success
  - ✅ PASS: Notes section clarifies constitution compliance (stateless, MCP tools only, authorization checks)
- Prompt variant (if applicable): N/A (task generation from spec + plan)
- Next experiment (smallest change to try):
  - Execute MVP scope (43 tasks) before generating full task set to validate approach
  - Consider splitting US1 into smaller tasks if 21 tasks feels too granular
  - Add test tasks if user requests TDD approach (currently omitted per spec)
  - Monitor task completion velocity to refine duration estimates for future features
