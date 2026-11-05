export interface QueueJobAttempt {
  id?: string;
  attemptNumber: number;
  status: string;
  error?: string | null;
  startedAt?: string | null;
}

export interface QueueJobPost {
  id?: string;
  body?: string;
}

export interface QueueJobAccount {
  id?: string;
  platform?: string;
  handle?: string;
}

export interface QueueJobItem {
  id: string;
  bullJobId?: string | null;
  idempotencyKey?: string | null;
  externalPostId?: string | null;
  status: string;
  attemptCount: number;
  maxAttempts: number;
  scheduledFor?: string | null;
  lastError?: string | null;
  attempts?: QueueJobAttempt[];
  post?: QueueJobPost;
  socialAccount?: QueueJobAccount;
}

export interface ScheduleSlot {
  id: string;
  dayOfWeek: number;
  time: string;
  isActive: boolean;
}
