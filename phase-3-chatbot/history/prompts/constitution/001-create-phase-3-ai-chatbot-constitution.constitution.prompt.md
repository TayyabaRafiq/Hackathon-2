---
id: 001
title: Create Phase-3 AI Chatbot Constitution
stage: constitution
date: 2026-02-05
surface: agent
model: claude-sonnet-4.5
feature: none
branch: main
user: developer
command: /sp.constitution
labels: ["phase-3", "ai-chatbot", "constitution", "mcp-tools", "cohere-api"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
  - null
---

## Prompt

I want to create the /sp.constitution for Phase-3 of my TodoFlow project.

Project Context:
- Phase-2 backend is Node.js + Express + TypeScript + Prisma + PostgreSQL (Neon)
- Phase-3 adds an AI-powered Todo Chatbot integrated into the existing backend
- Chatbot must manage user tasks: add, delete, update, mark complete, list tasks
- Chatbot should understand natural language commands
- User identity enforced via Better Auth (session-based)
- AI logic will use OpenAI Agents SDK, but executed through **Cohere API**
- Backend must remain stateless: all conversation and task state in PostgreSQL
- MCP tools will mediate all task operations (add_task, list_tasks, update_task, delete_task, complete_task)
- Frontend is Next.js 14 (App Router) + Tailwind CSS + OpenAI ChatKit UI
- Must maintain full Spec-Driven Development workflow (constitution → specify → tasks → plan → implementation)
- Deployment: Backend on Hugging Face Space (Docker), Frontend on Vercel

Goals of Constitution:
- Define all agents and their responsibilities
- Define all system boundaries and architecture principles
- Define AI chatbot capabilities and limitations
- Define stateless behavior and database rules
- Define tool contracts (MCP)
- Define integration rules with existing Phase-2 backend
- Define security, error handling, and production readiness principles
- Provide concise but complete foundation for /sp.specify, /sp.tasks, /sp.plan, /sp.implementation

Output Requirements:
- Structured, readable constitution with clear sections
- Include:
  1. Project Overview
  2. System Architecture
  3. Agents & Responsibilities
  4. Database & Conversation Rules
  5. MCP Tool Contracts
  6. AI Agent Behavior
  7. Stateless Principles
  8. Security & Error Handling Guidelines
  9. Integration & Deployment Notes
 10. Extension / Scalability Notes
- Must be concise but sufficiently detailed to serve as Phase-3 legal "constitution" for implementation
- Use bullet points, numbered lists, and headings for clarity
- Explicitly mention Cohere API usage

## Response snapshot

Created comprehensive Phase-3 AI Chatbot Constitution (v2.0.0) that extends Phase-2 foundation with:

**Major Additions:**
- 3 new core principles (VII-IX): AI Agent Architecture, Stateless Conversation Management, MCP Tool Contracts
- AI Chatbot Capabilities & Limitations section defining scope boundaries
- Technology stack updated with Cohere API, OpenAI Agents SDK, MCP tools
- MCP Tools Engineer agent added to governance
- Tool execution rules for database-safe operations
- AI-specific quality standards and testing requirements
- Security & error handling hierarchy for AI systems
- Deployment strategy for Hugging Face Space + Vercel

**Key Architectural Principles:**
- AI agent is stateless (all state in PostgreSQL conversations/messages tables)
- MCP tools are ONLY interface between AI and database (no direct access)
- All tools use Pydantic validation + Prisma ORM (SQL injection impossible)
- Tool responses always use ToolResponse format (success, data, error, warning)
- Horizontal scaling supported (any server handles any request)
- Cohere API via OpenAI Agents SDK for natural language understanding

**Integration Strategy:**
- Extends existing Phase-2 Express backend (backward compatible)
- Adds new routes: POST /api/chat/:userId, GET /api/conversations/:userId
- Better Auth session middleware applies to all routes
- Prisma migrations for conversations and messages tables
- Frontend uses ChatKit UI components for chat interface

## Outcome

- ✅ Impact: MAJOR version bump (1.0.0 → 2.0.0) - AI architecture fundamentally extends system
- 🧪 Tests: No tests (constitution is specification, not code)
- 📁 Files: Updated .specify/memory/constitution.md
- 🔁 Next prompts:
  - /sp.specify to create AI chatbot feature specification
  - Database schema design for conversations and messages tables
  - MCP tool contract specifications (add_task, list_tasks, etc.)
- 🧠 Reflection: Constitution successfully balances extension (Phase-3 builds on Phase-2) with new architectural requirements (stateless AI, MCP tools, Cohere integration)

## Evaluation notes (flywheel)

- Failure modes observed: None - constitution creation successful
- Graders run and results (PASS/FAIL):
  - ✅ PASS: All 9 core principles defined with rationale
  - ✅ PASS: Technology stack complete (Cohere API explicitly mentioned)
  - ✅ PASS: Agent governance extended with MCP Tools Engineer
  - ✅ PASS: Security principles cover authentication, authorization, SQL injection prevention
  - ✅ PASS: Stateless principles clearly defined (no server memory, DB as truth)
  - ✅ PASS: Success criteria specific and testable
  - ✅ PASS: Deployment strategy documented (Hugging Face + Vercel)
- Prompt variant (if applicable): N/A (initial constitution creation)
- Next experiment (smallest change to try):
  - Determine exact Cohere model (Command R vs Command R+) during spec phase
  - Define conversation history pagination limits (currently "last N messages")
  - Decide on MCP tool implementation language (Python vs TypeScript for Node.js backend)
