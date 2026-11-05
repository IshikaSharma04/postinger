/** Shapes returned by GET /api/posts (list view include block). */

export interface PostSocialAccount {
  id: string;
  platform: string;
  handle: string;
  displayName: string | null;
  avatarUrl: string | null;
}

export interface PostAccount {
  id: string;
  socialAccountId: string;
  socialAccount: PostSocialAccount;
}

export interface PostAuthor {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}

export interface PostListItem {
  id: string;
  title: string | null;
  body: string;
  status: string;
  hashtags: string[];
  scheduledAt: string | null;
  publishedAt: string | null;
  createdAt: string;
  author: PostAuthor | null;
  postAccounts: PostAccount[];
}

export interface PostsApiResponse {
  posts: PostListItem[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}
