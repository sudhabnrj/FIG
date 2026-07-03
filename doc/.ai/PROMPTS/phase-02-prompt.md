# Phase 02 AI Execution Guide
## Performance Optimization & Rendering Strategy

| | |
|---|---|
| **Version** | 1.1 |
| **Target AI** | Antigravity AI |
| **Estimated Execution Time** | 8–12 hours |
| **Priority** | ⭐⭐⭐⭐⭐ Critical |

---

## AI Role

You are acting as:
- Principal Frontend Architect
- Senior Next.js Engineer
- Senior Performance Engineer
- Senior TypeScript Engineer
- Software Architect
- Code Reviewer
- UI Performance Specialist

Your responsibility is to transform this project into a high-performance enterprise Next.js application. Do not behave like a simple code generator — behave like a senior engineer responsible for a production system serving thousands of users. **Every optimization must have a measurable benefit.**

---

## Project Context

Frontend Interview Guide built with: **Next.js (App Router), TypeScript, Tailwind CSS, Redux Toolkit (Phase 01)**.

Future architecture: Next.js (App Router) → Redux Toolkit → Next.js Route Handlers (API) → MongoDB Atlas → Production Infrastructure.

**Phase 02 scope is frontend performance only.**
- ❌ Do NOT implement Route Handlers or other backend features
- ❌ Do NOT modify database logic
- ❌ Do NOT change application functionality

---

## Primary Objective

Optimize the application while preserving: UI, functionality, UX, accessibility, existing features, and existing routing.

> The user should notice exactly one thing: **the application feels faster.** Nothing else should change.

---

## Performance Goals

- Reduce unnecessary rendering
- Reduce JavaScript bundle size
- Improve startup performance
- Improve search performance
- Improve scrolling performance
- Reduce memory usage
- Improve loading experience
- Prepare for 100,000+ interview questions
- Improve Core Web Vitals
- Improve Lighthouse score

**Never optimize for the sake of optimization.**

---

## Golden Rules

| # | Rule |
|---|---|
| 1 | Never break existing functionality |
| 2 | Never change UI |
| 3 | Never remove features |
| 4 | Only optimize where measurable improvements exist |
| 5 | Never overuse `React.memo` |
| 6 | Never overuse `useMemo` |
| 7 | Never overuse `useCallback` |
| 8 | Always measure before optimizing |
| 9 | Maintain readable code |
| 10 | Follow React and Next.js best practices |
| 11 | Prefer Server Components by default; keep `'use client'` boundaries as small and as deep in the tree as possible |

---

## Project Rules

Always follow `PROJECT_RULES.md` and `Phase-02-Performance.md`. If they conflict, **`PROJECT_RULES.md` takes precedence.**

---

## Before Writing Code

Do NOT start optimizing immediately — analyze the application first. Identify:

Largest components · Largest renders · Repeated rendering · Expensive calculations · Repeated filtering/searching/sorting · Large arrays · Heavy components · Large imports · Unused dependencies · Memory leaks · Repeated state updates · Large images · Blocking rendering · Bundle bottlenecks · Components unnecessarily marked `'use client'` that could be Server Components · Client bundle weight contributed by each `'use client'` boundary

**Document findings internally before changing anything.**

---

## Performance Analysis

For every page, ask:
1. How often does this render, and why?
2. Is every render necessary? Can it be reduced?
3. Can calculations move outside render?
4. Can state or props become simpler?
5. Can children be memoized, or expensive work cached?

Never optimize blindly.

---

## Component Render Audit

Inspect every major component and record:

| Field |
|---|
| Component Name |
| Purpose |
| Render Frequency |
| Render Trigger |
| Current Complexity |
| Optimization Opportunity |
| Potential Risk |

**High-priority components:** QuestionCard, QuestionList, SearchResults, CategorySidebar, SearchBar, Navigation, MarkdownRenderer, ThemeProvider

---

## React Rendering Strategy

Objective: reduce unnecessary rendering. Focus on: stable props, stable state, stable references, derived data, memoization, component isolation. Move business logic outside rendering whenever possible.

### Server vs Client Component Audit (do this first)
Before touching memoization, audit every `'use client'` boundary introduced in Phase 01:
- Does this component actually need state, hooks, event handlers, or browser APIs? If not, convert it back to a Server Component.
- Is the `'use client'` boundary as deep in the tree as possible, or is it accidentally forcing an entire subtree (including static children) into the client bundle?
- Can interactive "islands" (e.g. `SearchBar`, `ThemeToggle`, `ExpandButton`) be isolated as small client components while surrounding layout/content stays server-rendered?

Reducing the client JavaScript surface area is the single highest-leverage performance change available in a Next.js App Router project — do this before `React.memo`/`useMemo`/`useCallback` tuning, since it removes work entirely rather than caching it. `React.memo`, `useMemo`, and `useCallback` only apply within Client Components; Server Components don't re-render on the client at all.

### `React.memo` Strategy
Apply only when **all** are true: renders frequently, props usually unchanged, rendering is expensive, component appears multiple times.
- **Good candidates:** QuestionCard, CategoryItem, SearchResult, SidebarItem, Badge, NavigationItem
- **Avoid on:** tiny/static components, components with constantly changing props, simple JSX

### `useMemo` Strategy
Only for expensive computations: filtering, searching, sorting, grouping, markdown parsing, category generation, large array transforms (e.g. Questions → Filter → Sort → Search → Render).
- **Avoid on:** simple variables, primitives, static data, `items.length`, booleans, small arrays

### `useCallback` Strategy
Use when passing callbacks into memoized components (e.g. `onSearch`, `onFilter`, `onCategoryChange`, `onExpand`, `onCollapse`, `onCopy`, `onSidebarToggle`). Don't wrap every function — if memoization doesn't reduce rendering, remove it.

---

## Derived State

Never store data that can be computed.
- ❌ Bad: store "Filtered Questions" in state
- ✔ Good: `Questions → useMemo → Filtered Questions`

---

## Prop Stability

Avoid creating new references every render (e.g. `style={{}}`, `items={[]}`, `config={{}}`, `onClick={() => {}}`). Move static values outside rendering; memoize only when necessary. Stable references reduce unnecessary rendering.

---

## State Update Strategy

Review every state update:
- Can updates be combined or removed?
- Can state move closer to where it's used?
- Can derived state replace stored state?
- Can Redux selectors reduce rendering?

---

## Component Size Review

Ideal size: **under 300 lines.** If exceeded — extract smaller components, move business logic into hooks, extract utilities, reduce complexity.

---

## Deliverables (Part 1)

- ✔ Complete performance analysis & bottleneck identification
- ✔ Audit all major components, including Server vs Client Component boundaries
- ✔ Plan `React.memo` / `useMemo` / `useCallback` implementation
- ✔ Identify unnecessary renders and expensive calculations
- ✔ Prepare the application for implementation

**Do NOT begin bundle optimization or lazy loading yet.** Continue to Part 2: Lazy Loading, Dynamic Imports, Code Splitting, Suspense, Skeleton UI, Fuse.js Search, Virtualization, Pagination, Bundle Optimization, Memory Leak Prevention, implementation order.

---

# Part 2 — Performance Optimization Implementation

## Implementation Rules

Do NOT optimize everything simultaneously — one feature at a time. Validate after every optimization. Never leave the project broken; never introduce regressions.

## Implementation Order (strict — do not change)

1. Performance Analysis (including Server/Client Component boundary audit)
2. Rendering Optimization
3. `React.memo`
4. `useMemo`
5. `useCallback`
6. Lazy Loading
7. Code Splitting
8. Dynamic Imports
9. Fuse.js Search
10. Virtualization
11. Bundle Optimization
12. Memory Cleanup
13. Error Boundaries
14. Validation

---

### Step 1 — `React.memo` Implementation
Apply only where rendering is expensive, props are stable, renders frequently, and component appears multiple times (QuestionCard, CategoryItem, SidebarItem, NavigationItem, SearchResult, Badge). Avoid on small/static components, layout wrappers, simple JSX. Measure improvement before keeping it.

### Step 2 — `useMemo` Implementation
Memoize only: search, filtering, sorting, grouping, markdown processing, category generation, large array map/filter. Avoid: simple values, primitive calcs, booleans, small arrays, static constants. Always verify it reduces work.

### Step 3 — `useCallback` Implementation
Use only when the callback is passed into a memoized component, or is a dependency of another hook. Candidates: `onSearch`, `onCategoryChange`, `onExpand`, `onCollapse`, `onCopy`, `onSidebarToggle`. Don't wrap every function.

### Step 4 — Derived State Optimization
Replace stored filtered data with derived data (Questions → Filter → Sort → Search → Render). Don't store derived state unless absolutely necessary.

### Step 5 — Lazy Loading
Lazy-load anything not required on first paint using `next/dynamic` (preferred over raw `React.lazy` since it integrates with Next.js's build-time code splitting and supports `ssr: false` for client-only widgets): Settings, Markdown Renderer, Large Modals, Help/About pages, Analytics, Dev Tools.
Do NOT lazy-load: Header, Navigation, Search, Question List, or anything immediately visible. Also confirm each route segment under `app/` isn't pulling in more than it needs — Next.js already code-splits per route, so lazy loading here targets components *within* a route, not the routes themselves.

### Step 6 — `next/dynamic` / `React.lazy`
Wrap every lazy component in `Suspense` with a meaningful fallback (or use `next/dynamic`'s built-in `loading` option). Never show plain "Loading..." text — use Skeleton UI instead. For route-level loading states, prefer a route's `loading.tsx` file so the App Router streams a skeleton automatically while the segment renders on the server.

### Step 7 — Skeleton UI
Replace generic loading text with skeleton components (Question, Category, Sidebar, Search, Layout skeletons) that closely match final layout to avoid layout shift.

### Step 8 — Dynamic Imports
Dynamically import heavy libraries: Markdown, syntax highlighting, large utilities, future analytics, dev tools. Import only when needed — don't grow the first-load bundle.

### Step 9 — Bundle Splitting
Next.js already code-splits automatically by route under `app/`; verify this is actually happening (no shared chunk unexpectedly pulling in everything). Beyond that, split by feature within a route via dynamic imports: Search, Question, Markdown, Settings, Analytics, and (future) Admin bundles. Avoid one large JS bundle per route.

### Step 10 — Fuse.js Search
Replace manual search logic with Fuse.js. Configure weighted search, partial match, typo tolerance, case-insensitive search across Question, Answer, Category, Tags. Build the index once; rebuild only when data changes.

### Step 11 — Debounce Search
Never search on every keypress — debounce 250–400ms (User Types → Wait → Search → Display Results). Cancel outdated searches.

### Step 12 — Virtualization
Use `react-window` or `react-virtualized` for Question List, Search Results, and (future) Bookmarks/History. Render only visible rows.

### Step 13 — Pagination Preparation
Where virtualization isn't suitable, paginate (~20 items/page). Never render thousands of records at once.

### Step 14 — Bundle Optimization
Review every dependency: still used? replaceable by a browser API? lazy-loadable? lighter alternative? Remove unused dependencies, duplicate packages, unused utilities/assets/CSS/images.

### Step 15 — Image Optimization
Use SVG for icons. Replace raw `<img>` tags with `next/image`, which handles responsive sizing, automatic WebP/AVIF conversion, compression, and lazy-loading (except for above-the-fold images, which should use `priority`) out of the box. Avoid manually re-implementing what `next/image` already provides.

### Step 16 — Markdown Optimization
Memoize rendered output, avoid re-parsing unchanged content, lazy-load syntax highlighting, avoid repeated processing.

### Step 17 — Memory Cleanup
Every resource needs cleanup: event listeners, intervals, timeouts, animation frames, observers, AbortControllers, subscriptions.

### Step 18 — Event Optimization
Throttle: scroll, resize, mouse move, progress events. Debounce: search, text input, filtering.

### Step 19 — Error Boundaries
Wrap major sections (Question Container, Search Results, Markdown Renderer, future Dashboard) so one failure never crashes the app.

### Step 20 — Code Cleanup
Remove unused imports/variables, dead components/hooks/utilities, duplicate code/state/effects. Simplify wherever possible.

---

## Deliverables (Part 2)

- ✔ `React.memo` / `useMemo` / `useCallback` optimized
- ✔ Lazy loading, dynamic imports, code splitting completed
- ✔ Skeleton UI added
- ✔ Fuse.js integrated, search optimized
- ✔ Virtualization implemented
- ✔ Bundle optimized, memory leaks removed
- ✔ Error boundaries implemented, codebase cleaned

Continue to Part 3: Performance validation, Lighthouse, Core Web Vitals, DevTools audit, manual testing, reporting, acceptance criteria, Definition of Done, final checklist.

---

# Part 3 — Validation, Reporting & Completion

Do NOT consider Phase 02 complete until every validation step passes. **Optimization without validation is not complete.**

## Build Validation
Run `npm install` → `npm run build` → `npm run lint` → `npm run type-check` (or equivalent). Expect: build succeeds, no TS/ESLint errors, no build or runtime warnings.

## Application Validation
✔ Loads successfully · ✔ No blank screen · ✔ No hydration issues · ✔ No rendering/console errors · Application behavior unchanged.

## Performance Validation
Measure rendering speed on: Homepage, Question List, Question Details, Search, Category Page, Sidebar, Markdown Renderer, Loading States. Verify all are faster than before.

## React Performance Review
For every component: Does it still render unnecessarily? Is `React.memo` still useful? Can `useMemo`/`useCallback` be removed? Is rendering predictable? Is this component still correctly a Server Component, or was it left as `'use client'` unnecessarily? Prefer clean code over unnecessary memoization.

## Render Validation
Check Question Cards, Category List, Search Results, Navigation, Sidebar, Toast, Markdown for: smooth scrolling, no flicker/layout shift/delayed rendering/unnecessary updates.

## Search Validation
Test at 100 / 1,000 / 10,000 (simulated) questions. Verify partial match, typo tolerance, fast response, no lag or UI freezing. Fuse.js should stay responsive.

## Large List Validation
**Virtualization:** only visible rows render, smooth scrolling, stable memory, no glitches.
**Pagination:** correct page count, working navigation, no duplicate data.

## Memory Validation
Inspect heap memory, event listeners, timers, intervals, observers, detached DOM nodes. Verify no growth after repeated navigation and no listener/timer/observer leaks; AbortControllers cleaned up.

## Bundle Review
Analyze JS, CSS, fonts, images, icons, dependencies. Can bundle shrink further? Any removable dependency? Anything lazy-loadable? Document recommendations.

## Chrome DevTools Review
Use Performance, Memory, Network, Coverage tabs + React DevTools Profiler. Measure largest renders, long tasks, unused JS, blocking scripts, slow components, network waterfall. Record observations.

## Lighthouse Validation

| Category | Desktop Target | Mobile Target |
|---|---|---|
| Performance | 95+ | 90+ |
| Accessibility | 95+ | 95+ |
| Best Practices | 100 | 100 |

Record results before and after optimization.

## Core Web Vitals

| Metric | Target |
|---|---|
| LCP (Largest Contentful Paint) | < 2.5s |
| CLS (Cumulative Layout Shift) | < 0.1 |
| INP (Interaction to Next Paint) | < 200ms |

Also measure FCP, TTI, and TBT. Document all measurements.

## Accessibility Review
Performance work must NOT reduce accessibility. Verify semantic HTML, keyboard navigation, ARIA labels, focus indicators, heading structure, screen reader support, responsive layout. Must remain **WCAG AA compliant.**

## Code Quality Review
Remove unused imports/variables/hooks/components, dead code, duplicate logic/state, oversized functions/components. Simplify wherever possible.

## Manual Testing

**Desktop:** ✔ Homepage loads · ✔ Search works · ✔ Category filter works · ✔ Questions render · ✔ Expand/Collapse work · ✔ Copy works · ✔ Sidebar works · ✔ Responsive layout maintained · ✔ No console errors

**Mobile:** ✔ Responsive layout · ✔ Navigation works · ✔ Touch interactions work · ✔ Smooth scrolling · ✔ Search works · ✔ No overflow · ✔ No visual regressions

---

## Git Workflow

Branch: `feature/phase-02-performance`

Recommended commits:
```
perf: optimize rendering
perf: implement React.memo
perf: optimize search
perf: integrate Fuse.js
perf: implement lazy loading
perf: reduce bundle size
perf: cleanup memory leaks
perf: add error boundaries
```
Commit after each logical improvement. Never combine unrelated optimizations.

## Rollback Strategy

If an optimization introduces regressions: identify the affected commit → revert only that optimization → rebuild → retest → continue only once stability is restored. Never keep optimizing on top of unstable code.

---

## Final Report

Generate a report including:

1. **Performance Summary** — overall improvements
2. **Files Modified** — full list
3. **Server/Client Component Changes** — components converted back to Server Components, client bundle impact
4. **Components Optimized** — reason + optimization applied, per component
5. **`React.memo`** — components wrapped, expected rendering improvement
6. **`useMemo`** — calculations memoized, reason, expected benefit
7. **`useCallback`** — callbacks optimized, reason, expected benefit
8. **Lazy Loaded Components** — list + reason (`next/dynamic` vs `React.lazy`)
9. **Bundle Optimization** — dependencies removed, bundle reduction, dynamic imports, route/code splitting
10. **Search Optimization** — Fuse.js integration, debounce, indexing, expected performance
11. **Memory Improvements** — cleanup added, leaks removed, AbortControllers, event cleanup
12. **Lighthouse Results** — before/after comparison
13. **Future Recommendations** (do NOT implement now) — e.g. server-side caching via Route Handlers, Redis, CDN, `next/image` fine-tuning, API caching

---

## Acceptance Criteria

Phase 02 is complete only when:

✔ No unnecessary re-renders · ✔ Server/Client Component boundaries minimized and correct · ✔ `React.memo`/`useMemo`/`useCallback` used appropriately · ✔ Lazy loading, code splitting, dynamic imports implemented · ✔ Skeleton loading implemented · ✔ Fuse.js integrated and search optimized · ✔ Bundle size reduced · ✔ Memory leaks eliminated · ✔ Error boundaries implemented · ✔ Lighthouse score and Core Web Vitals improved · ✔ Existing UI and functionality preserved · ✔ No TypeScript, ESLint, or runtime errors

## Definition of Done

✔ Build succeeds and app runs correctly · ✔ Performance metrics, search speed, rendering efficiency, bundle size, and memory usage all improved · ✔ Accessibility maintained · ✔ Existing functionality preserved · ✔ Code follows project standards · ✔ Documentation updated · ✔ Project ready for Phase 03

---

## Final AI Instructions

You are optimizing for measurable performance improvements.

- Do NOT optimize blindly, add unnecessary abstractions, sacrifice readability for micro-optimizations, or change business logic/UI.
- Always validate each optimization before proceeding.
- Prefer removing client-side work entirely (via Server Components) over caching it with memoization whenever both are viable.
- When multiple strategies are available, choose the one with the highest measurable gain, lowest maintenance cost, best scalability, best readability, and strongest alignment with enterprise Next.js architecture.

**Do not proceed to Phase 03 until every validation step, acceptance criterion, and Definition of Done above has been successfully completed.**