# Phase 01 — Architecture Refactoring & Foundation

| | |
|---|---|
| **Version** | 1.1 |
| **Status** | Planned |
| **Estimated Time** | 8–12 hours |
| **Priority** | ⭐⭐⭐⭐⭐ Critical |
| **Stack** | Next.js (App Router) · TypeScript · Tailwind CSS · MongoDB Atlas |

---

## Objective

Establish a strong, scalable architectural foundation on **Next.js (App Router) + TypeScript + Tailwind CSS**, improving code quality, maintainability, and organization — **without changing any existing functionality or UI**.

**Out of scope:** MongoDB Atlas data modeling/migration, Route Handler (API) implementation, authentication. This phase is strictly frontend/application-architecture. MongoDB Atlas connection and data access will be wired up in a later backend-integration phase, but the folder structure created here must already anticipate it (e.g. `lib/db`, `server/` boundaries).

## Goals

- Understand the entire project architecture
- Remove architectural bottlenecks; refactor large components
- Improve project organization and TypeScript usage
- Introduce Redux Toolkit for shared client state
- Establish Tailwind CSS as the single styling system
- Extract reusable logic; improve readability
- Correctly separate **Server Components**, **Client Components**, and (future) **Route Handlers**
- Prepare the project for MongoDB Atlas / backend integration and enterprise-scale growth

## Success Criteria

- ✅ Project builds (`next build`); no TypeScript / ESLint / runtime errors
- ✅ Existing UI and functionality unchanged
- ✅ Redux Toolkit implemented (client-side state only)
- ✅ Tailwind CSS fully configured; no leftover legacy CSS/CSS-in-JS duplicating Tailwind's job
- ✅ App Router conventions used correctly (`layout.tsx`, `page.tsx`, `loading.tsx`, `error.tsx`, route groups)
- ✅ Folder structure scalable; components modular
- ✅ Shared logic extracted; root layout/page are lightweight (composition only)
- ✅ Server/Client component boundaries are explicit and intentional (`"use client"` only where required)

## Scope

| In Scope | Out of Scope (later phases) |
|---|---|
| Architecture review, folder refactoring | MongoDB Atlas connection & data modeling |
| Redux Toolkit, component refactoring | Route Handlers / API implementation |
| Tailwind CSS setup & design tokens | Authentication |
| Hooks, utility cleanup, type improvements | Testing, CI/CD |
| Reusable components, constants, config | Deployment, SEO/metadata strategy |
| Server/Client component boundary design | |
| Shared utilities, code cleanup | |

---

## General Rules

Before modifying any file: **read and understand the entire project** — components, services, utilities, types, assets, search logic, question rendering, category logic.

- Never make assumptions or rewrite code without understanding its purpose
- Always reuse existing logic; never introduce duplicate logic
- Default to **Server Components**; add `"use client"` only where interactivity/state/hooks require it

---

## Architecture Principles

**Clean Architecture** — one responsibility per layer: `Presentation → Business Logic → Data`

**SOLID**
| Principle | Rule |
|---|---|
| **S**ingle Responsibility | Each component does one thing. *Bad:* root layout/page owns Search, Sidebar, Questions, Toast, Filtering, Loading, Theme, Navigation. *Good:* `app/layout.tsx → Providers → Layout → QuestionList → Sidebar` |
| **O**pen/Closed | Components should be extendable without modifying existing code |
| **L**iskov Substitution | Reusable components behave consistently |
| **I**nterface Segregation | Prefer several small interfaces over one massive one (e.g. split a 50-property `QuestionData`) |
| **D**ependency Inversion | UI depends on abstractions, never directly on MongoDB Atlas / Route Handler implementation details |

**DRY** — no duplicate search implementations, category filters, or markdown renderers; use single reusable utilities.

**KISS** — if a component is hard to understand, split it.

---

## Current Project Analysis (do first)

Document before changing anything:
- Component / reusable-component / hook / utility counts
- Largest component; highest-complexity file
- Duplicated state; deeply drilled props
- Which components currently mix rendering with data-fetching/business logic (these must become Server Components + hooks, or be split)

### Root App Entry — Current Issues
Currently a single top-level component acts as Application Controller, Search Manager, Category Manager, Question Loader, Sidebar Manager, Toast Manager, State Manager, and UI Manager — violating SRP.

### Root App Entry — Target (Next.js App Router)
```
app/
  layout.tsx        → <Providers> (Redux, Theme) wrapping the whole app
  page.tsx           → composition only:
      <Layout>
        <Sidebar />
        <QuestionContainer />
        <Toast />
      </Layout>
```
Composition only — no business logic, filtering, searching, or data fetching inside `layout.tsx` / `page.tsx`.

---

## Target Folder Structure

```
src/
├── app/                # Next.js App Router — routes, layouts, loading/error states
│   ├── layout.tsx       # Root layout: Providers, global styles, fonts
│   ├── page.tsx          # Root page: composition only
│   ├── globals.css        # Tailwind directives + design tokens
│   └── (routes)/            # Future route groups/segments
├── components/
│   ├── common/       # Button, Input, Card, Badge, Loader, Skeleton, Modal, Toast, Divider, Section, Container, SearchInput
│   ├── layout/       # Navbar, Sidebar, Footer, PageContainer, Mobile/DesktopNavigation
│   └── question/     # QuestionCard, QuestionList, AnswerBlock, CategoryBadge, QuestionHeader/Footer, ExpandButton, CopyButton
├── hooks/            # useQuestions, useSearch, useCategories, useExpand, useSidebar, useTheme, useToast
├── store/            # appStore.ts, rootReducer.ts, StoreProvider.tsx (client wrapper)
├── features/         # questions/, search/, category/, theme/, ui/ (each with its own slice)
├── providers/        # ReduxProvider, ThemeProvider, etc. (all "use client")
├── contexts/
├── constants/        # routes, categories, theme, messages, api, storage
├── utils/            # copyToClipboard, formatDate, highlightText, slugify, debounce, storage
├── types/
├── config/           # env, theme, app, api
├── lib/
│   └── db/            # (placeholder for future) MongoDB Atlas client/connection helper — not wired up in Phase 01
├── styles/           # Tailwind config-adjacent styles only if needed beyond globals.css
└── assets/
```
Every folder has one clear responsibility — don't dump unrelated files into shared folders. Layout components hold no business logic; question logic stays isolated in `components/question`. Anything that will eventually talk to MongoDB Atlas belongs under `lib/db` or a future `server/` boundary — never inside components.

## Component & Hook Audit

**Per component**, determine: purpose, responsibility, dependencies, props, state, whether it's a Server or Client Component, and whether it can be reused / simplified / split. Split oversized components without changing behavior.

**Hooks** hold logic only (no rendering), are reusable/testable, each solve one problem (`useSearch()` ✅ vs `useEverything()` ❌), and are always Client-side (hooks require `"use client"` boundaries).

---

## Tailwind CSS Setup

**Objective:** Tailwind CSS becomes the single source of truth for styling — no parallel CSS Modules/styled-components system unless already present and intentionally retained.

- Configure `tailwind.config.ts` with TypeScript, project-specific design tokens (colors, spacing, typography) mapped from existing styles
- `app/globals.css` holds the three Tailwind directives plus any global resets/tokens
- Extract repeated utility-class combinations into reusable components (e.g. `Button`, `Card`) rather than duplicating class strings
- Support dark mode via Tailwind's `dark:` variant if the project currently has a theme toggle — preserve existing visual behavior exactly
- No inline styles or ad-hoc CSS where a Tailwind utility already exists
- Do not change any visual output while migrating existing styles to Tailwind — this is a like-for-like styling migration, not a redesign

---

## Redux Toolkit Architecture

**Objective:** replace shared local/prop-drilled state with Redux Toolkit as the single source of truth for shared client state, so data flow is traceable without following props across components.

**Why:** current issues are prop drilling, duplicate state, hard debugging/extension, scattered state. RTK gives centralized, predictable state; easier debugging, testing, and scaling.

**Next.js note:** Redux is client-side state. The store, `Provider`, and any component using `useSelector`/`useDispatch` must live behind a `"use client"` boundary (typically a `StoreProvider` client component wrapping children inside `app/layout.tsx`). Server Components must never import the store directly.

### State Ownership
| State type | Belongs in | Examples |
|---|---|---|
| Local | Component state | Modal open/close, input focus, dropdown visibility, tooltip state |
| Global | Redux | Questions, categories, search query, selected category, sidebar state, theme, toast, loading/error state, pagination, user preferences |
| Server-fetched | Server Component + future MongoDB Atlas query | Initial question/category data, once backend integration lands |

Never store shared business data in local state.

### Redux Folder Structure
```
store/
  appStore.ts
  rootReducer.ts
  StoreProvider.tsx     # "use client" wrapper used inside app/layout.tsx
features/
  questions/  questionSlice.ts, questionSelectors.ts, questionTypes.ts
  search/     searchSlice.ts
  category/   categorySlice.ts
  theme/      themeSlice.ts
  ui/         uiSlice.ts
hooks/
  useAppDispatch.ts
  useAppSelector.ts
```
Each feature owns its own state — avoid one massive slice.

### Store Configuration
Use `configureStore()`, enable Redux DevTools, use TypeScript, export `RootState` and `AppDispatch`, support middleware (avoid unnecessary middleware), keep it easy to extend, and wire it into the App Router via a client `StoreProvider` component.

### Slice Design
Each slice = initial state + reducers + actions + selectors + types, with no mixed concerns.
Example — `questionSlice` owns loading/updating/selecting questions and question status; it does **not** own theme, sidebar, or search UI.

### Selectors
Never access Redux state directly in components — always go through selectors.
```ts
// Bad
state.questions.questions
// Good
selectQuestions()
```
Benefits: reusable, easier to refactor, better performance, cleaner code.

### Async Logic
Use `createAsyncThunk()` for fetch/search questions and load categories, structured so the fetch layer can later be swapped for calls to Route Handlers backed by MongoDB Atlas without touching component code. Never fetch data directly inside UI components.

---

## Feature-Based Organization

Organize by feature, not file type:

❌ `components/ · hooks/ · services/` (flat, by type)
✅ `features/questions/{components,hooks,services,types,utils}` (grouped by feature)

Benefits: easier navigation, better scalability, cleaner ownership.

## TypeScript Standards

- Enable strict mode (`strict: true` in `tsconfig.json`); avoid `any`, unvalidated `unknown`, unnecessary casting
- Use interfaces, type aliases, generics, `readonly`, and utility types (`Partial`, `Pick`, `Omit`, `Record`)
- Split large models into smaller domain-specific types
- Define a `Question` / MongoDB document-shaped type now (in `types/`) even though the Atlas connection isn't implemented yet, so Phase-04 backend work can reuse it directly

## Naming & Import Conventions

| Type | Convention | Example |
|---|---|---|
| Components | PascalCase | `QuestionCard.tsx` |
| Hooks | camelCase | `useSearch.ts` |
| Utilities | camelCase | `copyToClipboard.ts` |
| Constants | camelCase file, exported constant names | `api.ts`, `routes.ts` |
| App Router files | Next.js reserved names | `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `route.ts` (future) |

**Import order:** React → Next.js → third-party libs → Redux → internal modules → components → hooks → services → utilities → types → styles. Avoid circular imports; prefer absolute imports/aliases (`@/components`, `@/hooks`, etc. via `tsconfig.json` paths).

## Component & Co-location Standards

- One responsibility, minimal props, no business logic, reusable, readable
- Target size: <~300 lines — split if larger
- Explicitly mark Client Components with `"use client"` at the top of the file; keep Server Components as the default
- Co-locate related files:
```
QuestionCard/
  QuestionCard.tsx
  QuestionCard.types.ts
  QuestionCard.test.tsx
  index.ts
```
(No separate `.styles.ts` file — styling lives inline as Tailwind utility classes, or in a small set of shared class-name constants if a pattern repeats.)

## Documentation Requirements

Each major module should document: purpose, inputs, outputs, dependencies, Server vs Client designation, usage examples (where useful), and future extension notes.

---

## Refactoring Execution Strategy

Refactor in small, verifiable steps — never in one commit.

1. Analyze the entire project
2. Refactor folder structure (App Router layout)
3. Set up Tailwind CSS and migrate existing styles 1:1
4. Implement Redux Toolkit (with client `StoreProvider`)
5. Move business logic into hooks
6. Extract reusable components
7. Improve TypeScript types
8. Move constants and configuration
9. Remove duplicated logic
10. Run validation
11. Commit changes

### Detailed Checklist

**Project Analysis** — read codebase, understand data flow, identify shared state/duplicated logic/oversized components, document decisions before changing code.

**Folder Refactoring** — create scalable App Router folders, move files into appropriate modules; don't rename unnecessarily or change imports until the new structure is ready (avoid temporary broken imports).

**Tailwind Migration** — configure `tailwind.config.ts` and `globals.css`; convert existing styles to utility classes without changing visual output; remove now-redundant legacy stylesheets once parity is confirmed.

**Redux Migration** — migrate gradually, validating after each step, in order: Questions → Categories → Search → Sidebar → Theme → Toast → Loading → future state. Ensure the store is only ever touched from Client Components.

**Hook Extraction** — move filtering, searching, sorting, expansion, sidebar, toast, and theme logic into hooks; never put UI rendering inside hooks.

**Component Refactoring** — extract reusable UI (Button, Badge, Input, Card, Search, Loader, Skeleton, Toast, QuestionHeader/Footer/Body, CategoryBadge, ExpandButton, CopyButton) as Tailwind-styled components; no duplicated JSX or class strings.

**Utility Refactoring** — centralize copyToClipboard, highlightSearch, formatText, debounce, storage, slugGenerator; never duplicate helpers.

**TypeScript Improvements** — review/split large interfaces, improve naming, remove `any`/unsafe casting/duplicate types, enable strict typing, define forward-looking `types/` for future MongoDB Atlas documents.

**Constants** — centralize routes, messages, storage keys, theme, categories, app config; avoid magic values.

**Cleanup** — remove dead code, unused imports/state/effects/functions, and duplicate components/hooks/utilities; simplify wherever possible.

---

## Validation

**Architecture** should satisfy: single responsibility, open for extension, reusable components, feature-based organization, scalable App Router folders, correct Server/Client boundaries, minimal coupling, maximum reusability, predictable state, readable code, enterprise standards.

**Code Review** — for every modified file, ask: Can another developer understand this? Is it reusable? Can logic be extracted? Is it duplicated? Can naming improve? Does it violate SOLID? Can it scale? Is the Server/Client boundary correct? Is there unnecessary complexity? Would I ship this in production? If any answer is "no," improve it.

**Performance** — no unnecessary renders, duplicated state, effects, props, or imports; keep components lightweight; avoid marking components `"use client"` unnecessarily (loses Server Component benefits).

**TypeScript** — no `any`/implicit `any`, no duplicate interfaces, no unused types, consistent naming, strict mode on.

**Styling** — no leftover non-Tailwind CSS duplicating what Tailwind already covers; no visual differences from before the migration.

**Accessibility** — semantic HTML, real button elements, proper labels, keyboard navigation, visible focus, correct heading hierarchy, ARIA where appropriate. Must never regress.

---

## Git Strategy

- Branch: `feature/phase-01-architecture` — never work directly on `main`
- Commit frequently, e.g.:
  ```
  refactor: reorganize folder structure to App Router conventions
  feat: configure Tailwind CSS and migrate styles
  feat: migrate shared state to Redux Toolkit
  refactor: extract reusable hooks
  refactor: simplify root layout/page
  refactor: create reusable Tailwind-based UI components
  refactor: improve TypeScript types
  chore: remove duplicate utilities
  ```
- Merge only after successful validation

## Rollback Strategy

If a major issue occurs: identify the failing commit, revert only the affected change (don't discard unrelated improvements), use Git history to isolate regressions, and never keep building on a broken implementation.

---

## Acceptance Criteria

Phase 01 is complete only when:
- Root `app/layout.tsx` and `app/page.tsx` contain only composition logic; no prop drilling for shared state
- Shared state uses Redux Toolkit, wired through a Client Component `StoreProvider`; folder structure is modular; components are reusable
- Tailwind CSS is fully configured and is the single styling system
- Business logic lives in hooks; utilities/constants/configuration are centralized
- TypeScript is improved; code duplication removed
- Server/Client component boundaries are explicit and correctly applied
- No UI or feature changes; build passes with no ESLint/TypeScript/runtime errors
- Folder structure anticipates MongoDB Atlas integration (`lib/db` placeholder) without implementing it

## Manual Testing Checklist

App starts (`next dev`) · questions load · categories display · category filtering works · search works · expand/collapse works · copy works · sidebar works · responsive layout works · dark mode (if present) still works via Tailwind `dark:` variant · no console errors/warnings · no broken styling · no hydration warnings from incorrect Server/Client boundaries.

## Deliverables

Scalable App Router folder structure · Tailwind CSS fully configured · Redux Toolkit configured with client `StoreProvider` · reusable hooks & UI components · improved TypeScript types · centralized constants/configuration · cleaner root layout/page and imports · reduced duplication · improved maintainability/readability · architecture prepared for MongoDB Atlas / backend integration.

## Final Validation

Build (`next build`) → lint → type-check → test every existing feature → compare UI before/after → confirm no regressions → review modified files → document architectural changes → commit → **only then** proceed to Phase 02.

---

## Antigravity AI Execution Instructions

1. Read the entire codebase before modifying anything
2. Implement tasks in the exact order described in this document
3. Do not skip validation
4. Do not introduce architectural changes outside Phase 01 scope
5. Do not implement MongoDB Atlas connections, Route Handlers, or auth in this phase — folder placeholders only
6. Do not change visual design or remove features — preserve all existing functionality (Tailwind migration must be visually identical)

**After completion, report:**
1. Files modified 2. Files created 3. Components refactored 4. Hooks created 5. Redux slices added 6. Folder structure changes (App Router) 7. Tailwind migration coverage 8. Performance improvements 9. TypeScript improvements 10. Code quality improvements 11. Recommendations for future phases (including MongoDB Atlas integration)

## Definition of Done

- Application behaves exactly as before, with a significantly cleaner, easier-to-understand Next.js App Router architecture
- Tailwind CSS is the single styling system with no visual regressions
- Shared state managed with Redux Toolkit; business logic separated from presentation
- Server/Client component boundaries are correct and intentional
- Project is ready for MongoDB Atlas / backend integration in Phase 04
- All validation checks pass

**No task in Phase 02 begins until every requirement above is completed and verified.**