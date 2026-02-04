# Research: Todo Frontend UI

**Feature**: 001-todo-frontend-ui
**Date**: 2025-01-15
**Status**: Complete

## Research Summary

This document captures technology decisions and best practices research for the Todo Frontend UI implementation.

---

## R-1: Next.js App Router Best Practices

**Question**: What are the current best practices for Next.js 16+ App Router architecture?

**Decision**: Use route groups, Server Components by default, Client Components for interactivity only.

**Rationale**:
- Route groups `(auth)` and `(dashboard)` organize code without affecting URL structure
- Server Components reduce JavaScript bundle size and improve initial load
- Client Components only where state/interactivity required (forms, modals, lists with mutations)

**Alternatives Considered**:
- Pages Router: Rejected - App Router is the modern standard with better data fetching patterns
- All Client Components: Rejected - unnecessary bundle size increase

**Sources**: Next.js documentation, App Router migration guide

---

## R-2: Better Auth Integration Pattern

**Question**: How should Better Auth be integrated with Next.js App Router?

**Decision**: Use Better Auth client-side hooks with middleware for route protection.

**Rationale**:
- `useSession()` hook provides reactive auth state
- Middleware can protect routes server-side before page renders
- Session tokens automatically managed by Better Auth

**Implementation Pattern**:
```typescript
// lib/auth.ts - Client setup
import { createAuthClient } from "better-auth/client";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_AUTH_URL,
});

// middleware.ts - Route protection
export function middleware(request: NextRequest) {
  const session = await authClient.getSession();
  if (!session && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }
}
```

**Alternatives Considered**:
- NextAuth.js: Viable alternative, but Better Auth specified in requirements
- Custom JWT handling: Over-engineering; Better Auth handles this

---

## R-3: Optimistic UI Implementation

**Question**: What is the best pattern for optimistic updates in React?

**Decision**: Use local state with immediate update, then reconcile with server response.

**Rationale**:
- Provides <100ms feedback as required by SC-002
- Simple pattern without external libraries
- Easy rollback on failure

**Implementation Pattern**:
```typescript
const updateTask = async (id: string, updates: UpdateTaskInput) => {
  // 1. Save previous state for rollback
  const previousTasks = tasks;

  // 2. Optimistically update
  setTasks(tasks.map(t => t.id === id ? { ...t, ...updates } : t));

  try {
    // 3. Send to server
    const updated = await api.updateTask(id, updates);
    // 4. Reconcile with server response (optional, for server-generated fields)
    setTasks(tasks.map(t => t.id === id ? updated : t));
  } catch (error) {
    // 5. Rollback on failure
    setTasks(previousTasks);
    toast.error("Failed to update task");
  }
};
```

**Alternatives Considered**:
- TanStack Query: Powerful but adds complexity; YAGNI for this scope
- SWR: Similar to above; simple hooks sufficient
- Redux: Over-engineering for single-page state

---

## R-4: Modal Focus Management

**Question**: How should focus be managed in modal dialogs for accessibility?

**Decision**: Implement focus trap with Escape key handling.

**Rationale**:
- Required for WCAG 2.1 compliance (FR-036, FR-037)
- Prevents keyboard users from tabbing outside modal
- Standard UX expectation

**Implementation Pattern**:
```typescript
// Using a lightweight focus-trap implementation
const Modal = ({ isOpen, onClose, children }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    // Focus first focusable element
    const focusable = modalRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    focusable?.[0]?.focus();

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Trap focus within modal
  // ... focus trap logic
};
```

**Alternatives Considered**:
- Headless UI: Good option but adds dependency; simple implementation sufficient
- Radix UI: Same as above
- Native `<dialog>`: Browser support inconsistent; manual implementation more reliable

---

## R-5: Tailwind CSS Color System

**Question**: What color system should be used for consistent, accessible UI?

**Decision**: Use Tailwind's neutral palette with a single accent color (blue-600).

**Rationale**:
- Neutral grays provide professional look
- Single accent reduces cognitive load
- Blue is universally recognized for primary actions
- Built-in Tailwind colors meet WCAG AA contrast requirements

**Color Mapping**:
| Usage | Color | Tailwind Class |
|-------|-------|----------------|
| Primary button | Blue | `bg-blue-600 hover:bg-blue-700` |
| Secondary button | Gray | `bg-gray-200 hover:bg-gray-300` |
| Danger button | Red | `bg-red-600 hover:bg-red-700` |
| Text primary | Dark gray | `text-gray-900` |
| Text secondary | Medium gray | `text-gray-600` |
| Background | White/Light gray | `bg-white` / `bg-gray-50` |
| Border | Light gray | `border-gray-200` |
| Focus ring | Blue | `focus:ring-blue-500` |
| Completed task | Muted | `text-gray-400 line-through` |

**Alternatives Considered**:
- Custom color palette: Unnecessary complexity
- Multiple accent colors: Violates simplicity principle

---

## R-6: Form Validation Strategy

**Question**: How should client-side validation be implemented?

**Decision**: Use controlled components with inline validation on blur/submit.

**Rationale**:
- Proactive validation per SC-003
- No additional library needed
- Clear error messages at point of input

**Implementation Pattern**:
```typescript
const [email, setEmail] = useState("");
const [emailError, setEmailError] = useState("");

const validateEmail = (value: string) => {
  if (!value) return "Email is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Invalid email format";
  return "";
};

const handleEmailBlur = () => {
  setEmailError(validateEmail(email));
};

const handleSubmit = () => {
  const error = validateEmail(email);
  if (error) {
    setEmailError(error);
    return;
  }
  // Submit...
};
```

**Alternatives Considered**:
- React Hook Form: Good library but adds dependency; native approach sufficient
- Zod validation: Better for complex schemas; overkill for 2 fields
- HTML5 validation only: Less control over error messages

---

## R-7: Debouncing Rapid Actions

**Question**: How should rapid consecutive actions (e.g., quick toggles) be handled?

**Decision**: Debounce API calls while updating UI immediately.

**Rationale**:
- Prevents server overload from rapid clicking
- UI still feels responsive (optimistic)
- Final state is sent after user stops clicking

**Implementation Pattern**:
```typescript
const debouncedToggle = useMemo(
  () => debounce(async (taskId: string, completed: boolean) => {
    await api.updateTask(taskId, { completed });
  }, 300),
  []
);

const handleToggle = (taskId: string) => {
  // Optimistic update immediately
  setTasks(tasks.map(t =>
    t.id === taskId ? { ...t, completed: !t.completed } : t
  ));
  // Debounced API call
  debouncedToggle(taskId, !tasks.find(t => t.id === taskId)?.completed);
};
```

**Alternatives Considered**:
- No debouncing: Could cause race conditions and server load
- Disable button during request: Poor UX; feels slow
- Throttle instead of debounce: Debounce better for "final state" scenarios

---

## Conclusion

All technical unknowns have been resolved. The implementation can proceed with:

1. Next.js App Router with route groups
2. Better Auth for authentication
3. Local React state with optimistic updates
4. Custom focus-trap modal implementation
5. Tailwind neutral + blue accent color system
6. Controlled form validation
7. Debounced API calls for rapid actions

No blocking issues identified. Proceed to Phase 1 design.
