# Phase 07 — Community Contribution System

| | |
|---|---|
| **Version** | 1.0 |
| **Status** | Planned |
| **Estimated Time** | 24–32 hours |
| **Priority** | ⭐⭐⭐⭐⭐ Critical |

---

## Objective

Transform the app from a static interview guide into a community-driven platform where authenticated users contribute interview content. **All community content must pass an approval workflow before becoming public.** Establishes the full content-creation pipeline while preserving quality through moderation.

**Out of scope (later phases):** admin dashboard, analytics, user management, notification center, reputation system, comments, likes, bookmarks.

## Goals

Create/edit/delete own question & answer · draft questions · submit for review · rich text editor · category suggestion & tag creation · image upload · code blocks · markdown & HTML support · version history · autosave · review workflow · moderation queue.

## Success Criteria

Authenticated users can create questions/answers · rich text editor fully functional (images, code blocks, HTML, markdown) · categories can be suggested, tags created · drafts and autosave work · questions and answers require admin approval before publishing · **existing UI unchanged**.

---

## Community Architecture

```
Authenticated User → Create Question → Draft → Submit → Pending Review → Moderator Review → Approved → Published
```
No community content becomes public without review.

**Content lifecycle (questions & answers, identical):** `Draft → Submitted → Pending Review → Approved → Published → Archived`. Rejected content returns to `Needs Revision`.

## User Permissions

| Role | Capabilities |
|---|---|
| Guest | View questions, search, read answers |
| User | Create/edit own questions & answers, delete own drafts, submit content |
| Moderator | Review, approve, reject, request changes on questions & answers |
| Admin | Everything |

**Community rules** — every submission must have a title, at least one category, at least one answer, pass validation and moderation, and be versioned. No anonymous content.

---

## Database Schema

**Collections:** `questions, answers, categories, tags, drafts, reviews, attachments, versions` (future: `comments, likes, bookmarks, reports, achievements`).

| Schema | Fields |
|---|---|
| **Question** | `_id, title, slug, summary, category, subcategory, difficulty, tags, content, authorId, status, reviewStatus, publishedAt, createdAt, updatedAt` (future: `views, likes, bookmarks, reports, seoTitle, seoDescription`) |
| **Answer** | `_id, questionId, content, authorId, status, reviewStatus, createdAt, updatedAt` (future: `likes, acceptedAnswer, reports`) |
| **Draft** | `_id, userId, questionId, answerId, draftContent, lastSaved, createdAt, updatedAt` — should autosave |
| **Category** | `_id, name, slug, description, icon, color, parentCategory, status, createdBy, createdAt, updatedAt` — users suggest, admins approve |
| **Tag** | `_id, name, slug, description, status, createdBy, createdAt` — prevent duplicates |

---

## Rich Text Editor

**Recommended:** Tiptap (not Quill). Must support: rich text, markdown, HTML, images (incl. drag/drop & paste), tables, code blocks with syntax highlighting, lists, links, blockquotes, horizontal rules, emoji, full screen, autosave.

**Code block languages:** JavaScript, TypeScript, React, Next.js, Node.js, HTML, CSS, SCSS, Tailwind CSS, SQL, MongoDB, JSON, Bash, Python, Java, C#, Go, Rust — all with syntax highlighting.

**Image upload** — allow PNG, JPEG, SVG, WEBP, GIF, max 5MB, stored securely (future: Cloudinary, AWS S3, R2).

**Markdown** — headers, lists, tables, links, images, task lists, code blocks, blockquotes, horizontal rules, inline code; stays HTML-compatible.

**HTML** — safe HTML only, via pipeline `HTML → DOMPurify → Database → Render`. Never store unsafe HTML.

**Version history** — every edit creates a new version (`v1 → v2 → v3...`); users can restore, admins can compare.

**Autosave** — `User types → wait 30s → save draft → continue editing`, to prevent data loss.

---

## Review & Moderation

**Review workflow:** `Create → Submit → Pending → Moderator → Approve → Publish`. Rejected content returns to Draft.

**Moderation queue** — separate queues for pending questions, answers, categories, and tags; moderators review each independently.

## Folder & Route Structure

```
features/community/{components,hooks,services,types,validators,editor,review,drafts,attachments,categories,tags,questions,answers}/
```
Keep community logic isolated.

```
/community
/community/questions
/community/questions/create
/community/questions/edit/[id]
/community/answers/create
/community/drafts
/community/categories
/community/tags
```
All community routes require authentication.

### Deliverables — Design Complete
Community architecture, content lifecycle, database schemas, rich text editor plan, category/tag system, draft workflow, and moderation workflow are all designed. **Do not implement yet.**

---

## Implementation Rules

Implement one feature at a time; validate each before the next. Never expose unpublished content or bypass the review workflow. Preserve existing functionality.

## Implementation Order

1. Authentication Verification
2. Create Question Page
3. Question Form Validation
4. Rich Text Editor
5. HTML Support
6. Markdown Support
7. Code Blocks
8. Image Upload
9. Attachment Management
10. Category Selection
11. Create Category
12. Tag System
13. Difficulty Selector
14. Create Answer
15. Draft System
16. Auto Save
17. Submission Workflow
18. Review Queue
19. Notifications
20. Version History
21. Search Index Update
22. Validation
23. Security
24. Cleanup

### Steps 1–3 — Access & Question Creation
**Auth verification** — only authenticated users may access `/community`, `/community/questions/create|edit`, `/community/answers/create`, `/community/drafts`; guests redirect to `/login`.
**Create Question page** (`/community/questions/create`) — fields: title, summary, category, subcategory, difficulty, tags, question description, answer, attachments; every field validated.
**Form validation** — title 10–150 chars, summary ≤ 300 chars, question ≥ 100 chars, category & difficulty required, answer required; prevent duplicate submissions.

### Steps 4–9 — Editor & Media
**Rich text editor (Tiptap)** — bold, italic, underline, strike, headings, paragraph, lists, tables, task lists, quotes, links, images, (future) videos, code blocks + syntax highlighting, emoji, horizontal rules, HTML, markdown, drag/drop & paste images, full screen, character counter.
**HTML support** — pipeline `Editor → DOMPurify → Database → DOMPurify → Render`; never render unsanitized HTML.
**Markdown support** — editor exports Markdown, HTML, and JSON (future: MDX); keep portable.
**Code blocks** — same language list as above, plus PHP; syntax highlighting, copy button (collapse button future).
**Image upload** — PNG/JPEG/WEBP/SVG/GIF, max 5MB; flow: select → upload → optimize → store → insert into editor (future: Cloudinary/S3/R2).
**Attachment management** — images, PDF, ZIP, markdown files; max 10 attachments; show upload progress.

### Steps 10–13 — Taxonomy
**Category selection** — searchable existing categories; if none fits, suggest new category → pending approval.
**Create category** — fields: name, description, color, icon, parent category; status starts Pending Review; only Admin publishes.
**Tag system** — users can create, search, and reuse tags; admins merge duplicates; prevent duplicate tags.
**Difficulty selector** — Beginner, Intermediate, Advanced, Expert — stored in DB.

### Steps 14–21 — Answers, Drafts & Lifecycle
**Create answer** — allow multiple answers per question; fields: rich text, attachments, references, code blocks, markdown, HTML; every answer enters review.
**Draft system** — save, continue editing, delete, duplicate; status flow `Draft → Editing → Submitted`.
**Autosave** — every 30s or on meaningful edit; saves question/answer content, attachments, and cursor position; restores automatically.
**Submission workflow** — `Draft → Submit → Validation → Pending Review → Moderator → Approved → Published`; never publish immediately.
**Review queue** — separate moderation queues for questions, answers, categories, tags; moderators review independently.
**Notifications** — notify contributor on submitted/approved/rejected/needs-revision (future: email, push, in-app).
**Version history** — every update creates a new version storing editor content, attachments, tags, category, timestamp, author; allow restoring previous versions.
**Search index update** — on approval, update the search index so the question becomes searchable; drafts must never appear in search.

### Steps 22–24 — Validation, Security & Cleanup
**Validation (Zod)** — validate question, answer, category, tag, image, attachments, rich text, markdown, HTML at client, API, and database level.
**Security** — verify authenticated user, rate limiting, HTML sanitization, image/file/attachment validation; prevent XSS, spam, duplicate content, malicious uploads.
**Cleanup** — review components, hooks, services, validators, editor, routes, models; remove duplicate logic, unused imports, temp files, console logs, dead code.

### Deliverables — Implementation Complete
Question & answer creation, rich text editor, safe HTML, markdown, image upload, category suggestion, tag creation, draft system, autosave, submission workflow, moderation queue, version history, search-index prep, validation, and security are all complete.

---

## Final Validation

Not complete until every validation step passes — never deploy community features without testing.

**Build validation** — `npm install → npm run build → npm run lint → npm run type-check` for frontend and backend; expect no TypeScript/ESLint/runtime/console errors.

### Feature Testing Matrix
| Area | Verify | Expected |
|---|---|---|
| Question creation | create/edit question, delete/save draft, autosave, category/tag selection, rich text, image upload, HTML, markdown, code block, attachments | draft created/updated, submission successful, pending review |
| Answer creation | create/edit answer, delete draft, autosave, attachments, images, markdown, HTML, code blocks | draft saved, submission successful, review queue updated |
| Rich text editor | bold/italic/underline, headings, lists, tables, blockquotes, task lists, links, images, code blocks + highlighting, emoji, markdown/HTML/JSON export, full screen, undo/redo, character counter, copy code | editor remains stable |
| HTML | allowed vs sanitized HTML, unsafe scripts, inline events, iframe | safe HTML stored, unsafe HTML removed, no XSS |
| Markdown | headers, tables, lists, code blocks, links, images, blockquotes, horizontal rules, task lists | correct rendering, no data loss, portable markdown |
| Images | PNG/JPEG/WEBP/SVG/GIF, large images, invalid files, max size, upload progress | upload succeeds, images optimized, invalid files rejected |
| Attachments | PDF/ZIP/markdown/images, limits, download/delete/replace | attachments stored, accessible, secure |
| Categories | existing categories, search, create suggestion, duplicate, parent category, approval status | suggestions created, duplicates prevented, pending review |
| Tags | search, create, duplicate, reuse, admin merge | duplicate prevention, searchable tags |
| Drafts | create/update/delete/restore, autosave, multiple drafts | no data loss, draft restored, stable editing |
| Version history | version creation/restore, compare versions, editor changes, attachments, metadata | every edit versioned, restore works |
| Review workflow | approved path (`Draft→Submitted→Pending→Approved→Published→Archived`) and rejected path (`→Rejected→Needs Revision→Resubmit`) | workflow correct, no direct publishing |
| Moderation | approve, reject, needs revision, archive, delete, merge duplicate | queue updated, content status updated |
| Search | published questions/answers searchable; drafts, pending, rejected hidden; index updated | only published content searchable |
| Permissions | Guest (no create/edit/delete), User (create/edit own, no approve), Moderator (review/approve/reject), Admin (full access) | permissions enforced |

**Security validation** — authentication, authorization, HTML sanitization, image/attachment validation, rate limiting, spam & duplicate prevention → secure community platform.

**Performance validation** — measure editor load time, image upload speed, draft save time, submission time, search update, version restore → smooth performance.

**Accessibility validation** — keyboard navigation, screen reader, ARIA labels, focus states, editor accessibility, image alt text, responsive layout — target WCAG 2.1 AA.

**Mobile testing** — question/answer editor, image upload, code block, toolbar, responsive layout, touch gestures — mobile friendly.

**Database validation** — questions, answers, categories, tags, drafts, versions, attachments, indexes, relationships → clean data, no duplicate records.

**API validation** — create/update question, delete draft, submit question, create answer, category suggestion, tag creation, draft APIs, review APIs → consistent API responses.

**Logging validation** — log question created, answer created, draft saved, submission, approval, rejection. **Never log** passwords, tokens, or sensitive HTML.

**Code quality review** — remove unused imports/variables, duplicate code, dead code, debug code, console logs from components, hooks, services, repositories, validators, editor, routes, Redux.

---

## Git Workflow

- Branch: `feature/phase-07-community-system`
- Suggested commits:
  ```
  feat: implement community architecture
  feat: add question creation
  feat: add answer creation
  feat: integrate tiptap editor
  feat: implement draft system
  feat: implement autosave
  feat: add category suggestions
  feat: implement review workflow
  feat: add version history
  fix: improve validation
  docs: update community documentation
  ```
- Commit after every logical feature.

## Rollback Strategy

If deployment fails: identify the failing feature → roll back the affected commit → retest → redeploy. Never continue with unstable community features.

## Final Report

Generate a report covering: Community Summary · Files Created/Modified · Editor (Tiptap, markdown, HTML, images, code blocks, attachments) · Community (questions, answers, categories, tags, drafts, review workflow, version history) · Security (sanitization, validation, permissions, auth, rate limiting) · Database (collections, indexes, relationships) · Testing (unit, integration, manual, coverage) · Future Recommendations (Phase 08 dashboard, CMS, notifications, analytics, moderation dashboard — do not implement here).

---

## Acceptance Criteria

Phase 07 is complete only when: authenticated users can create questions/answers · rich text editor operational · HTML and markdown supported safely · images and attachments upload correctly · categories/tags can be suggested/created · draft system and autosave operational · review workflow and moderation queue implemented · version history operational · search updates only after approval · existing UI preserved · no TypeScript/ESLint/runtime errors.

## Definition of Done

Community contribution system operational · rich text editor production-ready · draft system, version history, and moderation workflow complete · category suggestion and tag management implemented · secure HTML rendering and image upload · validation and accessibility validated · documentation updated · ready for Phase 08.

## Deliverables

Community contribution system · question & answer creation · rich text editor · markdown support · safe HTML rendering · code blocks with syntax highlighting · image upload · attachment manager · category suggestion · tag management · draft system · autosave · version history · moderation workflow · review queue · search index integration · community APIs · production-ready community platform.

---

## Antigravity AI Execution Instructions

1. Read the complete project before making changes
2. Follow the implementation order exactly
3. Never publish content directly — every submission must pass the review workflow
4. Sanitize all HTML before storage and before rendering
5. Validate every request on both client and server
6. Preserve existing UI and routing; keep community features modular and isolated
7. Generate a final implementation report before marking the phase complete

Do not start **Phase 08** until every validation step, acceptance criterion, and Definition of Done has been successfully completed. The Community Contribution System is the foundation for the Admin CMS and User Dashboard introduced in Phase 08.