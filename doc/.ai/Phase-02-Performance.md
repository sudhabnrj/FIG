# Phase 02 — Performance Optimization & Rendering Strategy

| | |
|---|---|
| **Version** | 1.1 |
| **Status** | Planned |
| **Estimated Time** | 8–10 hours |
| **Priority** | ⭐⭐⭐⭐⭐ Critical |
| **Stack** | Next.js (App Router) · TypeScript · Tailwind CSS · MongoDB Atlas |

---

## Objective

Improve application performance **without changing existing functionality or UI**. Focus: faster rendering, smaller client bundles, better use of Server Components, better search/memory performance, better UX and scalability.

Must prepare the app to handle: 100,000+ interview questions, thousands of concurrent users, future MongoDB Atlas-backed data fetching, large search results, heavy UI components.

**Out of scope:** MongoDB Atlas connection/queries, Route Handler implementation, authentication work.

## Goals

Reduce unnecessary renders · maximize use of Server Components to shrink client JS · improve rendering, bundle loading, and component performance · optimize search and memory usage · optimize loading experience with Suspense/streaming · reduce client-side JS bundle size · prepare for large datasets · improve Core Web Vitals.

## Success Criteria

No unnecessary re-renders · faster startup · smaller client bundle (client-only code minimized in favor of Server Components) · improved search performance · lazy loading & code splitting implemented (`next/dynamic`) · components optimized · better loading experience via `loading.tsx`/Suspense & Lighthouse score · **UI and functionality unchanged**.

## Scope

| In Scope | Out of Scope (later phases) |
|---|---|
| React.memo, useMemo, useCallback | MongoDB Atlas connection & queries |
| Server vs Client Component boundary optimization | Redux refactoring |
| `next/dynamic`, code splitting, Suspense/`loading.tsx` | Route Handler implementation |
| Skeleton UI, streaming | Authentication |
| `next/image`, `next/font` optimization | Testing, CI/CD |
| Performance profiling & monitoring prep | |
| Rendering, search, bundle, memory optimization | |
| Error boundaries (`error.tsx`) | |

---

## Performance Philosophy

Never sacrifice readability for performance: **Readable → Maintainable → Optimized**. Avoid premature optimization — only optimize where measurable improvement exists. In the App Router, the single biggest performance lever is **shipping less client JavaScript** by keeping components as Server Components wherever possible, before reaching for React-level memoization tricks.

## Performance Analysis (do first)

Before changing anything, analyze and document: startup time, largest components/renders, which components are unnecessarily marked `"use client"`, duplicate rendering, repeated calculations, large arrays, expensive filter/search/sort operations, heavy loops, unnecessary state updates, large imports, unused dependencies.

---

## Server vs Client Rendering Strategy

For every component, ask first: **Does this need to be a Client Component at all?** Only mark `"use client"` if it uses hooks, browser APIs, event handlers, or Redux. Everything else should default to a Server Component to avoid shipping it to the browser.

Then, for remaining Client Components, ask: Does it re-render unnecessarily? Can rendering be memoized? Can expensive calculations be cached? Can logic move outside render? Can state/props be simplified? Can children be memoized? **Measure first — never optimize blindly.**

**Component Rendering Audit** — for each component, document: Server or Client, render frequency, why it renders, what triggers it, whether rendering is necessary, whether memoization helps.

### React.memo
Use only when a Client Component receives identical props frequently, renders expensive UI, or appears many times (e.g. `QuestionCard`, `CategoryItem`, `SidebarItem`, `Badge`, `SearchResult`, `NavigationItem`). Don't memoize small components, simple JSX, or components that always get new props — memoization itself has a cost.

### useMemo
Use for filtering, searching, sorting, grouping, large array ops, markdown processing, category generation (e.g. the Questions → Filter → Sort → Search → Display pipeline) — these shouldn't re-run every render.
Avoid for simple/primitive values, small arrays, static values (e.g. `items.length` needs no `useMemo`).

### useCallback
Use for event handlers passed into memoized Client Components (`onSearch`, `onCategoryChange`, `onExpand`, `onCopy`, `onSidebarToggle`). Don't wrap every function — only where necessary.

### Preventing Re-renders
Common causes: state updates, parent renders, new object/array references, inline functions/objects/arrays.
```tsx
// Bad — new object every render
<QuestionCard style={{}} />
// Good — move static objects outside render, or use Tailwind classes instead of style objects
```

### Derived State
Don't store what can be computed. Bad: filtered questions stored in state. Good: computed via `useMemo`. Reduces sync issues.

### Other Rendering Rules
- **Large lists:** don't render hundreds of cards at once — prepare for virtualization/pagination/infinite scroll (see below)
- **State updates:** avoid firing multiple `setX()` calls for one logical update; batch related updates
- **Component trees:** prefer small reusable components; flatten unnecessary nesting; avoid value-less wrapper components; push leaf-level presentational pieces down to Server Components where they don't need interactivity

---

## Large Dataset Optimization

App must support 100,000+ questions, thousands of categories, large search results, future MongoDB Atlas-backed user data/analytics. **Never render every record simultaneously** — choose a strategy per use case:

| Strategy | How | Best for | Benefits |
|---|---|---|---|
| **Virtualization** (recommended) | Render only visible elements (`react-window`, `react-virtualized`) inside a Client Component | Question lists, search results, category lists, bookmarks, history | Extremely fast, low memory, scales to thousands |
| **Pagination** | Fixed-size pages (e.g. 20 questions → next page), ideally driven by Server Components / future Route Handlers + MongoDB Atlas `skip`/`limit` queries | Category pages, future API responses, admin dashboard | Smaller payload, easier backend support, better SEO (App Router pages are server-rendered by default) |
| **Infinite Scroll** | Load more on scroll | Feed-style pages, recommendations, recent questions | — but avoid where users need predictable navigation |

**Recommendation for this project:** Search Results → Virtualization · Category Pages → Pagination · Future Dashboard → Pagination · Bookmarks → Virtualization

---

## Search Performance

Search is one of the most expensive operations — current implementation likely re-searches everything on every keystroke, which doesn't scale. Search/filter logic stays client-side in this phase (in-memory dataset); a future phase may move heavy search to MongoDB Atlas (e.g. Atlas Search).

**Fuse.js** — replace manual string matching for fuzzy search, typo tolerance, partial matching, weighted results (e.g. "usmem" → `useMemo`, "react mem" → React Memo). Runs inside a Client Component.

**Search Indexing** — build the index once, reuse it, rebuild only when question data changes (faster search, lower CPU, better scalability).

**Debouncing** — debounce search input 250–400ms (User types → wait → search → render) so searches don't fire on every keypress.

**Throttling** — throttle continuous events (scroll, resize, mouse move, progress tracking) for lower CPU usage and a smoother UI.

---

## Bundle & Dependency Optimization

**Server Components first** — the most effective "code splitting" in the App Router is simply not sending server-only logic (data shaping, markdown parsing where possible, static content) to the client at all.

**Dynamic Imports / Code Splitting** — use `next/dynamic` (not `React.lazy`) for large modules (markdown renderer, syntax highlighter, heavy utilities, Sidebar, Settings, large modals) so they aren't loaded upfront. Next.js already code-splits per route automatically; use `next/dynamic` for large components *within* a route that aren't needed immediately.

**Lazy Loading** — use `next/dynamic(() => import(...), { ssr: false })` only when a component truly requires browser-only APIs; otherwise prefer server rendering. Wrap client-heavy sections in `<Suspense>` with a skeleton fallback, and use route-level `loading.tsx` for page-level loading states.

**Suspense fallbacks** — every dynamically-loaded or streamed component needs a fallback; use skeleton loaders (not generic "Loading...") matching the real layout to avoid layout shift.

**Tree Shaking / Selective Imports** — avoid pulling in entire utility/icon libraries for one function/icon; use selective imports.

**Dependency Audit** — for each dependency ask: still used? replaceable with a native API or lighter alternative? significant bundle impact? Remove unused ones.

**Image Optimization** — use `next/image` for automatic resizing, lazy loading, and modern formats (WebP/AVIF); SVG for icons; compress remaining static assets; never oversized assets.

**Font Optimization** — use `next/font` to self-host and preload fonts, avoiding layout shift and extra network requests to third-party font hosts.

**Markdown Performance** — memoize rendered output, avoid re-parsing unchanged content, lazy-load syntax highlighting if needed, and prefer rendering static markdown on the server where it doesn't need client interactivity.

---

## Memory Optimization

Review objects, arrays, maps, sets, timers, listeners, promises for proper cleanup — this applies to Client Components only (Server Components have no client-side lifecycle to leak).

**Always clean up:** event listeners, timers/intervals, subscriptions, observers (Intersection/Mutation), AbortControllers — every listener needs a matching cleanup; every `setTimeout`/`setInterval`/`requestAnimationFrame`/worker needs teardown in an effect's cleanup function. Uncleaned resources cause memory leaks.

**Abort unused requests** — when future MongoDB Atlas-backed APIs are introduced, cancel outdated requests (e.g. new search begins → old request aborted) to prevent race conditions.

---

## Target Metrics

**Core Web Vitals:** LCP < 2.5s · CLS < 0.1 · INP < 200ms — measure after every major optimization.

**Lighthouse Targets**
| | Desktop | Mobile |
|---|---|---|
| Performance | 95+ | 90+ |
| Accessibility | 95+ | 95+ |
| Best Practices | 100 | 100 |
| SEO | 95+ | 90+ |

Next.js App Router server-renders pages by default, so SEO scoring is meaningful starting this phase (unlike a pure client-rendered SPA) — verify metadata, semantic HTML, and server-rendered content contribute correctly.

**Performance Monitoring (prep only)** — architecture should support future tools: Lighthouse, Chrome DevTools, React DevTools Profiler, Next.js built-in Web Vitals reporting (`useReportWebVitals` / `next/web-vitals`), Sentry Performance, OpenTelemetry. Collect metrics before/after major optimizations.

---

## Validation & Audit

**Performance Audit Checklist** — for every page/major component: Is it a Server Component where it could be? Does it re-render unnecessarily? Can this computation be memoized? Can this be lazy-loaded via `next/dynamic`? Is this dependency required? Can the bundle shrink? Is memory cleaned up? Is rendering predictable? Does it scale to 100,000+ records? Document every finding.

**React Performance Review** — components render only when required; unnecessary Client Component boundaries removed; memoization applied only where beneficial (no unnecessary `useMemo`/`useCallback`/`React.memo`); no duplicated calculations; no stored derived state; business logic separated from UI.

**Bundle Review** — review JS, CSS, images, icons, fonts, dependencies (use `next build` output / bundle analyzer). Which file is largest? Splittable? Lazy-loadable? Convertible to a Server Component? Unused code removable? Document recommendations.

**Search Performance** — validate speed stays fast at 100 / 1,000 / 10,000 questions; supports fuzzy search, partial matching, typo tolerance; no noticeable lag.

**Rendering Validation** — test question list, category list, search results, sidebar, navigation, cards for smooth scrolling, no flicker, no layout shift, no visible delay.

**Memory Validation** — monitor browser memory, heap size, listeners, timers, detached DOM nodes, repeated requests. Confirm no growth after repeated navigation and no listener/timer/observer leaks.

**Suspense Validation** — every dynamically-loaded component and route (`loading.tsx`) shows a skeleton or meaningful loading UI; never a blank screen.

**Loading Experience** — replace "Loading..." text with skeleton UI matching final layout (no layout shift) for better perceived performance, using route-level `loading.tsx` where appropriate.

**Error Boundary Validation** — implement `error.tsx` boundaries at appropriate route segments; simulate component failures; app keeps running, user sees fallback UI, console has useful debug info; one component failing should never crash the whole app.

**Accessibility** — confirm keyboard navigation, ARIA labels, focus visibility, screen readers, semantic HTML all remain intact after optimization.

**Chrome DevTools Audit** — review Performance, Memory, Network, Coverage tabs and React Profiler; measure largest renders, slow components, unused JS, long tasks, blocking scripts. Record observations.

**Metrics to record before/after:** FCP, LCP, INP, CLS, TTI, TBT.

**Regression Testing** — re-verify question search, category filter, expand/collapse, copy button, sidebar, navigation, responsive layout, and Tailwind styling all behave exactly as before — performance improves, behavior doesn't change.

### Manual Testing Checklist
**Desktop:** homepage loads · search works · questions render · expand/collapse works · copy works · sidebar works · responsive layout preserved · no console errors/warnings · no hydration mismatch warnings.
**Mobile:** layout responsive · navigation usable · search usable · touch interactions work · no overflow issues · smooth scrolling.

---

## Acceptance Criteria

Phase 02 is complete only when:
- No unnecessary re-renders; large calculations memoized
- Client Component usage minimized in favor of Server Components wherever possible
- Bundle size reduced; lazy loading via `next/dynamic` and code splitting implemented
- Search optimized with Fuse.js integrated
- Skeleton loading and Suspense/`loading.tsx` implemented
- Images use `next/image`, fonts use `next/font`
- Memory leaks eliminated; `error.tsx` error boundaries implemented
- Lighthouse scores improved (including SEO)
- Existing functionality and UI unchanged
- No TypeScript / ESLint / runtime errors

## Git Workflow

- Branch: `feature/phase-02-performance`
- Commit frequently, never combine unrelated changes, e.g.:
  ```
  perf: convert eligible components to Server Components
  perf: optimize React rendering
  perf: implement next/dynamic lazy loading
  perf: integrate Fuse.js search
  perf: add skeleton loading and loading.tsx
  perf: adopt next/image and next/font
  perf: reduce client bundle size
  perf: optimize large list rendering
  perf: cleanup memory leaks
  ```

## Rollback Strategy

If an optimization causes regressions: identify the affected commit, revert only that optimization, retest. Never keep optimizing on top of broken functionality.

## Deliverables

Server/Client Component boundary optimization · React.memo/useMemo/useCallback where appropriate · `next/dynamic` lazy loading and code splitting · skeleton UI, Suspense, and `loading.tsx` · `error.tsx` error boundaries · Fuse.js search optimization · `next/image`/`next/font` adoption · memory/event/timer cleanup · optimized client bundle · improved Core Web Vitals & Lighthouse score (including SEO) · improved UX · enterprise-grade performance architecture ready for MongoDB Atlas integration.

---

## Antigravity AI Execution Instructions

1. Read the entire codebase before making changes
2. Optimize only where measurable benefits exist — do not overuse memoization or add unnecessary complexity
3. Do not change UI, remove features, or modify business logic
4. Do not implement MongoDB Atlas connections or Route Handlers in this phase
5. Optimize incrementally; validate after every optimization

**After completion, report:**
1. Files modified 2. Components optimized 3. Components converted from Client to Server 4. Hooks updated 5. Memoized components 6. `useMemo` implementations 7. `useCallback` implementations 8. `next/dynamic`-loaded components 9. Bundle size improvements 10. Search performance improvements 11. Lighthouse improvements 12. Memory optimizations 13. Remaining performance recommendations

## Definition of Done

- Application behaves exactly as before, with more efficient rendering, minimized client JS via Server Components, faster search, reduced bundle size, improved memory usage, and scalable large-list handling
- No regressions; performance metrics improve measurably
- Project is ready for MongoDB Atlas / backend integration in Phase 04
- All validation checks pass

## Exit Criteria

Do **not** proceed to Phase 03 until: performance validation passes · manual testing passes · Lighthouse audit completed (including SEO) · build/TypeScript/ESLint all pass · existing features fully functional · Git commit created.

Only then begin **Phase-03-Security.md**.