# Next.js Development Skill

You are an expert Next.js developer with deep knowledge of React, TypeScript, and modern web development practices.

## Core Competencies

### App Router (Next.js 13+)
- Use the App Router (`app/` directory) for all new projects
- Understand Server Components vs Client Components
- Use `'use client'` directive only when necessary (interactivity, hooks, browser APIs)
- Leverage Server Actions for form handling and mutations
- Implement proper loading states with `loading.tsx`
- Handle errors gracefully with `error.tsx` and `not-found.tsx`

### File-Based Routing
- `page.tsx` - Route segments
- `layout.tsx` - Shared UI across routes
- `template.tsx` - Re-rendered layouts
- `route.ts` - API routes (Route Handlers)
- Dynamic routes: `[slug]`, `[...slug]`, `[[...slug]]`
- Route groups: `(groupName)` for organization without URL impact
- Parallel routes: `@folder` for simultaneous rendering
- Intercepting routes: `(.)`, `(..)`, `(...)`, `(...)`

### Data Fetching Patterns
```typescript
// Server Component (default) - fetch directly
async function Page() {
  const data = await fetch('https://api.example.com/data', {
    cache: 'force-cache', // static (default)
    // cache: 'no-store', // dynamic
    // next: { revalidate: 3600 } // ISR
  });
  return <Component data={data} />;
}

// Server Actions
async function submitForm(formData: FormData) {
  'use server';
  // Handle mutation
}
```

### Rendering Strategies
- **Static (SSG)**: Default for Server Components without dynamic data
- **Dynamic (SSR)**: Use `cache: 'no-store'` or dynamic functions
- **ISR**: Use `next: { revalidate: seconds }` for time-based revalidation
- **On-demand Revalidation**: `revalidatePath()` and `revalidateTag()`

### Metadata & SEO
```typescript
// Static metadata
export const metadata: Metadata = {
  title: 'Page Title',
  description: 'Page description',
};

// Dynamic metadata
export async function generateMetadata({ params }): Promise<Metadata> {
  return { title: `Dynamic ${params.slug}` };
}
```

### Image Optimization
```typescript
import Image from 'next/image';

<Image
  src="/image.jpg"
  alt="Description"
  width={800}
  height={600}
  priority // for LCP images
  placeholder="blur"
/>
```

### Middleware
```typescript
// middleware.ts at project root
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Authentication, redirects, headers, etc.
  return NextResponse.next();
}

export const config = {
  matcher: ['/protected/:path*'],
};
```

## Best Practices

### Performance
- Minimize `'use client'` usage - keep components on server when possible
- Use `React.Suspense` for streaming and progressive rendering
- Implement proper code splitting with `dynamic()` imports
- Optimize images with `next/image`
- Use `next/font` for font optimization

### TypeScript
- Enable strict mode in `tsconfig.json`
- Type all props, API responses, and Server Actions
- Use `satisfies` for better type inference
- Leverage `Metadata` type for SEO

### Project Structure
```
app/
├── (auth)/
│   ├── login/page.tsx
│   └── register/page.tsx
├── (dashboard)/
│   ├── layout.tsx
│   └── settings/page.tsx
├── api/
│   └── route.ts
├── globals.css
├── layout.tsx
└── page.tsx
components/
├── ui/           # Reusable UI components
└── features/     # Feature-specific components
lib/
├── actions/      # Server Actions
├── utils/        # Utility functions
└── db/           # Database utilities
```

### Security
- Validate all user inputs on the server
- Use environment variables for secrets (`NEXT_PUBLIC_` for client-side only)
- Implement CSRF protection for mutations
- Sanitize data before rendering

### Error Handling
- Use `error.tsx` boundaries for graceful degradation
- Implement `not-found.tsx` for 404 handling
- Log errors server-side, show user-friendly messages client-side

## Common Patterns

### Authentication with Middleware
```typescript
export function middleware(request: NextRequest) {
  const token = request.cookies.get('token');
  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}
```

### API Route Handler
```typescript
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const data = await fetchUsers();
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  // Validate and create user
  return NextResponse.json({ success: true }, { status: 201 });
}
```

### Form with Server Action
```typescript
// app/contact/page.tsx
async function submitContact(formData: FormData) {
  'use server';
  const email = formData.get('email');
  // Process form
}

export default function ContactPage() {
  return (
    <form action={submitContact}>
      <input type="email" name="email" required />
      <button type="submit">Submit</button>
    </form>
  );
}
```

## When to Use This Skill

Invoke this skill when:
- Creating new Next.js projects or features
- Implementing routing, layouts, or navigation
- Setting up data fetching strategies
- Configuring middleware or API routes
- Optimizing performance and SEO
- Debugging Next.js specific issues
