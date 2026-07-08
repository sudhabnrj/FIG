# Implementation Plan — Community Navigation, Access Control & UI Enhancement

This plan covers adding header navigation for the Community portal, enforcing authentication guards on content creation pages (with a delayed redirect and toast notification), and redesigning the Community page into a premium, interactive hub with dynamic statistics, popular categories, latest questions, and call-to-actions.

## User Review Required

> [!IMPORTANT]
> The `/community` page will now be publicly accessible to allow all users (including unauthenticated visitors) to browse the community landing hub, view statistics, categories, benefits, and latest questions.
>
> Authentication is strictly enforced on sub-routes for creating content (`/community/questions/create`, `/community/answers/create`, `/community/categories/create`, `/community/tags/create`), redirecting to `/login` with a toast notification and a 1-second delay.

## Open Questions

> [!NOTE]
> **Q1: Question Detail Page & Interaction**
> Since the project currently lists and expands all questions in cards on the main home page (`/`) rather than using individual detail pages (no `/questions/[id]` route exists), we propose that clicking a latest question on the `/community` landing page redirects to the home page `/` with a query parameter like `?question=ID`. The home page will then automatically scroll to and expand that question card. Please let us know if you prefer this approach.
>
> **Q2: Content Creation Placeholders**
> Since `/community/answers/create`, `/community/categories/create`, and `/community/tags/create` pages do not exist in the current codebase, we will create simple authenticated placeholder pages. If a logged-in user accesses them, they will see a clean status message (e.g., "Answer creation coming soon"). If an unauthenticated user accesses them, the authentication guard will intercept the request, display the toast notification, wait 1 second, and redirect them to `/login`.

## Proposed Changes

### Navigation Header

#### [MODIFY] [Navbar.tsx](file:///d:/review/src/components/layout/Navbar.tsx)
- Import `usePathname` from `next/navigation` to detect active path state.
- Add the "Go To Community" button next to the Brand logo/title:
  - Responsive: visible on both desktop and mobile.
  - Active State: highlight with primary colors when the path is `/community` or sub-routes.
  - Accessibility: hover, focus, active states, and keyboard accessibility using standard button styling.

---

### Route Protection & Guard

#### [MODIFY] [middleware.ts](file:///d:/review/src/middleware.ts)
- Modify `isProtectedRoute` to exclude `/community` and the community creation sub-routes from the immediate, server-side redirect. This allows the client-side component to load and render the custom toast and delay.
- Retain immediate protection for `/profile`, `/settings`, `/dashboard`, and `/community/review`.

#### [NEW] [CommunityAuthGuard.tsx](file:///d:/review/src/components/auth/CommunityAuthGuard.tsx)
- Create a reusable client-side route guard:
  - Check Redux auth state (`isInitialized`, `isAuthenticated`).
  - If unauthenticated, trigger a toast notification: `Please login to contribute to the community.`
  - Prevent page access by rendering a "Redirecting to login..." loading state.
  - Wait 1 second before doing a client-side redirection to `/login` while passing the current URL as a `redirect` query parameter.

#### [MODIFY] [page.tsx](file:///d:/review/src/app/community/questions/create/page.tsx)
- Wrap the page component with `CommunityAuthGuard` to protect it.

#### [NEW] [page.tsx](file:///d:/review/src/app/community/answers/create/page.tsx)
- Create a protected placeholder page wrapped in `CommunityAuthGuard`.

#### [NEW] [page.tsx](file:///d:/review/src/app/community/categories/create/page.tsx)
- Create a protected placeholder page wrapped in `CommunityAuthGuard`.

#### [NEW] [page.tsx](file:///d:/review/src/app/community/tags/create/page.tsx)
- Create a protected placeholder page wrapped in `CommunityAuthGuard`.

---

### Redesigned Community Landing Page

#### [NEW] [route.ts](file:///d:/review/src/app/api/v1/community/stats/route.ts)
- Expose a public endpoint that returns counts for questions, answers, categories, and contributors by querying the MongoDB collections.

#### [NEW] [route.ts](file:///d:/review/src/app/api/v1/community/latest-questions/route.ts)
- Expose a public endpoint returning the 5 latest questions from the database, populated with author details and answer count.

#### [MODIFY] [page.tsx](file:///d:/review/src/app/community/page.tsx)
- Completely redesign the community portal with standard layout sections:
  1. **Hero Section**: Large header, short description, vector icons, Primary CTA ("Create Question" or "Login to Contribute"), Secondary CTA ("Browse Questions" linking to home page).
  2. **Community Statistics**: Dynamic cards displaying database counts of Questions, Answers, Categories, and Contributors.
  3. **Popular Categories**: Premium, hover-animated grid cards (AI, UI/UX, React, JavaScript, Next.js) with description and question counts.
  4. **Latest Questions**: Dynamic list fetching the newest submissions from the database, showing details (difficulty, category, author info, answer count, view count) and links to open them on the main index.
  5. **Community Benefits**: Icon cards explaining "Why contribute?" (Share Knowledge, Help Developers, Build Your Profile, Improve Skills).
  6. **Call To Action (CTA)**: Prominent bottom section motivating users to start contributing.
  7. **User's Active Drafts**: Keep the draft list visible if the user is authenticated.
  8. **Footer links**: Community Rules, Guidelines, FAQ, and Support.

#### [MODIFY] [QuestionContainer.tsx](file:///d:/review/src/components/question/QuestionContainer.tsx)
- Read search params on load. If a `?question=ID` parameter is found, dispatch `expandAll([ID])` to auto-expand the target question card, scroll to it, and apply a subtle flash animation.

---

## Verification Plan

### Automated Tests
- Run `npm run test` to verify no regressions in Redux or hooks.
- Run `npm run build` to verify no compilation or TypeScript errors.
- Run `npm run lint` to verify clean ESLint status.

### Manual Verification
- **Header Navigation**: Click "Go To Community" on home page, profile page, etc. Verify it correctly points to `/community` and highlights when active.
- **Route Protection**: Clear cookie/auth session, try to navigate to `/community/questions/create`. Verify access is blocked, the toast appears, a 1-second delay occurs, and redirection to `/login?redirect=%2Fcommunity%2Fquestions%2Fcreate` executes.
- **Redirect preservation**: Complete login and verify the user is redirected back to `/community/questions/create` with their session established.
- **Redesigned Landing Page**: Verify all sections (Hero, Stats, Categories, Latest Questions, Benefits, CTA, Footer) are fully responsive across desktop, tablet, and mobile with light/dark theme support.
