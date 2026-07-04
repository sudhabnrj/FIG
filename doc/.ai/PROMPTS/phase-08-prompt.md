# Phase 08 AI Execution Guide — Dashboard & Enterprise CMS

| | |
|---|---|
| **Version** | 1.0 |
| **Target AI** | Antigravity AI |
| **Estimated Execution Time** | 32–40 hours |
| **Priority** | ⭐⭐⭐⭐⭐ Critical |

---

## AI Role

You are acting as: Principal Software Architect, Senior Full Stack Engineer, Senior Next.js Engineer, Senior TypeScript Engineer, Senior MongoDB Architect, Senior CMS Architect, Senior UI Engineer, Senior Product Engineer, Senior DevOps Engineer — building an enterprise-grade Dashboard & CMS comparable to Stack Overflow, GitHub, Hashnode, Medium, or Dev.to.

You are not an AI code generator. Every decision must prioritize security, performance, scalability, maintainability, accessibility, SEO, user experience, and future expansion.

## Project Context

Current: Next.js 16 App Router → Authentication → Community System → Question Submission → Answer Submission → Moderation Queue.
Target: Enterprise Dashboard → Enterprise CMS → Analytics → Content Moderation → Administration → future AI integration.

## Primary Objective

Build an enterprise Dashboard and CMS without affecting the public website, routing, authentication, community features, search, SEO, or current UI. Everything must remain backward compatible.

## Dashboard Goals

User/Moderator/Admin dashboards · dashboard layout · profile/question/answer/draft/bookmark management · notification center · review queue · user/role/permission management · category/tag management · media library · analytics · reports · SEO & site settings · audit logs · future-ready CMS.

## Golden Rules

1. Dashboard must be protected
2. Never expose admin routes publicly
3. Every admin action creates an audit log
4. Permissions belong to RBAC
5. Never hardcode permissions
6. Dashboard must remain modular
7. Reuse existing components
8. Never duplicate business logic
9. Do not modify public UI
10. Everything should be scalable

## Project Rules

Always follow `PROJECT_RULES.md` and `Phase-08-Dashboard-CMS.md`. If they conflict, `PROJECT_RULES.md` takes precedence.

## Before Writing Code

Do not begin implementation immediately — analyze the project first: authentication, dashboard, community system, database, current APIs, Redux, layouts, sidebar, navigation, user roles, existing components/models, search, and analytics. Document findings and **reuse before creating new components**.

---

## Dashboard Types & Contents

**Tiers:** Guest (no dashboard) → User → Moderator → Admin → Super Admin — each with different permissions.

| Dashboard | Contains |
|---|---|
| **User** | Home, profile, my questions/answers, drafts, bookmarks, notifications, security, settings, activity, statistics (future: achievements, collections) |
| **Moderator** | Dashboard, pending questions/answers/categories/tags, review queue, reports, moderation history, activity, statistics |
| **Admin** | Overview, user/role/permission management, question/answer/category/tag management, media library, analytics, reports, SEO, site/system settings, audit logs |

## Architecture

**Dashboard:** `Authentication → Middleware → RBAC → Dashboard Layout → Sidebar → Widgets → Repository → Services → MongoDB`. Maintain layered architecture.
**CMS:** `Dashboard → Content Module → Validation → Repository → Service → MongoDB → Audit Log`. Every modification is recorded.

**RBAC** — Guest → User → Moderator → Admin → Super Admin; permissions must be dynamic, never hardcoded. Validate permissions at page, API, action, and database level — every request must be authorized.

## Layout & Navigation

**Layout:** `Header → Sidebar → Breadcrumb → Content Area → Widgets → Footer` — reusable across all pages.
**Sidebar items** (shown per permission): Dashboard, Questions, Answers, Categories, Tags, Drafts, Bookmarks, Notifications, Users, Roles, Permissions, Reports, Analytics, Media, SEO, Settings, Logout.
**Widgets** (single responsibility each): statistics card, activity card, recent questions/answers/reviews, notifications, top categories/contributors, charts.

## Database, Folder & Route Structure

**Collections:** `users, questions, answers, categories, tags, drafts, reviews, versions` (current); `notifications, roles, permissions, media, settings, analytics, audit_logs, reports` (future).

```
app/dashboard/
├── layout.tsx, page.tsx
├── profile/ questions/ answers/ drafts/ bookmarks/ notifications/ settings/
└── admin/
    ├── users/ roles/ permissions/ reviews/ analytics/ reports/
    └── media/ seo/ system/
components/dashboard/{widgets,tables,forms,charts}/
hooks/ repositories/ services/ validators/ types/ store/
```
Dashboard should remain isolated.

| Tier | Routes |
|---|---|
| User | `/dashboard{,/profile,/questions,/answers,/drafts,/bookmarks,/settings}` |
| Moderator | `/dashboard/reviews`, `/dashboard/moderation`, `/dashboard/reports` |
| Admin | `/dashboard/admin{,/users,/questions,/categories,/tags,/settings,/analytics}` |

Protect every route with middleware.

## Analytics, Audit & Validation Strategy

**Analytics tracked:** DAU/WAU/MAU, new users, questions/answers created, published questions, pending reviews, popular categories/tags, top contributors, search trends (future: retention, engagement, AI insights).

**Audit logging** — record login/logout, role/permission changes, question/answer approval/rejection/deletion, settings updates, media uploads. Never allow administrative actions without logging.

**Validation** — enforce at frontend → API → service → repository → database. Never trust client-side validation alone.

### Deliverables — Design Complete
Dashboard and CMS architecture, dashboard roles, layout, RBAC, sidebar, widget system, folder/route structure, analytics, audit logging, and database collections are all defined. **Do not implement yet.**

---

## Implementation Rules

Dashboard implementation begins only after Authentication and the Community System are complete. Implement one module at a time; never build multiple CMS modules simultaneously. Validate each module before continuing. Preserve the existing public website.

## Implementation Order

1. Dashboard Layout
2. User Dashboard
3. Profile Management
4. Account Settings
5. My Questions
6. My Answers
7. Draft Management
8. Bookmark Management
9. Notification Center
10. Moderator Dashboard
11. Review Queue
12. Question Management
13. Answer Management
14. Category Management
15. Tag Management
16. User Management
17. Role Management
18. Permission Management
19. Media Library
20. Analytics Dashboard
21. Reports
22. SEO Management
23. Site Settings
24. Audit Logs
25. Dashboard Search
26. Dashboard APIs
27. Redux
28. Validation
29. Security
30. Cleanup

### Steps 1–9 — User Dashboard
**Layout** (`/dashboard/layout.tsx`) — `Header → Sidebar → Breadcrumb → Main Content → Footer`; responsive, collapsible sidebar, sticky header, dark-mode ready, mobile friendly.
**User dashboard home** — widgets for recent questions/answers, drafts, bookmarks, notifications, profile completion, contribution statistics, recent activity — personalized only.
**Profile management** — profile/cover image, display name, username, bio, location, website, GitHub, LinkedIn, skills, experience, social links, preview; validate every update.
**Account settings** — password change, theme, language, notifications, privacy, connected accounts, active sessions, delete-account request; require password confirmation for sensitive changes.
**My Questions** — search, pagination, sorting, filtering (draft/pending/published/rejected/archived); actions: view, edit, delete, duplicate, restore draft, resubmit, version history.
**My Answers** — search, filter, pagination, edit, delete, duplicate, restore version, history, references, attachments.
**Draft management** — resume editing, delete, duplicate, restore, sort, search, filter, autosave status, preview.
**Bookmark management** — view, search, categorize, remove, sort, filter (future: collections/folders).
**Notification center** — display approvals/rejections/needs-revision/security alerts/account updates/announcements; mark read/all read, delete, filter, search, paginate.

### Steps 10–18 — Moderator & Admin Core
**Moderator dashboard** — pending questions/answers/categories/tags, reported content, review queue, recent actions, moderation statistics.
**Review queue** — approve, reject, needs revision, archive, delete, merge duplicate, add review notes, view history; every action creates an audit log, notification, and version record.
**Question management** (admin) — search, advanced filters, bulk approve/reject/publish/archive/delete/restore, export/import, version history.
**Answer management** — search, filter, approve/reject/delete/restore, history, bulk actions, review notes.
**Category management** — create/edit/delete/merge/move, parent categories, icons, colors, descriptions, SEO fields, bulk operations.
**Tag management** — create/edit/delete/rename/merge, aliases, usage count, popular tags, bulk operations.
**User management** — search, pagination, filters, role assignment, suspend/activate/block/delete, reset password, force logout, view profile. **Never delete Super Admin.**
**Role management** — Guest/User/Moderator/Admin/Super Admin (future: custom roles); create/edit/delete/assign/clone permissions.
**Permission management** — read/create/update/delete/approve/reject/publish/archive/import/export, assigned dynamically; never hardcoded.

### Steps 19–24 — Media, Analytics & Governance
**Media library** — manage images, documents, PDF, ZIP, markdown; track unused files, preview, replace, delete, optimize, storage usage (future: Cloudinary/S3/R2).
**Analytics dashboard** — total/active users, questions, answers, categories, tags, published content, pending reviews, daily/monthly visitors, top contributors, search trends; charts load asynchronously.
**Reports** — content/user/moderation/search/performance reports; export CSV/Excel/PDF; date filters and custom range.
**SEO management** — meta title/description, keywords, canonical URL, Open Graph, Twitter Card, structured data, robots, sitemap, Schema.org.
**Site settings** — application name, logo, favicon, theme, footer, SMTP, OAuth, maintenance mode, timezone, language, contact email (future: multi-tenant, white label).
**Audit logs** — record login/logout, user creation, role/permission changes, question/answer approval/deletion, category/settings updates, media uploads; store timestamp, user, IP, browser, device, action.

### Steps 25–30 — Search, APIs & Hardening
**Dashboard search** — global search across users, questions, answers, categories, tags, reports, media, settings; fast, debounced input, keyboard navigation.
**Dashboard APIs** — REST route handlers for `/api/dashboard`, `/api/users`, `/api/roles`, `/api/permissions`, `/api/questions`, `/api/answers`, `/api/categories`, `/api/tags`, `/api/reviews`, `/api/reports`, `/api/media`, `/api/settings`.
**Redux** — `dashboardSlice, analyticsSlice, notificationSlice, reviewSlice, settingsSlice` storing dashboard state, widgets, notifications, loading, errors, user preferences.
**Validation (Zod)** — validate forms, uploads, settings, permissions, roles at client → server → database.
**Security** — RBAC, authentication validation, authorization, CSRF protection, rate limiting, input validation, output sanitization, audit logging, secure headers; prevent privilege escalation.
**Cleanup** — review components, hooks, services, repositories, validators, Redux, route handlers, dashboard modules; remove unused imports/variables, duplicate logic, dead code, console logs, debug code.

### Deliverables — Implementation Complete
All three dashboards, profile/question/answer/draft/bookmark management, notification center, review queue, user/role/permission management, category/tag management, media library, analytics, reports, SEO/site settings, audit logs, dashboard APIs, Redux, validation, and security are all complete.

---

## Final Validation

Not complete until every validation step passes — the Dashboard is the operational center of the platform, so never deploy without full validation.

**Build validation** — `npm install → npm run build → npm run lint → npm run type-check` for frontend and backend; expect no TypeScript/ESLint/runtime/console errors.

### Feature Testing Matrix
| Area | Verify | Expected |
|---|---|---|
| User dashboard | home, profile, my questions/answers, drafts, bookmarks, notifications, settings, security, activity history, statistics | loads successfully, responsive, correct user data, fast loading |
| Moderator dashboard | pending questions/answers/categories/tags, review queue, moderation history, reports, statistics | review queue working, moderation actions working, audit logs created |
| Admin dashboard | overview, users, roles, permissions, questions, answers, categories, tags, media, reports, analytics, settings | all modules accessible, correct permissions, no performance issues |
| User management | search, pagination, filters, suspend/activate/delete, reset password, role assignment, view profile | stable, Super Admin protected |
| Role & permission | Guest/User/Moderator/Admin/Super Admin × read/create/update/delete/approve/reject/archive/export | RBAC working correctly, no privilege escalation |
| Question management | search, filters, sorting, bulk approve/reject/publish/archive/delete/restore, version history | bulk operations successful, data consistent |
| Answer management | approve/reject/delete/restore, bulk actions, review notes, history | workflow complete, audit logs created |
| Category management | create/edit/delete/merge/move, parent categories, SEO, bulk operations | categories managed correctly |
| Tag management | create/rename/delete/merge, aliases, usage count, popular tags | duplicate prevention, accurate usage counts |
| Media library | upload, preview, replace, delete, optimize, search, unused media, storage usage | media managed successfully |
| Analytics | daily/weekly/monthly users, questions, answers, categories, tags, search trends, traffic, top contributors | accurate data, charts load quickly |
| Reports | user/content/moderation/performance/search reports, export CSV/Excel/PDF | reports generated correctly |
| Settings | site name, logo, theme, language, timezone, SMTP, OAuth, maintenance mode | configuration saved, settings applied |
| SEO | meta title/description, keywords, canonical URL, Open Graph, Twitter Cards, robots, sitemap, structured data | SEO metadata generated correctly |
| Dashboard search | users, questions, answers, categories, tags, reports, media, settings | fast search, accurate results |

**Accessibility validation** — keyboard navigation, ARIA labels, focus states, semantic HTML, responsive layout, charts, forms, tables, screen readers — target WCAG 2.1 AA.

**Performance validation** — measure dashboard load, widget/table rendering, pagination, search, filtering, analytics, media library — smooth UX.

**Security validation** — authentication, authorization, RBAC, CSRF protection, rate limiting, input validation, output sanitization, secure headers, audit logs → secure dashboard, no unauthorized access.

**Database validation** — users, roles, permissions, questions, answers, categories, tags, reviews, media, settings, notifications, audit logs, indexes, relationships → integrity maintained.

**API validation** — dashboard/user/question/answer/category/tag/review/analytics/reports/media/settings APIs → REST standards followed, correct status codes, consistent responses.

**Logging validation** — log user login/logout, role/permission changes, question approval/rejection, media upload, settings update, errors. **Never log** passwords, JWT, refresh tokens, cookies, secrets, or sensitive user data.

**Code quality review** — remove unused imports/variables, dead code, duplicate logic, console logs, debug code from components, hooks, services, repositories, validators, Redux, route handlers, dashboard modules.

---

## Git Workflow

- Branch: `feature/phase-08-dashboard-cms`
- Suggested commits:
  ```
  feat: implement dashboard layout
  feat: implement user dashboard
  feat: implement moderator dashboard
  feat: implement admin dashboard
  feat: add review queue
  feat: implement user management
  feat: implement role management
  feat: implement analytics
  feat: implement media library
  feat: implement reports
  feat: implement site settings
  feat: implement SEO settings
  fix: improve dashboard validation
  docs: update dashboard documentation
  ```
- Commit after every completed feature.

## Rollback Strategy

If deployment fails: identify the affected module → roll back the commit → retest → redeploy. Never continue deployment with unstable dashboard modules.

## Final Implementation Report

Generate a report covering: Executive Summary · Files Created/Modified · Dashboard Modules (user/moderator/admin, profile, questions, answers, bookmarks, drafts, notifications, settings) · CMS Modules (questions, answers, categories, tags, media, reports, analytics, SEO, users, roles, permissions) · Security (RBAC, auth, validation, audit logging, rate limiting, headers) · Database (collections, indexes, relationships, migration notes) · APIs (endpoints, validation, performance, error handling) · Testing (unit, integration, manual, coverage, performance, accessibility) · Known Issues · Future Recommendations (Phase 09 community features/reputation/badges; Phase 10 AI assistant/review/question generator/duplicate detection/tag & SEO generators — do not implement here).

---

## Acceptance Criteria

Phase 08 is complete only when: User/Moderator/Admin dashboards, review queue, question/answer/category/tag management, user/role/permission management, media library, analytics, reports, notification center, SEO/site settings, and audit logs are all operational · existing public website unchanged · no TypeScript/ESLint/runtime errors.

## Definition of Done

Enterprise Dashboard and CMS complete · RBAC fully implemented · user management, content moderation, analytics, reporting, media management, and settings management complete · audit logging complete · accessibility, security, and performance validated · documentation updated · production ready.

---

## Final AI Execution Instructions

1. Read all project documentation before implementation
2. Follow the implementation order exactly
3. Protect every dashboard page with middleware
4. Validate permissions for every page, API, and action
5. Log every administrative action
6. Reuse existing components whenever possible
7. Preserve the public website UI and routing
8. Optimize tables, filters, pagination, and analytics
9. Keep the architecture modular and scalable
10. Generate a complete implementation report before marking Phase 08 complete

The Dashboard & CMS is the operational core of the application — all future enterprise features (reputation, comments, AI moderation, AI search, AI question generation, analytics, enterprise scaling) must build upon the architecture established here. Do not proceed to future phases until every validation step, acceptance criterion, and Definition of Done has been successfully completed.