export interface PlanLimits {
  name: string;
  priceMonthly: number;
  priceYearly: number;
  maxChannels: number;
  maxScheduledPerChannel: number;
  maxIdeas: number;
  teamMembers: number;
  aiGenerationsPerMonth: number;
  analyticsHistoryDays: number;
  features: string[];
}

export const PLAN_LIMITS: Record<string, PlanLimits> = {
  FREE: {
    name: "Free",
    priceMonthly: 0,
    priceYearly: 0,
    maxChannels: 3,
    maxScheduledPerChannel: 10,
    maxIdeas: 100,
    teamMembers: 1,
    aiGenerationsPerMonth: 30,
    analyticsHistoryDays: 30,
    features: [
      "3 connected social channels",
      "10 scheduled posts per channel",
      "100 scratchpad ideas",
      "Basic analytics (30 days)",
      "Standard queue time slots",
      "Community inbox",
    ],
  },
  PRO: {
    name: "Essentials / Pro",
    priceMonthly: 6,
    priceYearly: 5,
    maxChannels: 12,
    maxScheduledPerChannel: 2000,
    maxIdeas: 5000,
    teamMembers: 3,
    aiGenerationsPerMonth: 500,
    analyticsHistoryDays: 365,
    features: [
      "Unlimited social channels (up to 12)",
      "Unlimited scheduled posts (2,000/channel)",
      "Unlimited ideas bank",
      "Advanced insights & best time heatmaps",
      "AI Assistant (500 runs/mo)",
      "Per-channel schedule customizer",
      "Public REST API access",
    ],
  },
  ENTERPRISE: {
    name: "Team & Agency",
    priceMonthly: 12,
    priceYearly: 10,
    maxChannels: 50,
    maxScheduledPerChannel: 10000,
    maxIdeas: 25000,
    teamMembers: 25,
    aiGenerationsPerMonth: 5000,
    analyticsHistoryDays: 730,
    features: [
      "Everything in Pro",
      "Unlimited team collaboration & roles",
      "Draft approval workflows",
      "Custom branded Start Pages",
      "Audit logs & Webhooks",
      "Priority publishing queues",
      "Dedicated account manager",
    ],
  },
};

export function getPlanLimits(plan: string = "FREE"): PlanLimits {
  return PLAN_LIMITS[plan.toUpperCase()] ?? PLAN_LIMITS.FREE;
}

export const PLANS = PLAN_LIMITS;

