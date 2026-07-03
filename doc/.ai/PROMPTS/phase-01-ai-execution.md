# Phase 01 AI Execution Guide — Architecture Refactoring & Foundation

| | |
|---|---|
| **Version** | 1.1 |
| **Target AI** | Antigravity AI |
| **Estimated Execution Time** | 6–10 hours |
| **Priority** | ⭐⭐⭐⭐⭐ Critical |

---

## AI Role

You are acting as: Principal Software Architect, Senior Next.js Engineer, Senior TypeScript Engineer, UI/UX Engineer, Frontend Performance Engineer, Code Quality Reviewer, and Technical Lead — responsible for transforming this project into an enterprise-grade Next.js application without breaking anything.

Don't behave like a code generator — behave like a senior engineer responsible for a production application. Always choose maintainable solutions over quick fixes.

## Project Context

An Interview Preparation Platform (Next.js App Router, TypeScript, Tailwind CSS) currently loading questions from JSON files. Future architecture:
```
Next.js (App Router) → Redux Toolkit → Next.js Route Handlers (API) → MongoDB Atlas → Production Infrastructure
```
**This phase covers frontend architecture only — do not implement backend/route-handler or MongoDB functionality.**

## Primary Objective

Refactor the frontend architecture while preserving existing UI, features, UX, styling, and behavior exactly. The user should notice zero visual difference — only the codebase should improve.

## Before You Touch Any Code

Read the **entire** codebase first — folder structure, component tree, hooks, utilities, services, types, search logic, question rendering, category logic, state management. Do not modify anything until you understand the project.

**Also always follow `PROJECT_RULES.md`** — if this document conflicts with it, `PROJECT_RULES.md` wins.

---

## Project Goals

Improve architecture, maintainability, readability, scalability, and type safety · reduce complexity, duplicate code, and prop drilling · introduce Redux Toolkit · migrate cleanly to Next.js App Router conventions · prepare for backend integration via Route Handlers and MongoDB Atlas. Do not add unnecessary features.

## Golden Rules

1. Never break existing functionality
2. Never change the UI unnecessarily
3. Never remove features
4. Never introduce duplicate code
5. Never ignore TypeScript errors
6. Never bypass the architecture
7. Always follow SOLID
8. Always follow DRY
9. Always follow KISS
10. Prefer reusable code over duplicated code
11. Respect the Server Component / Client Component boundary — never mark a component `'use client'` unless it truly needs interactivity, state, or browser APIs

## Pre-Work Analysis (do not skip)

Before writing any code, analyze and document internally: component/reusable-component/hook/service/utility/type counts, largest component, component owning the most state, SRP violations, duplicated logic, components doing business logic, hardest-to-maintain files, and which components currently rely on browser-only APIs (localStorage, window, etc.) that will need a `'use client'` boundary under the App Router.

## What Must Not Change

Design, colors, typography, spacing, animations, icons, responsive layout, question/answer content, search results, existing behavior, routing, UX. **The refactor must be invisible to end users.**

## What Should Change

Architecture, folder structure, migration to Next.js App Router conventions, Redux, code organization, hooks, utilities, TypeScript, component reusability, maintainability, readability, scalability. Nothing else.

## Phase Scope

| In Scope | Out of Scope (later phases) |
|---|---|
| Architecture review, folder refactoring | Route Handlers (API), MongoDB Atlas integration, Authentication |
| Next.js App Router migration (layouts/pages) | Deployment, Testing, CI/CD |
| Redux Toolkit, component refactoring | SEO, Performance Optimization |
| Hooks, utilities, TypeScript | |
| Configuration, constants, reusable components, cleanup | |

---

## Target Folder Structure
```
src/
├── app/                     # Next.js App Router — routes, layouts, pages, route handlers (future)
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/{common,layout,question,ui}/
├── features/
├── hooks/
├── store/
├── services/
├── providers/
├── contexts/
├── constants/
├── utils/
├── types/
├── config/
├── styles/
├── assets/
└── lib/
```
`app/` is reserved exclusively for Next.js routing (layouts, pages, and future route handlers). Application composition, providers, and business logic live outside `app/` and are imported into it. Move files gradually — never break imports.

## App Router Composition Target
```
app/layout.tsx   (Server Component, root layout)
  <AppProviders>            ← client boundary starts here
    <AppLayout>
      <Sidebar />
      {children}
      <Toast />
    </AppLayout>
  </AppProviders>

app/page.tsx
  <QuestionContainer />
```
Keep `app/layout.tsx` and `app/page.tsx` as thin composition layers only. `AppProviders` (and anything stateful beneath it, e.g. Redux `Provider`, theme context) must be an explicit Client Component (`'use client'`) since Next.js Server Components cannot hold React state or context providers directly. Extract all business logic out of `layout.tsx`/`page.tsx` into hooks, features, and providers.

## Component & Hook Strategy

For every component ask: reusable? simplifiable? splittable? can logic move to a hook? can props simplify? should it be a Server Component or does it need `'use client'`? Split large components into logical subcomponents.

Extract business logic into hooks: `useQuestions()`, `useSearch()`, `useCategory()`, `useExpand()`, `useSidebar()`, `useToast()`, `useTheme()` — logic only, never return JSX. Any component using these hooks is implicitly a Client Component and must be marked accordingly.

### Deliverables — Analysis Complete
By this point: project understood · architecture analyzed · component hierarchy, business logic, and folder structure understood · Server/Client Component boundaries identified · App Router migration plan (`layout.tsx`/`page.tsx`) and custom-hooks plan ready · Redux integration prepared. **Do not begin implementation until analysis is complete.**

---

## Implementation Rules

Implement feature by feature, not all at once. Validate after each completed task. Never leave the project in a broken state.

## Implementation Order (do not change)

1. Project Analysis
2. Folder Refactoring
3. Next.js App Router Migration
4. Redux Toolkit
5. Feature Organization
6. Component Refactoring
7. Hook Extraction
8. Utility Extraction
9. Constants
10. Configuration
11. Providers
12. Context
13. TypeScript Cleanup
14. Final Validation

### Step 1 — Analyze Current Architecture
Read every file. Identify large components, duplicate/business logic, repeated JSX/styles, prop drilling, large state objects, deep component trees, and any client-only browser API usage. Document every issue before touching code.

### Step 2 — Refactor Folder Structure
Move to the target structure (above) carefully — update imports immediately, never leave broken imports, never move everything at once.

### Step 3 — Next.js App Router Migration
Ensure routing lives entirely under `app/` using `layout.tsx`/`page.tsx` conventions. Root layout stays a Server Component; wrap client-side concerns (providers, interactive UI) in dedicated `'use client'` boundaries as low in the tree as possible to maximize server rendering. Do not introduce React Router or any other routing library.

### Step 4 — Redux Toolkit
Install if missing. Create:
```
store/
  appStore.ts
  rootReducer.ts
features/
  questions/  categories/  search/  theme/  ui/
```
Each feature owns its own state — never one massive slice. Use `configureStore()`, `createSlice()`, typed hooks, and `createAsyncThunk` (future-ready for MongoDB Atlas-backed data via Route Handlers); export `RootState`, `AppDispatch`, and typed hooks; never use untyped selectors. The Redux `Provider` must live inside a `'use client'` component (e.g. `providers/ReduxProvider.tsx`) since it cannot be used directly in a Server Component.

**Move to Redux:** questions, categories, search query, sidebar, theme, loading, errors, (future) bookmarks/progress.
**Keep as local state:** dropdowns, input focus, modal visibility, tooltips.

### Step 5 — Feature-Based Organization
❌ `components/ · hooks/ · utils/` (by type) → ✅ `features/questions/{components,hooks,services,types,utils}` (self-contained by feature).

### Step 6 — App Router Composition Refactoring
Target the composition-only structure above. Remove business logic, filtering, searching, category logic, large state, and complex effects from `app/layout.tsx` and `app/page.tsx` — relocate them elsewhere.

### Step 7 — Component Refactoring
For every component ask: reusable? smaller? belongs in a feature folder? logic → hook? simpler props? Server Component by default, or does it need `'use client'`? Extract Button, Input, Card, Badge, Loader, Skeleton, Search, QuestionCard, CategoryBadge, Toast, Container, Divider. No duplicated UI.
**Standard:** one responsibility, minimal props, no business logic, reusable, readable, < 300 lines (split if larger).

### Step 8 — Hook Extraction
Move business logic into hooks (`useQuestions`, `useSearch`, `useCategories`, `useExpand`, `useSidebar`, `useToast`, `useTheme`) — logic only, no JSX, reusable, no feature coupling. One hook = one responsibility; prefer composing small hooks over one large hook. Any file using these hooks needs a `'use client'` directive.

### Step 9 — Utility Refactoring
Centralize in `utils/`: `debounce.ts`, `highlight.ts`, `copyToClipboard.ts`, `slugify.ts`, `storage.ts`, `formatDate.ts`. Never duplicate utility functions.

### Step 10 — Constants
Create `constants/{routes,theme,messages,categories,storage,api}.ts`; remove magic strings/numbers — never hardcode values throughout the app.

### Step 11 — Configuration
Create `config/{env,theme,app,api}.ts`. Use Next.js environment variable conventions — server-only variables via `process.env`, and browser-exposed variables prefixed `NEXT_PUBLIC_`. Configuration lives in one place, not scattered.

### Step 12 — Providers
Create `providers/` with `ReduxProvider`, `ThemeProvider` (future: `QueryProvider`, `AuthenticationProvider`), composed inside an `AppProviders` client component that wraps `{children}` in `app/layout.tsx`. Avoid nested provider chaos.

### Step 13 — Context
Use React Context only for Theme (future: Locale, Feature Flags) — never for large application state; use Redux Toolkit for that instead. Context providers must live in Client Components.

### Step 14 — TypeScript Cleanup
Remove `any`, implicit `any`, unsafe casting, duplicate interfaces. Prefer interfaces, type aliases, generics, and utility types. Enable strict typing.

**Naming:** Components → PascalCase · Hooks/Utilities → camelCase · Types → descriptive names, no abbreviations.

**Import order:** React → Next.js → third-party → Redux → internal modules → components → hooks → services → utilities → types → styles.

**Code standards:** SOLID, DRY, KISS, readable code, small functions, reusable components, feature isolation, minimal `'use client'` surface area. Avoid clever code — prefer explicit code.

### Deliverables — Implementation Complete
Next.js App Router structure in place · Redux Toolkit architecture implemented · folder structure refactored · `app/layout.tsx`/`app/page.tsx` simplified · Server/Client Component boundaries correct · components and hooks extracted · utilities/constants/configuration centralized · TypeScript improved · coding standards applied.

---

## Final Validation

Perform full project validation before marking Phase 01 complete — do not skip any step.

**Build validation** — run `npm install → npm run build → npm run lint → npm run type-check` (i.e. `next build`, `next lint`, `tsc --noEmit`, or equivalents). Expect: build success, no TypeScript/ESLint/build errors.

**Runtime validation** — start the dev server (`next dev`); confirm the app starts with no runtime errors, hydration errors, console errors, or warnings (pay special attention to Server/Client Component hydration mismatches).

**Feature validation** — verify search, category filter, expand/collapse, copy button, sidebar, navigation, dark mode/theme switching, markdown rendering, question loading. No existing feature may fail.

**UI validation** — compare before/after: colors, typography, spacing, icons, animations, responsive layout, question cards, search UI, sidebar all unchanged — visually identical.

**Architecture review** — do `app/layout.tsx`/`app/page.tsx` only compose? Is business logic extracted? Are Server/Client Component boundaries minimal and correct? Are hooks/components reusable? Is Redux the single source of shared state? Is the folder structure scalable and the code easier to understand? If "no" to any, keep refactoring.

**Redux validation** — store configured correctly, `Provider` correctly isolated in a client component, slices separated by feature, typed hooks implemented, selectors reusable, reducers simple, no duplicated or unnecessary global state — shared state only.

**Component review** — single responsibility, reusable, readable, minimal props/state, no duplicated JSX, correct Server/Client designation, < 300 lines (split if larger).

**Hook review** — one responsibility, reusable, no JSX, no misplaced side effects, no duplicated logic, meaningful naming.

**Utility review** — no duplicate helpers; pure, reusable, properly typed, documented functions.

**TypeScript review** — no `any`/implicit `any`/duplicate interfaces/unsafe casting; strict typing maintained; meaningful type names.

**Import review** — consistent ordering per the standard above, in every file.

**Folder structure validation** — matches the target tree; `app/` contains only routing concerns; every folder has a clear purpose.

**Code quality checklist** — no duplicate code, unused imports/variables/state/effects, dead components/utilities/hooks, magic strings/numbers, long functions, unnecessary `'use client'` directives, or overly complex components. Simplify wherever possible.

**Performance review (prep for Phase 02)** — flag large components, repeated calculations, unnecessary state, duplicate rendering, unnecessary inline objects/arrays/functions, and components marked `'use client'` that could be server-rendered instead. Document for later — don't fix now.

**Accessibility review** — semantic HTML, buttons, labels, keyboard navigation, focus indicators, heading order, ARIA where needed. Do not reduce accessibility.

**Documentation review** — update README, architecture notes, folder structure, App Router migration notes, Redux overview, hook usage, and component structure docs as needed so future developers understand the project easily.

---

## Git Workflow

- Branch: `feature/phase-01-architecture`
- Commit frequently, e.g.:
  ```
  refactor: reorganize folder structure
  refactor: migrate routing to Next.js App Router
  feat: add Redux Toolkit architecture
  refactor: extract reusable hooks
  refactor: simplify app/layout.tsx and app/page.tsx
  refactor: extract reusable UI components
  refactor: improve TypeScript typing
  chore: remove duplicate code
  ```
- Merge only after successful validation.

## Rollback Strategy

If an issue occurs: identify the failing commit → revert only the affected changes → retest → continue only once stability is restored. Never stack changes on top of unstable code.

---

## Final Report

After implementation, generate a report covering:
1. **Architecture Summary** — overall improvements, including the App Router migration
2. **Files Created** / **Files Modified** — full lists
3. **Folder Changes** — describe the new structure
4. **Redux** — slices, store config, typed hooks, selectors, reducers
5. **Server/Client Components** — how the boundary was drawn and why
6. **Components** — extracted / simplified / removed / new reusable components
7. **Hooks** — created / refactored / logic extracted
8. **Utilities** — created / reused / duplicates removed
9. **TypeScript** — interfaces improved, types added, `any` removed, strict-typing improvements
10. **Code Quality** — duplicate/dead code removed, readability & maintainability improvements
11. **Future Recommendations** — for performance, security, Route Handlers, MongoDB Atlas integration, production (do not implement yet)

## Acceptance Criteria

Phase 01 is complete only when: routing fully migrated to Next.js App Router conventions · `app/layout.tsx` and `app/page.tsx` are composition-only · Redux Toolkit implemented with shared state centralized · Server/Client Component boundaries are correct and minimal · folder structure scalable · components reusable · business logic in hooks · utilities/constants/configuration centralized · no duplicate code · no TypeScript/ESLint/runtime errors · existing UI and functionality unchanged · documentation updated · Git commit created.

## Definition of Done

Build succeeds (`next build`) · app runs (`next dev`) · existing features work · architecture significantly improved and easier to maintain · shared state uses Redux Toolkit · `app/layout.tsx`/`app/page.tsx` lightweight · components modular · hooks reusable · code follows SOLID/DRY/KISS · project ready for Phase 02 (Route Handlers + MongoDB Atlas integration).

---

## Final AI Instructions

You are optimizing for long-term maintainability, not speed. Never choose shortcuts over architecture. Never introduce breaking changes, remove functionality, or change the visual design — always preserve the user experience. Never introduce a routing library other than Next.js App Router, and never pull business logic or state providers into Server Components.

When multiple solutions are possible, choose the one that is most scalable, maintainable, readable, testable, and aligned with enterprise engineering standards.

**Do not proceed to Phase 02 (Next.js Route Handlers, MongoDB Atlas integration) until every validation step in this document has passed successfully.**