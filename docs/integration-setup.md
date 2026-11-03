# Postly Social Platform Integration Guide

This guide details the OAuth requirements, developer portals, scopes, permissions, and environment configurations necessary to connect live social media platforms to Postly.

---

## 1. Environment Configuration Checklist

Configure the following variables in `.env` or your deployment environment:

```bash
# App Configuration
NEXTAUTH_URL=http://localhost:3001
AUTH_URL=http://localhost:3001
AUTH_TRUST_HOST=true
AUTH_SECRET=your-32-byte-random-secret

# Database & Queue
DATABASE_URL=postgresql://user:pass@localhost:5432/postly_db
REDIS_URL=redis://localhost:6379

# OpenAI / AI Assistant (Optional)
OPENAI_API_KEY=sk-...

# Twitter / X (OAuth 2.0 PKCE)
TWITTER_CLIENT_ID=
TWITTER_CLIENT_SECRET=

# Meta / Facebook & Instagram (Facebook Login for Business)
META_APP_ID=
META_APP_SECRET=

# LinkedIn (OAuth 2.0)
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=

# TikTok (TikTok for Developers)
TIKTOK_CLIENT_KEY=
TIKTOK_CLIENT_SECRET=

# Pinterest (Pinterest API v5)
PINTEREST_APP_ID=
PINTEREST_APP_SECRET=

# YouTube / Google (Google Cloud Console)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

---

## 2. Platform-by-Platform API Setup

### A. Twitter / X
- **Portal**: [developer.x.com](https://developer.x.com)
- **OAuth Version**: OAuth 2.0 with PKCE (User Authentication Settings).
- **Callback URL**: `http://localhost:3001/api/auth/callback/twitter`
- **Required Scopes**:
  - `tweet.read`: Read user profile and tweet metrics.
  - `tweet.write`: Create and delete tweets.
  - `users.read`: Retrieve authorized account profile and avatar.
  - `offline.access`: Receive refresh tokens for persistent connection.
- **Publishing Limits**: Free tier is limited to 17 tweets per 24-hour window per user. Basic tier ($100/mo) supports up to 100 tweets per 24 hours.

### B. Instagram & Facebook Pages (Meta)
- **Portal**: [developers.facebook.com](https://developers.facebook.com)
- **Product**: Facebook Login for Business + Instagram Graph API.
- **Callback URL**: `http://localhost:3001/api/auth/callback/facebook`
- **Required Permissions**:
  - `pages_show_list`: Enumerate user's managed Facebook Pages.
  - `pages_read_engagement`: Access post performance and metrics.
  - `pages_manage_posts`: Publish posts and photos to Facebook Pages.
  - `instagram_basic`: Retrieve Instagram Business / Creator account ID.
  - `instagram_content_publish`: Direct publishing of photos, carousels, and Reels.
  - `instagram_manage_comments`: Read and reply to comments in the Community Inbox.
- **Important Restriction**: Instagram direct publishing requires an Instagram Professional (Business or Creator) account linked to a Facebook Page. Personal accounts do not support API publishing.

### C. LinkedIn
- **Portal**: [linkedin.com/developers](https://www.linkedin.com/developers)
- **Product**: Share on LinkedIn + Sign In with LinkedIn using OpenID Connect.
- **Callback URL**: `http://localhost:3001/api/auth/callback/linkedin`
- **Required Scopes**:
  - `openid`, `profile`, `email`: User identification.
  - `w_member_social`: Publish updates, photos, and links to personal profiles.
  - `w_organization_social`: Publish updates to Company Pages (requires Company Page admin access).
- **Token Expiration**: Access tokens expire after 60 days. Refresh tokens are valid for 365 days.

### D. TikTok
- **Portal**: [developers.tiktok.com](https://developers.tiktok.com)
- **Product**: TikTok Content Posting API.
- **Required Scopes**:
  - `user.info.basic`: Retrieve username and avatar.
  - `video.upload`: Upload video assets to user draft/inbox.
  - `video.publish`: Direct publish videos to user profile (requires Direct Post audit approval).

### E. Pinterest
- **Portal**: [developers.pinterest.com](https://developers.pinterest.com)
- **Product**: Pinterest API v5.
- **Required Scopes**:
  - `boards:read`: List user boards to allow selecting destination board.
  - `pins:read`: Retrieve pin analytics and performance.
  - `pins:write`: Create new pins with media and destination links.

### F. Threads (Meta)
- **Portal**: [developers.facebook.com](https://developers.facebook.com)
- **Product**: Threads API.
- **Required Scopes**:
  - `threads_basic`: Read account profile.
  - `threads_content_publish`: Publish text, image, and video threads.

### G. Bluesky & Mastodon (Decentralized)
- **Bluesky**: Uses AT Protocol (`@atproto/api`). Authenticates via app passwords without OAuth registration overhead.
- **Mastodon**: Uses OAuth 2.0 per instance (e.g. `mastodon.social`). Requires `read`, `write`, `follow` scopes.

---

## 3. Sandboxed & Simulated Mode

When external OAuth credentials are not provided in `.env`, Postly gracefully transitions to **Simulated Mode**:
- Accounts can be connected via the Account directory with sample handles.
- Publishing jobs are executed by the worker with realistic simulated latency and deterministic IDs (`tw_...`, `ig_...`, `li_...`).
- Analytics records display connected workspace performance or clearly labeled sample data.
