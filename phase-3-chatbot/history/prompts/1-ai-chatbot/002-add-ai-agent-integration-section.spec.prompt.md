---
id: 002
title: Add AI Agent Integration Section
stage: spec
date: 2026-02-05
surface: agent
model: claude-sonnet-4.5
feature: 1-ai-chatbot
branch: 1-ai-chatbot
user: developer
command: /sp.clarify
labels: ["phase-3", "ai-chatbot", "cohere-api", "openai-agents-sdk", "mcp-tools", "specification-update"]
links:
  spec: specs/1-ai-chatbot/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/1-ai-chatbot/spec.md
tests:
  - null
---

## Prompt

/clarify

Please update my existing /sp.specify for Phase-3 TodoFlow AI Chatbot.

Requirements for update:
1. Add a new section titled: "AI Agent Integration (Cohere + OpenAI Agents SDK)"
2. Include the following points:
   - Use **Cohere API** for AI logic (replace any Gemini references)
   - OpenAI Agents SDK code structure for creating the agent
   - MCP tools integration: add_task, list_tasks, update_task, delete_task, complete_task
   - Backend flow: POST /api/chat/:userId → Agent → MCP tools → PostgreSQL → frontend
   - Frontend integration with ChatKit UI and chatbot icon
   - Sample code snippet showing agent, RunConfig, tools, and Runner.run usage
3. Keep all existing sections intact (API contracts, database rules, error handling, security, etc.)
4. Output the updated spec in structured Markdown, ready to save as /specs/1-ai-chatbot/spec.md

Sample code snippet to include in the new section:

from agents import Agent, AsyncOpenAI, OpenAIChatCompletionsModel, RunConfig, Runner, function_tool

## Response snapshot

Added comprehensive "AI Agent Integration (Cohere + OpenAI Agents SDK)" section to specification with:

**Architecture Flow Diagram**:
```
User → POST /api/chat/:userId → Express Handler → Load History from DB →
OpenAI Agents SDK Runner → Cohere API (Command R/R+) → MCP Tools →
Prisma ORM → PostgreSQL → Tool Results → AI Response → Stream to Frontend (SSE) → ChatKit UI
```

**Agent Configuration (Python)**:
- AsyncOpenAI client configured for Cohere API base URL
- OpenAIChatCompletionsModel with Command R+ or Command R
- Agent with comprehensive system prompt and 5 MCP tools
- Example instructions covering task operations and guidelines

**MCP Tool Definitions (5 tools)**:
1. `@function_tool` decorated `add_task` - Create new task
2. `@function_tool` decorated `list_tasks` - Retrieve tasks with filters
3. `@function_tool` decorated `update_task` - Modify task details
4. `@function_tool` decorated `complete_task` - Mark task complete
5. `@function_tool` decorated `delete_task` - Soft delete task

Each tool includes:
- Complete function signature with type hints
- Docstring with Args and Returns
- Input parameters (user_id, task-specific fields)
- Structured output format: {success, data, error}
- Backend MCP call integration

**Agent Execution (Runner)**:
- `handle_chat_request` async function
- Conversation history loading (last 50 messages)
- Message list construction (system + history + current)
- RunConfig with max_turns=5 and stream=True
- `Runner.run_stream` with async iteration
- Token, tool_call, and tool_result event handling
- Database persistence after response completion

**Backend Integration (TypeScript)**:
- POST /api/chat/:userId Express route
- Better Auth session validation
- Server-Sent Events (SSE) setup
- Streaming token-by-token to frontend
- Error handling with structured responses

**MCP Tool Backend Implementation (TypeScript)**:
- Zod validation schemas (AddTaskSchema example)
- Prisma ORM database operations
- Structured ToolResponse format
- Error handling with try-catch

**Frontend Integration (React/Next.js)**:
- ChatbotIcon component with floating button
- ChatWindow with ChatKit UI components
- Streaming message handler using fetch + ReadableStream
- Server-Sent Events parsing (data: lines)
- Real-time UI updates during streaming
- Error display for failed requests

**Key Implementation Notes**:
1. Cohere API model selection (Command R+ vs Command R)
2. Stateless design (load context from DB every request)
3. Tool security (user_id validation before operations)
4. Error handling (structured returns, no exceptions to AI)
5. Streaming protocol (SSE for real-time tokens)
6. Context window management (last 50 messages limit)

## Outcome

- ✅ Impact: Specification updated with detailed AI agent integration architecture and code examples
- 🧪 Tests: No tests (specification document update, not code)
- 📁 Files: Updated specs/1-ai-chatbot/spec.md (added new section after Requirements, before Success Criteria)
- 🔁 Next prompts:
  - /sp.plan to design detailed implementation architecture
  - Database schema finalization for conversations and messages tables
  - Backend MCP tool implementation planning (TypeScript + Zod + Prisma)
  - Frontend ChatKit UI integration planning
- 🧠 Reflection: Section successfully added with comprehensive code examples showing Cohere API integration via OpenAI Agents SDK. All existing sections preserved intact.

## Evaluation notes (flywheel)

- Failure modes observed: None - specification update successful
- Graders run and results (PASS/FAIL):
  - ✅ PASS: New section added in correct location (after Requirements, before Success Criteria)
  - ✅ PASS: All requested points covered (Cohere API, OpenAI SDK, MCP tools, backend flow, frontend)
  - ✅ PASS: Sample code included (Agent, RunConfig, Runner.run, function_tool decorators)
  - ✅ PASS: Architecture flow diagram provided
  - ✅ PASS: All 5 MCP tools defined with complete signatures
  - ✅ PASS: Backend integration examples (TypeScript Express + Prisma)
  - ✅ PASS: Frontend integration examples (React + ChatKit UI + SSE)
  - ✅ PASS: All existing sections preserved (User Stories, Requirements, Assumptions, Dependencies, etc.)
  - ✅ PASS: Markdown formatting valid (headings, code blocks, lists)
- Prompt variant (if applicable): N/A (specification update)
- Next experiment (smallest change to try):
  - During planning, decide exact Cohere model (Command R+ for quality vs Command R for speed/cost)
  - Determine Python-TypeScript integration approach (subprocess vs HTTP vs embedded runtime)
  - Design SSE fallback for browsers that don't support streaming
  - Plan conversation context truncation strategy (sliding window implementation)
