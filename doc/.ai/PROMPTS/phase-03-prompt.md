# Phase 03 AI Execution Guide
## Security, Accessibility & Code Quality

| | |
|---|---|
| **Version** | 1.0 |
| **Target AI** | Antigravity AI |
| **Estimated Execution Time** | 8–12 hours |
| **Priority** | ⭐⭐⭐⭐⭐ Critical |

---

## AI Role

You are acting as:
- Principal Software Security Architect
- Senior Next.js Engineer
- Senior TypeScript Engineer
- Senior Frontend Security Engineer
- Accessibility Specialist (WCAG AA)
- Code Quality Reviewer
- Enterprise Software Architect

Your responsibility is to transform this project into a secure, production-ready frontend application. Do NOT behave like an AI code generator — behave like a senior engineer responsible for software used by thousands of users. **Every security improvement must be maintainable, scalable, and measurable.**

---

## Project Context

Frontend Interview Guide built with: **Next.js (App Router), TypeScript, Tailwind CSS, MongoDB Atlas**.

Current architecture: Next.js (App Router) → Next.js Route Handlers / Server Actions (future) → MongoDB Atlas (future).

**This phase focuses only on:** Frontend Security, Accessibility, Configuration, Code Quality, Error Handling.
- ❌ Do NOT implement backend authentication
- ❌ Do NOT modify database logic
- ❌ Do NOT change UI

---

## Primary Objective

Improve application security while preserving: existing UI, features, styling, UX, and routing.

> The user should never notice visual changes. Only security, accessibility, and maintainability should improve.

---

## Project Goals

- Prevent XSS
- Secure markdown rendering; implement DOMPurify
- Improve accessibility, error handling, configuration, and browser storage
- Improve code quality
- Prepare for secure APIs, authentication, and production deployment

---

## Golden Rules

| # | Rule |
|---|---|
| 1 | Never break existing functionality |
| 2 | Never change UI |
| 3 | Never remove features |
| 4 | Never trust user input |
| 5 | Never trust browser storage |
| 6 | Never expose sensitive information |
| 7 | Always sanitize before rendering |
| 8 | Always validate before processing |
| 9 | Always follow secure coding practices |
| 10 | Security must never reduce usability |

---

## Project Rules

Always follow `PROJECT_RULES.md` and `Phase-03-Security.md`. If they conflict, **`PROJECT_RULES.md` takes precedence.**

---

## Before Writing Code

Do NOT begin implementation immediately — first analyze the entire project. Identify:

`dangerouslySetInnerHTML` usage · Markdown rendering · Clipboard usage · Browser storage · Environment variables · Configuration files · Console logging · Error handling · Theme management · Accessibility issues · ARIA usage · Keyboard navigation · Focus management · Dependency risks · Unused packages · Potential XSS risks

**Document findings before making changes.**

---

## Security Analysis

Review every component and ask:
- Can this render HTML or Markdown? Can user input reach it?
- Can scripts execute? Can browser storage be manipulated?
- Can sensitive information leak, or internal errors be exposed?
- Can configuration be improved?

Document every risk.

---

## Threat Model

Assume all external input is untrusted. Potential threats:

Cross-Site Scripting (XSS) · HTML Injection · Markdown Injection · Clipboard Injection · Malicious Browser Storage · Configuration Leakage · Sensitive Console Logging · Dependency Vulnerabilities · Future API Abuse

Every implementation should reduce one or more of these risks.

---

## XSS Analysis

Search the project for `dangerouslySetInnerHTML`. For every occurrence, determine why it exists, whether it's necessary, and whether a safer alternative exists. **Never render raw HTML without sanitization.**

## DOMPurify Strategy

If HTML rendering is required, pipeline: **User Content → DOMPurify → Next.js Rendering → Safe Output.** Never bypass sanitization; use restrictive defaults; only allow safe HTML.

## Markdown Security

Preferred architecture: **Markdown → react-markdown → remark-gfm → rehype plugins → DOMPurify → Safe Rendering.** Avoid custom HTML parsers. Treat Markdown as untrusted content.

## Input Validation

Review every input (Search Box, Category Filter, future Forms/Notes/Comments). Validate length, format, characters, allowed values, required fields. Reject invalid data early.

## Output Sanitization

Never render raw user input. Sanitize Markdown, HTML, clipboard content, and future user notes/rich text. Everything rendered should be treated as potentially unsafe.

## Clipboard Review

Review every copy operation — verify only plain text is copied, with no hidden HTML, JavaScript, or unsafe formatting. Clipboard should never become an attack vector.

## Browser Storage Review

Inspect Local Storage and Session Storage. Verify no passwords, API keys, secrets, or sensitive personal data are stored — only Theme, Sidebar State, and (future) Bookmarks. Validate stored values before using them.

## Configuration Review

Review environment variables, config files, constants, theme/app configuration. Ensure no hardcoded secrets, no scattered environment-specific values, and centralized configuration.

## Dependency Review

For every dependency, ask: is it maintained, still required, replaceable by a browser API, a security risk, updatable? Plan removal of unused packages.

---

## Deliverables (Part 1)

- ✔ Complete security analysis and threat modeling
- ✔ Identify XSS and markdown risks
- ✔ Review browser storage, configuration, and dependencies
- ✔ Identify accessibility issues
- ✔ Prepare implementation plan

**Do NOT begin implementation yet.** Continue to Part 2: DOMPurify implementation, secure markdown rendering, accessibility improvements, Theme Provider, Error Boundaries, global error handling, logging improvements, configuration cleanup, dependency cleanup, step-by-step implementation.

---

# Part 2 — Security Implementation

## Implementation Rules

Do NOT modify everything simultaneously — implement one security improvement at a time. Validate after every completed task. Never leave the project broken; never introduce regressions.

## Implementation Order (strict — do not change)

1. Security Audit
2. DOMPurify
3. Markdown Security
4. Input Validation
5. Output Sanitization
6. Browser Storage
7. Theme Provider
8. Configuration Cleanup
9. Error Boundaries
10. Global Error Handling
11. Logging Cleanup
12. Accessibility
13. Dependency Cleanup
14. Validation

---

### Step 1 — Security Audit
Review every component and identify: unsafe HTML, unsafe markdown, console logging, browser storage, clipboard usage, configuration, environment variables, accessibility issues, potential XSS. Document every issue before changing code.

### Step 2 — DOMPurify Integration
Search for `dangerouslySetInnerHTML`. Where raw HTML rendering is required, implement DOMPurify: **HTML → DOMPurify → Next.js Rendering.** Never render unsanitized HTML or bypass sanitization.

### Step 3 — Markdown Security
Preferred pipeline: **Markdown → react-markdown → remark-gfm → rehype plugins → DOMPurify → Safe Rendering.** Disable unsafe HTML rendering; don't build custom HTML parsers.

### Step 4 — Input Validation
Validate every user-controlled input (Search, Category, Filters, future Forms/Notes) for required fields, length, allowed characters/values, and format. Reject invalid input immediately.

### Step 5 — Output Sanitization
Sanitize every rendered value: HTML, Markdown, clipboard content, future rich text/notes. Never trust API responses or browser storage — treat everything rendered as untrusted.

### Step 6 — Clipboard Security
Ensure copy operations produce plain text only — no hidden HTML, embedded scripts, or unintended formatting. Clipboard should never expose sensitive information.

### Step 7 — Browser Storage
Inspect Local Storage and Session Storage.
- **Allowed:** Theme, Sidebar State, (future) Bookmarks, Reading Progress
- **Never store:** Passwords, API Keys, JWT Tokens, Secrets, Sensitive Personal Data

Validate all stored values before use.

### Step 8 — Theme Provider
Create or improve the Theme Provider to handle Light/Dark/System themes. Persist only valid values; fall back to System if the stored value is invalid. Don't hardcode themes throughout components.

### Step 9 — Configuration Cleanup
Centralize configuration under `config/` (`app.ts`, `theme.ts`, `env.ts`, `settings.ts`). Move magic strings/numbers, application settings, API URLs, and theme constants into one place.

### Step 10 — Error Boundaries
Wrap major sections: Question List, Markdown Renderer, Sidebar, Search Results, Settings, future Dashboard. One component crash must never take down the whole app.

### Step 11 — Global Error Handling
Centralize handling of unexpected exceptions, rendering errors, future API errors, validation errors, configuration errors. Display friendly messages; never expose stack traces in production.

### Step 12 — Logging Cleanup
Remove `console.log` / `.debug` / `.trace` / `.table` statements, keeping only intentional development logging. Never log passwords, tokens, secrets, environment variables, or sensitive user data.

### Step 13 — Accessibility Improvements
Improve semantic HTML, ARIA labels, keyboard navigation, focus indicators, heading hierarchy, accessible buttons/links, and (future) accessible forms. Target **WCAG 2.1 AA** — accessibility must improve without changing the UI.

### Step 14 — Dependency Cleanup
For each dependency, check: still maintained, still required, security issues, replaceable by a browser API, updatable? Remove unused, deprecated, and duplicate packages. Run `npm audit` and `npm outdated`; plan updates where appropriate.

### Step 15 — Code Cleanup
Remove unused imports/variables, dead code, duplicate utilities/components/logic, and overly complex functions. Simplify wherever possible while maintaining readability.

---

## Deliverables (Part 2)

- ✔ DOMPurify implemented, markdown secured
- ✔ Input validation and output sanitization completed
- ✔ Clipboard secured, browser storage reviewed
- ✔ Theme Provider improved, configuration centralized
- ✔ Error Boundaries implemented, global error handling centralized
- ✔ Logging cleaned, accessibility improved
- ✔ Dependencies reviewed, codebase cleaned

Continue to Part 3: security validation, accessibility testing, OWASP checklist, manual testing, reporting, acceptance criteria, Definition of Done, final execution instructions.

---

# Part 3 — Validation, Reporting & Completion

Do NOT consider Phase 03 complete until every validation step has passed. **Security improvements without validation are incomplete.**

## Build Validation
Run `npm install` → `npm run build` → `npm run lint` → `npm run type-check` (or equivalent). Expect: build succeeds, no TS/ESLint errors, no build or runtime warnings.

## Application Validation
✔ Loads correctly · ✔ No white screen · ✔ No runtime crashes · ✔ No hydration issues · ✔ No console errors/warnings. The application should behave exactly as before.

## Security Validation
✔ No raw HTML rendering · ✔ DOMPurify sanitizes all HTML · ✔ Markdown renders safely · ✔ No unsafe browser APIs · ✔ Clipboard copies plain text only · ✔ Browser storage contains no sensitive data · ✔ Configuration has no hardcoded secrets · ✔ Error messages don't expose internal implementation

## XSS Validation
Test with malicious input, e.g. `<script>alert("xss")</script>`, `<img src=x onerror=alert(1)>`, `<iframe src="evil-site"></iframe>`, `javascript:alert(1)`. Verify no JavaScript executes, unsafe HTML is removed/escaped, and the app remains stable.

## Markdown Validation
Test headers, lists, tables, code blocks, links, and embedded HTML. Verify markdown renders correctly, unsafe HTML is sanitized, and no scripts execute.

## Accessibility Validation
Verify semantic HTML, heading hierarchy, keyboard navigation, visible focus states, ARIA labels, accessible buttons/links, screen reader compatibility, responsive layout. Target **WCAG 2.1 AA** — accessibility must not regress.

### Keyboard Testing
Navigate with Tab, Shift+Tab, Enter, Escape, Space, and Arrow Keys (where applicable). Verify every interactive element is reachable, no keyboard traps exist, and focus order is logical.

### Screen Reader Review
Verify announcements for Navigation, Search, Buttons, Question Cards, Expand/Collapse, Loading States, Error Messages, Toast Notifications. Use native HTML semantics whenever possible.

## Browser Storage Validation
Inspect Local Storage and Session Storage — verify no passwords, tokens, secrets, or API keys are present; only approved application preferences are stored.

## Error Handling Validation
Simulate failures (broken component, invalid configuration, failed future API, unexpected exception). Verify the Error Boundary catches component errors, the user sees a friendly message, the app keeps functioning, and no stack traces show in production.

## Logging Review
Inspect logs — ensure no passwords, secrets, tokens, environment variables, or sensitive request data appear. Development logs are acceptable; production logs should stay clean.

## Configuration Review
Verify environment variables are centralized, config files organized, and there's no duplicated configuration, hardcoded URLs/secrets, or scattered settings.

## Dependency Audit
Review every dependency: still maintained, no known critical vulnerabilities, no unused packages. Run `npm audit` and `npm outdated`. Document findings.

## OWASP Validation
Review against the **OWASP Top 10**. Verify: ✔ input validation · ✔ output sanitization · ✔ secure configuration · ✔ dependency review · ✔ logging review · ✔ browser storage review · ✔ secure rendering. Document any remaining risks.

## Code Quality Review
Remove unused imports/variables/hooks, dead code, duplicate utilities/components/state, large functions, and complex logic. Improve readability wherever possible.

## Manual Testing

**Desktop:** ✔ Homepage · ✔ Search · ✔ Category filter · ✔ Question rendering · ✔ Expand/Collapse · ✔ Copy functionality · ✔ Sidebar · ✔ Theme switching · ✔ Responsive layout · ✔ No console errors

**Mobile:** ✔ Responsive layout · ✔ Navigation · ✔ Search · ✔ Touch interactions · ✔ Smooth scrolling · ✔ No overflow · ✔ No visual regressions

---

## Git Workflow

Branch: `feature/phase-03-security`

Recommended commits:
```
feat: implement DOMPurify
refactor: improve accessibility
refactor: centralize error handling
refactor: add error boundaries
refactor: centralize configuration
chore: dependency cleanup
chore: remove insecure logging
```
Commit after each logical improvement. Never combine unrelated changes.

## Rollback Strategy

If a security change introduces regressions: identify the affected commit → revert only that change → rebuild → retest → continue only once stability is restored. Never continue development on an unstable application.

---

## Final Report

Generate a report including:

1. **Security Summary** — overall improvements
2. **Files Modified** — full list
3. **Security Improvements** — DOMPurify, input validation, output sanitization, clipboard security, browser storage improvements, configuration improvements
4. **Accessibility Improvements** — ARIA, keyboard navigation, focus management, semantic HTML, contrast improvements, screen reader support
5. **Error Handling** — error boundaries, global error handling, user-friendly messages, logging improvements
6. **Dependency Review** — packages updated/removed, security vulnerabilities addressed
7. **Configuration** — environment cleanup, configuration centralization, secret management readiness
8. **Remaining Recommendations** (do NOT implement now) — e.g. JWT Authentication, Role-Based Access, Secure Cookies, API Authorization, Rate Limiting, CORS, Helmet

---

## Acceptance Criteria

Phase 03 is complete only when:

✔ DOMPurify implemented and HTML sanitized · ✔ Markdown secured · ✔ Accessibility improved · ✔ Error boundaries implemented and error handling centralized · ✔ Browser storage secured · ✔ Configuration centralized · ✔ Dependencies reviewed · ✔ Logging secured · ✔ Existing UI and functionality preserved · ✔ No TypeScript, ESLint, or runtime errors

## Definition of Done

✔ Build succeeds and app runs correctly · ✔ Security and accessibility validation pass · ✔ OWASP review completed · ✔ Browser storage secured, configuration improved · ✔ Error handling centralized · ✔ Existing functionality preserved · ✔ Documentation updated · ✔ Project ready for Phase 04

---

## Final AI Instructions

You are optimizing for security, maintainability, and accessibility.

- Do NOT introduce unnecessary complexity, sacrifice usability for security, or change business logic/UI.
- Every security improvement must be measurable, maintainable, scalable, and compatible with future backend integration.
- When multiple secure implementations are possible, choose the one that follows OWASP recommendations, preserves Next.js best practices, maintains accessibility, improves long-term maintainability, and aligns with enterprise software architecture.

**Do not proceed to Phase 04 until every validation step, acceptance criterion, and Definition of Done above has been successfully completed.**