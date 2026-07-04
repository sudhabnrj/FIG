# Phase 07 AI Execution Guide — Community Contribution System

| | |
|---|---|
| **Version** | 1.0 |
| **Target AI** | Antigravity AI |
| **Estimated Execution Time** | 24–32 hours |
| **Priority** | ⭐⭐⭐⭐⭐ Critical |

---

## AI Role

You are acting as: Principal Software Architect, Senior Full Stack Engineer, Senior Next.js Engineer, Senior TypeScript Engineer, Senior MongoDB Architect, Senior CMS Architect, Senior Product Engineer, Senior Security Engineer, Senior UI/UX Engineer — transforming the Interview Guide into a production-ready community platform.

Don't behave like a code generator — behave like a senior engineer building an enterprise knowledge-sharing platform comparable to Stack Overflow, Dev.to, Hashnode, or Medium. Prioritize security, performance, scalability, maintainability, accessibility, UX, and SEO.

## Project Context

Current: Next.js 16 App Router → MongoDB Atlas → Authentication → User Dashboard → Interview Questions.
Target: community-driven platform where users create questions → users create answers → admin reviews → publish → searchable content. Community features become the foundation of future dashboard and AI modules.

## Primary Objective

Build a complete Community Contribution System without affecting the existing website — existing pages, routing, APIs, authentication, and design must continue working unchanged.

## Community Goals

Question & answer creation · rich text editor · category suggestion & tag system · drafts & autosave · version history · review workflow & moderation queue · attachments & image upload · markdown & HTML support · code blocks with syntax highlighting · search integration · future-ready architecture.

## Golden Rules

1. Guests cannot create content
2. Only authenticated users may contribute
3. Nothing becomes public without approval
4. Every edit creates a new version
5. Every submission passes moderation
6. Never trust frontend validation
7. Sanitize all HTML
8. Validate every request
9. Never lose draft data
10. Never break existing UI

## Project Rules

Always follow `PROJECT_RULES.md` and `Phase-07-Community-System.md`. If they conflict, `PROJECT_RULES.md` takes precedence.

## Before Writing Code

Do not begin implementation immediately — analyze the project first: authentication, dashboard, database, Redux, API routes, current question/category/search structure, existing components and layouts. Document every reusable component and **reuse before creating new ones**.

---

## Content Lifecycle

**Questions and answers share the same workflow:** `Draft → Editing → Submitted → Pending Review → Approved → Published → Archived`. Rejected path: `Rejected → Needs Revision → Resubmit`. Never bypass this workflow.

## User Roles & Responsibilities

**Hierarchy:** Guest → User → Moderator → Admin → Super Admin. Never hardcode permissions — always use RBAC.

| Role | Capabilities |
|---|---|
| Guest | Read, search, browse |
| User | Create questions/answers, edit own content, delete own drafts, submit content |
| Moderator | Approve, reject, request changes, archive, merge duplicates |
| Admin | Everything |

## Community Architecture

```
Authenticated User → Question Editor → Validation → Draft → Submit → Pending Review → Moderator → Approved → Published → Search Index
```
Maintain this workflow throughout.

## Database & Schema

**Collections:** `users, questions, answers, categories, tags, drafts` (current); `notifications, versions, reports, attachments, likes, bookmarks, comments` (future). Prepare architecture for future growth.

| Schema | Fields |
|---|---|
| **Question** | `title, slug, summary, category, subcategory, difficulty, tags, content, authorId, status, reviewStatus, createdAt, updatedAt` (future: `views, likes, reports, seo, readingTime`) |
| **Answer** | `questionId, content, authorId, status, reviewStatus, createdAt, updatedAt` (future: `acceptedAnswer, likes, reports`) |
| **Category** | `name, slug, description, icon, color, parent, status, createdBy` — requires approval |
| **Tag** | `name, slug, description, status, createdBy` — prevent duplicates |
| **Draft** | `userId, questionId, answerId, content, lastSaved, createdAt, updatedAt` — autosave required |

## Folder & Route Structure

```
app/community/{questions,answers,drafts,categories,tags}/
components/editor/  hooks/  services/  repositories/  validators/  models/
features/community/  store/  types/  utils/
```
Keep community features isolated.

| Tier | Routes |
|---|---|
| Public | `/questions`, `/question/[slug]` |
| Protected | `/community`, `/community/questions/create`, `/community/questions/edit/[id]`, `/community/answers/create`, `/community/drafts`, `/community/categories`, `/community/tags` |

Middleware protects every protected route.

## Rich Text Editor & Content Pipeline

**Editor:** Tiptap (not Quill). Must support rich text, markdown, safe HTML, code blocks + syntax highlighting, tables, lists, images, links, blockquotes, horizontal rules, task lists, emoji, drag/drop & paste images, character counter, full screen (future: Mermaid, math, video).

**HTML strategy:** `Editor → DOMPurify → Validation → Database → DOMPurify → Render`. Never render raw HTML.
**Markdown strategy:** export Markdown → HTML → JSON; keep content portable.
**Image strategy:** allow PNG/JPEG/WEBP/SVG/GIF, max 5MB (future: Cloudinary/S3/R2).
**Version strategy:** every edit → new version → history → restore/compare. Never overwrite previous versions.
**Validation strategy:** enforce at frontend, API, and database — never rely on client-side validation alone.

### Deliverables — Design Complete
Community architecture, content lifecycle, question/answer/category/tag schemas, draft strategy, version history, folder structure, routing, rich text editor plan, and moderation workflow are all defined. **Do not implement yet.**

---

## Implementation Rules

Implementation starts only after authentication is complete. Implement one module at a time; validate before the next. Never expose unpublished content or bypass moderation. Preserve the existing public UI.

## Implementation Order

1. Community Layout
2. Question Creation
3. Question Validation
4. Rich Text Editor
5. HTML Support
6. Markdown Support
7. Code Block Support
8. Image Upload
9. Attachment Manager
10. Category System
11. Tag System
12. Difficulty Level
13. Answer Creation
14. Draft System
15. Auto Save
16. Version History
17. Submission Workflow
18. Review Queue
19. Search Index
20. Notifications
21. Validation
22. Security
23. Repository Layer
24. Service Layer
25. Redux
26. API Routes
27. Cleanup

### Steps 1–3 — Layout & Question Creation
**Community layout** (`/community`) — `Header → Sidebar → Editor Area → Preview Panel → Footer`; kept independent from the public website.
**Question creation** (`/community/questions/create`) — fields: title, summary, category, subcategory, difficulty, tags, description, expected answer, attachments; every field validated.
**Validation** — title 10–150 chars, summary ≤300 chars, question content ≥100 chars, category & difficulty required, answer required; reject duplicate submissions.

### Steps 4–9 — Editor & Media
**Rich text editor (Tiptap)** — bold, italic, underline, strike, headings, paragraphs, lists, tables, task lists, blockquotes, horizontal rules, hyperlinks, images, code blocks + syntax highlighting, markdown, HTML, character counter, full screen, drag/drop & paste images (future: Mermaid, math, video).
**HTML support** — `Editor → DOMPurify → Store → Sanitize again → Render`; never store or render unsafe HTML.
**Markdown support** — export markdown, HTML, and JSON; keep future MDX compatibility.
**Code blocks** — JavaScript, TypeScript, React, Next.js, Node.js, HTML, CSS, SCSS, Tailwind, JSON, MongoDB, SQL, Python, Java, Go, Rust, PHP, C#; syntax highlighting, copy button, language selector, line numbers (future: run code, collapse).
**Image upload** — PNG/JPEG/WEBP/SVG/GIF, max 5MB; flow: select → validate → compress → upload → store → insert into editor (future: Cloudinary/S3/R2).
**Attachment manager** — images, PDF, markdown, ZIP; max 10 attachments; show upload progress and file size; allow remove/replace.

### Steps 10–12 — Taxonomy
**Category system** — search, select, or suggest a category; if not found → create suggestion → pending approval. Only Admin publishes categories.
**Tag system** — search, reuse, create tags; prevent duplicates (future: aliases, merge, popularity).
**Difficulty level** — Beginner, Intermediate, Advanced, Expert — stored in DB.

### Steps 13–20 — Answers, Drafts & Lifecycle
**Answer creation** (`/community/answers/create`) — rich text, images, code blocks, markdown, HTML, attachments, references; every answer enters moderation.
**Draft system** — save, resume, delete, duplicate; support multiple drafts; status `Draft → Editing → Submitted`.
**Autosave** — every 30s or after significant changes; saves editor content, cursor position, images, attachments, tags, category; restores automatically.
**Version history** — every save creates a new version storing content, images, tags, category, timestamp, author; allow restore.
**Submission workflow** — `Draft → Validation → Submit → Pending Review → Moderator → Approve → Publish`; rejected → `Needs Revision → Resubmit`. Never publish immediately.
**Review queue** — separate queues for questions, answers, categories, tags; moderators review independently; actions: approve, reject, needs revision, archive, delete, merge duplicate.
**Search index** — only published content updates search; never index drafts, pending, rejected, or archived content.
**Notifications** — notify user on submitted/approved/rejected/needs-revision (future: email, push, in-app).

### Steps 21–27 — Validation, Architecture & Hardening
**Validation (Zod)** — validate questions, answers, categories, tags, attachments, images, markdown, HTML at frontend, API, and database level.
**Security** — authentication validation, authorization, HTML sanitization, file/attachment validation, rate limiting, spam & duplicate detection; prevent XSS, CSRF, malicious uploads.
**Repository layer** — `QuestionRepository, AnswerRepository, CategoryRepository, TagRepository, DraftRepository, ReviewRepository` — database logic only.
**Service layer** — `QuestionService, AnswerService, CategoryService, TagService, DraftService, ReviewService` — business logic lives here.
**Redux** — `communitySlice, draftSlice, editorSlice, reviewSlice` storing draft state, editor state, review status, loading, errors. Don't store editor HTML unnecessarily.
**API routes** — REST handlers for `/api/questions`, `/api/answers`, `/api/categories`, `/api/tags`, `/api/drafts`, `/api/reviews`, `/api/uploads`.
**Cleanup** — review components, hooks, services, repositories, validators, routes, Redux, editor; remove unused imports/variables, duplicate logic, dead code, temp files, console logs.

### Deliverables — Implementation Complete
Community layout, question & answer creation, Tiptap editor, HTML/markdown/code block support, image upload, attachment manager, category suggestion, tag system, draft system, autosave, version history, submission workflow, review queue, search indexing, repository/service layers, Redux integration, API routes, validation, and security are all complete.

---

## Final Validation

Not complete until every validation step passes — never deploy community features before completing all validation.

**Build validation** — `npm install → npm run build → npm run lint → npm run type-check` for frontend and backend; expect no TypeScript/ESLint/runtime/console errors.

### Feature Testing Matrix
| Area | Verify | Expected |
|---|---|---|
| Question creation | create/edit, delete draft, autosave, category/tag/difficulty selection, attachments, rich text, HTML, markdown, code blocks | draft created, question saved, validation working, submission successful, status = pending review |
| Answer creation | create/edit, delete draft, autosave, attachments, markdown, HTML, rich text, code blocks | answer created, draft saved, pending review, version created |
| Rich text editor | bold/italic/underline/strike, headings, paragraphs, lists, task lists, tables, blockquotes, horizontal rules, links, images, code blocks + highlighting, character counter, undo/redo, paste/drag-drop images, full screen | stable editor, no content loss, fast rendering |
| HTML | allowed vs unsafe HTML, inline scripts, iframe, event handlers, embedded JS | safe HTML stored, unsafe HTML removed, no XSS |
| Markdown | headers, lists, tables, task lists, links, images, blockquotes, code blocks, horizontal rules | correct rendering, no data loss, export works |
| Code blocks | all supported languages | syntax highlighting, copy button, language display |
| Images | PNG/JPEG/WEBP/SVG/GIF, large/invalid files, max size, upload progress | upload succeeds, invalid files rejected, images optimized |
| Attachments | images, PDF, markdown, ZIP, max limit, replace/delete/download | attachments managed correctly |
| Categories | existing categories, search, suggestions, duplicate prevention, parent categories, approval status | suggestions created, pending approval, no duplicate categories |
| Tags | search, create, duplicate prevention, reuse, merge (future) | tags created, duplicates prevented |
| Drafts | save/update/delete/resume, multiple drafts | autosave working, draft recovery working, no data loss |
| Version history | create/compare/restore version, author, timestamp | every edit versioned, restore successful |
| Review workflow | approved path (`Draft→Submit→Pending→Approve→Publish`) and rejected path (`→Needs Revision→Resubmit`) | workflow correct, no direct publishing |
| Moderation | approve, reject, needs revision, archive, delete, merge duplicate, moderator notes | queue updated, status updated, audit log created |
| Search | published questions/answers searchable; drafts/pending/rejected/archived hidden | only published content searchable |
| Permissions | Guest (no create/edit/delete), User (create/edit own, no approve), Moderator (review/approve/reject), Admin (full access) | RBAC working, unauthorized access blocked |
| Database | questions, answers, categories, tags, drafts, reviews, versions, attachments, indexes, relationships | integrity maintained |
| API | `POST/PATCH/DELETE /api/questions`, `/api/answers`, `/api/categories`, `/api/tags`, `/api/drafts`, `/api/reviews`, `/api/uploads` | REST standards followed, correct status codes, proper error responses |

**Security validation** — authentication, authorization, RBAC, input validation, output sanitization, HTML sanitization, file/image validation, spam protection, duplicate detection, rate limiting → secure community platform.

**Accessibility validation** — keyboard navigation, ARIA labels, focus states, responsive design, screen reader support, editor accessibility, image alt text — target WCAG 2.1 AA.

**Performance validation** — measure editor load time, draft save time, submission time, search update, version restore, image upload → smooth experience, fast rendering.

**Logging validation** — log question created/updated, answer created, draft saved, submission, approval, rejection. **Never log** JWT, passwords, cookies, secrets, or sensitive HTML.

**Code quality review** — remove unused imports/variables, duplicate logic, dead code, console logs, debug code from components, hooks, services, repositories, validators, Redux, editor, routes.

---

## Git Workflow

- Branch: `feature/phase-07-community-system`
- Suggested commits:
  ```
  feat: implement community architecture
  feat: add question creation
  feat: add answer creation
  feat: integrate tiptap editor
  feat: implement image uploads
  feat: implement draft system
  feat: implement autosave
  feat: add moderation workflow
  feat: implement version history
  feat: add category suggestions
  feat: implement tag system
  fix: improve validation
  docs: update community documentation
  ```
- Commit after every completed feature.

## Rollback Strategy

If deployment fails: identify the affected feature → roll back the commit → retest → redeploy. Never continue with unstable community features.

## Final Implementation Report

Generate a report covering: Community Summary · Files Created/Modified · Community Features (question/answer creation, editor, drafts, autosave, version history, moderation queue, categories, tags, attachments, images) · Editor (Tiptap, markdown, safe HTML, code blocks, syntax highlighting, images, attachments) · Security (auth, RBAC, HTML sanitization, validation, rate limiting, spam protection) · Database (collections, indexes, relationships, migration notes) · APIs (question/answer/category/tag/draft/review/upload) · Testing (unit, integration, manual, coverage, performance) · Future Recommendations (Phase 08 dashboard, CMS, analytics, user/role management, notification center — do not implement here).

---

## Acceptance Criteria

Phase 07 is complete only when: authenticated users can create questions/answers · rich text editor fully operational · HTML rendered safely, markdown and code blocks supported · image uploads and attachments working · categories suggested, tags managed · draft system, autosave, and version history operational · review workflow and moderation queue operational · existing UI unchanged · no TypeScript/ESLint/runtime errors.

## Definition of Done

Community Contribution System production-ready · rich text editor production-ready · draft system, autosave, and version history complete · moderation workflow complete · category suggestion and tag management implemented · validation complete · security, accessibility, and performance validated · documentation updated · ready for Phase 08.

---

## Final AI Execution Instructions

1. Read the complete project documentation before implementation
2. Follow the implementation order exactly
3. Never publish content directly — every submission must pass the moderation workflow
4. Sanitize all HTML before storing and rendering
5. Validate every request on both client and server
6. Preserve the public UI and routing
7. Keep community modules reusable and modular
8. Generate a final implementation report before marking this phase complete

Do not start Phase 08 until every validation step, acceptance criterion, and Definition of Done has been successfully completed. The Community Contribution System is the foundation of the Dashboard & CMS — build it with scalability, security, and maintainability as the highest priorities.