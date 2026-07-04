# Phase 06 — Authentication & Authorization System

| | |
|---|---|
| **Version** | 1.0 |
| **Status** | Planned |
| **Estimated Time** | 18–24 hours |
| **Priority** | ⭐⭐⭐⭐⭐ Critical |

---

## Objective

Implement a complete authentication and authorization system — user identity, session management, route protection, role-based authorization, and OAuth — while preserving existing UI and functionality. Prepares the project for community contributions, user dashboards, and the admin CMS in later phases.

**Out of scope (later phases):** question/answer creation, admin dashboard, content moderation, notifications, reputation system, bookmarks, AI features.

## Goals

User registration, login, logout · forgot/reset password · email verification · Google & GitHub login · JWT auth with refresh tokens · HTTP-only cookies · session management · protected routes & middleware · RBAC · user profile & account settings · security best practices.

## Success Criteria

Registration, login, logout, password reset, email verification, Google login, and GitHub login all work · JWT + refresh tokens implemented · sessions secure and persist across refresh · protected routes and role-based authorization work · **no UI regressions**.

## Technology Stack

| Layer | Stack |
|---|---|
| Frontend | Next.js 16 App Router, TypeScript, Tailwind CSS v4, Redux Toolkit, React Hook Form, Zod |
| Backend | Next.js Route Handlers, MongoDB Atlas, Mongoose |
| Authentication | JWT, refresh token, HTTP-only cookies, Google OAuth, GitHub OAuth |
| Security | bcrypt, CSRF protection, rate limiting, secure cookies |

---

## Authentication Architecture

```
Browser → Middleware → Protected Route → JWT Validation → Refresh Token → MongoDB → Authenticated User
```
Authentication must remain stateless. **Never store auth state only in Redux** — Redux is a UI state manager; authentication belongs in secure cookies.

**Every request must answer:** Who is the user? → Is the user authenticated? → Does the user have permission? → Can this action execute? Never trust the browser, headers, client state, or Redux — always validate against the database.

**Auth flow:** Register → Email Verification → Login → Access Token → Refresh Token → Authenticated Session → Protected Routes → Logout → Session Destroyed.

## User Roles & Permissions

**Roles (hierarchy):** Guest → User → Moderator → Admin → Super Admin. Never hardcode permissions — always enforce via RBAC.

| Feature | Guest | User | Moderator | Admin |
|---|---|---|---|---|
| View Questions / Search | ✅ | ✅ | ✅ | ✅ |
| Register / Login | ✅ | ❌ | ❌ | ❌ |
| Create / Edit Own Question | ❌ | ✅ | ✅ | ✅ |
| Review Questions | ❌ | ❌ | ✅ | ✅ |
| Manage Users | ❌ | ❌ | ❌ | ✅ |

---

## JWT & Session Strategy

**Two-token system:** Access Token (15 min, short-lived) · Refresh Token (30 days, long-lived).
Workflow: Login → Access Token → Refresh Token → Secure Cookie → Automatic Refresh.

**Storage** — Access & Refresh Tokens live only in HTTP-only cookies. **Never** use LocalStorage, SessionStorage, or IndexedDB for auth tokens.

| Cookie | Settings |
|---|---|
| Access | `HttpOnly, Secure, SameSite=Lax`, short expiration |
| Refresh | `HttpOnly, Secure, SameSite=Strict`, long expiration |

Cookies should be encrypted and never readable from JavaScript.

## User Database Schema

**Collection:** `users`
**Fields:** `_id, name, username, email, password, avatar, provider, role, status, isVerified, lastLogin, createdAt, updatedAt`
**Future fields:** `bio, website, github, linkedin, location, preferences, theme, language, reputation, points, badges`

**Status lifecycle:** Pending Verification → Active → Suspended → Blocked → Deleted (status determines login permission).

**Password policy:** min 8 characters; require uppercase, lowercase, number, special character; reject weak passwords.
**Username rules:** 3–30 characters; letters, numbers, underscore only; no duplicates.
**Email rules:** unique, verified, lowercase, trimmed, validated; never allow duplicates.

---

## Folder Structure

```
app/
├── (api)/auth/{login,register,forgot-password,reset-password,verify-email}/
├── profile/
├── settings/
├── middleware.ts
components/auth/
providers/
hooks/
store/features/auth/
lib/auth/{jwt.ts, cookies.ts, oauth.ts}
validators/auth/
models/User.ts
services/AuthService.ts
repositories/UserRepository.ts
```
Every folder has one responsibility.

## Route Protection

| Type | Routes |
|---|---|
| Public | `/`, `questions`, `categories`, `login`, `register`, `forgot-password`, `reset-password` |
| Protected | `profile`, `settings`, `dashboard`, `create-question`, `create-answer`, `bookmarks` |
| Admin | `admin`, `admin/users`, `admin/questions`, `admin/reviews` |

**Middleware responsibilities:** authenticate user → read cookies → validate JWT → refresh expired tokens → load user → check permissions → continue request. Never duplicate middleware logic across routes.

**Database relationships (prep for later phases):** `User → Questions → Answers → Bookmarks → Notifications → Achievements`.

### Deliverables — Design Complete
Authentication architecture, roles, JWT/session strategy, database schema, folder structure, route protection, and middleware are all designed. **Do not implement yet.**

---

## Implementation Rules

Implement incrementally — one feature at a time — and validate each before moving to the next. Don't change existing UI unless required for auth; preserve existing functionality.

## Implementation Order

1. User Model
2. Password Hashing
3. Authentication Service
4. JWT Generation
5. Cookie Management
6. Register
7. Email Verification
8. Login
9. Logout
10. Forgot Password
11. Reset Password
12. Google OAuth
13. GitHub OAuth
14. Protected Routes
15. Middleware
16. Redux Authentication
17. User Profile
18. Account Settings
19. Role-Based Access Control
20. Validation
21. Security
22. Session Management
23. Error Handling
24. Cleanup

### Steps 1–5 — Foundation
**User Model** — fields as above; index `email`, `username`, `role`, `status`; never duplicate user info.
**Password Hashing** — bcrypt: `Password → Salt → Hash → Database`. Never store or log plain-text passwords.
**Authentication Service** — owns register, login, logout, verify email, forgot/reset password, refresh token, profile, change password; business logic lives here only.
**JWT Generation** — access + refresh tokens containing user ID, role, email, issued-at, expiration — never sensitive data.
**Cookie Management** — store both tokens as HTTP-only cookies (`HttpOnly, Secure, SameSite=Lax, Path=/, Expires`); clear on logout.

### Steps 6–11 — Core Flows
| Step | Workflow |
|---|---|
| Register | Validate name/username/email/password/confirm → hash password → create user → send verification email. Reject duplicate email/username. |
| Email Verification | Register → send email → verification link → verify token → activate account. No login until verified. |
| Login | Validate credentials → generate tokens → set cookies → return profile; update `lastLogin`. |
| Logout | Delete cookies → invalidate refresh token → return success. Session terminates immediately. |
| Forgot Password | Email → generate reset token (expires in 15 min) → send email → user resets password. |
| Reset Password | Validate token + new password/confirm → hash → update user → invalidate token. Old password stops working. |

### Steps 12–13 — OAuth
**Google OAuth** — consent screen → OAuth callback → find or create user → login; store provider, Google ID, avatar.
**GitHub OAuth** — OAuth callback → find or create user → login; support account linking.

### Steps 14–19 — Access Control & Profile
**Protected Routes** — guard profile, dashboard, settings, create-question, bookmarks, notifications; redirect guests to `/login`.
**Middleware** — read cookies → validate JWT → refresh token → load user → continue or redirect.
**Redux Authentication** — `authSlice`, `authSelectors`, `authThunks` store user, loading, error, permissions, and auth status. **Redux must never store JWT, refresh tokens, passwords, or secrets.**
**User Profile** — avatar, display name, username, email, bio, GitHub, LinkedIn, website, theme, language; keep extensible for future settings.
**Account Settings** — allow updating profile, password, avatar, theme, language, notification/security preferences; validate every update.
**RBAC** — Guest → User → Moderator → Admin → Super Admin; never hardcode permissions — enforce via middleware.

### Steps 20–24 — Hardening
**Validation (Zod)** — validate register, login, forgot/reset password, profile update, account settings at request, response, and database level.
**Security** — rate limiting, CSRF protection, secure cookies, HTTP headers, input validation, output sanitization, password hashing, brute-force protection, account lockout; never expose internal errors.
**Session Management** — verify persistence, automatic refresh, cookie expiration, logout, multi-tab behavior, expired-session handling, and session restoration.
**Error Handling** — handle invalid credentials, expired tokens/reset links, duplicate email/username, OAuth failure, network failure with friendly messages.
**Cleanup** — review controllers, services, models, validators, middleware, Redux; remove unused code, duplicate logic, debug code, console logs.

### Deliverables — Implementation Complete
User model, password hashing, JWT auth, refresh tokens, secure cookies, registration, login, logout, forgot/reset password, email verification, Google & GitHub OAuth, Redux auth, protected routes, RBAC, validation, and security improvements are all complete.

---

## Final Validation

Authentication is not complete until every validation step passes — never deploy without testing.

**Build validation** — run `npm install → npm run build → npm run lint → npm run type-check` for both frontend and backend (Next.js Route Handlers). Expect: build succeeds, no TypeScript/ESLint/runtime/console errors.

**Feature validation** — every auth feature (registration, login, logout, forgot/reset password, email verification, Google/GitHub login, JWT, refresh token, protected routes, session persistence, RBAC) must work independently.

### Feature Testing Matrix
| Feature | Test cases | Expected |
|---|---|---|
| Registration | valid signup, duplicate email/username, weak password, invalid email, password mismatch | user created, password hashed, verification email sent, DB updated |
| Login | correct credentials, wrong password, unknown email, inactive/suspended/blocked/unverified user | secure login, JWT generated, cookies + session created, `lastLogin` updated |
| Logout | cookie removal, refresh token removal, session destruction, protected-route access after | user logged out, session destroyed, cookies removed, protected pages redirect |
| Password Reset | email sent, expired/invalid token, successful reset, old vs new password | reset link sent, password updated, old password invalid, new password works |
| Email Verification | verification email, expired/invalid link, already verified, success | account activated, login allowed |
| Google/GitHub OAuth | login, existing/new user, account linking, logout, session persistence | authentication succeeds, user created if needed, session created |
| Session | browser refresh, multiple tabs, browser restart, expired session, auto-refresh, logout | session restored, automatic refresh, secure logout |

**Cookie validation** — verify `HttpOnly`, `Secure`, `SameSite`, expiration, path, and encryption. Cookies must never be readable from JavaScript.

**Redux validation** — verify user, loading, auth status, permissions, and error state are present; confirm JWT, refresh token, passwords, and secrets are **never** in Redux.

**Route protection & RBAC** — verify guest routes (login/register/forgot/reset), protected routes (dashboard/profile/settings/create question/answer), and admin routes (dashboard/review queue/user management) all redirect unauthorized users correctly. Every route, API, and action must check permissions server-side — never rely on frontend-only permission checks.

**Database validation** — verify user creation, duplicate prevention, password hashing, role/status/verification storage, refresh tokens, and indexes; no duplicate users.

**Security validation** — review password hashing, JWT, cookies, CSRF, XSS, SQL/Mongo injection, rate limiting, brute-force protection, headers, input validation, output sanitization. No authentication vulnerability should remain.

**OWASP checklist** — broken authentication, sensitive data exposure, injection, security misconfiguration, broken access control, cryptographic failures, identification failures, logging, dependency security.

**Performance validation** — measure login/registration speed, token refresh, middleware overhead, protected-route load, and DB query time; authentication must remain fast.

**Logging validation** — log login, logout, failed login, password reset, OAuth login, email verification. **Never log** passwords, tokens, cookies, or secrets.

**Accessibility validation** — login, register, forgot/reset password forms meet WCAG 2.1 AA (keyboard navigation, ARIA labels, focus states, error messages, responsive design).

### Manual Testing
**Desktop:** register · login · logout · Google login · GitHub login · forgot/reset password · protected routes · profile · settings · no console errors.
**Mobile:** responsive layout · authentication · OAuth · keyboard · form validation · no overflow.

**Code quality review** — remove unused imports/variables, dead code, duplicate validation/middleware, console logs, debug code from every modified file.

---

## Git Workflow

- Branch: `feature/phase-06-authentication`
- Suggested commits:
  ```
  feat: implement authentication architecture
  feat: add JWT authentication
  feat: implement refresh token
  feat: add secure cookies
  feat: implement Google OAuth
  feat: implement GitHub OAuth
  feat: add protected routes
  feat: implement RBAC
  fix: improve authentication security
  docs: update authentication documentation
  ```
- Commit after every logical task.

## Rollback Strategy

If authentication fails: identify the failing commit → roll back only the affected changes → retest → continue only after stability is restored. Never deploy broken authentication.

## Final Report

Generate a report covering: Authentication Summary · Files Created / Modified · Authentication (JWT, refresh token, cookies, OAuth, middleware, protected routes) · Database (user model, indexes, relationships, validation) · Security (hashing, CSRF, cookies, headers, rate limiting, validation) · Redux (slice, thunks, selectors, protected state) · OAuth (Google, GitHub, account linking) · Testing (unit, integration, auth, manual, coverage) · Future Recommendations (Phase 07 community system, Phase 08 dashboard/CMS — do not implement here).

---

## Acceptance Criteria

Phase 06 is complete only when: registration, login, logout, forgot/reset password, email verification, Google login, GitHub login, JWT auth, refresh tokens, secure cookies, protected routes, and RBAC all work · authentication persists · no UI regressions · no TypeScript/ESLint/runtime errors.

## Definition of Done

Authentication and authorization fully functional · OAuth implemented · JWT and cookies secure · middleware, protected routes, and RBAC complete · security and accessibility validated · documentation updated · ready for Phase 07.

## Deliverables

Authentication system · JWT auth with refresh tokens · HTTP-only cookies · registration, login, logout · forgot/reset password · email verification · Google & GitHub OAuth · protected routes · RBAC · authentication middleware · user profile & account settings · Redux authentication · security improvements · authentication documentation · production-ready authentication.

---

## Antigravity AI Execution Instructions

1. Read the complete project before making changes
2. Follow the implementation order exactly; never skip validation
3. Never expose authentication secrets or store JWT in LocalStorage — always use HTTP-only cookies
4. Always validate every request; protect every private route server-side
5. Preserve the existing UI
6. Generate a final implementation report before marking the phase complete

Authentication is the foundation for all future community and dashboard features. No task from **Phase 07** should begin until every requirement in this document has been completed and verified.