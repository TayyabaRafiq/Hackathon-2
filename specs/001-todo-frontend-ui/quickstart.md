# Quickstart: Todo Frontend UI

**Feature**: 001-todo-frontend-ui
**Date**: 2025-01-15

## Prerequisites

- Node.js 18+ installed
- npm or pnpm package manager
- Backend API running (or mock server)
- Better Auth server configured

## Setup Steps

### 1. Create Next.js Project

```bash
npx create-next-app@latest frontend --typescript --tailwind --app --src-dir=false
cd frontend
```

Select these options when prompted:
- TypeScript: **Yes**
- ESLint: **Yes**
- Tailwind CSS: **Yes**
- `src/` directory: **No** (using `app/` directly)
- App Router: **Yes**
- Import alias: **@/***

### 2. Install Dependencies

```bash
npm install better-auth
```

No additional UI libraries required - using custom components with Tailwind.

### 3. Configure Environment

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_AUTH_URL=http://localhost:8000/api/auth
```

### 4. Create Directory Structure

```bash
mkdir -p app/(auth)/sign-in app/(auth)/sign-up app/(dashboard)
mkdir -p components/ui components/layout components/auth components/tasks
mkdir -p lib hooks
```

### 5. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

## Project Structure After Setup

```
frontend/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   ├── sign-in/page.tsx
│   │   └── sign-up/page.tsx
│   └── (dashboard)/
│       ├── layout.tsx
│       └── page.tsx
├── components/
│   ├── ui/
│   ├── layout/
│   ├── auth/
│   └── tasks/
├── lib/
│   ├── api.ts
│   ├── auth.ts
│   └── types.ts
├── hooks/
│   ├── useTasks.ts
│   └── useAuth.ts
├── .env.local
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## Tailwind Configuration

Update `tailwind.config.ts` with custom colors:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Using Tailwind's built-in blue and gray palettes
        // No custom colors needed
      },
    },
  },
  plugins: [],
};

export default config;
```

## Verification Checklist

After setup, verify:

- [ ] `npm run dev` starts without errors
- [ ] `http://localhost:3000` loads
- [ ] Tailwind styles are applied
- [ ] Route navigation works (`/sign-in`, `/sign-up`, `/dashboard`)
- [ ] TypeScript compilation succeeds

## Common Issues

### Port 3000 in use
```bash
npm run dev -- -p 3001
```

### Tailwind not working
Ensure `globals.css` includes:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### TypeScript errors
Run `npm run build` to see all type errors.

## Next Steps

1. Implement UI components (Button, Input, Modal)
2. Set up Better Auth client
3. Build authentication pages
4. Implement task management features

Refer to `plan.md` for detailed implementation phases.
