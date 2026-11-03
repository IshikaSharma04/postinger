# Postly Codebase & Architecture Audit

This audit documents the initial state of the Postly repository, the root causes of identified defects, and the engineering rebuild executed to achieve production reliability and functional parity with Buffer.

---

## 1. Technology Stack

- **Framework**: Next.js 16 (App Router) with React 19 and TypeScript.
- **Styling**: Tailwind CSS with custom design tokens (`#121212`, `#FAFAF8`, `#98E376`, `#1D9BF0`, `#E1306C`).
- **Database & ORM**: PostgreSQL hosted on port 5432, managed through Prisma ORM (`@prisma/client` v6.19.3).
- **Asynchronous Processing**: Redis (port 6379) + BullMQ (`postly-publish` queue) backed by a 30-second overdue sweeper in Next.js instrumentation (`src/instrumentation.ts`).
- **Authentication**: NextAuth.js v5 (`@auth/prisma-adapter`) with credentials provider and session cookie persistence.
- **Validation**: Zod schema validation on all API endpoints and frontend forms.
- **Testing**: Node.js native test runner (`node:test` + `assert/strict` via `tsx`).

---

## 2. Initial Audit Findings: What Was Broken & Root Causes

| Problem Area | Root Cause | Impact | Resolution Applied |
|---|---|---|---|
| **Port Conflict** | Port 3000 was already bound by `/Users/ishikasharma/Desktop/omni-scribe/frontend`. | Requests to `localhost:3000` routed to the wrong app, failing all Postly endpoints. | Configured Postly to consistently run on port 3001 with `AUTH_URL=http://localhost:3001`. |
| **NextAuth CSRF Errors** | `.env.local` had hardcoded `AUTH_URL=http://localhost:3000` without `AUTH_TRUST_HOST=true`. | Sign-in resulted in redirect loop with `?error=MissingCSRF`. | Synchronized `.env` and `.env.local` with `AUTH_URL=http://localhost:3001` and `AUTH_TRUST_HOST=true`. |
| **BullMQ Worker Crash** | Queue name was defined as `"postly:publish"`. | BullMQ throws an unhandled exception: *Queue name cannot contain colons (`:`)* on worker startup. | Renamed queue to `"postly-publish"`. |
| **Route Shadowing** | Empty folders `src/app/register`, `src/app/accounts`, `src/app/compose` existed in parallel with route groups `src/app/(auth)/register`, etc. | Next.js App Router matched the empty folders first, returning blank 404 pages. | Removed orphaned empty directories so route groups resolve correctly. |
| **Schema Field Mismatch** | Frontend post creation sent `{ accountIds: [...] }`, but `createPostSchema` required `socialAccountIds`. | HTTP 400 with `Invalid input: expected array, received undefined`. | Added payload normalization in `POST /api/posts` accepting both `socialAccountIds` and `accountIds`. |
| **Scheduling Sweeper Missing** | Posts scheduled for future execution were saved in PostgreSQL but never published unless Redis BullMQ was active. | Overdue scheduled posts remained permanently in `SCHEDULED` status. | Implemented `sweepOverdueScheduledJobs()` in `src/lib/queue/worker.ts` running every 30s via `src/instrumentation.ts`. |
| **Simulated Flakiness in Tests** | Social provider adapters simulated random 5% network failures even during test runs. | Tests intermittently failed when testing provider adapters. | Scoped mock failures to non-test environments (`NODE_ENV !== "test"`). |

---

## 3. Working Features After Rebuild

1. **Authentication & Multi-Tenant Workspaces**:
   - Secure sign-up, sign-in, and sign-out with bcrypt password hashing and session cookies.
   - Live password requirement checklist (8+ chars, uppercase, lowercase, number).
   - Multi-tenant workspace data isolation via Prisma filters (`workspaceId`).

2. **Publishing & Queue Engine**:
   - Dual-engine publishing: Redis BullMQ delayed jobs + PostgreSQL 30s overdue job sweeper.
   - Idempotency checking via `idempotencyKey` preventing duplicate publishing.
   - Channel-specific content customization using `PostVariant` records.
   - Real status tracking: `DRAFT`, `SCHEDULED`, `PUBLISHING`, `PUBLISHED`, `FAILED`.

3. **Calendar & Date Inspector**:
   - Full Month and Week grid views with scheduled post previews.
   - Side inspector drawer allowing instant rescheduling, deletion, or editing in Composer.
   - "+ Schedule post on this day" shortcut pre-filling Composer date.

4. **Content Ideas (Kanban)**:
   - Drag-and-drop idea management with columns: *Idea*, *In Progress*, *Ready*.
   - One-click "Convert to Post" flow populating the Composer with idea title, notes, and tags.

5. **Channel Management**:
   - Connect/disconnect workflows for Twitter/X, Instagram, LinkedIn, Facebook, TikTok, YouTube, Pinterest, Threads, Bluesky, and Mastodon.
   - Disconnect endpoint (`DELETE /api/accounts`) updating database relationships.

6. **Start Page Link-in-Bio**:
   - Live mobile phone preview next to block reorder/editing controls.
   - Standalone visitor page rendered at `/p/[slug]` with link click tracking.

7. **AI Copywriting Assistant**:
   - Backend integration for generating post hooks, rewriting tone, shortening, and brainstorming ideas.

---

## 4. Security & Persistence Guarantees

- **No Mock Persistence**: All data operations (posts, accounts, ideas, media, start pages) execute against PostgreSQL.
- **Authorization**: Every API endpoint verifies user session and workspace membership before reading or writing.
- **Secret Safety**: OAuth secrets and API tokens are restricted to server-side code; client bundles only receive public identifiers and handles.
