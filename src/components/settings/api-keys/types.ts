export interface ApiKeyItem {
  id: string;
  name: string;
  keyPrefix: string;
  scopes: string[];
  lastUsedAt?: string | null;
  createdAt: string;
  revokedAt?: string | null;
}

export interface WebhookItem {
  id: string;
  url: string;
  events: string[];
  secret?: string | null;
  createdAt: string;
}

export interface WorkspaceItem {
  id: string;
  name: string;
  slug: string;
}
