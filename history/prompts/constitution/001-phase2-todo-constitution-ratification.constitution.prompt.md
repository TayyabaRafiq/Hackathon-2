---
id: 001
title: Phase II Todo Constitution Ratification
stage: constitution
date: 2025-01-15
surface: agent
model: claude-opus-4-5-20251101
feature: none
branch: master
user: user
command: /sp.constitution
labels: ["constitution", "phase2", "todo-app", "full-stack"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
  - N/A
---

## Prompt

Project: Phase II – Full-Stack Todo Web Application
Theme: Spec-Driven Full-Stack Development

Purpose:
Design and implement a production-ready full-stack Todo application
by extending Phase I functionality into a web-based system using
strict Spec-Driven Development principles.

This constitution applies ONLY to Phase II and governs all specs,
agents, skills, and implementations for this phase.

--------------------------------------------------
CORE PRINCIPLES
--------------------------------------------------

1. Spec-Driven Development (Mandatory)
- No frontend, backend, or database code without approved specs
- Specs are the single source of truth
- Implementation must exactly match specifications

2. Layered Architecture Discipline
- Frontend, backend, and database must be clearly separated
- No business logic in the frontend
- No UI concerns in the backend

3. Extension, Not Rewrite
- Phase II must extend Phase I concepts
- Core Todo behaviors (add, update, delete, complete) remain consistent
- Web layer replaces CLI, not the logic model

4. API-First Design
- API contracts defined before implementation
- Frontend consumes backend only via documented APIs
- No direct database access from frontend

--------------------------------------------------
TECHNOLOGY STACK (FIXED)
--------------------------------------------------

Frontend:
- Next.js (App Router)
- TypeScript
- Server & Client Components as appropriate

Backend:
- FastAPI
- SQLModel
- RESTful API design

Database:
- Neon PostgreSQL
- Schema defined via SQLModel

--------------------------------------------------
FUNCTIONAL REQUIREMENTS
--------------------------------------------------

Core Features:
- Add Todo
- Update Todo
- Delete Todo
- View Todo List
- Mark Todo as Complete / Incomplete

Enhanced Features:
- Priority levels (low / medium / high)
- Tags or categories (e.g., work, personal)
- Search todos by keyword
- Filter by status, priority, or category
- Sort by due date, priority, or title

--------------------------------------------------
AGENT GOVERNANCE
--------------------------------------------------

Agents must operate within defined roles:
- Architecture Planner: system design & boundaries
- Spec Writer: feature and API specifications
- Backend Engineer: FastAPI + business logic
- Database Engineer: schema & migrations
- Frontend Engineer: Next.js UI & API consumption
- Integration Tester: end-to-end validation

Agents must:
- Follow specs strictly
- Escalate ambiguity
- Avoid inventing features

--------------------------------------------------
QUALITY STANDARDS
--------------------------------------------------

- Input validation on all API endpoints
- Proper error handling with meaningful messages
- Consistent data models across layers
- Deterministic behavior (same input → same output)

--------------------------------------------------
CONSTRAINTS
--------------------------------------------------

- No AI chatbot in Phase II
- No Kubernetes or Docker
- No hardcoded database credentials
- No skipping specification steps

--------------------------------------------------
SUCCESS CRITERIA
--------------------------------------------------

Phase II is successful when:
- Frontend, backend, and database integrate cleanly
- All Todo features work via web UI

## Response snapshot

Created and ratified the Phase II – Full-Stack Todo Web Application Constitution v1.0.0.

Key deliverables:
- 6 Core Principles: Spec-Driven Development, Layered Architecture, Extension Not Rewrite, API-First Design, Test-First Development, Simplicity/YAGNI
- Fixed Technology Stack: Next.js + FastAPI + SQLModel + Neon PostgreSQL
- Functional Requirements: Core (CRUD + complete) and Enhanced (priority, tags, search, filter, sort)
- Agent Governance: 6 defined agent roles with strict rules
- Quality Standards: Input validation, error handling, data consistency, determinism
- Constraints: No AI chatbot, no containers, no hardcoded credentials
- Success Criteria: Clean integration, working features, API contract adherence

All dependent templates verified compatible.

## Outcome

- ✅ Impact: Major – Initial constitution ratification for Phase II
- 🧪 Tests: N/A – Governance document
- 📁 Files: .specify/memory/constitution.md (created/updated)
- 🔁 Next prompts: /sp.specify to create feature specifications
- 🧠 Reflection: Constitution successfully derived from user input with all placeholders filled

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A
