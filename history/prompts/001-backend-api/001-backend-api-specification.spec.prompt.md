---
id: 001
title: TodoFlow Backend API Specification
stage: spec
date: 2026-01-19
surface: agent
model: claude-opus-4-5-20251101
feature: 001-backend-api
branch: 001-backend-api
user: system
command: /sp.specify
labels: ["backend", "api", "authentication", "better-auth", "task-management"]
links:
  spec: specs/001-backend-api/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/001-backend-api/spec.md
  - specs/001-backend-api/checklists/requirements.md
tests:
  - N/A (specification phase)
---

## Prompt

You are a senior backend architect and API designer.

I am building the BACKEND for Hackathon 2 – Phase 2 project called "TodoFlow".
The FRONTEND is already completed in Next.js and deployed-ready.

Your task is to SPECIFY and DESIGN a complete backend system that integrates seamlessly with the existing frontend.

========================
PROJECT CONTEXT
========================

Project Name: TodoFlow
Phase: Hackathon 2 – Phase 2 (Backend + Integration)
Frontend: Next.js (already built)
Backend Goal: Authentication + Task Management API

This backend will initially run in DEMO / LOCAL mode but must be production-ready in design.

========================
CORE REQUIREMENTS
========================

1. Authentication System
- User Sign Up
- User Sign In
- Secure password hashing
- Token-based authentication (JWT or session-based)
- Protected routes for authenticated users only

2. Task Management (CRUD)
- Create Task
- Read all tasks for logged-in user
- Update task (title, completed status)
- Delete task
- Each task must belong to a specific user

3. API Design
- RESTful API endpoints
- Clear request/response JSON schemas
- Proper HTTP status codes
- Error handling with meaningful messages

4. Database Layer
- Use a relational or document-based DB (PostgreSQL / SQLite / MongoDB – choose best fit)
- Tables / collections:
  - Users
  - Tasks
- Proper relations between users and tasks

5. Security & Best Practices
- Environment variables for secrets
- No hardcoded credentials
- Input validation
- Rate limiting (basic)
- CORS configuration for frontend integration

========================
FRONTEND INTEGRATION
========================

The backend MUST integrate with an existing Next.js frontend:

- Auth pages: /sign-in, /sign-up
- Dashboard page: /dashboard
- Frontend expects JSON APIs
- Token stored safely (httpOnly cookie or secure storage)
- Clear explanation of how frontend should call each API

Provide:
- API endpoint list
- Example frontend fetch calls
- Auth flow diagram (text-based)

========================
TECH STACK (RECOMMENDED)
========================

Choose ONE clean backend stack and justify it:
- Node.js + Express / Fastify
OR
- Python + FastAPI

Include:
- Project folder structure
- Key files explanation
- How to run locally
- How to connect to frontend

========================
DELIVERABLES
========================

1. Backend architecture overview
2. API specification (routes + payloads)
3. Database schema
4. Authentication flow
5. Frontend integration guide
6. Deployment readiness notes (future Vercel / Railway / Render)

IMPORTANT:
- Do NOT write full implementation code yet
- Focus on SPECIFICATION (sp.specify style)
- Be clear, structured, and beginner-to-intermediate friendly
- Assume this is a Hackathon evaluation project

End with a short checklist for Phase 2 backend completion.

## Response snapshot

Created comprehensive backend API specification for TodoFlow Phase 2 including:

1. **7 User Stories** with priorities (P1-P3) covering:
   - User Registration (P1)
   - User Sign In (P1)
   - Create Task (P2)
   - View Tasks (P2)
   - Update Task (P2)
   - Delete Task (P3)
   - Sign Out (P3)

2. **22 Functional Requirements** (FR-001 to FR-022) covering:
   - Authentication with Better Auth (FR-001 to FR-007)
   - Task Management CRUD (FR-008 to FR-014)
   - API Design standards (FR-015 to FR-018)
   - Security requirements (FR-019 to FR-022)

3. **API Specification** with:
   - 4 Auth endpoints via Better Auth
   - 4 Task endpoints (GET, POST, PATCH, DELETE)
   - Error response format with standard codes

4. **Technical Recommendations**:
   - Stack: Node.js + Express + Better Auth + Prisma
   - Database: SQLite (dev) / PostgreSQL (prod)
   - Project structure defined

5. **Frontend Integration Guide** with:
   - Environment configuration
   - Auth flow diagram
   - Deployment readiness notes

## Outcome

- ✅ Impact: Complete backend specification created, ready for implementation planning
- 🧪 Tests: N/A (specification phase - no code written)
- 📁 Files: 2 files created (spec.md, requirements.md checklist)
- 🔁 Next prompts: `/sp.plan` to create implementation plan, then `/sp.tasks` for task breakdown
- 🧠 Reflection: Analyzed existing frontend code (api.ts, auth.ts, types.ts) to ensure backend spec matches frontend expectations exactly. Better Auth integration decision was driven by frontend already using better-auth/react client.

## Evaluation notes (flywheel)

- Failure modes observed: None - spec completed successfully
- Graders run and results (PASS/FAIL): Manual checklist validation - PASS
- Prompt variant (if applicable): Standard /sp.specify with detailed user requirements
- Next experiment (smallest change to try): N/A - proceed to planning phase
