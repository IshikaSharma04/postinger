export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  author: { name: string; role: string; avatar: string };
  content: string;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "content-repurposing-framework",
    title: "How to Repurpose 1 Core Idea Across 10 Channels Without Burnout",
    excerpt: "Most creators burn out trying to write unique content for every platform. Here is the exact fan-out framework to turn one weekly long-form insight into 10 platform-native assets.",
    category: "Workflow",
    date: "October 28, 2026",
    readTime: "5 min read",
    author: { name: "Alex Demo", role: "Head of Content", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" },
    content: `
### The Myth of Creating from Scratch
The biggest trap in social media is believing that every platform requires an entirely new concept. The most prolific creators do not invent 30 ideas a week; they invent **one high-signal thesis** and translate it into 5 distinct formats.

### The 4-Layer Repurposing Stack
1. **The Anchor Insight**: Start with an authentic lesson learned, client outcome, or technical epiphany. Write 3 paragraphs explaining the "why".
2. **The Microblog Thread (X & Bluesky)**: Break the core lesson into 5 bullet points with an engaging hook.
3. **The Professional Synthesis (LinkedIn)**: Frame the insight around business impact, metrics, and career lessons.
4. **The Visual Reel / Short (Instagram & TikTok)**: Record a 45-second direct-to-camera takeaway using the first sentence as your spoken hook.
5. **The Community Debate**: Ask a focused poll or open-ended question in your Community Inbox to spark follower dialogue.

### Schedule With Automation
By queuing these across staggered time slots using Postinger's multi-channel composer, your audience hears the message in their preferred format without you feeling overwhelmed.
    `,
  },
  {
    slug: "algorithms-depth-vs-frequency",
    title: "The 2026 Social Algorithm Shift: Depth vs. Raw Volume",
    excerpt: "Platforms have quietly depreciated low-effort high-frequency spam. Here is what modern recommendation algorithms are actually rewarding.",
    category: "Strategy",
    date: "October 20, 2026",
    readTime: "7 min read",
    author: { name: "Sarah Lin", role: "Product Strategy", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80" },
    content: `
### Dwell Time and Conversation Velocity
Across LinkedIn, Instagram, and X, algorithmic feeds have deprioritized accounts that post 6 times a day with surface-level advice. Instead, recommendation engines measure **dwell time** (how long people read or re-read your post) and **conversation velocity** (quality back-and-forth replies in the first 60 minutes).

### What This Means for Your Queue
- **Fewer, higher-leverage posts**: 4 thoughtful weekly posts consistently out-perform 20 rushed one-liners.
- **Fast replies**: Use Postinger's Community Inbox to reply to your first 5 comments within 30 minutes of publishing.
- **Saveable formats**: Carousels, checklists, and breakdown threads receive 4x more bookmarks than pure announcements.
    `,
  },
  {
    slug: "building-open-transparency",
    title: "Why Transparent Companies Win: What We Learned Building in Public",
    excerpt: "Open metrics, public roadmaps, and sharing failure modes creates an unshakeable bond with your audience. Here is why we embrace open transparency.",
    category: "Culture",
    date: "October 14, 2026",
    readTime: "4 min read",
    author: { name: "Alex Demo", role: "Co-Founder", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" },
    content: `
### Trust is the Ultimate Competitive Moat
When you share your real numbers, how you build features, and what failed last month, you stop competing on commodity marketing. Your customers become partners in your journey.

At Postinger, we believe every tool should provide clear insight into how data is processed, how security is enforced, and how features are designed.
    `,
  },
];
