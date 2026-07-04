# Phase 08 — Dashboard & Content Management System (CMS)

| | |
|---|---|
| **Version** | 1.0 |
| **Status** | Planned |
| **Estimated Time** | 32–40 hours |
| **Priority** | ⭐⭐⭐⭐⭐ Critical |

---

## Objective

Build an enterprise-grade Dashboard and CMS for users, moderators, and admins — turning the Interview Guide into a fully manageable platform where users manage their own content while admins moderate, approve, publish, analyze, and maintain the application.

**Out of scope (future phases):** AI content generation, AI review assistant, reputation system, badges/achievements, live chat, push notifications, Docker, Kubernetes.

## Goals

User/Moderator/Admin dashboards · profile, question, answer, draft, bookmark management · notification center · activity history · analytics dashboard · review queue · category/tag management · media library · role/permission management · audit logs · site/SEO settings · system configuration.

## Success Criteria

Every authenticated user has a dashboard · admins manage all users · moderators review submissions · questions/answers can be approved · categories/tags managed · analytics and activity logs available · **existing public UI unchanged**.

---

## Dashboard Architecture

```
Authentication → Middleware → Dashboard Layout → Role Validation → Sidebar → Page → Widgets → API → MongoDB
```
Every dashboard page must be protected.

**Dashboard tiers (by role):** Guest (no dashboard) → User → Moderator → Admin → Super Admin. Each role sees different navigation; never expose unauthorized nav items.

| Dashboard | Includes |
|---|---|
| **User** | Dashboard home, my profile, my questions/answers, drafts, bookmarks, notifications, account settings, security, activity history, profile statistics |
| **Moderator** | Dashboard, pending questions/answers/categories/tags, review queue, reports, moderation history, activity log |
| **Admin** | Dashboard overview, user/role/question/answer/category/tag management, reports, audit logs, analytics, media library, SEO, site settings, system configuration |

**Layout:** `Header → Sidebar → Breadcrumb → Content → Widgets → Footer` — reusable across all dashboard pages.

**Sidebar items** (shown per permission): Dashboard, Questions, Answers, Categories, Tags, Drafts, Bookmarks, Media, Notifications, Users, Roles, Permissions, Reports, Analytics, Settings, Logout.

## Permission Matrix

| Feature | Guest | User | Moderator | Admin |
|---|---|---|---|---|
| Dashboard / My Questions | ❌ | ✅ | ✅ | ✅ |
| Review Queue / Analytics | ❌ | ❌ | ✅ | ✅ |
| User Management / Site Settings | ❌ | ❌ | ❌ | ✅ |

Never hardcode permissions.

---

## CMS Architecture

```
Dashboard → Content Module → Validation → Repository → MongoDB → Audit Log → Notification
```
Every change must be recorded.

**Database collections:** `users, questions, answers, categories, tags, drafts, reviews, versions` (existing); `notifications, activity_logs, roles, permissions, media, settings, analytics, reports, search_logs` (new this phase).

## Folder & Route Structure

```
app/dashboard/
├── layout.tsx, page.tsx
├── profile/ questions/ answers/ drafts/ bookmarks/ notifications/ settings/
└── admin/
    ├── users/ roles/ permissions/ reviews/ analytics/ reports/
    └── categories/ tags/ media/ seo/ system/
components/dashboard/{widgets,tables,charts,forms,modals}/
hooks/ services/ validators/ types/
```
Dashboard logic stays isolated from the public application.

| Tier | Routes |
|---|---|
| User | `/dashboard`, `/profile`, `/questions`, `/answers`, `/drafts`, `/bookmarks`, `/settings` |
| Moderator | `/dashboard/reviews`, `/dashboard/reports`, `/dashboard/moderation` |
| Admin | `/dashboard/admin{,/users,/questions,/categories,/tags,/settings,/analytics}` |

Every route must pass middleware authentication.

## Widgets, Statistics & Analytics

**Widgets** (single responsibility each): statistics card, activity card, recent questions, pending reviews, recent notifications, trending categories, top contributors, charts.

| Role | Key Stats |
|---|---|
| User | Questions/answers created, drafts, bookmarks, profile completion |
| Moderator | Pending reviews, approved/rejected today, average review time |
| Admin | Total users/questions, published questions, pending reviews, categories, tags, storage usage |

**Analytics tracked:** DAU/WAU/MAU, question/answer growth, search trends, popular categories/tags, top contributors, new registrations (future: retention & conversion rate).

## Media, Audit & Notifications

**Media library** — manage images, documents, PDF, markdown files; track unused media and storage usage (future: Cloudinary/S3/R2/CDN).

**Audit logging** — log every important action (login/logout, question created/approved, answer deleted, role changed, settings updated); never allow destructive actions without logging.

**Notifications** — submission approved/rejected/needs-revision, profile updated, security alerts (future: email, push, SMS).

**Settings modules** — profile, security, notifications, appearance, language, privacy (future: API keys, connected accounts, sessions).

### Deliverables — Design Complete
Dashboard and CMS architecture, all three dashboard types, permission matrix, folder/route structure, widget system, analytics, and audit logging are all designed. **Do not implement yet.**

---

## Implementation Rules

Implement one module at a time; validate before moving to the next. Don't modify the public website UI — the dashboard must stay isolated.

## Implementation Order

1. Dashboard Layout
2. User Dashboard Home
3. User Profile
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
22. Site Settings
23. SEO Settings
24. Security Settings
25. Audit Logs
26. Dashboard Search
27. Bulk Operations
28. Dashboard APIs
29. Validation
30. Cleanup

### Steps 1–9 — User Dashboard
**Layout** — `Header → Sidebar → Breadcrumb → Main Content → Footer`; responsive desktop/tablet/mobile with collapsible sidebar.
**Dashboard home** — widgets for recent questions/answers, pending reviews, drafts, bookmarks, notifications, profile completion, statistics — personalized per user.
**Profile** — manage image, name, username, bio, website, GitHub, LinkedIn, location, skills, experience; validated.
**Account settings** — password, email preferences, notifications, language, theme, privacy, connected accounts, sessions; validate every update.
**My Questions** — search, pagination, sorting, filtering by status (draft/pending/published/rejected); actions: view, edit, delete, duplicate, resubmit.
**My Answers** — search, pagination, sorting, edit, delete, resubmit, version history.
**Drafts** — view, resume editing, delete, duplicate, search, sort, autosave status.
**Bookmarks** — view, remove, search, categorize, sort (future: collections/folders).
**Notifications** — approvals, rejections, security alerts, profile updates, system messages; mark read, delete, search, paginate (future: push).

### Steps 10–18 — Moderator & Admin Core
**Moderator dashboard** — pending questions/answers/categories/tags, reports, statistics, review activity, recent actions.
**Review queue** — approve, reject, needs revision, archive, delete, merge duplicate, moderator notes, history; every action creates an audit log.
**Question management** (admin) — search/filter/sort, bulk delete/publish/archive/reject/approve, export/import, version history.
**Answer management** (admin) — search/filter/sort, approve/reject/delete/restore, history, bulk actions.
**Category management** — create/edit/delete/merge, parent categories, icons, colors, descriptions, SEO, bulk operations.
**Tag management** — create/edit/delete/merge/rename, aliases, popular tags, usage count, bulk actions.
**User management** — search, pagination, filters (role/status/last login/registration date), suspend/activate/delete, reset password, view profile. **Never delete Super Admin.**
**Role management** — Guest/User/Moderator/Admin/Super Admin; create/edit/delete roles, assign permissions (future: custom roles).
**Permission management** — read/create/update/delete/review/publish/archive/export/import, assigned by role; never hardcode.

### Steps 19–25 — Media, Analytics & Governance
**Media library** — manage images, PDF, markdown, ZIP; track unused files & storage; preview, delete, replace, optimize (future: cloud storage).
**Analytics dashboard** — total users/questions/answers, published questions, pending reviews, categories, tags, traffic, top searches, top contributors; charts update dynamically.
**Reports** — user/content/moderation/search/performance reports; export as CSV, Excel, PDF.
**Site settings** — site name, logo, favicon, footer, theme, contact email, timezone, language, maintenance mode (future: multi-language).
**SEO settings** — meta title/description, keywords, Open Graph, Twitter Cards, robots, sitemap, canonical URLs, Schema.org.
**Security settings** — JWT expiration, session timeout, password policy, allowed login methods, OAuth providers, rate limiting, allowed file types/sizes.
**Audit logs** — track login/logout, profile updates, question/answer approval & deletion, role/permission changes, settings updates; store user, timestamp, action, IP, device.

### Steps 26–30 — Search, Bulk Ops & Hardening
**Dashboard search** — global search across users, questions, answers, categories, tags, reports, media, settings; must be fast.
**Bulk operations** — bulk delete/publish/reject/archive/restore/export/category-update; require confirmation dialogs.
**Dashboard APIs** — REST endpoints for users, questions, answers, categories, tags, reviews, notifications, reports, analytics, media, settings.
**Validation (Zod)** — every form, API, upload, setting, permission, and role validated at client, server, and database level.
**Cleanup** — review components, hooks, services, repositories, validators, Redux, routes; remove unused imports/variables, dead code, duplicate logic, temp files, console logs.

### Deliverables — Implementation Complete
All three dashboards, profile/question/answer/draft/bookmark management, notification center, review queue, user/role/permission management, category/tag management, media library, analytics, reports, site/SEO/security settings, audit logs, dashboard APIs, and validation are all complete.

---

## Final Validation

Not complete until every validation step passes — never deploy dashboard features without full validation.

**Build validation** — `npm install → npm run build → npm run lint → npm run type-check` for frontend and backend; expect no TypeScript/ESLint/runtime/console errors.

### Feature Testing Matrix
| Area | Verify | Expected |
|---|---|---|
| User dashboard | home, profile, my questions/answers, drafts, bookmarks, notifications, settings, security, activity history, statistics | loads correctly, personal data shown, responsive, no permission issues |
| Moderator dashboard | pending questions/answers/categories/tags, review queue, reports, moderation history | queue populated, review actions functional, audit logs generated |
| Admin dashboard | overview, user/role/permission/question/answer/category/tag management, media, reports, analytics, settings | every module accessible, correct permissions enforced, stable performance |
| User management | search, pagination, filters, suspend/activate/delete, reset password, role assignment, view profile | managed successfully, Super Admin protected |
| Role & permission | Guest/User/Moderator/Admin/Super Admin × read/create/update/delete/approve/reject/publish/archive | RBAC enforced, no unauthorized access |
| Question management | search/filter/sort, bulk publish/reject/archive/delete, version history | bulk actions work, content updated |
| Answer management | approve/reject/delete/restore, search, bulk actions | workflow complete, history preserved |
| Category management | create/edit/delete/merge, parent category, SEO fields, bulk actions | categories managed correctly |
| Tag management | create/rename/delete/merge, aliases, usage count, search | duplicate prevention, accurate statistics |
| Media library | upload, preview, delete, replace, search, storage usage, unused files | media managed successfully |
| Analytics | total users/questions/answers, top contributors, popular categories/tags, search trends, traffic | accurate metrics, fast-loading charts |
| Reports | user/question/answer/moderation reports, export CSV/Excel/PDF | reports generated correctly |
| Settings | site name, logo, favicon, theme, SMTP, OAuth, language, maintenance mode | configuration saved, changes reflected |
| SEO | meta title/description, keywords, Open Graph, Twitter Cards, sitemap, robots, schema, canonical URLs | SEO data generated correctly |
| Notifications | approved/rejected/needs-revision, security alert, system message, mark read, delete | delivered correctly |
| Dashboard search | users, questions, answers, categories, tags, reports, media, settings | fast and accurate results |

**Accessibility validation** — keyboard navigation, focus indicators, ARIA labels, semantic HTML, color contrast, responsive layout, screen reader support, chart accessibility — target WCAG 2.1 AA.

**Performance validation** — measure dashboard load time, table rendering, pagination, search speed, filtering, analytics, charts, media library — smooth UX.

**Security validation** — authentication, authorization, RBAC, CSRF, XSS prevention, secure headers, rate limiting, input validation, output sanitization, audit logging — secure dashboard.

**Database validation** — users, roles, permissions, questions, answers, categories, tags, reviews, media, notifications, settings, indexes, relationships — integrity maintained.

**API validation** — dashboard/user/role/permission/question/answer/analytics/media/settings APIs — consistent REST responses, proper status codes.

**Logging validation** — log user login, role changes, question/answer approval, media upload, settings update, system errors. **Never log** passwords, JWT, refresh tokens, or secrets.

**Code quality review** — remove unused imports/variables, duplicate logic, dead code, console logs, temp files from components, hooks, services, repositories, validators, Redux, routes, dashboard modules.

---

## Git Workflow

- Branch: `feature/phase-08-dashboard-cms`
- Suggested commits:
  ```
  feat: implement dashboard layout
  feat: add user dashboard
  feat: implement moderator dashboard
  feat: implement admin dashboard
  feat: add review queue
  feat: implement user management
  feat: implement role management
  feat: add analytics dashboard
  feat: implement media library
  feat: add site settings
  fix: improve dashboard validation
  docs: update dashboard documentation
  ```
- Commit after every completed feature.

## Rollback Strategy

If deployment fails: identify the affected module → roll back the commit → retest → redeploy. Never continue deployment with unstable dashboard modules.

## Final Report

Generate a report covering: Dashboard Summary · Files Created/Modified · Dashboard Modules (user/moderator/admin, review queue, notifications, media, analytics, reports, settings) · CMS (questions, answers, categories, tags, users, roles, permissions, SEO) · Security (auth, RBAC, validation, audit logs) · Database (collections, indexes, relationships, migration notes) · APIs (endpoints, validation, performance, error handling) · Testing (unit, integration, manual, coverage, performance) · Future Recommendations (Phase 09 community features/reputation/comments/achievements; Phase 10 AI features — do not implement here).

---

## Acceptance Criteria

Phase 08 is complete only when: User/Moderator/Admin dashboards operational · review queue, question/answer/category/tag management complete · user/role/permission management complete · media library, analytics, reports, notification center operational · site/SEO settings complete · existing public UI unchanged · no TypeScript/ESLint/runtime errors.

## Definition of Done

Enterprise dashboard and CMS complete · RBAC fully implemented · content moderation, user management, analytics, reporting, and settings management complete · accessibility, security, and performance validated · documentation updated · ready for future enterprise features.

## Deliverables

Enterprise dashboard (user, moderator, admin) · CMS · review queue · question/answer/category/tag management · user/role/permission management · notification center · media library · analytics dashboard · reports · SEO manager · site settings · audit logs · dashboard APIs · production-ready CMS.

---

## Antigravity AI Execution Instructions

1. Read the complete project documentation before implementation
2. Follow the implementation order exactly
3. Never expose dashboard routes without authentication
4. Validate permissions for every page, API, and action
5. Record all administrative actions in audit logs
6. Keep dashboard components modular and reusable
7. Preserve the public website UI and routing
8. Validate all forms and API requests on both client and server
9. Optimize tables, filters, pagination, and analytics for performance
10. Generate a final implementation report before marking this phase complete

The Dashboard & CMS is the operational core of the platform — all future enterprise features (reputation systems, AI moderation, advanced analytics, scaling) build on the architecture established here. Do not proceed to future phases until every validation step, acceptance criterion, and Definition of Done has been successfully completed.