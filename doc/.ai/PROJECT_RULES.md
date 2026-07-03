# PROJECT_RULES.md

# 🚀 Frontend Interview Guide — Engineering Standards & AI Development Rules

**Version:** 2.0.0 · **Author:** Project Architect

Every AI assistant (Antigravity, Claude, ChatGPT, Cursor, Copilot, etc.) **must follow these rules** before making any code change. The goal: an enterprise-grade, scalable, secure, maintainable Interview Preparation Platform.

## Table of Contents

1. [Project Vision](#project-vision)
2. [Golden Rules](#golden-rules)
3. [Architecture Principles](#architecture-principles)
4. [Technology Stack](#technology-stack)
5. [Folder Structure](#folder-structure)
6. [Component & React Rules](#component--react-rules)
7. [State Management](#state-management)
8. [API & Backend Rules](#api--backend-rules)
9. [Database Rules](#database-rules)
10. [Security Rules](#security-rules)
11. [Performance Rules](#performance-rules)
12. [Accessibility Rules](#accessibility-rules)
13. [TypeScript & Styling Rules](#typescript--styling-rules)
14. [Naming & File Size Conventions](#naming--file-size-conventions)
15. [Error Handling & Logging](#error-handling--logging)
16. [Git & Testing](#git--testing)
17. [Documentation Rules](#documentation-rules)
18. [AI Development Rules](#ai-development-rules)
19. [Quality Checklist & Definition of Done](#quality-checklist--definition-of-done)
20. [Long-Term Vision](#long-term-vision)

---

## Project Vision

Transform this project from a static interview guide into a production-ready learning platform supporting 100,000+ interview questions, millions of API requests, thousands of concurrent users, an admin dashboard, an AI interview assistant, user accounts, bookmarks, analytics, premium features, and mobile apps.

## Golden Rules

1. **Never break existing functionality.** If a feature works, preserve it.
2. **Never modify UI unnecessarily.** Layout, colors, typography, components, and responsive design stay as-is unless specifically requested.
3. **Never remove features** — only improve them.
4. **Backward compatibility is mandatory.** Old functionality must keep working.
5. **Every change must improve at least one of:** performance, readability, maintainability, security, or scalability.

## Architecture Principles

✅ Clean Architecture · SOLID · DRY · KISS · Separation of Concerns · Feature-Based Architecture · Modular Design

❌ Spaghetti code · Tight coupling · Oversized components · Duplicate logic · Deep nesting · Circular dependencies

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router), TypeScript, Tailwind CSS |
| State (client-only) | Redux Toolkit — UI state only (theme, modals, toasts, filters). Server data does not live in the store. |
| Backend | Next.js Route Handlers / Server Actions |
| Database | MongoDB |
| Deployment | Vercel (single deployment for frontend and backend) |

## Folder Structure

```text
app/
├── (routes)/               # route groups & pages
│   └── */page.tsx
├── api/                    # Route Handlers
│   └── */route.ts
├── actions/                # Server Actions
├── layout.tsx
├── loading.tsx
├── error.tsx
└── not-found.tsx

components/
├── common/
├── layout/
├── question/
└── ui/

lib/
├── db.ts                   # cached MongoDB client
├── services/                # business logic, called by routes/actions
└── utils/

store/                       # Redux Toolkit — client-only UI state
└── features/

hooks/
contexts/
└── providers/

constants/
types/
styles/
assets/
config/
```

Never place everything inside one folder. Framework-mandated files (`page.tsx`, `layout.tsx`, `route.ts`, `loading.tsx`, `error.tsx`, `not-found.tsx`) keep their required lowercase names — this overrides the PascalCase-for-components rule below.

## Component & React Rules

- One responsibility per component. Good: `QuestionCard`, `SearchBar`, `Sidebar`, `CategoryList`, `ThemeToggle`. Bad: `MegaComponent.tsx`.
- Keep components under ~300 lines where practical; extract subcomponents or hooks as they grow.
- **Default to Server Components.** Only add `"use client"` when a component needs interactivity, browser APIs, hooks like `useState`/`useEffect`, or event handlers.
- Fetch data directly in Server Components (`async` components, `fetch`, or a service call) instead of `useEffect` + client-side fetching, wherever the data doesn't need to be interactive.
- Prefer functional components, hooks, and composition.
- Use `React.memo`, `useMemo`, and `useCallback` in Client Components when justified by actual rendering patterns — avoid unnecessary re-renders, but don't over-optimize.

## State Management

- **Redux Toolkit is scoped to client-only UI state**: theme, modals, toasts, sidebar, search-input state, pagination controls. It is not a cache for server data.
- Server data (questions, categories, bookmarks, user records) is fetched in Server Components, Route Handlers, or Server Actions — not stored in Redux.
- Use Context only for lightweight concerns like `ThemeProvider`.

**Redux structure (client-state only):**
```text
store/
├── appStore.ts
└── features/
    ├── search/
    ├── theme/
    └── ui/
```
Use `createSlice()`, `configureStore()`, and typed hooks (`useAppDispatch()`, `useAppSelector()`).

## API & Backend Rules

The frontend never talks to MongoDB directly from Client Components. Never bypass the service layer:

```text
Server Component / Client Component
        ↓
Route Handler (app/api/*/route.ts) or Server Action (app/actions/*.ts)
        ↓
Service (lib/services/*)
        ↓
MongoDB
```

- Use **Server Actions** for form submissions and mutations triggered from within the app.
- Use **Route Handlers** for endpoints that need to be called externally, from Client Components via `fetch`, or that return non-HTML responses.
- Business logic lives in `lib/services/`; Route Handlers and Server Actions stay thin and delegate to services.

## Database Rules

- MongoDB only. Never hardcode data or use JSON files as primary storage.
- Use a **cached, singleton connection** (`lib/db.ts`) — Next.js runs in a serverless environment, and opening a new MongoDB connection per request will exhaust the connection pool. Cache the client across invocations (e.g. attach to `global` in development).
- **Collections:** questions, categories, tags, users
- **Indexes:** slug, category, difficulty, tags
- Use pagination for large datasets.

## Security Rules

**Never expose:** Mongo URI, secrets, API keys, passwords, JWT secret.

- Only prefix an env var with `NEXT_PUBLIC_` if it is genuinely safe for the browser — this prefix ships the value to the client bundle. Secrets stay unprefixed and server-only.
- Security headers (equivalent to Helmet) are configured via `next.config.js` `headers()` or `middleware.ts`, not Express middleware.

**Always use:** environment variables, input validation, sanitization, DOMPurify, CORS (for externally-called Route Handlers), rate limiting.

Never trust client input.

## Performance Rules

Optimize rendering, search, data fetching, database queries, and bundle size using: `next/dynamic` (code splitting), `next/image` (image optimization), `next/font` (font loading), streaming with `<Suspense>`, virtualization, pagination, memoization, and Fuse.js. Prefer fetching in Server Components over client-side fetching to avoid unnecessary API round-trips.

## Accessibility Rules

Follow WCAG AA: semantic HTML, ARIA labels, keyboard navigation, visible focus states, screen-reader support, skip navigation. Never sacrifice accessibility for speed or style.

## TypeScript & Styling Rules

- Never use `any`. Prefer interfaces, type aliases, generics, and enums where appropriate. Strict typing, no implicit `any`.
- Use Tailwind CSS with consistent spacing, typography, color system, and responsive layouts. Avoid inline styles except when unavoidable.

## Naming & File Size Conventions

| Item | Convention | Example |
|---|---|---|
| Components | PascalCase | `QuestionCard.tsx` |
| Hooks | camelCase | `useQuestions.ts` |
| Utility files | camelCase | — |
| Constants | UPPER_SNAKE_CASE (where appropriate) | — |
| Variables | camelCase | — |
| Interfaces | Descriptive name; `I` prefix only if the codebase already follows that convention | — |

| Module type | Target size limit |
|---|---|
| Component | < 300 lines |
| Hook | < 200 lines |
| Utility | < 150 lines |
| Service | < 300 lines |

If a file exceeds its target, split it into smaller modules.

## Error Handling & Logging

- Every async function needs a `try/catch`. Every API response needs a proper HTTP status, a clear error message, and a graceful fallback UI. The app should never crash outright.
- Console logs are fine during development; remove unnecessary ones before production. Never log secrets, passwords, tokens, database URLs, or personal information.

## Git & Testing

- Feature branches: `feature/app-router-migration`, `feature/backend-routes`, `feature/search`, `feature/theme`. Never push directly to `main`. Commit after every completed phase.
- Every phase must pass: build, TypeScript, ESLint, and manual testing. Future: Vitest, React Testing Library, Playwright.

## Documentation Rules

Every major feature should document its purpose, architecture, usage, limitations, and future improvements. Keep documentation current.

## AI Development Rules

Before changing code: understand the entire feature, never guess, read related files first, avoid duplicate logic, reuse existing utilities, and refactor instead of rewriting.

When multiple solutions exist, choose the most scalable, maintainable, readable, enterprise-standard option. No quick hacks.

## Quality Checklist & Definition of Done

Before finishing any phase, confirm:

- [ ] Build succeeds, no TypeScript or ESLint errors, no runtime errors
- [ ] No broken imports, duplicate code, or dead code
- [ ] No UI or feature regressions
- [ ] Responsive design and accessibility maintained
- [ ] Performance improved
- [ ] Documentation updated

A task is **done** only when the feature works, nothing existing broke, the build passes, the code is readable and follows the architecture, docs are updated, and no regressions were introduced.

## Long-Term Vision

Authentication & user profiles · progress tracking · bookmarks & favorites · admin dashboard · AI assistant · mock & voice interviews · company-wise questions · daily challenges · notes · premium courses · mobile apps · analytics dashboard · multi-language support · offline support (PWA)

The architecture should support all of these with minimal future refactoring.

---

**Final rule:** every code change must leave the project in a better state than before. Never trade maintainability for speed of implementation — always favor enterprise-grade architecture, clean code, security, performance, scalability, and long-term maintainability.
