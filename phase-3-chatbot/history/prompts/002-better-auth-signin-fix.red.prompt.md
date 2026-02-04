---
id: "002"
title: "Better Auth Signin Fix"
stage: "red"
date_iso: "2026-02-01"
surface: "agent"
model: "claude-sonnet-4-5-20250929"
feature: "authentication"
branch: "main"
user: "unknown"
command: "manual-debug-session"
labels: ["authentication", "better-auth", "signin", "debugging", "database"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - "backend/src/auth.ts"
tests: []
---

# Better Auth Signin Fix

## Prompt Text
```
I have a Next.js frontend (localhost:3001) and Express + Better Auth backend (localhost:8000).
Signup works, but signin returns result.error = {} with no message.
Browser console shows auth requests hitting backend but login fails silently.
Backend routes use toNodeHandler(auth) at /api/auth/*.
CORS allows 3000 & 3001.
Cookies were cleared.
Need you to debug why Better Auth signin fails without error and tell EXACT files + code changes needed.
```

## Response Text
Identified and fixed the core issue where Better Auth configuration had an incorrect database provider. Changed provider from "sqlite" to "postgresql" in backend/src/auth.ts to match the actual PostgreSQL database.

## Outcome Impact
Fixed Better Auth sign-in functionality that was failing silently due to database provider mismatch. Sign-in operations now work correctly with proper error handling.

## Tests Summary
none

## Files Summary
- backend/src/auth.ts: Fixed database provider configuration from "sqlite" to "postgresql"

## Next Prompts
none

## Reflection Note
Database provider mismatches can cause silent authentication failures that are difficult to debug without proper logging.

---

## Failure Modes Observed
None - issue was resolved successfully by identifying the configuration mismatch.

## Next Experiment to Improve Prompt Quality
Consider adding more detailed error logging in Better Auth configurations to make similar issues easier to diagnose.