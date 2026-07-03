# Phase 03 — Security, Code Quality & Accessibility

| | |
|---|---|
| **Version** | 1.0 |
| **Status** | Planned |
| **Estimated Time** | 8–10 hours |
| **Priority** | ⭐⭐⭐⭐⭐ Critical |

---

## Objective

Turn the application into a secure, production-ready Next.js (App Router) + TypeScript + Tailwind CSS frontend following modern security and accessibility standards — covering frontend security, secure coding, accessibility, input validation, output sanitization, error handling, configuration security, dependency security, and code quality. Prepares the project for backend integration and production deployment.

**Out of scope:** backend authentication, MongoDB integration (Phase 04).

## Goals

Prevent XSS and unsafe HTML rendering · improve accessibility · secure app configuration · improve error handling and code quality · remove security risks · improve maintainability · prepare for authentication and secure APIs.

## Success Criteria

No XSS vulnerabilities · HTML rendering sanitized · accessibility improved · error handling centralized · sensitive configuration protected · dependencies reviewed · no unnecessary console logs · code quality improved · **existing UI and functionality unchanged**.

## Scope

| In Scope | Out of Scope (Phase 04) |
|---|---|
| XSS prevention, DOMPurify, secure HTML rendering | Authentication, Authorization |
| Input validation, output sanitization | MongoDB security, JWT |
| Accessibility, ARIA, keyboard navigation, theme provider | Backend APIs, rate limiting |
| Error handling, secure configuration | Helmet, CORS |
| Code cleanup, dependency review, logging | |

---

## Security Philosophy

Security is part of the architecture, not a feature — assume all user input is untrusted. **Never trust:** user input, query/URL parameters, local/session storage, API responses, cookies. Always validate, sanitize, and encode when necessary.

## Threat Model

Identify threats before implementing mitigations: XSS, HTML injection, malicious markdown, unsafe clipboard data, dependency vulnerabilities, sensitive data exposure, console information leakage, unsafe configuration, future API abuse. Every mitigation should target one or more of these.

## Security Audit (do first)

For every component ask: Can it render user content? Execute HTML? Access browser storage? Expose secrets? Leak information? Be abused? Document findings — never assume content is safe.

---

## XSS Prevention & Safe Rendering

**XSS** — e.g. a malicious value like `<script>alert("Hacked")</script>` must never execute if rendered. Search the codebase for `dangerouslySetInnerHTML`; for each instance determine why it exists, whether it's necessary, and whether a safer alternative exists. Never render raw HTML without sanitization.

**DOMPurify** — if HTML rendering is required: Markdown → Sanitize → Render. Never skip sanitization or whitelist everything; use restrictive defaults.

**Markdown** — treat as untrusted since it can contain HTML. Preferred pipeline: `react-markdown → remark-gfm → rehype plugins → sanitized output`. Avoid custom HTML parsing. Prefer rendering Markdown in Server Components where possible so sanitized output is generated at build/request time rather than on the client.

## Browser Storage & APIs

Review all browser APIs (clipboard, local/session storage, window, document, navigator, history) for proper validation, permissions, and safe usage — avoid exposing sensitive info.

**Clipboard** — check whether malicious content could be copied or executed elsewhere; copy plain text unless HTML is explicitly required; validate content before copying and avoid copying hidden/unintended data.

**Local/Session Storage**
| Allowed | Never store |
|---|---|
| Theme, sidebar state, bookmarks, reading progress, search history (optional) | Passwords, tokens, secrets, API keys, DB URLs, private/sensitive user data |

Treat everything in browser storage as user-controlled — always validate on read (e.g. theme falls back to "System" if invalid).

## Input Validation & Output Encoding

Validate every input (search, category, slug, filters, future forms) — length, characters, format, required fields, allowed values — before processing, storing, rendering, or sending to an API. Reject invalid data early.

Never render user input directly — always encode/sanitize before display, especially content from a database, API, markdown, user notes, or future admin dashboard.

**URL Validation** — validate links, external URLs, navigation targets, and future API endpoints before use; never construct URLs from untrusted input.

**Secure Routing** — validate dynamic route params (slug, category, tags, search query); reject malformed values early; don't build routes from untrusted input.

---

## Configuration Security

Never hardcode configuration — use a dedicated layer:
```
config/
  app.ts
  theme.ts
  env.ts
  settings.ts
```
Future secrets belong in environment variables, not source code. Never hardcode API/DB URLs, keys, or secrets — prefer typed configuration wrappers. In Next.js, only variables explicitly prefixed `NEXT_PUBLIC_` are exposed to the browser bundle — never prefix secrets, tokens, or DB connection strings this way; keep them server-only (used only in Route Handlers/Server Components).

**Content Security Policy (prep)** — CSP can be configured via Next.js `middleware.ts` or `next.config.ts` headers; avoid inline scripts/event handlers and unsafe HTML injection now so the app is ready for a strict CSP. Tailwind CSS is class-based (no runtime CSS-in-JS injection), which keeps the app CSP-friendly by default. Only load fonts/images/scripts/APIs from trusted origins.

## Secure Coding & Code Quality

Always validate, sanitize, escape when necessary, handle errors gracefully, prefer explicit logic over clever shortcuts, and write readable code — secure code is maintainable code.

Review every file for dead code, unused imports/variables/state, duplicate utilities/components, large functions, and complex logic — simplify wherever possible.

---

## Dependency & Supply-Chain Security

Before installing any package, evaluate: actively maintained? recent security updates? widely adopted? native alternative available? smaller package available? adds unnecessary complexity?

**Audit regularly** — for each dependency ask if it's still used, removable, replaceable with a browser API, lazy-loadable, or updatable. Run `npm audit` / `npm outdated`; resolve high/critical vulnerabilities before production.

**Supply chain** — only install from trusted maintainers; avoid unknown packages, packages with very few downloads, or abandoned packages. Check GitHub repo, stars, issues, release frequency, security advisories.

---

## Secure API Preparation (for Phase 04)

Frontend must never talk to MongoDB directly:
```
Next.js (App Router, Client/Server Components) → Redux Toolkit → API Service → Next.js Route Handlers (Route.ts, App Router API) → MongoDB Atlas
```
Never bypass the API layer. Server Components/Server Actions may read data via the API Service or Route Handlers directly on the server, but must never embed MongoDB credentials or query logic in client-shipped code.

**Service Layer** — centralize API calls, never call `fetch()` directly in UI (Client Component) code:
```
services/api/
  questionService.ts
  categoryService.ts
  searchService.ts
  futureAuthService.ts
```
Benefits: centralized error handling, reusable logic, easy testing, future scalability.

**Secure Communication** — every request should use HTTPS, handle timeouts/retries/network failures gracefully, never expose implementation details, and prepare cancellation via `AbortController`.

**Auth & Authorization readiness (prep only, not implemented this phase)** — architecture should support future JWT, OAuth, Google/GitHub login, email auth, and session-based auth without hardcoded assumptions; support future roles (Admin, Editor, Premium, Registered, Guest) via role-based rendering; structure routing so protected routes (bookmarks, progress, profile, admin dashboard, analytics, premium content) can be added easily.

**Secure State Management** — Redux must never store passwords, refresh tokens, API secrets, DB credentials, or private keys; shared state holds only application data. Credentials belong in secure cookies or backend sessions (future).

---

## Error Handling & Logging

Errors must never expose internals. Bad: raw DB errors, stack traces, file paths, API keys. Good: "Something went wrong. Please try again." Log details only during development.

**Global error handler** — centralize handling for network errors, unexpected exceptions, component errors, API failures, validation errors, and unexpected states; give consistent, user-friendly feedback.

**Logging** — console logging is fine in development; strip unnecessary logs in production. Never log tokens, passwords, secrets, personal data, DB URLs, env variables, or sensitive request payloads.

**User Notifications** — meaningful, jargon-free messages (e.g. "Unable to load questions. Please try again."); never expose backend internals.

---

## Accessibility (WCAG 2.1 AA)

Accessibility is also a security concern — users must always know what has focus, what's happening, and what errors occurred.

**Requirements:** semantic HTML, proper heading hierarchy, keyboard navigation, visible focus indicators, screen reader compatibility, sufficient color contrast, meaningful alt text, accessible form labels/buttons/links. Must never regress from security changes.

- **Keyboard navigation** — full support for Tab, Shift+Tab, Enter, Escape, arrow keys (where applicable), Space; no feature should require a mouse.
- **Focus management** — visible focus state, logical order, focus returns correctly after dialogs/overlays close, no unintended focus traps.
- **Screen readers** — announce navigation, buttons, search fields, question titles, expand/collapse state, toasts, errors, loading states; use ARIA only where native HTML semantics fall short.
- **Color contrast** — normal text ≥ 4.5:1, large text ≥ 3:1; icons/interactive elements stay distinguishable.

---

## OWASP Top 10 Review

| # | Risk | Action for this project |
|---|---|---|
| A01 | Broken Access Control | Prep only — future auth must enforce authorization; never rely solely on hidden UI for security |
| A02 | Cryptographic Failures | Never expose passwords/secrets/tokens/keys/connection strings; use HTTPS for all future API calls |
| A03 | Injection | Prevent HTML/JS/Markdown injection now; validate & sanitize all input (SQL/NoSQL injection is a backend concern) |
| A04 | Insecure Design | Avoid tight coupling, hardcoded logic, unsafe assumptions; design for scalability and secure defaults |
| A05 | Security Misconfiguration | Review env vars, config files, build settings, API endpoints; never ship dev config to production |
| A06 | Vulnerable Components | Keep dependencies maintained, remove unused ones, run `npm audit` before releases |
| A07 | Authentication Failures | Future auth should support JWT/OAuth/secure cookies/RBAC; never store credentials in browser storage |
| A08 | Software Integrity | Verify package integrity and trusted/verified sources; never copy code from untrusted sources unreviewed |
| A09 | Logging Failures | Never log passwords/secrets/tokens/PII/env vars/sensitive payloads; production logs must be safe to retain |
| A10 | SSRF (prep) | Backend concern primarily, but never let the frontend build unrestricted URLs from untrusted input — use predefined endpoints |

---

## Manual Testing

**Security**
- **Search input** — paste HTML/JS/Markdown/special characters; verify nothing executes
- **Question rendering** — no HTML injection, no JS execution, Markdown renders correctly
- **Clipboard** — only intended text copied, no hidden HTML/unexpected formatting
- **Browser storage** — inspect local/session storage for sensitive data
- **Console** — no secrets, API keys, DB URLs, or excessive debug logs
- **Env variables** — no `.env` values exposed in the frontend bundle; only `NEXT_PUBLIC_`-prefixed vars available client-side

**Accessibility** — test with keyboard only, screen reader, 200% zoom, high-contrast mode, and mobile devices; usability should stay consistent.

## Validation Checklists

**Security** — no unsafe HTML rendering · DOMPurify implemented where required · Markdown rendered safely · input validation complete · browser storage reviewed · error handling centralized · sensitive config isolated · dependencies reviewed · accessibility improved · no sensitive logs · UI/functionality unchanged.

**Code Review** (per modified file) — Is input validated? Is rendered content sanitized? Could this expose sensitive info? Are errors handled safely? Is it readable? Any duplicate logic? Can it be simplified? Does it follow project rules? Document remaining risks.

---

## Deliverables

DOMPurify integration · safe markdown rendering · improved accessibility · secure configuration layer · improved error handling · completed dependency review · logging strategy · browser-storage guidelines followed · cleaner codebase · enterprise security architecture established.

## Git Workflow

- Branch: `feature/phase-03-security`
- Suggested commits:
  ```
  feat: implement DOMPurify sanitization
  refactor: improve accessibility
  refactor: centralize error handling
  chore: remove insecure logging
  docs: add security standards
  ```
- Commit frequently; merge only after validation succeeds.

## Rollback Strategy

If a security change causes regressions: identify the affected commit, revert only that change, retest, and don't add further changes until resolved. Keep Git history clean.

---

## Antigravity AI Execution Instructions

1. Before modifying code, read `PROJECT_RULES.md` and this document; understand the existing architecture
2. Implement only the tasks defined in this phase
3. Do **not**: change UI, remove features, modify business logic, or introduce unnecessary dependencies

**After completion, report:**
1. Files modified 2. Components updated 3. Security improvements 4. Accessibility improvements 5. Dependencies reviewed 6. Configuration changes 7. Error handling improvements 8. Logging improvements 9. Remaining risks 10. Recommendations for Phase 04

## Definition of Done

- Application behaves exactly as before
- User input validated; rendered content sanitized; no XSS vulnerabilities remain
- Browser storage contains no sensitive information
- Accessibility meets WCAG AA; error handling centralized; code quality improved
- No TypeScript / ESLint / runtime errors; existing functionality intact
- Security validation checklist and manual accessibility testing both pass
- Git commit created

## Exit Criteria

Do **not** begin Phase 04 until: security validation completed · accessibility testing completed · build/TypeScript/ESLint all pass · existing features remain functional · security review completed.

Only then proceed to **Phase-04-Backend.md**.

---

## Phase 03 Summary

Delivers: secure frontend architecture, XSS protection, safe HTML/Markdown rendering, structured error handling, improved accessibility, secure browser-storage practices, production-ready configuration standards, and a cleaner codebase — a strong foundation for backend integration.

Next: **Phase 04** replaces the static JSON-based architecture with a scalable backend powered by Next.js Route Handlers (App Router API), TypeScript, REST APIs, Redux Toolkit integration, and MongoDB Atlas.