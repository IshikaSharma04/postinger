# Postly — Production Social Media Scheduling & Publishing Platform

> An enterprise-grade, multi-tenant social media management suite built with Next.js 15 (App Router), TypeScript, Three.js 3D telemetry, BullMQ distributed background queues, PostgreSQL (Prisma ORM), and Redis.

[![Postly CI](https://github.com/ishikasharma/postly/actions/workflows/ci.yml/badge.svg)](https://github.com/ishikasharma/postly/actions/workflows/ci.yml)
[![Node](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org)
[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791.svg)](https://www.postgresql.org)
[![Redis](https://img.shields.io/badge/Redis-7-dc382d.svg)](https://redis.io)

---

## 🚀 Key Highlights & Architecture

- **Buffer-Grade Product Suite**:
  - **Create (Idea Bank)**: Content scratchpad at `/ideas` with AI brainstorming and 1-click conversion into scheduled posts.
  - **Publishing & Queue Slots**: Automated recurring weekly time slots at `/queue` plus "Customize for each network" tabs at `/compose`.
  - **Community (Social Inbox)**: Cross-platform comment triage at `/community` with sentiment filters (Questions, Praise) and inline reply dispatches.
  - **Start Page (Link-in-Bio)**: Complete link-in-bio website builder at `/start-page` with live smartphone preview and public hosting at `/p/[handle]`.
  - **Audience Heatmap**: 7-day × 24-hour visual follower activity heatmap pinpointing peak engagement windows.
- **Interactive 3D Visualizations (Three.js)**:
  - **Constellation Core**: Custom interactive 3D icosahedron node with orbiting social satellites and 300-point data dust field on the landing hero with mouse parallax tilt.
  - **Live Worker Telemetry**: Wireframe dodecahedron on the executive dashboard displaying real-time background queue sync and dispatch activity.
- **Idempotent Distributed Queue Engine**:
  - Built on **BullMQ + Redis** with dedicated worker processes (`src/lib/queue/worker.ts`).
  - Strict job idempotency using deduplication tokens (`jobId: post_<id>_<platform>`) to prevent duplicate social publishing across retries or worker restarts.
  - Configurable exponential backoff retry schedules (up to 3 attempts with 5s initial delay).
- **Unified Post Management Hub (`/posts`)**:
  - Filter posts by state (`ALL`, `DRAFT`, `SCHEDULED`, `PUBLISHED`, `FAILED`) and platform.
  - Live preview modal with platform-accurate styling (Twitter / X, LinkedIn, Instagram).
  - In-place editing and rescheduling modal directly integrated with `PATCH /api/posts/[id]`.
- **Integrated AI Content Assistant (`/api/ai/generate`)**:
  - Server-side text generation supporting 5 operational modes: `IDEAS`, `REWRITE`, `ADAPT`, `HOOKS`, `SUMMARIZE`.
  - Tone selection (`Professional`, `Punchy`, `Casual`, `Thought-Leadership`, `Technical`).
  - Seamless dual-engine support: uses OpenAI / Gemini when keys are present, and provides intelligent contextual fallbacks for offline demo mode.
- **Production Design System**:
  - Thoughtfully designed studio aesthetic matching Buffer.com: warm gallery canvas (`#FAFAF9`), subtle zinc borders (`#E4E4E0`), deep obsidian typography (`#0D0D0E`), and royal cobalt accent (`#2563EB`).
  - Zero generic purple AI gradients; fully semantic badges and responsive layouts.
- **Enterprise Multi-Tenancy & RBAC**:
  - Workspace scoping on all database queries with role-based access control (`OWNER`, `ADMIN`, `MEMBER`).
  - NextAuth v5 session authentication with credentials provider and argon2/bcrypt-compatible password hashing.
- **Production Health & Observability Endpoint (`/api/health`)**:
  - Probes live PostgreSQL database via `SELECT 1` and Redis via `PING`.
  - Reports service health, uptime, and latency in milliseconds.

---

## 🏗️ System Architecture

```mermaid
graph TD
  User([User / Browser]) -->|HTTP / JSON| NextApp[Next.js 15 App Router]
  
  subgraph Frontend Layer
    Landing[Landing Hero + Three.js Constellation]
    Dashboard[Dashboard + Three.js Telemetry]
    Composer[Composer + AI Assistant Modal]
    PostsHub[All Posts Management Hub]
    Calendar[Interactive Calendar View]
  end

  subgraph API & Backend Layer
    NextApp --> AuthRoute[NextAuth v5 /api/auth]
    NextApp --> PostsRoute[CRUD /api/posts & /api/posts/:id]
    NextApp --> AIRoute[AI Content Engine /api/ai/generate]
    NextApp --> QueueRoute[Queue Dispatch /api/queue]
    NextApp --> HealthRoute[Health Check /api/health]
  end

  subgraph Data & Queue Layer
    PostsRoute -->|Prisma ORM| Postgres[(PostgreSQL 15)]
    QueueRoute -->|BullMQ Jobs| Redis[(Redis 7)]
    Worker[Background Queue Worker] -->|Fetch Jobs| Redis
    Worker -->|Execute & Update| Postgres
    Worker -->|Social Adapters| Providers[Twitter / LinkedIn / IG Adapters]
  end
```

---

## 💻 Tech Stack

| Domain | Technology | Purpose |
|---|---|---|
| **Framework** | Next.js 15 (React 19) | App Router, Server Components, Route Handlers |
| **Language** | TypeScript 5.x | Strict type safety across frontend and backend |
| **3D Graphics** | Three.js | Canvas scenes, interactive nodes, particle fields |
| **Styling** | Vanilla Tailwind CSS | Studio gallery design system (obsidian + cobalt) |
| **Database** | PostgreSQL 15 + Prisma ORM | Relational schema, migrations, multi-tenant scoping |
| **Queue & Cache** | Redis 7 + BullMQ | Distributed background scheduling, exponential backoff |
| **Auth** | NextAuth v5 | Session tokens, workspace membership verification |
| **Validation** | Zod | Runtime schema validation on all API endpoints |
| **Testing** | Node.js Test Runner + `tsx` | 34 automated unit & integration tests |
| **CI/CD** | GitHub Actions | Automated build, linting, typecheck, and test pipeline |

---

## 🛠️ Getting Started

### 1. Prerequisites
- **Node.js**: `20.x` or later
- **Docker & Docker Compose**: For local PostgreSQL and Redis

### 2. Clone & Install
```bash
git clone https://github.com/ishikasharma/postly.git
cd postly
npm install
```

### 3. Start Database & Redis Services
```bash
docker compose up -d
```
*Spins up PostgreSQL on port `5432` and Redis on port `6379`.*

### 4. Setup Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure the connection strings point to your local containers:
```env
DATABASE_URL="postgresql://postgres:postgrespassword@localhost:5432/postly?schema=public"
REDIS_URL="redis://localhost:6379"
NEXTAUTH_SECRET="your-32-character-secret-key-goes-here"
NEXTAUTH_URL="http://localhost:3000"
```

### 5. Run Database Migrations & Seed
```bash
npx prisma db push
npm run db:seed
```
*Creates the database schema and seeds a demo user (`demo@postly.app` / `Password123!`) with sample social accounts, draft posts, and workspace members.*

### 6. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing & Verification

Run the complete test suite (34 unit & integration tests):
```bash
npm test
```

Run TypeScript compiler validation:
```bash
npx tsc --noEmit
```

Run linter:
```bash
npm run lint
```

Query the live system health endpoint:
```bash
curl -s http://localhost:3000/api/health | jq .
```
Expected output:
```json
{
  "status": "ok",
  "timestamp": "2026-10-28T22:29:11.731Z",
  "uptimeSeconds": 7506,
  "totalLatencyMs": 34,
  "services": {
    "database": { "status": "healthy", "latencyMs": 19 },
    "redis": { "status": "healthy", "latencyMs": 15 }
  },
  "environment": "development"
}
```

---

## 💼 Technical Interview Talking Points

1. **Idempotent Queue Scheduling**:
   - *Problem*: In distributed social scheduling, a temporary network failure or worker restart could trigger a double post to Twitter or LinkedIn.
   - *Solution*: BullMQ jobs use deterministic IDs based on `post_<id>_<platform>`. When enqueued, Redis rejects duplicate job keys. The worker executes state updates inside a Prisma `$transaction` with optimistic locking on `JobAttempt`.
2. **Graceful Three.js Lifecycles in React 19**:
   - Implemented direct Three.js rendering via React `ref` and `ResizeObserver`.
   - Guaranteed full GPU resource cleanup (`renderer.dispose()`, `geometry.dispose()`, `material.dispose()`, and `cancelAnimationFrame`) on component unmount to prevent WebGL context leaks during client-side navigation.
3. **Resilient AI Fallback Architecture**:
   - The `/api/ai/generate` route handles missing or rate-limited API keys gracefully by analyzing input keywords and synthesizing high-quality, tone-adapted copy without throwing a 500 server error.
4. **Multi-Tenant Security**:
   - Enforced workspace isolation across all Prisma queries: `findMany({ where: { workspaceId } })` and `verifyWorkspaceMembership()` guard clauses on all mutations.

---

## 📄 License
MIT © [Postly](https://github.com/ishikasharma/postly)
