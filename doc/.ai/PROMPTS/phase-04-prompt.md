# Phase 04 AI Execution Guide — Backend Development & MongoDB Integration

| Field | Value |
|---|---|
| Version | 1.0 |
| Target AI | Antigravity AI |
| Estimated Execution Time | 16–24 hours |
| Priority | ⭐⭐⭐⭐⭐ Critical |

Governing docs (in order of precedence): **`PROJECT_RULES.md`** > `Phase-04-Backend.md`. If they conflict, `PROJECT_RULES.md` wins.

---

## 1. AI Role

Act as a **Principal Software Architect / Senior Backend, Next.js (App Router), MongoDB & TypeScript Engineer / REST API & Database Architect** — not a generic code generator. Behave like the engineer responsible for a production system serving thousands of users: every decision should prioritize scalability, maintainability, security, and performance.

## 2. Project Context

- **Current:** Next.js (App Router) → JSON files
- **Target:** Next.js (App Router) → API Service Layer → Next.js Route Handlers (`app/api`) → MongoDB Atlas

**Hard rule:** the frontend must never talk to MongoDB directly — every request goes through the backend API (Next.js Route Handlers).

## 3. Objective & Goals

Replace the JSON data source with a scalable backend while preserving the existing **UI, features, routing, search, categories, and UX** exactly as they are (zero visual change — only the architecture evolves). This means:

- Remove the JSON dependency
- Build a REST API using Next.js Route Handlers (`app/api`)
- Connect MongoDB Atlas
- Implement Repository → Service → Controller layers
- Add request validation, and prepare (but don't build) authentication
- Improve security, performance, and future-proof the architecture

## 4. Golden Rules

1. Never break existing functionality, modify the UI, or remove existing features.
2. Frontend never accesses MongoDB directly.
3. Business logic lives only in Services; database logic only in Repositories.
4. Controllers stay thin; every request is validated.
5. Always use environment variables — never hardcode config.
6. Every layer has exactly one responsibility.

## 5. Before Writing Code

Do not implement anything yet. First analyze and document the existing project: JSON/question schema, category structure, search & filtering logic, client-side data-fetching architecture, API service layer, folder structure, types, utilities, and current data flow. Understand how questions load, how categories generate, and how search/filtering/data flow to components — **only then** plan the replacement.

## 6. Project Structure

Next.js App Router is full-stack, so the frontend and backend live in one app rather than a client/server monorepo. Keep them cleanly separated by folder and import discipline:

```
frontend-interview-guide/
├── app/                        # Next.js App Router — pages, layouts, UI routes (unchanged)
│   ├── (routes)/                # existing UI routes, untouched
│   └── api/                     # Route Handlers — backend REST endpoints
│       └── v1/{questions,categories,tags,search,health}/route.ts (+ [slug]/route.ts where needed)
├── src/
│   ├── components, hooks, services, store, utils, types, constants, config, assets   # unchanged client features
│   └── server/                  # backend-only code — never imported into client (`'use client'`) files
│       └── {config,controllers,middlewares,models,repositories,services,validators,utils,types}
├── shared/                      # common types shared across app/ and src/server/
├── middleware.ts                # Next.js edge middleware — logging, CORS, rate limiting, security headers
├── docs/
├── README.md
└── .gitignore
```

**Import boundary rule:** anything under `src/server/` must never be imported by a `'use client'` component — Next.js will otherwise bundle server-only/database code into the browser.

## 7. Backend Architecture

**Request flow:** Client Component → API Service → Next.js Route Handler (`app/api/.../route.ts`) → Validation Middleware → Controller → Service → Repository → MongoDB → Response. Maintain this flow consistently; never skip or reorder layers.

| Layer | Responsibility | Must NOT do |
|---|---|---|
| **Route Handler** | File-based routing, validation wiring, error handling, logging, calling the controller, shaping the response | Contain business logic |
| **Controller** | Receive request → validate → call service → return response (target <100 lines) | Contain business logic, touch MongoDB, do complex calculations |
| **Service** | Business rules, data processing, validation coordination, repository calls | Know about `NextRequest`/`NextResponse` |
| **Repository** | DB queries, aggregation, filtering, sorting, pagination, index usage | Contain business rules; be called directly by controllers |

Access chain is strict: **Controller → Service → Repository → MongoDB (via Mongoose only).** Never query MongoDB directly from a controller or service.

## 8. Database Design

**MongoDB Atlas → Mongoose → Models → Repositories.**

Collections now: `questions`, `categories`, `tags`. Planned for later phases: `users`, `bookmarks`, `progress`, `history`, `notes`, `analytics`, `roles`, `permissions`. Design every schema to be extensible.

| Schema | Fields | Planned additions |
|---|---|---|
| **Question** | `_id, title, slug, category, subCategory, difficulty, tags, question, answer, featured, order, status, isPublished, createdAt, updatedAt` | — |
| **Category** | `_id, name, slug, description, icon, order, createdAt, updatedAt` | SEO, visibility, parent category |
| **Tag** | `_id, name, slug, createdAt, updatedAt` | popularity, search weight, related tags |

**Indexes:** plan for `slug, category, difficulty, tags, featured, status`. Don't over-index — review query performance before adding more.

**Validation happens at 3 layers:** Frontend → Backend → Database. Backend validation is mandatory regardless of frontend checks.

---

## Part 1 — Deliverables

Before moving on, confirm you have: analyzed the existing app end-to-end, planned the backend architecture, designed the project/folder structure, defined the Route Handler/Repository/Service layers, and designed the MongoDB collections and schemas. **Do not start implementation until this is done.**

---

# Part 2 — Implementation

Implement one feature at a time, validating after each. Never leave the app broken, never regress, never touch the UI or remove functionality.

**Fixed order:** Next.js API Setup → Env Config → MongoDB Atlas → Models → Repositories → Services → Controllers → Route Handlers → Validation → Middleware → REST APIs → Client Integration → Search → Filtering → Sorting → Pagination. Do not reorder.

| # | Step | Key requirements |
|---|---|---|
| 1 | **Backend init** | Stack: Next.js (App Router), TypeScript, Mongoose, Zod, Pino, dotenv-based env loading (`.env.local`). Security headers (Helmet-equivalent) via `next.config.js` `headers()`; CORS and rate limiting (express-rate-limit-equivalent) via `middleware.ts`; compression handled by the Next.js/hosting platform. Enterprise project structure. |
| 2 | **Env config** | `.env.local` + `.env.example`; load/validate via `src/server/config/env.ts`; terminate startup if required vars are missing; never hardcode config. |
| 3 | **MongoDB Atlas** | Single pooled connection cached on `globalThis` (to survive Next.js dev hot-reload and serverless invocations), auto-reconnect, graceful shutdown; verify connection before serving requests. |
| 4 | **Mongoose models** | `Question`, `Category`, `Tag` — each with schema, indexes, validation, timestamps, room to extend. No duplicated schema defs. |
| 5 | **Repository layer** | `QuestionRepository`, `CategoryRepository`, `TagRepository` — queries, pagination, filtering, sorting, search, aggregation. No business rules. |
| 6 | **Service layer** | `QuestionService`, `CategoryService`, `SearchService` — business logic, validation coordination, repo calls, response mapping. No `NextRequest`/`NextResponse` objects. |
| 7 | **Controllers** | Receive → validate → call service → respond. No DB queries, no business logic, no duplication. Keep small. |
| 8 | **Route Handlers** | One file per feature under `app/api/v1/`: `questions/route.ts`, `questions/[slug]/route.ts`, `categories/route.ts`, `categories/[slug]/route.ts`, `tags/route.ts`, `search/route.ts`, `health/route.ts` (future: `user`, `auth`, `bookmark`). |
| 9 | **Validation** | Zod schemas for body, query params, route params, and headers where needed. Reject bad requests before they reach controllers. |
| 10 | **Middleware** | `requestLogger`, `validateRequest`, `errorHandler`, `notFoundHandler`, implemented via Next.js `middleware.ts` and shared Route Handler wrappers (future: `authenticate`, `authorize`, `requireAdmin`). One responsibility each. |
| 11 | **Error handling** | Centralized handling for validation/DB/unexpected errors, 404/400/500. Never leak stack traces in production; always return the standard response shape. |
| 12 | **Logging** | Structured logs for startup, DB connection, requests, response time, errors, warnings. Never log passwords, tokens, secrets, env vars, or sensitive payloads. |
| 13 | **REST API** | `GET /api/v1/questions`, `/questions/:slug`, `/categories`, `/categories/:slug`, `/tags`, `/search`, `/health` (future: POST/PATCH/DELETE). Consistent response structure. |
| 14 | **Pagination** | `page` & `limit` query params; default 20, max 100. Every list endpoint paginates — never return the full dataset. |
| 15 | **Filtering** | Composable filters: category, difficulty, tags, featured, status, published. |
| 16 | **Sorting** | Explicit sort options only: newest, oldest, alphabetical, difficulty, order. |
| 17 | **Search** | Keyword, partial-match, case-insensitive, indexed queries (future: fuzzy search). Avoid full collection scans. |
| 18 | **Client integration** | React Component → API Service → REST API (`app/api`). No component fetches directly; migrate existing JSON logic to consume the API without changing UI behavior. Use Server Components with `fetch` where appropriate, and the existing client-side service layer for client components. |
| 19 | **API response standard** | `{ success: true, message, data }` on success; `{ success: false, message, errors }` on error. Never mix formats. |
| 20 | **Code cleanup** | Remove unused imports/vars, dead code, duplicate logic/queries, and overly complex controllers/services. |

## Part 2 — Deliverables

A Next.js Route Handler backend, MongoDB Atlas connection, Mongoose models, Repository/Service/Controller/Route Handler layers, validation, middleware, REST APIs, client integration, pagination/filtering/sorting/search, logging, and centralized error handling should all be complete and working before moving to Part 3.

---

# Part 3 — Validation, Reporting & Completion

Phase 04 is **not** complete until every validation step below passes.

### Build validation
Run once for the unified Next.js app: `npm install → npm run build → npm run lint → npm run type-check`. Expect: build clean, zero TS/ESLint errors, no runtime or hydration warnings.

### Server & database validation
Next.js server starts (dev & production build), env vars load, MongoDB Atlas connects, health endpoint responds, graceful shutdown works, no startup warnings. Confirm `questions`/`categories`/`tags` collections exist, indexes are created (no duplicates), schema validation works, connection pooling is active.

### API validation
Test every endpoint (`questions`, `questions/:slug`, `categories`, `categories/:slug`, `tags`, `search`, `health`) for correct response, correct status code, standard response format, and proper handling of invalid input.

**HTTP status codes to verify:** 200, 201, 204, 400, 404, 409, 422, 500 (401/403 reserved for future auth). Never return 200 for a failed request.

### Feature validation
- **Pagination:** `page`/`limit` defaults & max, edge cases, correct totals/page counts/next-prev flags, stable ordering.
- **Filtering:** category, difficulty, tags, featured, status, published — individually and combined; accurate, no duplicates/missing records.
- **Sorting:** newest, oldest, alphabetical, difficulty, order — deterministic.
- **Search:** keyword, partial match, case-insensitive, no-result cases, large datasets — fast, accurate, indexed (no unnecessary scans).
- **Client data flow:** Component → API Service → REST API (`app/api`) → Route Handler → MongoDB → Response → Client state/UI, with no component bypassing the service layer.

### Middleware, security & performance
- Middleware fires in the correct order: request logger, validation, error handler, 404 handler (+ future auth placeholders).
- Security: security headers (Helmet-equivalent via `next.config.js`), CORS, rate limiting (via `middleware.ts`), secured env vars, no committed secrets, request size limits, active input validation, no stack traces in prod.
- Performance: review queries/indexes/pagination/search/response size & time; avoid full scans, duplicate queries, oversized payloads, unnecessary DB calls.
- Logging: contains startup/DB/requests/response time/errors/warnings; never contains passwords, tokens, secrets, connection strings, or sensitive user data.
- Error handling: simulate validation/DB/404/500/unexpected failures — responses stay friendly and consistently formatted, no internals leaked, server stays up.

### Manual testing
- **Frontend:** questions/categories load, search/filter/sort/pagination work, UI is visually unchanged.
- **Backend:** API responds correctly, DB connected, health endpoint works, logs generate, validation and error handling work.

### Code quality review
Inspect every modified file; remove unused imports/vars, dead code, duplicate services/repositories/validation, and overly complex controllers/middleware.

### Git workflow
Branch: `feature/phase-04-backend`. Commit per logical step (e.g. `feat: initialize Next.js API routes`, `feat: connect MongoDB Atlas`, `feat: implement repository layer`, `feat: implement service layer`, `feat: implement REST APIs`, `feat: integrate client API layer`, `feat: add validation middleware`, `chore: configure backend security`). Never bundle unrelated changes.

### Rollback strategy
If a regression appears: identify the offending commit → revert only that change → rebuild → retest → resume once stable. Never keep building on an unstable backend.

### Final report
Produce a report covering: Backend Summary, Files Created, Files Modified, Next.js API (route handlers/middleware/config), MongoDB (collections/indexes/schemas/relationships), Repositories (queries, pagination, filtering, sorting, search), Services (business logic, validation coordination), Controllers (endpoints, validation), REST APIs (endpoints, response format, status codes, versioning), Client Integration (API services, data fetching, JSON→API migration), Security (security headers, CORS, rate limiting, validation, env config), Performance (query optimization, indexes, response optimization, pooling), and **Remaining Recommendations** for future phases (JWT auth, RBAC, admin dashboard, Redis caching, Swagger/OpenAPI, background jobs, WebSockets — do not implement these now).

### Acceptance criteria
JSON dependency removed · MongoDB Atlas connected · Next.js Route Handler backend, Repository/Service/Controller layers, validation, middleware, and REST APIs implemented · client integration complete · pagination/filtering/sorting/search working · logging implemented · security configured · existing UI & functionality fully preserved · zero TS/ESLint/runtime errors.

### Definition of Done
Unified Next.js app builds successfully · layered architecture with Repository & Service patterns in place · MongoDB Atlas operational · API integration complete · existing functionality preserved · security validation and manual testing pass · documentation updated · project ready for Phase 05.

---

## Final AI Instructions

Optimize for long-term scalability and maintainability. Do not take shortcuts, bypass the architecture, put business logic in controllers, touch MongoDB outside the repository layer, or fetch data directly inside React components. Always preserve the existing UI and UX.

When choosing between architectural approaches, prefer the one that follows Clean Architecture and SOLID principles, keeps strict layer separation, and is the most scalable, testable, and maintainable — i.e. aligned with enterprise backend engineering standards.

**Do not proceed to Phase 05** until every validation step, acceptance criterion, and Definition-of-Done item above has passed.