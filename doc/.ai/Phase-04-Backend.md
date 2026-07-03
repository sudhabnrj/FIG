# Phase 04 — Backend Development & MongoDB Integration

| | |
|---|---|
| **Version** | 1.0 |
| **Status** | Planned |
| **Estimated Time** | 16–24 hours |
| **Priority** | ⭐⭐⭐⭐⭐ Critical |

---

## Objective

Transform the app from a static frontend (JSON-file-based) into a full-stack platform, using Next.js's App Router as both frontend and backend:
```
Next.js (App Router, Client Components) → Redux Toolkit → API Service → Next.js Route Handlers (Route.ts) → MongoDB Atlas
```
The frontend must never talk to MongoDB directly — every request goes through the backend API, implemented as Next.js Route Handlers.

## Goals

Remove JSON dependency · build the Next.js Route Handler backend · connect MongoDB Atlas · create REST APIs · implement service & repository layers · improve scalability, security, and performance · prepare for authentication · future-proof the architecture.

## Success Criteria

JSON file removed · MongoDB Atlas connected · REST API working · Redux fetching from backend · API error handling implemented · pagination, filtering, search, sorting all supported · TypeScript maintained · **existing UI and functionality unchanged**.

## Scope

| In Scope | Excluded (later phases) |
|---|---|
| Next.js Route Handlers, MongoDB Atlas, Mongoose | Authentication, Authorization |
| REST API, controllers/handlers, services, repository layer | Payments, Notifications |
| Validation, middleware, error handling | Admin Dashboard, Analytics |
| Redux API integration, pagination/filtering/search/sorting | CI/CD, Testing, Deployment |
| Environment variables, logging | |

---

## Architecture Philosophy

Follow Clean Architecture, SOLID, DRY, KISS, the Repository Pattern, layered architecture, and dependency-injection principles where appropriate. Thin route handlers, reusable services — never mix business logic with routing.

**Target flow:**
```
Frontend (Client Components) → Redux Toolkit → API Service Layer → REST API → Route Handlers → Services → Repositories → MongoDB Atlas
```
Every layer talks only to the next layer, with one responsibility each.

## Project Structure

Since Next.js App Router is a full-stack framework, frontend and backend live in one app rather than a split client/server monorepo:

```
frontend-interview-guide/
├── src/
│   ├── app/
│   │   ├── (site)/                     # pages, layouts, UI routes
│   │   └── api/
│   │       └── v1/
│   │           ├── questions/
│   │           │   ├── route.ts        # GET, POST /api/v1/questions
│   │           │   └── [slug]/route.ts # GET/PATCH/DELETE by slug or id
│   │           ├── categories/
│   │           │   ├── route.ts
│   │           │   └── [slug]/route.ts
│   │           ├── tags/route.ts
│   │           ├── search/route.ts
│   │           └── health/route.ts
│   ├── components/
│   ├── hooks/
│   ├── store/                          # Redux Toolkit
│   ├── features/
│   ├── services/                       # frontend API service layer
│   ├── server/                         # backend-only code (never imported client-side)
│   │   ├── config/
│   │   ├── controllers/                # thin request handlers, called from route.ts
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── models/                     # Mongoose models
│   │   ├── validators/
│   │   ├── middlewares/
│   │   └── utils/
│   ├── types/
│   ├── constants/
│   └── config/
├── middleware.ts                       # Next.js edge middleware (logging, headers, future auth)
├── shared/
├── docs/
├── README.md
└── .gitignore
```
**Why this structure:** one deployable app, shared types between frontend and backend, no duplicate build tooling, simpler development, cleaner architecture, and native support for Server Components/Server Actions later if needed. `src/server/` contains all MongoDB/Mongoose code and must never be imported into a Client Component.

---

## Route Handler Layer Design

Next.js Route Handlers (`route.ts` files under `app/api/`) handle routing, validation, (future) auth, logging, error handling, and API responses — they should stay lightweight and delegate business logic.

**Route Handlers (`route.ts`)** — receive request → validate → call controller/service → return a `NextResponse`. Nothing else; no business logic; target < 100 lines each.

**Controllers** — receive the parsed/validated request → call service → shape the response payload. Keep as plain functions callable from any route handler; never import `next/server` types into services.

**Services** — contain business logic (`questionService`, `categoryService`, `searchService`, future `userService`); validate business rules, call repositories, return data; never touch the Next.js `Request`/`NextResponse` objects directly.

**Repositories** — own all database communication; give database independence, reusable queries, cleaner services, easier testing, and easier future DB migration. Services never talk to MongoDB directly.

**Route organization** — one route segment per feature (`app/api/v1/questions/route.ts`, `app/api/v1/categories/route.ts`, `app/api/v1/search/route.ts`, future `app/api/v1/users/route.ts`) — never put all endpoints in one handler file.

**Configuration layer**
```
src/server/config/
  database.ts
  env.ts
  logger.ts
  cors.ts
```
Never hardcode configuration.

**Environment variables** (`.env.local`, never committed): `NODE_ENV`, `MONGODB_URI`, `CLIENT_URL`, `LOG_LEVEL`, `JWT_SECRET` (future). Server-only — never prefix these with `NEXT_PUBLIC_`, which would expose them to the browser bundle.

---

## MongoDB & Data Model

**MongoDB Atlas** replaces JSON for scalability, cloud hosting, high availability, indexing, aggregation, flexible schema, and production readiness.

**Mongoose** (ODM) owns schema, validation, indexes, relationships, middleware, and models — never query MongoDB directly without going through a model. Because Route Handlers run in a serverless/edge environment, cache the Mongoose connection on the global object (a `dbConnect()` helper that reuses an existing connection) instead of reconnecting on every request.

**Collections:** `questions`, `categories`, `tags` now; `users`, `bookmarks`, `progress`, `history`, `notes`, `analytics`, `roles`, `permissions` planned for later.

| Schema | Fields |
|---|---|
| **Question** | `_id, title, slug, category, subCategory, difficulty, tags, question, answer, featured, order, createdAt, updatedAt, isPublished, status` — designed to support future expansion without breaking compatibility |
| **Category** | `_id, name, slug, description, icon, order, createdAt, updatedAt` (+ future: SEO metadata, parent category, visibility) |
| **Tag** | `_id, name, slug, createdAt, updatedAt` (+ future: popularity, search weight, related tags) |

**Indexes** — create for `slug`, `category`, `difficulty`, `tags`, `featured`, `status`; avoid unnecessary indexes and review performance before adding more.

**Relationships** — `Question → Category → Tags` via `ObjectId` references; keep relationships simple, avoid unnecessary nesting.

**Validation** happens at all three layers — Frontend → Route Handler → Database. Never rely on frontend validation alone; server-side validation is mandatory.

---

## REST API Design

The API must be consistent, predictable, versionable, secure, scalable, and easy to consume. All frontend communication goes through it — never direct DB access.

**Versioning** — support from day one, e.g. `/api/v1/questions`, `/api/v1/categories`, `/api/v1/search`, with room for a future `/api/v2/`.

**Naming** — use nouns + HTTP methods, not verbs: `GET /questions` ✅ vs `GET /getQuestions` ❌. Methods: `GET` retrieve, `POST` create, `PUT` replace, `PATCH` update, `DELETE` remove — never use `GET` for writes/deletes. In Next.js Route Handlers, each HTTP method is a named export (`export async function GET(request) {}`, `export async function POST(request) {}`) in the same `route.ts`.

### Endpoints

| Endpoint | Purpose |
|---|---|
| `GET /api/v1/questions` | Paginated question list; supports `page, limit, category, difficulty, tags, sort, search` |
| `GET /api/v1/questions/:slug` | Single question |
| `POST /api/v1/questions` | Create question *(future admin)* |
| `PATCH /api/v1/questions/:id` | Update question *(future admin)* |
| `DELETE /api/v1/questions/:id` | Soft delete preferred *(future admin)* |
| `GET /api/v1/categories` | All categories |
| `GET /api/v1/categories/:slug` | Category details |
| `GET /api/v1/tags` | Available tags |
| `GET /api/v1/search` | Ranked results; supports `query, category, difficulty, tags, page, limit` |
| `GET /api/v1/health` | Server status, DB status, version, safe environment info — for monitoring |

**Pagination** — every list endpoint paginates (`page`, `limit`); never return the full dataset. Default 20 items, max 100.
```json
{
  "success": true,
  "data": [],
  "pagination": { "page": 1, "limit": 20, "total": 2500, "totalPages": 125, "hasNext": true, "hasPrevious": false }
}
```

**Filtering** — by category, difficulty, tags, featured, published, status now; company, technology, year, experience level later. Filters should be composable.

**Sorting** — by newest, oldest, alphabetical, difficulty, order (popularity later), via an explicit param e.g. `sort=createdAt:desc`.

**Search** — support keyword, partial, and exact match now (fuzzy later); keep it index-friendly and avoid full collection scans.

### Standard Response Format
```json
// Success
{ "success": true, "message": "Questions fetched successfully.", "data": {} }
// Error
{ "success": false, "message": "Question not found.", "errors": [] }
```
Keep this shape consistent across every endpoint, returned via `NextResponse.json(body, { status })`.

**Status codes:** 200 OK · 201 Created · 204 No Content · 400 Bad Request · 401 Unauthorized · 403 Forbidden · 404 Not Found · 409 Conflict · 422 Unprocessable Entity · 500 Internal Server Error. Never return 200 for a failure.

---

## Validation & Middleware

**Validation** — validate path params, query params, body, and headers (where required) for every request; reject invalid input early. Use Zod, with schemas kept separate from route handlers:
```
src/server/validators/
  question.validator.ts
  search.validator.ts
  category.validator.ts
```

**Middleware** (one responsibility each): a top-level `middleware.ts` for cross-cutting concerns (request logging, security headers, future `authenticate`/`authorize`), plus per-route helpers: `validateRequest`, `errorHandler`, `notFoundHandler`.

**Request flow:** `Client → Next.js middleware.ts → Route Handler (route.ts) → Validation → Controller → Service → Repository → MongoDB → NextResponse` — keep this consistent everywhere.

**Auth/Authorization prep (not implemented this phase)** — reserve middleware placeholders (`authenticate()`, `authorize()`, `requireAdmin()`) in `middleware.ts` and per-route handlers that are easy to enable later; design routes so role checks (Guest/User/Premium/Editor/Admin) can be added without refactoring handlers.

**Frontend integration** — `Client Component → Redux Thunk/async logic → Question Service → REST API (Route Handler)`; never call `fetch()` directly inside components.

**Async error handling** — wrap all async route handler logic safely (reusable async wrappers where useful) and always return a `NextResponse` even on failure; unhandled promise rejections must never crash the server.

**Logging** — log incoming requests, response time, server errors, and DB connection status; never log passwords, tokens, sensitive payloads, or env variables; use structured logs.

---

## Backend Security

Treat every request as untrusted — never trust body, query/route params, headers, cookies, or client-side validation. Validate everything.

**Environment variables** — all sensitive config (`NODE_ENV, MONGODB_URI, CLIENT_URL, JWT_SECRET (future), REFRESH_TOKEN_SECRET (future), LOG_LEVEL`) lives in server-only env vars; never commit `.env.local`; never hardcode URLs/secrets/keys/passwords; never prefix these with `NEXT_PUBLIC_`.

**CORS** — only relevant if the API is consumed from a different origin (e.g. a future mobile app); set headers explicitly in the route handler or `middleware.ts` for only trusted origins (`http://localhost:3000` dev, `https://your-domain.com` prod); never `*` in production; allow only the methods/headers/credentials actually needed. Same-origin requests from the Next.js app itself don't require CORS.

**Security headers** — since Helmet is an Express-specific package, set equivalent security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Strict-Transport-Security`, CSP) via `next.config.ts` `headers()` or `middleware.ts`, to protect against clickjacking, MIME sniffing, and information leakage.

**Rate limiting** — e.g. 100 requests / 15 minutes per IP/user, returning `429 Too Many Requests`, implemented in `middleware.ts` or a lightweight rate-limit utility (in-memory for now, Redis-backed later); future: per-user/IP/role limits.

**Request size limits** — e.g. 1MB JSON payload cap enforced when parsing the request body; reject oversized requests.

---

## Performance & Optimization

**MongoDB/query optimization** — for every query ask: can it use an index? return fewer fields? paginate? avoid aggregation? Never do unnecessary full collection scans. Use indexes, field projections, pagination; avoid nested/duplicate queries.

**Connection management** — use a single cached MongoDB connection (via a global-scoped `dbConnect()` helper) so repeated Route Handler invocations reuse the same connection pool instead of opening a new connection per request/invocation.

**Repositories** — return only required data, stay free of business logic, reuse common queries, and hide MongoDB implementation details from services.

**API performance** — optimize response size, DB queries, serialization, and payload; return only needed fields (e.g. question/category/tags), not internal IDs or DB metadata unless required. Use `export const dynamic = 'force-dynamic'` (or appropriate caching directives) deliberately on each route handler based on whether the data must always be fresh.

**Caching (future-ready, not implemented now)** — design to be cache-friendly for Next.js's built-in data cache/revalidation, a future Redis layer, CDN, browser cache, or service worker layer.

**API documentation** — document every endpoint's purpose, method, URL, params, request/response examples, possible errors, and auth requirements; Swagger/OpenAPI recommended for the future.

**Monitoring (future-ready)** — prepare for tools like Sentry, Grafana, Prometheus, OpenTelemetry, or Application Insights, collecting error rate, response time, DB latency, and request volume.

**Deployment prep** — the app (frontend + API Route Handlers together) should deploy without code changes to platforms like Vercel, Netlify, Render, AWS, Azure, or GCP, with all config coming from environment variables.

---

## Testing & Validation

**Production build checklist** — env vars configured · MongoDB connected · build succeeds · API routes work · validation works · error handling works · logs work · CORS configured (if needed) · security headers set · rate limiting enabled.

**API testing** — verify every relevant status code (200/201/400/401/403/404/409/422/500) and that every response matches the standard format.

**Integration testing** — frontend verifies question/category loading, search, pagination, filtering, sorting, error handling, and loading states — nothing should break when JSON is replaced with the API.

**Manual testing checklist** — app starts · DB connects · questions/categories load · search/pagination/filtering/sorting work · API errors handled correctly · no console or database errors.

**Phase completion checklist** — JSON removed · MongoDB Atlas connected · Next.js Route Handlers running · REST endpoints working · repository & service layers implemented · validation & error middleware implemented · logging implemented · pagination/search/filtering/sorting implemented · Redux fetching from backend · UI unchanged · existing features preserved · no TypeScript/ESLint/runtime errors.

---

## Git Workflow

- Branch: `feature/phase-04-backend`
- Suggested commits:
  ```
  feat: create Next.js Route Handler backend structure
  feat: connect MongoDB Atlas
  feat: implement question repository
  feat: implement REST API route handlers
  feat: integrate Redux API layer
  feat: add pagination and search
  chore: configure backend security headers
  ```
- Commit frequently; merge only after validation.

## Rollback Strategy

If backend integration causes regressions: identify the failing commit, revert only the affected backend change, retest, and don't continue development until stability is restored. Keep Git history clean.

---

## Antigravity AI Execution Instructions

1. Before modifying code, read `PROJECT_RULES.md` and this document; understand the frontend, Redux, database, and API architecture
2. Implement tasks in order
3. Do **not**: change UI, remove features, modify project branding, bypass the service layer, access MongoDB directly from a Client Component, or import `src/server/` code into client-side files

**After completion, report:**
1. Files created 2. Files modified 3. API endpoints (Route Handlers) 4. Database collections 5. Mongoose models 6. Middleware added 7. Services created 8. Repositories created 9. Redux integration 10. Security improvements 11. Performance improvements 12. Remaining recommendations

## Definition of Done

- Backend follows layered architecture with repository and service layers implemented as Next.js Route Handlers
- MongoDB Atlas connected; JSON dependency removed
- Redux communicates only through API services
- Validation implemented; error handling centralized; logging implemented
- Pagination, filtering, sorting, and search all working
- Existing frontend unchanged; no regressions
- Build/TypeScript/ESLint pass; manual testing completed

## Exit Criteria

Do **not** proceed to Phase 05 until: backend validation passes · frontend integration passes · API testing completed · build succeeds · database verified · existing functionality preserved · Git commit created.

Only then proceed to **Phase-05-Production.md**.

---

## Phase 04 Summary

The project evolves from a static frontend into a production-ready full-stack platform, all within one Next.js (App Router) application: TypeScript throughout, Tailwind CSS for styling, Redux Toolkit, an API service layer, a Next.js Route Handler backend with layered/repository/service architecture, MongoDB Atlas, REST APIs with pagination/filtering/sorting/search, validation, error handling, logging, and environment-based configuration.

Next: **Phase 05** covers testing, CI/CD, documentation, deployment preparation, monitoring, and production hardening.