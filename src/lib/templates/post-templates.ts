export interface PostTemplate {
  id: string;
  category: string;
  title: string;
  description: string;
  body: string;
  hashtags: string[];
}

export const POST_TEMPLATES: PostTemplate[] = [
  {
    id: "tip",
    category: "Education",
    title: "Actionable Pro Tip",
    description: "Share a quick, high-leverage tactic your audience can execute today.",
    body: `💡 Quick Tip: Most creators spend 80% of their time on [Activity], but the highest ROI actually comes from [Actionable Habit].\n\nHere is how to apply it in 3 steps:\n1. [Step 1]\n2. [Step 2]\n3. [Step 3]\n\nTry this on your next project and notice the difference! 🚀`,
    hashtags: ["protip", "creatorgrowth", "workflow"],
  },
  {
    id: "story",
    category: "Narrative",
    title: "Personal Story & Turning Point",
    description: "Build deep resonance with an authentic before-and-after story.",
    body: `2 years ago, I was completely stuck on [Old Struggle].\n\nEvery day felt like [Relatable Obstacle].\n\nThen one small shift changed everything:\n👉 [Key Epiphany or Decision]\n\nToday, [Current Win / Positive Outcome].\n\nIf you're currently in the middle of [Struggle], keep going. Consistency compounds.`,
    hashtags: ["journey", "lessonslearned", "mindset"],
  },
  {
    id: "case-study",
    category: "Proof",
    title: "Behind-the-Numbers Case Study",
    description: "Show real data, metrics, and tactical breakdowns.",
    body: `How we achieved [Impressive Metric] in just [Timeframe] (without [Common Pain Point]):\n\n📊 The Numbers:\n• [Metric 1]: [Value]\n• [Metric 2]: [Value]\n• [Metric 3]: [Value]\n\n🛠 The 3 Decisions That Made It Happen:\n1. [Strategic Choice A]\n2. [Strategic Choice B]\n3. [Strategic Choice C]\n\nDrop any questions below — happy to share our exact setup!`,
    hashtags: ["casestudy", "growthhack", "metrics"],
  },
  {
    id: "question",
    category: "Engagement",
    title: "Conversation Starter & Poll",
    description: "Trigger comments and community debates with an open question.",
    body: `Quick question for everyone building in [Your Industry]:\n\nWhich matters more in 2026?\nA) [Option A — e.g. Quality & Depth]\nB) [Option B — e.g. Daily Posting Volume]\n\nDrop your vote (A or B) and tell me why in the comments! 👇`,
    hashtags: ["community", "discussion", "creatorpoll"],
  },
  {
    id: "opinion",
    category: "Perspective",
    title: "Unpopular Opinion / Hot Take",
    description: "Challenge consensus thinking with a well-reasoned contrarian take.",
    body: `Unpopular opinion about [Topic]:\n\n[Contrarian Statement that goes against common advice].\n\nWhy? Because [Clear Reason 1], and [Clear Reason 2].\n\nInstead of [Overrated Action], top operators focus on [High-Value Focus].\n\nAgree or disagree?`,
    hashtags: ["hottake", "perspective", "industryinsights"],
  },
  {
    id: "how-to",
    category: "Tutorial",
    title: "Step-by-Step How-To Guide",
    description: "Detailed tutorial providing immediate utility.",
    body: `How to [Desirable Outcome] in [Time Period] — save this for later 📌\n\nStep 1: [Initial Setup]\nStep 2: [Core Execution]\nStep 3: [Optimization & Polish]\n\nBonus Resource: [Tool / Link].\n\nWhich step are you working on right now?`,
    hashtags: ["howto", "tutorial", "productivity"],
  },
  {
    id: "list",
    category: "Curation",
    title: "Curated Resource Listicle",
    description: "Deliver massive value by curating top tools or frameworks.",
    body: `5 tools I use every week to manage [Core Responsibility] with zero burnout:\n\n1. [Tool 1] — for [Specific Benefit]\n2. [Tool 2] — for [Specific Benefit]\n3. [Tool 3] — for [Specific Benefit]\n4. [Tool 4] — for [Specific Benefit]\n5. Postinger — for automated multi-channel scheduling & queueing\n\nWhat's in your daily stack?`,
    hashtags: ["tools", "techstack", "efficiency"],
  },
  {
    id: "bts",
    category: "Culture",
    title: "Behind the Scenes Look",
    description: "Humanize your brand with an unfiltered preview of your process.",
    body: `Here is what nobody tells you about [Working on Major Milestone]:\n\nBehind every polished update is [Honest Reality / Scrapped Drafts / Experiments].\n\nToday we're heads-down testing [Exciting Feature Preview].\n\nHere is a sneak peek at what's coming next week ✨`,
    hashtags: ["behindthescenes", "buildinpublic", "studiolife"],
  },
  {
    id: "launch",
    category: "Announcement",
    title: "Official Product Launch",
    description: "Announce new releases, updates, or milestone launches.",
    body: `🚀 It's finally here: Introducing [Product / Feature Name]!\n\nWe spent the last [Time] solving [Big Problem] for [Target Audience].\n\nHere is what you can now do:\n✨ [Key Feature 1]\n✨ [Key Feature 2]\n✨ [Key Feature 3]\n\nTry it free today at [Link] and let us know what you think!`,
    hashtags: ["launch", "productupdate", "announcement"],
  },
  {
    id: "sale",
    category: "Promotional",
    title: "Limited-Time Offer or Flash Promo",
    description: "Drive action with clear value and urgency.",
    body: `🔥 Special Offer: For the next 48 hours, get [Discount / Bonus] on [Product Name]!\n\nWhat's included:\n✅ [Benefit 1]\n✅ [Benefit 2]\n✅ [Benefit 3]\n\nUse code [CODE] at checkout: [Link]\n\nOffer ends [Date/Time]. Don't miss out!`,
    hashtags: ["specialoffer", "flashsale", "deal"],
  },
];
