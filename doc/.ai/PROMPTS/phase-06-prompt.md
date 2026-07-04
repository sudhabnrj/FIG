# Phase 06 AI Execution Guide — Authentication & Authorization System

| | |
|---|---|
| **Version** | 1.0 |
| **Target AI** | Antigravity AI |
| **Estimated Execution Time** | 18–24 hours |
| **Priority** | ⭐⭐⭐⭐⭐ Critical |

---

## AI Role

You are acting as: Principal Software Architect, Senior Authentication Engineer, Senior Security Engineer, Senior Next.js Engineer, Senior Backend Engineer, Senior TypeScript Engineer, MongoDB Architect, and IAM Specialist — implementing a production-grade authentication and authorization system.

Don't behave like a code generator — behave like a senior engineer building authentication for a SaaS platform. Every decision should prioritize security, scalability, maintainability, performance, and user experience.

## Project Context

Current stack: Next.js 16 App Router → Redux Toolkit → MongoDB Atlas → Community Platform.
Target addition: Authentication → Authorization → JWT → Secure Cookies → OAuth → RBAC → Protected Routes → Community Features. Authentication becomes the foundation for all future phases.

## Primary Objective

Implement enterprise-grade authentication while preserving existing UI, routes, features, and performance. No existing functionality should break.

## Project Goals

User registration, login, logout · forgot/reset password · email verification · Google & GitHub login · JWT with refresh tokens · HTTP-only cookies · protected routes · RBAC · session management · user profile & account settings · security best practices · future-ready authentication.

## Golden Rules

1. Never expose authentication tokens to JavaScript
2. Never store JWT in LocalStorage
3. Always use HTTP-only cookies
4. Never trust frontend authentication
5. Every protected API must validate the user server-side
6. Every protected page must use middleware
7. Never hardcode permissions
8. Passwords must always be hashed
9. Never expose internal authentication errors
10. Authentication should remain independent from UI (Redux stores UI state only)

## Project Rules

Always follow `PROJECT_RULES.md` and `Phase-06-Authentication.md`. If they conflict, `PROJECT_RULES.md` takes precedence.

## Before Writing Code

Do not begin implementation immediately — analyze the project first: current authentication, middleware, Redux store, MongoDB models, API structure, routing, layouts, protected vs. public pages, and future dashboard/community routes. Document findings before implementation; authentication must integrate cleanly with the existing architecture.

---

## User Roles & Responsibilities

**Hierarchy:** Guest → User → Moderator → Admin → Super Admin. Roles must remain extensible — never hardcode permissions.

| Role | Responsibilities |
|---|---|
| Guest | View public pages, search, read questions |
| User | Register, login, manage profile, create questions & answers |
| Moderator | Review questions/answers, approve, reject |
| Admin | Manage users, categories, tags, reviews, settings |
| Super Admin | Everything |

## Authentication Flow & Strategy

`Register → Email Verification → Login → JWT → Refresh Token → Secure Cookies → Protected Routes → Logout`. Maintain this workflow consistently.

**Strategy:** stateless — `JWT → Refresh Token → Secure Cookies → Database Validation`. Never rely on Redux for authentication; Redux stores only UI state.

**JWT** — two tokens: Access Token (15 min) and Refresh Token (30 days). Workflow: `Login → Generate Access Token → Generate Refresh Token → Secure Cookie → Authenticated User`. Never expose refresh tokens.

**Cookies** — HttpOnly, Secure, SameSite, encrypted, auto-expiring; clear immediately on logout.

**Session management** — support browser refresh, multiple tabs, automatic refresh, logout, expiration, and session recovery; session state lives in secure cookies.

---

## User Database

**Collection:** `users`
**Fields:** `_id, name, username, email, password, avatar, provider, role, status, isVerified, lastLogin, createdAt, updatedAt`
**Future:** `preferences, theme, language, bio, socialLinks, reputation, points, badges`

**Password policy** — min 8 chars; require uppercase, lowercase, number, special character.
**Email policy** — unique, lowercase, validated, verified, trimmed.
**Username policy** — 3–30 chars; letters, numbers, underscore; no duplicates.
**Indexes** — `email, username, role, status, provider` (avoid unnecessary indexes).
**Validation** — enforce at frontend, API, and database layers; never rely on frontend validation alone.

## Folder & Route Structure

```
app/(api)/auth/{login,register,forgot-password,reset-password,verify-email}/
profile/  settings/  middleware.ts
components/auth/  hooks/  services/  repositories/  validators/  models/
store/features/auth/  lib/auth/
```
Authentication should remain modular.

| Tier | Routes |
|---|---|
| Public | `/`, `questions`, `categories`, `login`, `register`, `forgot-password`, `reset-password` |
| Protected | `profile`, `settings`, `dashboard`, `community`, `drafts`, `bookmarks` |
| Admin | `dashboard/admin`, `dashboard/reviews`, `dashboard/users`, `dashboard/settings` |

Middleware protects every private route.

**Middleware responsibilities:** read cookies → validate JWT → refresh tokens → load user → check permissions → continue request. Never duplicate middleware logic.

**Architecture:** `Browser → Middleware → Protected Route → Route Handler → Service → Repository → MongoDB → Response` — follow layered architecture throughout.

### Deliverables — Design Complete
Authentication architecture, JWT/cookie strategy, session management, user schema, RBAC, middleware plan, folder structure, auth routes, and database indexes are all defined. **Do not implement authentication yet.**

---

## Implementation Rules

Implement one authentication feature at a time; validate each before the next. Never leave authentication partially implemented or introduce regressions. Don't modify the existing public UI — authentication must integrate seamlessly.

## Implementation Order

1. Environment Configuration
2. Database & User Model
3. Repository Layer
4. Authentication Service
5. Password Hashing
6. JWT
7. Refresh Token
8. Secure Cookies
9. Registration
10. Email Verification
11. Login
12. Logout
13. Forgot Password
14. Reset Password
15. Google OAuth
16. GitHub OAuth
17. Middleware
18. Protected Routes
19. Redux Authentication
20. User Profile
21. Account Settings
22. RBAC
23. Validation
24. Security
25. Session Management
26. Cleanup

### Steps 1–5 — Foundation
**Environment config** — set up `.env`/`.env.example` with `DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET, GOOGLE_CLIENT_ID/SECRET, GITHUB_CLIENT_ID/SECRET, NEXTAUTH_URL, APP_URL`. Never hardcode secrets.
**User model** — fields as above plus `providerId`; index `email, username, role, status, provider`.
**Repository layer** (`UserRepository`) — create/find/update user, update password/verification/session, search users. No business logic in repositories.
**Authentication service** (`AuthService`) — register, login, logout, forgot/reset password, email verification, refresh session, Google/GitHub OAuth, change password, update profile. Business logic lives only here.
**Password hashing** — bcrypt: `Password → Generate Salt → Hash → Store`. Never store plain text or expose hashes.

### Steps 6–8 — Tokens & Cookies
**JWT** — access token containing user ID, role, email, expiration; never sensitive data.
**Refresh token** — stored in secure cookie + database session; rotate automatically and invalidate previous tokens.
**Secure cookies** — `HttpOnly, Secure, SameSite=Lax, Path=/`, auto-expiring; cookies contain only tokens.

### Steps 9–14 — Core Auth Endpoints
| Endpoint | Workflow |
|---|---|
| `POST /api/auth/register` | validate name/username/email/password/confirm → hash password → create user → generate verification token → send email → return success. Reject duplicate email/username. |
| `GET /api/auth/verify` | validate verification token → activate account → mark verified → redirect to login. Prevent reuse of verification links. |
| `POST /api/auth/login` | validate credentials → generate JWT → generate refresh token → store cookies → return user; update `lastLogin`. |
| `POST /api/auth/logout` | delete cookies → invalidate refresh token → destroy session → return success. Session terminates immediately. |
| `POST /api/auth/forgot-password` | validate email → generate reset token → store expiration → send email. Reset links expire in 15 minutes. |
| `POST /api/auth/reset-password` | validate token + password → hash password → update database → invalidate token → return success. Old passwords become invalid. |

### Steps 15–16 — OAuth
**Google OAuth** — consent → OAuth callback → find or create user → generate session → login; store provider, Google ID, avatar.
**GitHub OAuth** — consent → OAuth callback → find or create user → generate session → login; support account linking.

### Steps 17–22 — Access Control & Profile
**Middleware** — read cookies → validate JWT → refresh expired access token → load user → validate role → continue request; redirect guests when required.
**Protected routes** — guard `/dashboard`, `/profile`, `/settings`, `/community`, `/create-question`, `/create-answer`, `/bookmarks`; redirect unauthorized users.
**Redux authentication** — `authSlice`, `authThunks`, `authSelectors` storing current user, permissions, loading, error, and auth status. Never store JWT in Redux.
**User profile** — avatar, name, username, bio, website, GitHub, LinkedIn, location, skills; validate every update.
**Account settings** — password change, email preferences, theme, language, notifications, connected accounts, sessions; validate every update.
**RBAC** — Guest → User → Moderator → Admin → Super Admin; validate permissions before every protected action.

### Steps 23–26 — Hardening
**Validation (Zod)** — validate registration, login, forgot/reset password, profile update, settings update at client, API, and database level.
**Security** — rate limiting, CSRF protection, secure headers, input validation, output sanitization, password hashing, brute-force protection, account lockout, audit logging; never expose internal errors.
**Session management** — verify browser refresh, multiple tabs, automatic refresh, logout, expiration, and recovery — persistence should be automatic.
**Cleanup** — review components, hooks, services, repositories, validators, Redux, routes, middleware; remove unused imports/variables, duplicate logic, debug code, console logs, dead code.

### Deliverables — Implementation Complete
User model, repository layer, authentication service, password hashing, JWT, refresh tokens, secure cookies, registration, email verification, login, logout, forgot/reset password, Google & GitHub OAuth, middleware, protected routes, Redux auth, user profile, account settings, RBAC, validation, and security improvements are all complete.

---

## Final Validation

Authentication is not complete until every validation step passes — it's the security foundation of the platform, so never deploy without full validation.

**Build validation** — `npm install → npm run build → npm run lint → npm run type-check` for frontend and backend; expect no TypeScript/ESLint/runtime/console errors.

### Feature Testing Matrix
| Feature | Verify | Expected |
|---|---|---|
| Registration | valid data, duplicate email/username, weak password, invalid email, password confirmation, email verification | user created, password hashed, verification email sent, status = pending verification, duplicates prevented |
| Login | correct email, wrong password, unknown email, inactive/suspended/blocked/unverified user | login successful, JWT + refresh token generated, secure cookies created, `lastLogin` updated |
| Logout | cookie removal, refresh token invalidated, protected-route access, browser refresh, multiple tabs | session destroyed, cookies removed, user redirected |
| Password reset | forgot-password email, expired/invalid token, successful reset, old vs new password | reset email sent, token validated, password updated, previous password invalid |
| Email verification | verification email, expired/invalid token, already verified, success | account activated, login allowed, status updated |
| Google OAuth | new/existing user, account linking, logout, browser refresh | login successful, user auto-created, session + cookies created |
| GitHub OAuth | new/existing user, account linking, logout, session restore | login successful, account linked, secure session created |
| Session | browser refresh, multiple tabs, auto token refresh, expired session, logout | session restored, automatic refresh, secure logout, session recovery |
| Cookies | HttpOnly, Secure, SameSite, expiration, encryption, path | JavaScript cannot access cookies, secure transmission, proper expiration |
| Redux | user, loading, permissions, auth status, errors present; JWT/refresh token/passwords/secrets absent | Redux stores UI state only |
| Route protection | public/protected/admin routes | guests redirected, authorized users allowed, unauthorized denied |
| Roles | Guest/User/Moderator/Admin/Super Admin × view/create/update/delete/approve/reject/manage | permissions enforced, no privilege escalation |
| Database | user collection, indexes, duplicate prevention, password hashing, tokens, status, roles | integrity maintained, no duplicate records |
| API | all `/api/auth/*` endpoints (register, login, logout, forgot/reset-password, verify, profile GET/PATCH, password PATCH) | consistent REST responses, proper status codes, correct validation errors |

**Security validation** — password hashing, JWT, refresh token, cookies, CSRF, XSS, rate limiting, account lockout, headers, brute-force protection, input validation, output sanitization → secure authentication.

**OWASP checklist** — broken authentication, broken access control, injection, security misconfiguration, sensitive data exposure, cryptographic failures, identification failures, dependency vulnerabilities, logging → OWASP Top 10 mitigated.

**Accessibility validation** — login/register/forgot/reset-password forms: keyboard navigation, focus states, ARIA labels, error messages, responsive layout — target WCAG 2.1 AA.

**Performance validation** — measure login/register time, JWT validation, token refresh, middleware execution, protected-route load → fast authentication, minimal latency.

**Logging validation** — log login, logout, registration, password reset, verification, OAuth login, failed login. **Never log** passwords, JWT, refresh tokens, cookies, secrets, or sensitive user data.

**Code quality review** — remove unused imports/variables, duplicate logic, dead code, console logs, debug code from auth components, hooks, services, repositories, validators, Redux, middleware, routes.

---

## Git Workflow

- Branch: `feature/phase-06-authentication`
- Suggested commits:
  ```
  feat: implement authentication architecture
  feat: implement user registration
  feat: implement secure login
  feat: add JWT authentication
  feat: add refresh token support
  feat: implement secure cookies
  feat: add Google OAuth
  feat: add GitHub OAuth
  feat: implement protected routes
  feat: implement RBAC
  fix: improve authentication validation
  docs: update authentication documentation
  ```
- Commit after every completed feature.

## Rollback Strategy

If deployment fails: identify the affected feature → roll back the commit → retest → redeploy. Never continue with unstable authentication.

## Final Report

Generate a report covering: Authentication Summary · Files Created/Modified · Authentication (registration, login, logout, forgot/reset password, JWT, refresh tokens, cookies, OAuth, middleware, RBAC) · Database (user model, indexes, validation, relationships) · Security (hashing, validation, headers, cookies, rate limiting, CSRF, audit logging) · Redux (slice, thunks, selectors, state flow) · Testing (unit, integration, auth, manual, coverage) · Future Recommendations (Phase 07 community system — question/answer creation, rich text editor, moderation workflow — do not implement here).

---

## Acceptance Criteria

Phase 06 is complete only when: registration, login, logout, forgot/reset password, email verification, Google OAuth, GitHub OAuth, JWT auth, refresh tokens, secure cookies, protected routes, RBAC, and session management are all operational · existing UI unchanged · no TypeScript/ESLint/runtime errors.

## Definition of Done

Authentication and authorization production-ready · OAuth operational · JWT and refresh tokens secure · secure cookies configured · middleware and protected routes implemented · RBAC implemented · security, accessibility, and performance validated · documentation updated · ready for Phase 07.

---

## Final AI Execution Instructions

1. Read the complete project before implementation
2. Follow the implementation order exactly
3. Never expose authentication secrets
4. Never store JWT in LocalStorage or SessionStorage
5. Always use HTTP-only secure cookies
6. Validate every request on the server
7. Protect every private page using middleware and every private API using RBAC
8. Preserve the existing UI and routing
9. Generate a final implementation report before marking this phase complete

Authentication is the foundation of every future phase. Do not proceed to Phase 07 until every validation step, acceptance criterion, and Definition of Done has been successfully completed.