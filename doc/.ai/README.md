# 🚀 Frontend Interview Guide — Enterprise AI Development Roadmap

> **Version:** 2.0.0 · **Type:** Enterprise Frontend Learning Platform
> **Stack:** Next.js (App Router) + TypeScript + Tailwind CSS + MongoDB
> **Status:** AI-Guided Refactoring Roadmap

## Table of Contents

1. [Overview](#overview)
2. [Project Goal](#project-goal)
3. [Folder Structure](#folder-structure)
4. [Documentation Guide](#documentation-guide)
5. [Development Phases](#development-phases)
6. [Recommended Workflow](#recommended-workflow)
7. [Validation Checklist](#validation-checklist)
8. [Git Workflow](#git-workflow)
9. [Technology Stack](#technology-stack)
10. [Long-Term Vision](#long-term-vision)
11. [Success Criteria](#success-criteria)
12. [Using with Antigravity AI](#using-with-antigravity-ai)

---

## Overview

This folder contains the AI development roadmap for transforming the **Frontend Interview Guide** into an **enterprise-grade Interview Preparation Platform**.

Designed for use with AI coding assistants — Antigravity AI, Claude, ChatGPT, Cursor, GitHub Copilot, Windsurf, Cline.

Rather than refactoring everything at once, work is split into **small, testable phases**. This reduces bugs, prevents regressions, and mirrors how professional engineering teams ship large changes.

## Project Goal

Transform the current app into a scalable, production-ready platform built on:

Enterprise architecture · Next.js App Router · MongoDB · Server Actions & Route Handlers · AI-ready design · secure, maintainable code · future mobile support

**Target capabilities** (see [Long-Term Vision](#long-term-vision) for the full feature list):
100,000+ interview questions, 10,000+ concurrent users, authentication, admin dashboard, and an AI interview assistant.

## Folder Structure

```text
.ai/
├── README.md
├── PROJECT_RULES.md
├── Phase-01-Architecture.md
├── Phase-02-Performance.md
├── Phase-03-Security.md
├── Phase-04-Backend.md
├── Phase-05-Production.md
└── PROMPTS/
    ├── phase-01-prompt.md
    ├── phase-02-prompt.md
    ├── phase-03-prompt.md
    ├── phase-04-prompt.md
    └── phase-05-prompt.md
```

## Documentation Guide

| Document | Purpose |
|---|---|
| **README.md** | Project overview and how to use this roadmap |
| **PROJECT_RULES.md** | Single source of truth for engineering standards — coding, architecture, security, performance, Next.js, state management, data access, and TypeScript rules |
| **Phase-0X-*.md** | Objectives, scope, tasks, deliverables, acceptance criteria, validation checklist, and Git commit recommendations for each phase |
| **PROMPTS/phase-0X-prompt.md** | AI-ready prompt specifying what to change, what not to change, files to analyze, validation steps, and final report format |

> ⚠️ **PROJECT_RULES.md takes precedence** over any phase document if the two conflict. Never bypass it.

## Development Phases

| Phase | Focus | Goal |
|---|---|---|
| **1 — Architecture** | Analyze project, migrate to Next.js App Router, establish Server vs. Client Component boundaries, restructure folders around `app/`, scope Redux Toolkit (if kept) to client-only UI state, tighten TypeScript, extract components, remove duplication | Clean, modular, App Router–native architecture |
| **2 — Performance** | `next/dynamic`, `next/image`, `next/font`, Server Component data fetching, streaming & Suspense, skeleton loading, Fuse.js search, virtualization, error boundaries | Faster rendering and better UX |
| **3 — Security** | DOMPurify, accessibility, theme provider, error handling, config cleanup, dead-code removal, code quality | Production-ready security and accessibility |
| **4 — Backend** | Build Route Handlers / Server Actions, connect MongoDB directly via a cached serverless-safe client, remove JSON storage, service layer, replace REST calls with direct data access where appropriate | Full-stack Next.js architecture |
| **5 — Production** | Testing, CI/CD, documentation, production validation, final cleanup | Deployment-ready application |

## Recommended Workflow

Work **phase by phase** — never run all phases together:

1. Read `PROJECT_RULES.md`
2. Read the current phase document
3. Read the matching phase prompt
4. Run the AI assistant
5. Review the generated code
6. Build the project
7. Fix issues
8. Commit to Git
9. Move to the next phase

## Validation Checklist

Every phase must pass **all** of the following before moving on:

- [ ] Project builds successfully
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] No runtime errors
- [ ] No broken imports
- [ ] No UI or feature regressions
- [ ] Responsive layout still works
- [ ] Existing functionality preserved

## Git Workflow

Branch per phase, merge into `main` after validation:

```text
main → feature/phase-01 → merge → feature/phase-02 → merge →
feature/phase-03 → merge → feature/phase-04 → merge →
feature/phase-05 → merge → main
```

Commit after every completed task or logical milestone. Example messages:

```text
feat: migrate app to Next.js App Router
refactor: split pages into Server and Client Components
perf: adopt next/image and next/dynamic for lazy loading
feat: replace Express backend with Route Handlers and MongoDB
fix: improve markdown rendering
docs: update architecture documentation
```

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router), TypeScript, Tailwind CSS |
| State (client-only) | Redux Toolkit — scoped to UI state; server data fetched in Server Components |
| Backend | Next.js Route Handlers / Server Actions |
| Database | MongoDB |
| Deployment | Vercel (frontend and backend, single deployment) |

## Long-Term Vision

The platform should evolve to support:

Authentication & user profiles · bookmarks & favorites · progress tracking · AI interview assistant · mock & voice interviews · company-wise questions · daily challenges · premium membership · admin & analytics dashboards · multi-language support · PWA · mobile apps

The architecture should support these with minimal future refactoring.

## Success Criteria

The refactor is successful when:

- The application remains fully functional
- The architecture is modular and follows App Router conventions
- Client-only UI state uses Redux Toolkit; server data is fetched via Server Components, Route Handlers, or Server Actions
- Data is served from MongoDB with no direct frontend access
- Performance and security are measurably improved
- Accessibility meets WCAG AA
- The codebase is maintainable and well-documented
- The project is ready for future enterprise features

## Using with Antigravity AI

1. Open the corresponding phase document
2. Read the objectives and acceptance criteria
3. Copy the matching prompt from `PROMPTS/`
4. Paste it into Antigravity AI
5. Wait for implementation to complete
6. Review the generated code
7. Run validation checks
8. Commit the changes
9. Continue to the next phase only after verification

---

This roadmap mirrors the workflow used by experienced engineering teams: sequential phases, validation after every step, and strict adherence to `PROJECT_RULES.md`. Follow it to reach a production-ready platform without unnecessary risk or regressions.
