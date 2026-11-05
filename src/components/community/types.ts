export type CommentSentiment = "QUESTION" | "PRAISE" | "FEEDBACK";
export type CommentStatus = "UNREAD" | "READ" | "REPLIED";

export interface SocialCommentItem {
  id: string;
  authorName: string;
  authorHandle: string;
  authorAvatar: string | null;
  platform: string;
  content: string;
  sentiment: CommentSentiment;
  status: CommentStatus;
  replyText?: string | null;
  repliedAt?: string | null;
  createdAt: string;
}

export interface SavedReply {
  id: string;
  shortcut: string;
  title: string;
  content: string;
}
