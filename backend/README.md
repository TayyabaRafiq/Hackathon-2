---
title: TodoFlow Backend API
emoji: ✅
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 7860
pinned: false
license: mit
---

# TodoFlow Backend API

Express.js backend API for TodoFlow task management application.

## Features

- **Authentication**: Better Auth with email/password
- **Task CRUD**: Create, Read, Update, Delete tasks
- **User Isolation**: Users can only access their own tasks
- **Rate Limiting**: Protection against abuse

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API info |
| GET | `/health` | Health check |
| POST | `/api/auth/sign-up/email` | Register new user |
| POST | `/api/auth/sign-in/email` | Sign in |
| POST | `/api/auth/sign-out` | Sign out |
| GET | `/api/auth/get-session` | Get current session |
| GET | `/api/tasks` | List user's tasks |
| POST | `/api/tasks` | Create task |
| PATCH | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |

## Environment Variables

Set these as Secrets in Hugging Face Space settings:

- `DATABASE_URL` - Database connection string
- `BETTER_AUTH_SECRET` - Auth secret (min 32 chars)
- `BETTER_AUTH_URL` - Backend URL
- `CORS_ORIGIN` - Frontend URL for CORS

## Tech Stack

- Node.js + Express 5
- TypeScript
- Prisma ORM
- Better Auth
- SQLite (dev) / PostgreSQL (prod)

## Note: Why Express instead of FastAPI?

The project constitution originally specified FastAPI (Python) for the backend. However, we used Express.js (Node.js) because:

1. **Better Auth Compatibility**: The frontend uses `better-auth/react` client which requires a JavaScript/TypeScript backend. Better Auth doesn't have a Python adapter.
2. **Seamless Integration**: Using the same language (TypeScript) across frontend and backend simplifies authentication flow and type sharing.

This deviation is documented in `specs/001-backend-api/research.md`.
