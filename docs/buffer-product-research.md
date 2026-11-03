# Buffer Product Research & Functional Mapping

This document details the product research conducted on Buffer ([https://buffer.com](https://buffer.com)), official documentation, support channels, and developer specifications. It establishes the functional and UX blueprint implemented in Postly.

---

## 1. Official Resources & Routes Inspected

### Public & Marketing Surfaces
- **Home (`https://buffer.com/`)**:
  - Top announcement banner for community contests and seasonal campaigns.
  - Sticky navigation bar with interactive dropdown mega-menus (**Features** split into Planning/Publishing and Audience/Analytics; **Integrations** grouping native channels and third-party tools).
  - Editorial hero with subtle dot/grid pattern, floating app/platform badges (Twitter/X, Instagram, LinkedIn, TikTok, YouTube, Pinterest, Threads, Bluesky, Canva, Dropbox, Zapier), headline *"Your social media workspace"*, and single-field signup pill.
  - Trust marquee featuring prominent brands (*VICE, Pizza Hut, Clash of Clans, Metallica, benefit, Crocs, ElevenLabs*).
  - Side-by-side product cards: **PUBLISH** (lilac `#F5EDFC`) showcasing multi-channel composer and queue time-slot selector; **CREATE** (mint green `#E8F8EC`) showcasing AI ideas generator and Kanban stage board.
  - Secondary workflow cards: **ANALYZE** (orange `#FFF3EB`), **ENGAGE** (sky blue `#EBF5FB`), **START PAGE** (yellow `#FFFBEA`).

- **Publishing (`https://buffer.com/publish`)**:
  - Centralized multi-channel workspace with left sidebar channel selector.
  - Sub-views: *Queue* (chronological scheduled queue slots), *Drafts* (collaborative unpublished posts), *Approvals* (workflow review stage), *Sent* (published history with link to analytics), and *Grid* (Instagram visual feed preview).
  - Slot-based posting schedules allowing users to define recurring times per day/channel.

- **Create / Ideas (`https://buffer.com/create`)**:
  - Scratchpad and brainstorming workspace for creators.
  - Views: Kanban board (Idea -> In Progress -> Ready) and list/grid views.
  - Conversion workflow: one-click "Create Draft" that pre-fills the post composer with saved text, media, and tags.

- **Start Page (`https://buffer.com/start-page`)**:
  - Standalone link-in-bio website builder.
  - Live split-screen mobile viewport preview alongside modular block editor (links, headers, images, social icons, YouTube/Spotify embeds).
  - Distinct *Draft* and *Published* states with a public URL (`/p/[slug]`).

- **Pricing (`https://buffer.com/pricing`)**:
  - Tiered subscription model (Free, Essentials, Team, Agency) billed per connected channel.

### Official Support & Developer Documentation
- **Supported Channels (`https://support.buffer.com/en-us/articles/supported-channels-LM3P7Y4zsp`)**:
  - Covers Facebook Pages/Groups, Instagram Business/Creator, Twitter / X, LinkedIn Profiles/Pages, TikTok, Pinterest, YouTube Shorts, Threads, Bluesky, Mastodon, and Google Business Profile.
  - Direct publishing vs mobile notification reminders (e.g. personal Instagram accounts require push notification reminders; professional accounts support direct publishing via Instagram Graph API).

- **Calendar (`https://support.buffer.com/articles/how-to-use-buffers-calendar-feature-FSSKbH32DN`)**:
  - Visual calendar supporting Month and Week views.
  - Click on any empty date/time slot to open the composer pre-filled with that timestamp.
  - Status color coding: Draft (gray/neutral), Scheduled (blue), Sent (green), Failed (red).

- **Insights & Analytics (`https://support.buffer.com/en-us/articles/using-insights-in-buffer-x4gLauQU5a`)**:
  - Cross-channel overview and channel-specific reports.
  - Aggregated metrics: Engagement rate, Impressions, Reach, Follower growth, Total clicks.
  - Top-performing posts table sorted by engagement.

- **Community Inbox (`https://support.buffer.com/en-us/articles/using-community-in-buffer-jvTv4uQacA`)**:
  - Unified comment stream for Instagram and Facebook Pages.
  - Status filters: Unread, Needs Reply, Dismissed.
  - In-app reply composer with saved replies and AI assistance.

- **AI Assistant (`https://support.buffer.com/en-us/articles/using-buffers-ai-assistant-qbBulfw9sn`)**:
  - Copy generation, hook generation, tone adjustments (punchy, casual, professional), copy expansion/shortening, and platform translation.

- **Approvals & Collaboration (`https://support.buffer.com/en-us/articles/requesting-approval-and-approving-draft-posts-57li7M8tDA`)**:
  - Role-based permissions: Admin, Manager, Contributor.
  - Contributors can only create and request approval; Managers and Admins can approve and schedule.

---

## 2. Buffer to Postly Functional Mapping

| Buffer Capability | Buffer UX Pattern | Postly Implementation |
|---|---|---|
| **Marketing Homepage** | Floating platform badges, sticky nav, card showcase | `src/app/(public)/page.tsx` with floating badges, live marquee, and Publish/Create feature cards |
| **Authentication** | Split dark `#161616` and cream `#FAFAF8` showcase panel | `src/app/(auth)/login/page.tsx` & `register/page.tsx` with live password strength checklist and quick demo fill |
| **Publishing Queue** | Slot-based posting schedule per channel | `src/app/(app)/publish/page.tsx` with Queue, Drafts, Scheduled, Sent, and Failed tabs |
| **Post Composer** | Multi-channel selection, platform overrides | `src/app/(app)/compose/page.tsx` with channel pills, platform customization tabs, media upload, preview, autosave |
| **Visual Calendar** | Month and Week views with date slot picker | `src/app/(app)/calendar/page.tsx` with month/week toggle, day inspector drawer, inline reschedule, edit in composer |
| **Ideas / Create** | Kanban stage board with quick convert | `src/app/(app)/ideas/page.tsx` with drag-and-drop Kanban, tag filters, and "Convert to Post" flow |
| **Analytics** | Cross-channel engagement & post table | `src/app/(app)/analytics/page.tsx` with date range selectors, KPI charts, channel breakdowns, and top posts table |
| **Community** | Unread comment triage & reply composer | `src/app/(app)/community/page.tsx` with channel filter, conversation viewer, reply composer, and quick responses |
| **Start Page** | Link-in-bio modular page builder | `src/app/(app)/start-page/page.tsx` with block editor, live mobile frame preview, and public page at `/p/[slug]` |
| **Channel Settings** | Connect/disconnect 10+ social platforms | `src/app/(app)/accounts/page.tsx` with platform directory, connect modal, and live disconnect |
| **Background Scheduler**| Server-side cron and queue worker | `src/lib/queue/worker.ts` with BullMQ + PostgreSQL 30s overdue job sweeper |

---

## 3. Platform & API Restrictions Documented

1. **Meta (Instagram & Facebook)**:
   - Requires Facebook Login for Business and app review for `instagram_content_publish`.
   - Personal Instagram accounts cannot use direct publishing (only Professional/Creator accounts).
   - Images must have aspect ratios between 4:5 and 1.91:1.

2. **Twitter / X**:
   - Free API tier is strictly write-only with low rate limits (17 tweets / 24 hours).
   - Basic ($100/mo) or Pro ($5,000/mo) required for full analytics and reading mentions.

3. **LinkedIn**:
   - Supports text, links, single/multiple images, and native video.
   - Requires `w_member_social` for personal profiles and `w_organization_social` for Company Pages.

4. **TikTok**:
   - Content Posting API requires Direct Post approval from TikTok for Developers.
   - Video duration: 3 seconds to 10 minutes. Aspect ratio 9:16 recommended.

5. **Pinterest**:
   - Requires a destination board ID and image URL for every Pin created.
