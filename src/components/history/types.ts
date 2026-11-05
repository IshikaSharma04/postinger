export interface HistorySocialAccount {
  id: string;
  platform: string;
  handle: string;
  displayName?: string | null;
  avatarUrl?: string | null;
}

export interface HistoryPostAccount {
  id?: string;
  socialAccountId?: string;
  socialAccount?: HistorySocialAccount;
}

export interface HistoryPostItem {
  id: string;
  body: string;
  status: string;
  tags?: string[];
  hashtags?: string[];
  scheduledAt?: string | null;
  publishedAt?: string | null;
  createdAt?: string;
  postAccounts?: HistoryPostAccount[];
}

export interface TagMetric {
  tag: string;
  count: number;
  published: number;
  rate: number;
}
