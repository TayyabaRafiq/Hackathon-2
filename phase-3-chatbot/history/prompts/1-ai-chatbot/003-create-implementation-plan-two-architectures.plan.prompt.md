---
id: 003
title: Create Implementation Plan with Two Architecture Options
stage: plan
date: 2026-02-05
surface: agent
model: claude-sonnet-4.5
feature: 1-ai-chatbot
branch: 1-ai-chatbot
user: developer
command: /sp.plan
labels: ["phase-3", "ai-chatbot", "architecture", "planning", "cohere-api", "fastapi", "mcp-tools", "option-a-integrated", "option-b-separate"]
links:
  spec: specs/1-ai-chatbot/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/1-ai-chatbot/plan.md
  - history/prompts/1-ai-chatbot/003-create-implementation-plan-two-architectures.plan.prompt.md
tests:
  - null
---

## Prompt

/sp.plan

Create the technical implementation plan for Phase-3 of TodoFlow: AI Chatbot Integration.

IMPORTANT: Design TWO architecture approaches:
🔹 Option A — Integrated AI (inside existing Express backend)
🔹 Option B — Separate FastAPI AI Service + existing Express backend

Both must follow MCP + Agents SDK + Cohere integration from the spec.

The plan must include:
1️⃣ System Architecture
   - Explain Option A and Option B architectures
   - Component roles (Express, AI agent, MCP tools, database)
   - Data flow diagrams for both options

2️⃣ Chat Request Lifecycle Flow for both options
   - Step-by-step flow from user message to AI response
   - Show where MCP tools get called
   - Show SSE streaming mechanism

3️⃣ API Contracts
   - POST /api/chat/:userId (request/response format)
   - GET /api/conversations/:userId
   - MCP tool contracts (5 tools: add_task, list_tasks, update_task, delete_task, complete_task)

4️⃣ Data Model
   - Prisma schema extensions (conversations and messages tables)
   - Relationships with existing users and tasks tables
   - Indexes for performance

5️⃣ Project Structure
   - File organization for Option A (Python agent in backend/)
   - File organization for Option B (separate ai-service/ directory)
   - Frontend components (ChatKit UI integration)

6️⃣ Pros and Cons Analysis
   - Trade-offs for each option
   - Deployment complexity comparison
   - Recommendation with justification

7️⃣ Research Questions (Phase 0)
   - Cohere model selection (Command R vs R+)
   - SSE vs WebSocket for streaming
   - Context window management (50 messages limit)

8️⃣ Implementation Phases with time estimates

## Response snapshot

Created comprehensive implementation plan (specs/1-ai-chatbot/plan.md) via Plan agent with detailed comparison of TWO architecture approaches:

**Option A: Integrated AI (Python in Express Backend)**
- Architecture: Python agent code embedded in Node.js Express backend using child_process.spawn()
- File structure: backend/agent/ directory with chat_handler.py, agent.py, tools.py
- MCP tools: TypeScript implementations (backend/src/tools/taskTools.ts)
- Integration: Node.js spawns Python process per chat request, communicates via stdin/stdout
- Data flow: User → Express → spawn Python → Python calls TypeScript MCP tools → Prisma → PostgreSQL
- Dockerfile: Multi-stage (Node.js + Python 3.11)
- Pros: Single Docker container, shared codebase, direct Prisma access, simpler deployment, lower latency (no network)
- Cons: Language mixing complexity, subprocess overhead (~100-200ms), complex debugging, resource contention, cannot scale independently

**Option B: Separate FastAPI AI Service** (RECOMMENDED)
- Architecture: Standalone Python FastAPI microservice, Express acts as API gateway/proxy
- File structure: ai-service/ directory (FastAPI + Agents SDK), backend/ (Express + MCP endpoints)
- MCP tools: HTTP endpoints in Express (POST /mcp/add-task, etc.)
- Integration: Express proxies to FastAPI, FastAPI calls Express MCP tools via HTTP
- Data flow: User → Express proxy → FastAPI AI service → HTTP call to Express /mcp/* → Prisma → PostgreSQL
- Dockerfile: Two containers (Node.js Express + Python FastAPI), docker-compose orchestration
- Pros: Clean separation (Principle II), independent scaling, pure Python environment, fault isolation, easier debugging, technology-specific optimization
- Cons: Network latency (~10-50ms per tool call), two deployments, API contract maintenance, local dev overhead

**Recommendation Decision**: Option B (Separate FastAPI AI Service)
- Justification: Aligns with Constitution Principle II (Layered Architecture), supports independent scaling, enables pure Python dev experience, provides fault isolation (Phase-2 CRUD continues if AI down), and allows technology-specific optimization
- Trade-off acceptance: Network latency (~10-50ms) is 2-5% of total 2000ms p95 latency budget (acceptable overhead)
- Fallback: Reconsider Option A if Hugging Face Space strictly requires single container

**Technical Details Included:**
- Architecture diagrams with ASCII art for both options
- Complete data flow with 14 steps (User → Frontend → Express → AI Agent → MCP Tools → Database)
- Prisma schema extensions (Conversation and Message models with indexes)
- API contracts (POST /api/chat/:userId with SSE streaming, MCP tool ToolResponse format)
- Frontend ChatKit UI integration (ChatbotIcon, ChatWindow, MessageList components)
- AI agent configuration (OpenAI Agents SDK + Cohere, @function_tool decorators, system prompt)
- Error handling hierarchy (tool-level, AI-level, API-level, frontend-level)
- Security patterns (authorization checks in MCP tools, Zod validation, Prisma parameterized queries)
- Performance optimizations (context window management, database indexing, rate limiting)
- Project structure for both options (detailed file trees)

**Research Questions Identified (Phase 0):**
1. Cohere model selection: Command R ($0.15/$0.60 per 1M tokens, 100ms p50) vs. Command R+ ($3.00/$15.00, 200ms p50)
2. Context window management: How many messages fit in 128K token limit (estimate: 50 messages with safety buffer)
3. SSE vs WebSocket: Recommend SSE (simpler, auto-reconnect, sufficient for unidirectional streaming)
4. OpenAI Agents SDK Cohere compatibility: Test function calling support before committing
5. Docker multi-stage build performance (Option A): Benchmark image size, startup time, resource usage

**Artifacts to Create in Phase 1:**
- specs/1-ai-chatbot/research.md (Phase 0 findings)
- specs/1-ai-chatbot/data-model.md (Prisma schema details)
- specs/1-ai-chatbot/quickstart.md (Local setup for both options)
- specs/1-ai-chatbot/contracts/ (chat-api.md, mcp-tools.md, conversation-api.md, ai-service-api.md)

**Implementation Phases Timeline:**
- Phase 0: Research & Prototyping (2-3 days) - Test models, benchmark SSE, validate SDK
- Phase 1: Foundation (5-7 days) - Prisma schema, MCP tools, Express routes, contracts
- Phase 2: AI Agent Integration (7-10 days) - OpenAI Agents SDK, Python tools, SSE streaming, error handling
- Phase 3: Frontend ChatKit UI (5-7 days) - Components, SSE client, conversation history, E2E tests
- Phase 4: Integration & Testing (5-7 days) - E2E tests, performance testing, security audit
- Phase 5: Deployment (3-5 days) - Dockerfiles, Hugging Face Space, Vercel, monitoring
- **Total: 22-33 days (4-7 weeks)**

**Constitution Check Results:**
- ✅ Principle I (Spec-Driven Development): PASS - Full spec with 50 FRs
- ✅ Principle II (Layered Architecture): PASS - AI layer separated via MCP tools
- ✅ Principle III (Extension Not Rewrite): PASS - Extends Phase-2 routes/tables
- ✅ Principle IV (API-First Design): PASS - MCP tool contracts defined
- ✅ Principle V (Test-First Development): PASS - AI behavior tests + contract tests required
- ✅ Principle VI (Simplicity): PASS - Minimal AI prompts, stateless design
- ✅ Principle VII (AI Agent Architecture): PASS - Stateless, MCP tools only, PostgreSQL as truth
- ✅ Principle VIII (Stateless Conversation Management): PASS - All state in DB, context loaded per request
- ✅ Principle IX (MCP Tool Contracts): PASS - Structured I/O, authorization, ORM queries
- **Violations: NONE**

**Critical Implementation Patterns Documented:**
1. Stateless context loading pattern (load 50 messages from DB per request)
2. Tool authorization pattern (ALWAYS verify user_id matches session)
3. SSE streaming pattern (text/event-stream with data: JSON lines)
4. AI agent error handling pattern (retry with exponential backoff, structured error responses)

**Risk Mitigations:**
- Risk 1 (Cohere rate limits): Request queuing, user rate limiting (30 req/min), usage monitoring
- Risk 2 (Subprocess overhead Option A): Benchmark, process pooling, fallback to Option B
- Risk 3 (Network latency Option B): Co-locate services, HTTP/2, monitor inter-service latency
- Risk 4 (Context overflow): Sliding window (50 msgs), token estimation, truncate oldest
- Risk 5 (AI misinterpretation): Improve prompts, feedback loop, log ambiguous commands

## Outcome

- ✅ Impact: Comprehensive implementation plan created with two fully-detailed architecture options, recommendation for Option B (Separate FastAPI), and clear path to implementation (5 phases, 22-33 days)
- 🧪 Tests: No tests (planning artifact, not code) - Test strategy documented in plan (contract tests, AI behavior tests, integration tests, E2E tests)
- 📁 Files: Plan agent created specs/1-ai-chatbot/plan.md (comprehensive plan), PHR recorded in history/prompts/1-ai-chatbot/003-*.plan.prompt.md
- 🔁 Next prompts:
  - Phase 0: Create specs/1-ai-chatbot/research.md (Cohere model testing, SDK validation, benchmarking)
  - Phase 1: Create specs/1-ai-chatbot/data-model.md, contracts/, quickstart.md
  - /sp.tasks to generate actionable, dependency-ordered tasks.md from plan
  - Create ADRs after implementation (5 decisions: Option B selection, SSE choice, stateless design, model selection, MCP tool design)
- 🧠 Reflection: Plan successfully presents TWO complete architecture options with detailed trade-off analysis, recommends Option B for alignment with constitution principles (layered architecture, independent scaling), and provides concrete implementation roadmap. All constitution checks passed. Ready for Phase 0 research and task generation.

## Evaluation notes (flywheel)

- Failure modes observed: None - Plan agent completed successfully with comprehensive output
- Graders run and results (PASS/FAIL):
  - ✅ PASS: Technical Context section complete (all fields filled with concrete values)
  - ✅ PASS: Constitution Check validated all 9 principles (zero violations)
  - ✅ PASS: TWO architecture options presented (Option A: Integrated, Option B: Separate FastAPI)
  - ✅ PASS: Architecture diagrams provided (ASCII art with component flow)
  - ✅ PASS: Data flow documented for both options (14-step lifecycle)
  - ✅ PASS: API contracts specified (chat API, MCP tools, ToolResponse format)
  - ✅ PASS: Data model defined (Prisma Conversation and Message models with indexes)
  - ✅ PASS: Project structure detailed (file trees for both Option A and Option B)
  - ✅ PASS: Pros/cons analysis comprehensive (deployment, scaling, debugging, cost)
  - ✅ PASS: Recommendation justified (Option B with rationale based on constitution principles)
  - ✅ PASS: Research questions identified (5 questions for Phase 0)
  - ✅ PASS: Implementation phases defined with timeline (5 phases, 22-33 days total)
  - ✅ PASS: Critical patterns documented (stateless context, authorization, SSE, error handling)
  - ✅ PASS: Risk mitigations provided (5 risks with specific strategies)
  - ✅ PASS: Security considerations included (authorization, Zod validation, Prisma ORM)
  - ✅ PASS: Performance optimizations documented (indexing, rate limiting, context window)
- Prompt variant (if applicable): N/A (initial planning, not A/B test)
- Next experiment (smallest change to try):
  - Phase 0: Prototype OpenAI Agents SDK with Cohere API (validate compatibility before full implementation)
  - Benchmark subprocess spawn overhead (Option A) vs. HTTP latency (Option B) with real metrics
  - Test Command R vs. Command R+ with ambiguous task commands ("do the thing", "finish it") to validate quality difference
  - Create minimal SSE streaming proof-of-concept (Express → Frontend) to validate approach
