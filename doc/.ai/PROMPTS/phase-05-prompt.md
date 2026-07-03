# Phase 05 AI Execution Guide — Production Readiness, Testing & Deployment

| Field | Value |
|---|---|
| Version | 1.0 |
| Target AI | Antigravity AI |
| Estimated Execution Time | 10–14 hours |
| Priority | ⭐⭐⭐⭐⭐ Critical |

Governing docs (in order of precedence): **`PROJECT_RULES.md`** > `Phase-05-Production.md`. If they conflict, `PROJECT_RULES.md` wins.

---

## 1. AI Role

Act as a **Principal Software Architect / Senior DevOps, QA, Next.js & TypeScript Engineer / CI-CD Engineer / SRE** — not a generic code generator. Behave like the engineer taking this software to real-world production: every change must prioritize reliability, maintainability, observability, and stability.

## 2. Project Context

- **Current:** Next.js (App Router) → Redux Toolkit → Route Handlers (API Layer) → MongoDB Atlas
- **Target:** Client (Next.js App Router, TypeScript, Tailwind CSS) → Redux Toolkit → Next.js Route Handlers (API Layer) → MongoDB Atlas → Monitoring → Logging → Analytics → Production Deployment

Phase 05 is **only** about production readiness — do not redesign the architecture or add new features.

## 3. Objective & Goals

Prepare the app for production while fully preserving the existing **UI, features, UX, performance, security, and accessibility.** The application should come out of this phase **reliable, stable, deployable, observable, recoverable, and maintainable.** Concretely:

- Implement automated testing (unit, integration, API, E2E, regression)
- Stand up CI/CD and an automated deployment pipeline
- Improve monitoring, logging, analytics, and documentation
- Complete a full production readiness checklist

## 4. Golden Rules

1. Never break existing functionality, change the UI, or remove features.
2. Every production change must be testable; every deployment repeatable; every failure observable; every release reversible.
3. Never expose secrets; never skip validation.
4. Production quality is mandatory, not optional.

## 5. Before Writing Code — Production Analysis

Do not implement anything yet. First analyze: testing setup, CI configuration, deployment configuration, environment variables, documentation, logging, monitoring, build process, dependencies, scripts, GitHub Actions, and package configuration. Identify missing tests/workflows, deployment blockers, production risks, and technical debt.

Then answer honestly, and document every risk found:
- Can this be deployed today? Would failures be detected? Can the app recover?
- Is monitoring sufficient? Is documentation complete? Are releases repeatable? Are tests reliable?

## 6. Testing Strategy

Follow the **Testing Pyramid** — mostly unit tests, some integration tests, and E2E reserved only for critical user journeys.

**Stack:** Vitest, React Testing Library, Mock Service Worker (MSW), Playwright — configured for Next.js App Router (`next/jest` or Vitest's Next.js-aware config, Server/Client Component test boundaries). Tests must be deterministic — avoid slow or flaky tests.

| Test type | Scope | Verify |
|---|---|---|
| **Unit** | Utilities, hooks, reducers, selectors, services, validators, components | Predictable, isolated outputs |
| **Component** | `Button, Card, Input, Search, QuestionCard, Sidebar, Toast, ThemeToggle` | Rendering, props, events, accessibility, edge cases, loading/error states |
| **Hooks** | `useQuestions, useSearch, useCategory, useSidebar, useTheme` | Returned values, state updates, cleanup, error handling, dependencies — not implementation details |
| **Redux** | Reducers, selectors, slices, async thunks | Loading/success/error states, predictable transitions |
| **Utilities** | Search, sorting, filtering, debounce, clipboard, formatting, slugify, storage | Deterministic behavior |
| **Integration** | Full workflows: Search→Redux→API→UI, Questions→API→Redux→Components | Every layer communicates correctly |
| **API** | Every Next.js Route Handler (`app/api/**/route.ts`) | Requests, responses, validation, status codes, pagination, filtering, sorting, search, error handling — no endpoint left untested |
| **Backend integration** | MongoDB Atlas, repositories/services, Route Handlers, `middleware.ts`, validation, logging, health endpoint | All layers function together |
| **E2E (Playwright)** | Critical journey: open site → search question → open question → expand answer → copy answer → filter category → navigate → responsive layout → theme switch → no errors | Journey completes successfully end-to-end |
| **Regression** | Search, categories, copy, sidebar, filtering, sorting, pagination, theme, responsive layout | No functionality from prior phases breaks |

**Minimum coverage:** Utilities & critical APIs 100% · Hooks, Redux, Backend 90% · Components 80%. Coverage supports quality, it doesn't replace thoughtful test design.

**Fixtures:** keep reusable, production-separate test data under `test/fixtures/` (`questions.ts`, `categories.ts`, `users.ts`).

**Build validation:** verify dev build, prod build, TypeScript, ESLint, env vars, and dependencies — no warnings before release.

---

## Part 1 — Deliverables

Before moving on, confirm you have: reviewed production readiness, defined the testing strategy, planned unit/integration/API/E2E testing, reviewed the build process, and documented every production blocker. **Do not begin deployment implementation yet.**

---

# Part 2 — CI/CD, Deployment & Production Infrastructure

Implement one production improvement at a time, validating after each. Never leave the project broken, never deploy untested code, never regress.

**Fixed order:** CI/CD Setup → GitHub Actions → Branch Strategy → Deployment → Environment Config → Monitoring → Logging → Analytics → Caching → Backup Strategy → Disaster Recovery → Validation. Do not reorder.

| # | Step | Key requirements |
|---|---|---|
| 1 | **GitHub Actions** | `.github/workflows/{build,test,deploy,security}.yml` — one responsibility per workflow. |
| 2 | **Continuous Integration** | Pipeline: checkout → install deps → restore cache → type-check → ESLint → unit tests → production build → success → merge. Never merge failing code. |
| 3 | **Continuous Deployment** | Push → GitHub Actions → build → test → deploy → production. Manual deploys reserved for emergencies only. |
| 4 | **Branch strategy** | `main`, `develop`, `feature/*`, `bugfix/*`, `hotfix/*`. No direct commits to `main`; all merges via PR; every PR must pass CI. |
| 5 | **Code review standards** | Check architecture compliance, readability, no duplicate/dead code, no security issues, tests included, no console logs or unused imports. Reject anything below standard. |
| 6 | **Application deployment** | Vercel (unified Next.js App Router deployment — frontend + API Route Handlers as serverless/edge functions). Verify production build, HTTPS, custom domain, env vars, caching, compression, static assets, source maps — zero warnings. |
| 7 | **API layer (serverless) hardening** | Verify Route Handlers, MongoDB Atlas connection pooling (reused across invocations, no connection-per-request leaks), env vars, health endpoint, timeouts, security headers (via `next.config.js` / `middleware.ts`), CORS (if consumed externally), rate limiting, error handling — clean cold-start and recovery behavior. |
| 8 | **Environment management** | Independent config/credentials/env vars per environment (dev, test, staging, prod). Never reuse production secrets. |
| 9 | **Environment variables** | Client-exposed: `NEXT_PUBLIC_APP_NAME, NEXT_PUBLIC_ENVIRONMENT`. Server-only: `MONGODB_URI, NODE_ENV, LOG_LEVEL` (future: `JWT_SECRET, REFRESH_SECRET, NEXTAUTH_SECRET`). Never prefix secrets with `NEXT_PUBLIC_`; never commit `.env`; always provide `.env.example`. |
| 10 | **Build optimization** | Verify tree shaking, minification, compression, code splitting, lazy loading, bundle analysis — trim unnecessary JS. |
| 11 | **Browser caching** | Configure Cache-Control, ETag, immutable assets for fonts/images/JS/CSS. Don't aggressively cache API responses unless explicitly configured. |
| 12 | **Monitoring** | Sentry, LogRocket, or Azure App Insights (future: OpenTelemetry). Monitor app/React/API errors, unhandled exceptions, performance. |
| 13 | **Logging** | Structured logs for app/server startup, DB connection, requests, response time, warnings, errors. Never log passwords, tokens, secrets, env vars, or sensitive user data. |
| 14 | **Health endpoint** | `GET /api/v1/health` (Route Handler at `app/api/v1/health/route.ts`) returns server status, DB status, version, environment, timestamp. Keep it lightweight. |
| 15 | **Analytics** | Google Analytics 4 or PostHog. Track question views, category usage, search queries, reading time, popular topics, session duration. No PII without explicit requirement. |
| 16 | **Performance monitoring** | Track Core Web Vitals (LCP, INP, CLS), API/DB latency, memory & CPU usage — continuously. |
| 17 | **Backup strategy** | Daily backup → weekly snapshot → monthly archive. Document and periodically verify restoration procedures. |
| 18 | **Disaster recovery** | Document recovery procedures for server/DB/deployment failure, rollback, credential rotation, environment recovery. Keep current. |
| 19 | **Security monitoring** | Watch failed requests, unexpected errors, suspicious traffic, high request volume, repeated 404s (future: auth failures). Review dashboards regularly. |
| 20 | **Production cleanup** | Remove temp files, unused scripts/env vars, dead docs, duplicate config, debug utilities, unused assets. Leave the repo production-ready. |

## Part 2 — Deliverables

GitHub Actions, CI and CD pipelines, deployment strategy (Vercel — unified Next.js frontend + API Route Handlers), environment management, monitoring, structured logging, analytics, performance monitoring, backup strategy, disaster recovery, and a cleaned production-ready repo should all be complete before moving to Part 3.

---

# Part 3 — Production Validation, Release & Completion

Phase 05 is **not** complete until every validation step below passes.

### Build & test validation
Run for the unified Next.js application: `npm install → npm run build → npm run lint → npm run type-check`. Expect a clean production build (including all Route Handlers), zero TS/ESLint errors, no warnings.
Then run: Unit → Integration → API → E2E → Regression tests. Expect all passing, no flaky tests, stable results, existing functionality preserved.

### CI/CD & deployment validation
GitHub Actions runs automatically; build, test, deployment, and security workflows all succeed; dependency audit completes; every PR passes all workflows.

- **Frontend:** production URL accessible, HTTPS enabled, custom domain configured, assets served correctly, caching configured, env vars loaded.
- **API (Route Handlers):** API accessible, health endpoint operational, MongoDB Atlas connected (pooled connections across serverless invocations), logging enabled, graceful error handling working. No deployment warnings.

### Staging → production
Deploy to staging first; verify UI, Route Handlers, database, API responses, search, pagination, filtering, sorting, theme, responsive layout. **Only promote to production after staging passes.**

**Immediately post-deployment**, verify: app loads, API Route Handlers healthy, DB connected, search/categories/questions operational, API latency acceptable, no console/server errors, monitoring active, logs healthy.

**Production smoke test** — run the critical journey end to end: homepage → search question → open question → expand answer → copy answer → filter category → navigate → switch theme → responsive layout → no errors.

### Accessibility, security & performance
- **Accessibility:** semantic HTML, keyboard navigation, focus indicators, ARIA labels, heading structure, screen reader support, responsive layout, contrast ratio — target **WCAG 2.1 AA**, no regressions.
- **Security:** no exposed secrets, no unsafe HTML, no console errors, no sensitive logs, no insecure dependencies, env vars secured, production config verified, final dependency audit run.
- **Performance:** review lazy loading, code splitting, bundle size, memoization, Core Web Vitals (LCP/INP/CLS), API response time, DB query performance — no unnecessary rendering left.
- **Monitoring:** confirm it captures app/backend/DB errors, API latency, CPU/memory usage, request volume, unhandled exceptions, and that alerting works.

### Documentation, versioning & release
- **Docs review:** `README.md`, `PROJECT_RULES.md`, architecture docs, API docs, database docs, deployment guide, environment guide, contribution guide, release notes, `CHANGELOG.md` — all must reflect the current implementation.
- **Versioning:** Semantic Versioning (`MAJOR.MINOR.PATCH` — breaking / features / fixes). Bump before release.
- **Changelog:** update `CHANGELOG.md` with Added / Changed / Fixed / Removed / Deprecated / Security for every release.
- **Release process (no skipped steps):** merge approved PRs → run CI → run tests → build production → deploy to staging → manual QA → performance audit → security review → accessibility review → production deployment → post-deployment validation.
- **Git release workflow:** branch `release/v1.0.0` → validate → tag (`v1.0.0`) → push tags → merge only after successful validation.
- **Rollback plan:** on deployment failure — stop deployment → roll back to previous version → verify stability → investigate → prepare hotfix. Every deployment must be reversible.

### Code quality review
Inspect every modified file; remove unused imports/vars, dead code, duplicate logic, temporary debug code, unused scripts, and dev-only configuration. Repository stays clean.

### Final report
Produce a report covering: Production Summary, Files Created, Files Modified, Testing (unit/integration/API/E2E, coverage, results), CI/CD (GitHub Actions, pipeline config, automation, deployment workflow), Deployment (frontend/backend deployment, environment config, production URLs), Monitoring (logging, monitoring, health checks, analytics, performance monitoring), Documentation (README, API/DB docs, deployment & environment guides, release notes), Performance Improvements (bundle optimization, loading, caching, Core Web Vitals), Security Improvements (dependency audit, configuration, env vars, monitoring, logging), and **Remaining Recommendations** for future phases (Redis, CDN, horizontal scaling, Docker, Kubernetes, WebSockets, microservices, AI features — do not implement these now).

### Acceptance criteria
Application builds successfully · all tests pass · CI/CD operational · deployment succeeds · monitoring and logging configured · documentation complete · security, accessibility, and performance reviews completed · production checklist completed · existing functionality preserved · zero TS/ESLint/runtime errors.

### Definition of Done
Next.js app (client + API Route Handlers) production-ready · MongoDB Atlas operational · automated testing implemented · CI/CD pipeline operational · deployment automated · monitoring and logging enabled · documentation complete · security, accessibility, and performance validated · release process documented · Git release created · project ready for enterprise production.

---

## Final AI Instructions

You are preparing this application for enterprise production deployment. Do not introduce unnecessary architectural changes, redesign the app, change the UI, remove functionality, or skip testing. Every change must improve reliability, maintainability, observability, scalability, and recoverability.

When choosing between production strategies, prefer the one that follows modern DevOps practices, supports automated deployment, maximizes stability, preserves existing functionality, and aligns with enterprise engineering standards.

Do not consider this project complete until every validation step, acceptance criterion, and Definition-of-Done item above has passed.

---

## Project Completion (All 5 Phases)

After completing all five phases, the project should have: an enterprise Next.js (App Router) architecture in TypeScript with Redux Toolkit and Tailwind CSS, a Next.js Route Handler API layer on MongoDB Atlas with a layered (Repository + Service) architecture and RESTful endpoints, secure configuration, production logging/monitoring/analytics, automated testing, GitHub Actions CI/CD with automated deployment, WCAG 2.1 AA accessibility compliance, performance optimization, comprehensive documentation, and a documented release process — ready for real-world deployment and enterprise-scale growth.