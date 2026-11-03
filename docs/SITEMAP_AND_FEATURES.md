# SITEMAP AND FEATURES SPECIFICATION

Modeled on Buffer (`https://buffer.com` and `https://publish.buffer.com`).

---

## 1. Complete Sitemap

### A. Public Marketing & Resources Site
- **Home (`/`)**: Main value proposition, interactive composer & calendar preview without login, fan-out demo, pricing calculator, trust proof, CTA to signup.
- **Product & Feature Showcases**:
  - `/publish`: Multi-channel publishing, per-network queue slots, scheduling modes, calendar, previews.
  - `/create`: Idea bank, kanban workflows, templates library, AI writer, RSS feeds.
  - `/analytics`: All-channel vs single-channel analytics, weekly takeaways, best-time heatmap.
  - `/inbox`: Unified social comments, reply in-app, comment score dashboard.
  - `/collaborate`: Teams, invites, approval workflows, custom permissions.
  - `/start-page-info`: Link-in-bio builder, live phone preview, custom blocks.
  - `/ai-assistant`: AI copywriting, hooks, summaries, multi-network repurposing.
  - `/pricing`: Monthly & annual toggles, plan feature comparison table (Free, Essentials, Team, Agency), FAQ accordion.
- **Channel Landing Pages**:
  - `/channels/instagram`, `/channels/facebook`, `/channels/x`, `/channels/linkedin`, `/channels/tiktok`, `/channels/youtube`, `/channels/threads`, `/channels/pinterest`, `/channels/google-business`, `/channels/bluesky`, `/channels/mastodon`, `/channels/substack`.
- **"Made For" Persona Pages**:
  - `/made-for/creators`, `/made-for/small-business`, `/made-for/agencies`, `/made-for/nonprofits`, `/made-for/higher-education`, `/made-for/developers`, `/made-for/startups`.
- **Integrations**:
  - `/integrations`: Adapter ecosystem (Unsplash, Canva, Google Drive, Dropbox, OneDrive, Google Photos, Zapier, Make).
- **Free Growth Tools (Work without login)**:
  - `/tools/hook-generator`: Viral hook creator for threads & captions.
  - `/tools/hashtag-generator`: Smart tag group finder by niche.
  - `/tools/utm-builder`: Campaign tracking URL builder.
  - `/tools/image-resizer`: Multi-network social dimension cropper & exporter.
  - `/tools/bio-generator`: Bio generator for X, Instagram, and LinkedIn.
- **Resources, Blog & Transparency**:
  - `/templates`: Searchable templates library with 10+ categorized content formats.
  - `/blog`: Markdown-backed publication with filterable categories and real articles.
  - `/changelog`: What's new feed with product improvements.
  - `/help`: Searchable help center with guides, FAQ, and contact support modal.
  - `/about`: Company story, mission, and transparent culture.
- **Legal**:
  - `/legal/privacy`: Data privacy policy.
  - `/legal/terms`: Terms of service.
  - `/legal/security`: Security controls, encryption standards, and vulnerability reporting.

### B. Auth & Onboarding Flow
- `/signup`: Name, email, password, terms agreement, bot protection.
- `/verify-email`: Real single-use verification token link with local dev mailbox at `/dev/mailbox`.
- `/onboarding`: Step-by-step questionnaire with progress bar, Back/Continue/Skip, and server-side state persistence.
- `/login`: Email + password authentication, "Remember Me", error handling.
- `/forgot-password`: Single-use expiring token dispatch with email delivery.
- `/reset-password`: Token validation and password reset form.

### C. Logged-in App (`/app` or standard app routes)
- `/dashboard` (Home):
  - Collapsible Sidebar with Logo, What's New drawer button, Green `+ New` button with dropdown.
  - Main Navigation: Home, Create (`/ideas`), Publish (`/queue`, `/calendar`, `/posts`), Community (`/community`), Insights (`/history`).
  - Channels List: Connected channel avatars, connection status, "+" connect modal trigger.
  - Progress Card: `0/3 channels connected` segmented bar with dismiss X.
  - Bottom Org Switcher: Org name, plan badge, settings modal trigger, logout.
  - Greeting Header: Time-of-day greeting (Sun/Moon), current date, feedback drawer.
  - Stats Strip: Week Streak, Posting Goals, Comment Score with info modals.
  - First Steps Cards: 1) Connect channel, 2) Create post, 3) Explore API.
  - Up Next: Upcoming scheduled queue items.
  - Comments: Unified recent comments quick-reply widget.
  - Templates Row: Personalized cards chosen by onboarding answers.
  - Floating Help Widget: Searchable articles, keyboard shortcuts, contact support.
- `/compose`: Multi-channel composer with fan-out customization, post formats, saved hashtags, AI generator, live previews, scheduling modes.
- `/queue`: Weekly recurring schedule slots per channel, drag-and-drop order, daylight saving time support.
- `/calendar`: Week & month views, list toggle, drag-to-reschedule, filter by channel/tag/type.
- `/posts`: Tabs for Drafts, Scheduled, Sent/Published, Awaiting Approval.
- `/ideas`: Kanban board (Unassigned, In Review, Approved, Ready), gallery toggle, tags, RSS feed sync, templates.
- `/community`: Unified comment stream, sentiment filters, saved replies (`:shortcuts`), AI responses, convert-to-post.
- `/history` (Analytics): All-channel vs per-channel performance, weekly takeaways, tooltips, tags reporting, CSV/PDF export.
- `/start-page`: Link-in-bio builder, themes, typography, custom blocks, live mobile phone preview, `/p/{handle}`.
- `/team`: Collaborative organizations, email invites, 5 roles, per-channel permissions, draft approval queue.
- `/settings`: Profile, email/password change, notifications, API keys (scoped, shown once), webhooks (HMAC-signed), billing & plan upgrades.
- `/admin`: Server-protected administrative telemetry dashboard.

---

## 2. Feature Inventory Table

| Feature | Where It Lives | How It Behaves |
| :--- | :--- | :--- |
| **Guest Sandbox Composer** | `/` and `/publish` | Lets visitors draft posts, preview across channels, and stores drafts in `localStorage` until signup. |
| **Email Verification & Dev Mailbox** | `/verify-email` & `/dev/mailbox` | Generates secure cryptographic tokens; dev mailbox captures outgoing emails locally so anyone can inspect and click the link without SMTP credentials. |
| **Onboarding Flow** | `/onboarding` | 7 interactive questions; updates progress bar; stores answers via `POST /api/onboarding`; rehydrates on refresh; configures initial workspace defaults. |
| **Collapsible Sidebar & Org Switcher** | App Shell (`(app)/layout.tsx`) | Remembers collapsed state; shows channel quota progress (`X/3`); opens quick channel queue; org menu allows switching workspaces, billing, and team. |
| **What's New Drawer** | Sidebar plant icon | Opens slide-out panel showcasing latest platform updates and feature releases. |
| **+ New Action Dropdown** | Sidebar green button | Dropdown options: "New Post" (opens composer), "New Idea" (opens ideas scratchpad), "New Start Page Link" (opens bio builder). |
| **Home Stats Strip** | `/dashboard` | Displays Week Streak (consecutive weeks posting goal was met), Posting Goals (posts/week per channel), and Comment Score. Shows prompt banner when 0 channels connected. |
| **First Steps Checklist** | `/dashboard` | 3 interactive cards (Connect channel, Create post, Explore API) that auto-complete based on real database state. |
| **Channel Connection Modal & Sandbox** | Sidebar `+` and `/accounts` | Supports 12 channels + Start Page. If API keys are missing in `.env`, automatically enters realistic Sandbox mode with a mock OAuth approval screen and simulated metrics. |
| **Posting Schedule & Timezone** | `/queue` | Each channel has its own recurring weekly times and timezone; computes UTC timestamps with automatic Daylight Saving Time handling. |
| **Scheduling Modes** | Composer | Next Available (first free queue slot), Prioritize (bumps to queue front), Publish Now (BullMQ instant publish), Set Date & Time. |
| **Fan-Out Customization** | Composer | One master post fans out to selected channels. Captions, hashtags, media, and scheduled time can be customized per channel before saving as independent records. |
| **Saved Hashtag Groups** | Composer | Collection drawer allowing one-click insertion of saved tag sets (e.g., `#saas #marketing`). |
| **Post Formats** | Composer | Supports Post, Reel, Story, Carousel (Instagram); Thread (multi-post sequence); Shorts (YouTube); Pin (Pinterest). |
| **Auto-Publish vs Notification** | Composer & Channels | Flags channels that publish automatically vs channels requiring notification reminders (Instagram/TikTok/YouTube/FB Groups). |
| **Calendar Rescheduling & Filters** | `/calendar` | Week and month views; drag-to-reschedule; inline day inspector; filters by channel, post format, and tag. |
| **Ideas Kanban & RSS Subscriptions** | `/ideas` | 4 columns (Unassigned, In Review, Approved, Ready); gallery toggle; drag-and-drop; RSS feed auto-import into ideas. |
| **Post Templates Library** | `/ideas` & `/templates` | 10+ categorized content formats with placeholders and one-click "Use in Composer". |
| **Browser Extension (Manifest V3)** | `/extension` | Background script and popup to capture web pages, highlights, and images into Ideas. |
| **Community Inbox & Saved Replies** | `/community` | Unified follower comments; filter by unanswered; saved replies with `:shortcut` expansion; AI reply with tone adjustment; "Create post from reply". |
| **Analytics & Weekly Takeaways** | `/history` | Channel comparisons; weekly actionable advice cards; metric tooltips; export to CSV/PDF; best-time heatmap. |
| **Start Page Link-in-Bio** | `/start-page` & `/p/{handle}` | Theme colors, fonts, block types (links, embeds, photo grid, email capture); view/click analytics. |
| **Team Roles & Approvals** | `/team` & `/posts` | 5 roles (Owner, Admin, Manager, Contributor, Viewer); Contributors submit drafts; Managers/Admins approve to queue; threaded notes on drafts. |
| **Billing & Plan Limits** | `/settings/billing` | Free (3 channels, 10 scheduled/channel, 100 ideas), Essentials, Team. Interactive plan selector enforcing limits server-side. |
| **Public REST API & MCP Server** | `/api/v1` & `/src/mcp` | Bearer API keys (hashed in DB, shown once), rate limiting, OpenAPI 3.0 docs at `/api/docs`, MCP server with read/write tools. |
| **Command Palette (Cmd+K)** | Global App | Instant search and navigation shortcut across all pages, quick actions, and connected channels. |

---

## 3. Gap Analysis vs. Current Postinger Codebase

| Feature | Current State | Required Target | Action Plan |
| :--- | :--- | :--- | :--- |
| **Public Marketing Site Depth** | Partial landing, pricing, and 5 tools. | Full set of 12 channel pages, 7 persona pages, integrations, templates, blog, changelog, help center, and legal pages. | Build out missing public routes with rich copy and illustrations. |
| **Signup & Onboarding Flow** | Direct credentials signup to dashboard. | Landing email input -> Signup -> Verification (local dev mailbox) -> 7-step interactive onboarding questionnaire -> Personalization. | Implement `/onboarding` multi-step questionnaire, dev mailbox at `/dev/mailbox`, and answer persistence in database. |
| **Dashboard Home (`/dashboard`)** | Overview with stats and recent posts. | Buffer Home replica: Stats strip (Week Streak, Goals, Comment Score), First Steps cards, Up Next, Comments, personalized Templates row, and Help button. | Refactor `/dashboard` to match Buffer Home layout and dynamic metrics. |
| **Sidebar Elements** | Standard navigation links. | Collapsible sidebar, What's New plant icon drawer, green `+ New` button with dropdown, channel quota progress bar (`0/3`), bottom org switcher with plan badge. | Update `Sidebar.tsx` with collapsible drawer, `+ New` dropdown, quota bar, and org menu. |
| **Channel Sandbox Mode** | Mock credentials stored directly. | Realistic mock authorization modal with avatar and handle selection, realistic dummy follower metrics and comments generation, and "Sandbox" badge. | Build dedicated Sandbox OAuth screen and mock generator in channel adapter. |
| **Settings & Billing** | Profile and basic settings. | Full billing & plan management (Free/Essentials/Team upgrade simulation), password change, email change, notification preferences, webhooks, API keys. | Complete `/settings` sub-pages with interactive plan toggle. |
| **Command Palette (Cmd+K)** | Missing. | Global Cmd+K modal for quick page navigation, post drafting, and channel jumping. | Add global `CommandPalette` component with keyboard shortcut listeners. |
| **Dev Mailbox** | Missing. | Visual development mailbox at `/dev/mailbox` showing outgoing verification and password reset emails. | Build in-memory dev mailbox store and UI page at `/dev/mailbox`. |
