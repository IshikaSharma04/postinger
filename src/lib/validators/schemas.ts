import { z } from "zod";

// ── Auth Schemas ──────────────────────────────────────────────────────────────

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(60),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const resetPasswordRequestSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain uppercase")
      .regex(/[0-9]/, "Must contain a number"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// ── Workspace Schemas ─────────────────────────────────────────────────────────

export const createWorkspaceSchema = z.object({
  name: z.string().min(2, "Workspace name too short").max(60),
  slug: z
    .string()
    .min(2)
    .max(40)
    .regex(/^[a-z0-9-]+$/, "Slug may only contain lowercase letters, numbers, and hyphens"),
});

export const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(["ADMIN", "MEMBER"]),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const postStatusEnum = z.enum([
  "DRAFT",
  "NEEDS_APPROVAL",
  "SCHEDULED",
  "PROCESSING",
  "PUBLISHED",
  "FAILED",
  "CANCELLED",
  "PARTIALLY_FAILED",
]);

export const platformEnum = z.enum([
  "TWITTER",
  "INSTAGRAM",
  "LINKEDIN",
  "FACEBOOK",
  "TIKTOK",
  "YOUTUBE",
  "PINTEREST",
  "THREADS",
  "BLUESKY",
  "MASTODON",
  "GOOGLE_BUSINESS",
  "SUBSTACK_NOTES",
]);

// ── Post Schemas ──────────────────────────────────────────────────────────────

export const postVariantSchema = z.object({
  socialAccountId: z.string().min(1),
  customBody: z.string().min(1).max(5000),
  customHashtags: z.array(z.string().max(50)).default([]),
  firstComment: z.string().max(2000).optional(),
});

export const postFormSchema = z.object({
  title: z.string().max(120).optional(),
  body: z.string().min(1, "Post content is required").max(5000),
  hashtags: z.array(z.string().max(50)).max(30),
  scheduledAt: z.string().optional(),
  socialAccountIds: z.array(z.string()).min(1, "Select at least one account"),
  mediaAssetIds: z.array(z.string()).max(10),
  status: z.enum(["DRAFT", "SCHEDULED", "NEEDS_APPROVAL"]),
});

export type PostFormInput = z.infer<typeof postFormSchema>;

export const createPostSchema = z.object({
  workspaceId: z.string().min(1),
  campaignId: z.string().optional().nullable(),
  title: z.string().max(120).optional(),
  body: z.string().min(1, "Post content is required").max(5000),
  hashtags: z.array(z.string().max(50)).max(30).default([]),
  scheduledAt: z.coerce.date().optional(),
  socialAccountIds: z.array(z.string()).min(1, "Select at least one account"),
  mediaAssetIds: z.array(z.string()).max(10).default([]),
  postFormat: z
    .enum(["POST", "REEL", "STORY", "CAROUSEL", "THREAD", "SHORTS", "PIN"])
    .default("POST"),
  tags: z.array(z.string().max(50)).default([]),
  fanOut: z.boolean().default(false),
  targetStartPage: z.boolean().default(false),
  firstComment: z.string().max(2000).optional(),
  status: z
    .enum(["DRAFT", "NEEDS_APPROVAL", "SCHEDULED", "PROCESSING", "PUBLISHED", "FAILED"])
    .default("DRAFT"),
  action: z
    .enum(["DRAFT", "QUEUE", "SCHEDULE", "PUBLISH_NOW", "SUBMIT_FOR_APPROVAL", "NEXT_AVAILABLE", "PRIORITIZE"])
    .optional(),
  variants: z.array(postVariantSchema).optional().default([]),
});

export const updatePostSchema = createPostSchema.partial().extend({
  id: z.string(),
  workspaceId: z.string(),
});

// ── Scratchpad / Idea Schemas ─────────────────────────────────────────────────

export const createIdeaSchema = z.object({
  workspaceId: z.string().min(1),
  title: z.string().min(1, "Title is required").max(160),
  content: z.string().max(5000).default(""),
  tags: z.array(z.string().max(40)).default([]),
  status: z.enum(["UNASSIGNED", "REVIEW", "DONE"]).default("UNASSIGNED"),
  mediaUrl: z.string().url().optional().nullable(),
});

export const updateIdeaSchema = createIdeaSchema.partial().extend({
  id: z.string().min(1),
  workspaceId: z.string().min(1),
});

// ── Posting Schedule Slot Schemas ─────────────────────────────────────────────

export const createPostingSlotSchema = z.object({
  workspaceId: z.string().min(1),
  socialAccountId: z.string().optional().nullable(),
  dayOfWeek: z.number().int().min(0).max(6),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Time must be HH:MM format"),
  timezone: z.string().default("UTC"),
  isActive: z.boolean().default(true),
});

// ── Approval & Discussion Schemas ─────────────────────────────────────────────

export const approvePostSchema = z.object({
  decision: z.enum(["APPROVE", "REJECT"]),
  notes: z.string().max(1000).optional(),
});

export const createPostCommentSchema = z.object({
  content: z.string().min(1).max(2000),
});

// ── Community Inbox Schemas ───────────────────────────────────────────────────

export const replyCommentSchema = z.object({
  replyText: z.string().min(1, "Reply cannot be empty").max(2000),
});

// ── Start Page / Link-in-Bio Schemas ──────────────────────────────────────────

export const httpUrl = z
  .string()
  .max(2048)
  .refine(
    (val) => {
      try {
        const u = new URL(val);
        return u.protocol === "http:" || u.protocol === "https:";
      } catch {
        return false;
      }
    },
    { message: "URL must start with http:// or https://" }
  );

export const updateStartPageSchema = z.object({
  workspaceId: z.string().min(1),
  handle: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-z0-9_-]+$/, "Handle must only contain letters, numbers, underscores, and dashes"),
  title: z.string().min(1).max(80),
  bio: z.string().max(300).optional(),
  avatarUrl: httpUrl.optional().nullable(),
  theme: z.string().default("warm-stone"),
  layout: z.enum(["stack", "grid"]).default("stack"),
  font: z.enum(["inter", "outfit", "serif", "mono"]).default("inter"),
  isPublished: z.boolean().default(true),
  blocks: z.array(
    z.object({
      id: z.string().optional(),
      type: z.enum([
        "link",
        "video",
        "product",
        "photo_grid",
        "email_capture",
        "social_icons",
        "latest_posts",
        "socials",
        "newsletter",
        "header",
      ]),
      title: z.string().max(100),
      url: httpUrl.optional().nullable(),
      icon: z.string().optional().nullable(),
      order: z.number().int().default(0),
      isActive: z.boolean().default(true),
    })
  ),
});

// ── Media Schemas ─────────────────────────────────────────────────────────────

export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "video/mp4",
  "video/quicktime",
  "video/webm",
] as const;

export const MAX_FILE_SIZE_BYTES = parseInt(process.env.MAX_FILE_SIZE_MB ?? "50") * 1024 * 1024;

// ── Social Account Schemas ────────────────────────────────────────────────────

export const connectAccountSchema = z.object({
  workspaceId: z.string().min(1),
  platform: z.enum([
    "TWITTER",
    "INSTAGRAM",
    "LINKEDIN",
    "FACEBOOK",
    "TIKTOK",
    "YOUTUBE",
    "PINTEREST",
    "THREADS",
    "BLUESKY",
    "MASTODON",
    "GOOGLE_BUSINESS",
    "SUBSTACK_NOTES",
  ]),
  handle: z.string().min(1).max(50),
  displayName: z.string().max(100).optional(),
});

// ── Hashtag Group Schemas ─────────────────────────────────────────────────────

export const createHashtagGroupSchema = z.object({
  workspaceId: z.string().min(1),
  name: z.string().min(1).max(50),
  hashtags: z.array(z.string().max(50)).min(1).max(30),
});

// ── RSS Feed Schemas ──────────────────────────────────────────────────────────

export const createRssFeedSchema = z.object({
  workspaceId: z.string().min(1),
  url: z.string().url(),
  title: z.string().min(1).max(100),
});

// ── Saved Replies Schemas ─────────────────────────────────────────────────────

export const createSavedReplySchema = z.object({
  workspaceId: z.string().min(1),
  shortcut: z.string().min(1).max(30),
  content: z.string().min(1).max(2000),
});

// ── API Key Schemas ───────────────────────────────────────────────────────────

export const createApiKeySchema = z.object({
  workspaceId: z.string().min(1),
  name: z.string().min(1).max(50),
  scopes: z.array(z.string()).default(["posts:read", "posts:write"]),
});

// ── Webhook Schemas ───────────────────────────────────────────────────────────

export const createWebhookSchema = z.object({
  workspaceId: z.string().min(1),
  url: z.string().url(),
  events: z.array(z.string()).min(1),
  secret: z.string().optional(),
});

// ── Queue Schemas ─────────────────────────────────────────────────────────────

export const retryJobSchema = z.object({
  jobId: z.string(),
  workspaceId: z.string(),
});

// ── AI Assistant Schema ───────────────────────────────────────────────────────

export const aiGenerateSchema = z.object({
  action: z.enum([
    "IDEAS",
    "REWRITE",
    "ADAPT",
    "HOOKS",
    "SUMMARIZE",
    "REPHRASE",
    "SHORTEN",
    "EXPAND",
    "MORE_CASUAL",
    "MORE_FORMAL",
    "HASHTAGS",
  ]),
  prompt: z.string().min(1, "Input prompt or caption is required").max(3000),
  tone: z.enum(["Professional", "Punchy", "Casual", "Thought-Leadership", "Technical"]).optional(),
  platform: z
    .enum([
      "TWITTER",
      "LINKEDIN",
      "INSTAGRAM",
      "TIKTOK",
      "FACEBOOK",
      "YOUTUBE",
      "PINTEREST",
      "THREADS",
      "BLUESKY",
      "MASTODON",
      "GOOGLE_BUSINESS",
      "SUBSTACK_NOTES",
    ])
    .optional(),
  brandGuidelines: z.string().max(500).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type CreateIdeaInput = z.infer<typeof createIdeaSchema>;
export type UpdateIdeaInput = z.infer<typeof updateIdeaSchema>;
export type CreatePostingSlotInput = z.infer<typeof createPostingSlotSchema>;
export type ConnectAccountInput = z.infer<typeof connectAccountSchema>;
export type AiGenerateInput = z.infer<typeof aiGenerateSchema>;
export type CreateHashtagGroupInput = z.infer<typeof createHashtagGroupSchema>;
export type CreateRssFeedInput = z.infer<typeof createRssFeedSchema>;
export type CreateSavedReplyInput = z.infer<typeof createSavedReplySchema>;
export type CreateApiKeyInput = z.infer<typeof createApiKeySchema>;
export type CreateWebhookInput = z.infer<typeof createWebhookSchema>;
