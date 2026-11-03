# Postly Route & Interaction Map

This document catalogs every route in Postly, its layout structure, accessible interactive elements, expected behaviors, and state persistence rules.

---

## 1. Route Inventory

| Route | Access | Layout | Primary Purpose |
|---|---|---|---|
| `/` | Public | Marketing Layout (`PostlyNavbar` + Footer) | Buffer-inspired landing page with floating badges, live marquee, and feature showcase. |
| `/login` | Public | Split Auth Layout (Dark `#161616` / Cream `#FAFAF8`) | User sign-in with live validation, demo fill button, and marketing showcase. |
| `/register` | Public | Split Auth Layout (Dark `#161616` / Cream `#FAFAF8`) | Account creation with password requirement checklist. |
| `/dashboard` | Authenticated | Application Shell (Sidebar + Top Bar) | Central command center with upcoming scheduled posts, drafts, analytics, and quick actions. |
| `/compose` | Authenticated | Application Shell | Multi-channel post composer with platform customization tabs, media upload, and live preview. |
| `/publish` | Authenticated | Application Shell | Publishing workspace with tabs: Queue, Drafts, Scheduled, Sent, Failed. |
| `/calendar` | Authenticated | Application Shell | Month and Week visual calendar with date inspector drawer and rescheduling. |
| `/ideas` | Authenticated | Application Shell | Kanban board for organizing content ideas from concept to publication. |
| `/analytics` | Authenticated | Application Shell | Metric summaries, engagement graphs, channel breakdowns, and top-performing posts table. |
| `/community` | Authenticated | Application Shell | Unified comment inbox, conversation thread viewer, and reply composer. |
| `/start-page` | Authenticated | Application Shell | Split link-in-bio builder with modular block editor and live mobile preview. |
| `/p/[slug]` | Public | Standalone Mobile Page | Public visitor-facing Start Page rendering published links and profile bio. |
| `/accounts` | Authenticated | Application Shell | Social channel connection directory and status management. |
| `/settings` | Authenticated | Application Shell | Profile, workspace details, posting schedules, and team permissions. |

---

## 2. Interactive Element Catalog by Route

### A. Marketing Landing Page (`/`)
- **Contest Banner**: "Register" button scrolls/navigates to signup.
- **Header Mega Menus**:
  - *Features*: Dropdown containing 8 sub-products (Create, Insights, Collaborate, AI Assistant, Publish, Community, Start Page, API). Clicking navigates to relevant workflow or dashboard section.
  - *Integrations*: Dropdown grouping Channels (10 platforms) and Third-Party Tools (Canva, Dropbox, Zapier, Unsplash).
- **Hero Signup Pill**: Email input with "Get started for free" button redirecting to `/register?email=...`.
- **Side-by-Side Cards**:
  - *PUBLISH Card*: Interactive composer preview with channel toggles and scheduling time-slot selector.
  - *CREATE Card*: Interactive AI ideas generator with prompt pills and stage Kanban preview.
- **Client Logo Marquee**: Infinite smooth horizontal scroll displaying trust partners.

### B. Authentication Pages (`/login`, `/register`)
- **Demo Quick-Fill Button** (`⚡ Fill Demo`): Automatically fills `demo@postly.app` and `Demo1234!` for instant testing.
- **Password Strength Indicators**: Live visual feedback verifying minimum 8 characters, uppercase, lowercase, and numbers.
- **Submit Buttons**: Shows loading spinner, disables repeated clicks, and redirects to `/dashboard` on success.

### C. Post Composer (`/compose`)
- **Query Parameter Pre-population**:
  - `?edit=[id]`: Loads existing post for updating.
  - `?duplicate=[id]`: Copies body, media, and channels into a new draft.
  - `?date=YYYY-MM-DD`: Automatically sets scheduled date picker.
  - `?prefill=[text]`: Injects text from Ideas or AI Assistant.
- **Channel Selector Pills**: Multi-select toggle for connected channels (Twitter, Instagram, LinkedIn, etc.).
- **Platform Customization Tabs**: When multiple channels are selected, allows overriding captions specifically for each channel without altering other channels.
- **Media Upload**: File selector and drag-and-drop supporting images and videos (`POST /api/media`).
- **Scheduling Buttons**:
  - `Save Draft`: Persists post with status `DRAFT`.
  - `Schedule Post`: Validates future date/time, creates `PublishingJob`, and sets status to `SCHEDULED`.
  - `Publish Now`: Triggers immediate background worker execution.

### D. Visual Calendar (`/calendar`)
- **View Toggle**: Switch between Month and Week views.
- **Navigation Controls**: "Previous", "Next", and "Today" buttons updating the active calendar grid.
- **Day Inspector Drawer**: Clicking any date cell opens a slide-over panel displaying all posts scheduled for that day.
- **Inspector Actions**:
  - `Reschedule`: Dropdown to change scheduled time; instantly calls `PATCH /api/posts/[id]`.
  - `Edit in Composer`: Redirects to `/compose?edit=[id]`.
  - `Delete`: Confirms and removes post from database (`DELETE /api/posts/[id]`).
  - `+ Schedule post on this day`: Redirects to `/compose?date=YYYY-MM-DD`.

### E. Content Ideas Kanban (`/ideas`)
- **Column Stages**: *Idea*, *In Progress*, *Ready*.
- **Drag-and-Drop / Stage Move**: Moving an idea card updates its stage in the database.
- **Convert to Draft**: "Create Post" action converts idea into a post and opens the Composer with pre-filled content.
- **Create Idea Dialog**: Modal to enter title, description, tags, and notes.

### F. Accounts Management (`/accounts`)
- **Platform Cards**: Lists all 10 supported platforms with connection status badges ("Connected", "Ready to Connect").
- **Connect Channel Modal**: Prompts for handle and permissions; executes `POST /api/accounts`.
- **Disconnect Action**: Red trash button confirms and calls `DELETE /api/accounts?id=[id]`, updating the UI and database.

### G. Start Page Builder (`/start-page`)
- **Live Mobile Preview**: Right-hand interactive phone frame rendering blocks in real-time.
- **Block Controls**: Add, edit, toggle visibility, and delete links and bio text.
- **Publish Action**: Saves draft changes and updates the public page at `/p/[slug]`.
