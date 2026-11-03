import { prisma } from "@/lib/db/client";

/**
 * Calculates a local date and time in a specific timezone,
 * automatically accounting for Daylight Saving Time (DST) changes.
 */
export function getUtcForZonedTime(
  year: number,
  month: number, // 1-12
  day: number,
  hour: number,
  minute: number,
  timezone: string
): Date {
  // Approximate as UTC first
  const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00Z`;
  const initialUtc = new Date(dateStr);

  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: false,
    });

    const parts = formatter.formatToParts(initialUtc);
    const getVal = (type: string) => {
      const part = parts.find((p) => p.type === type);
      return part ? parseInt(part.value, 10) : 0;
    };

    const targetHour = getVal("hour") === 24 ? 0 : getVal("hour");
    const targetMinute = getVal("minute");
    const diffMinutes = (targetHour - hour) * 60 + (targetMinute - minute);

    // Adjust UTC by the difference to land on the exact local wall-clock time
    return new Date(initialUtc.getTime() - diffMinutes * 60 * 1000);
  } catch {
    return initialUtc;
  }
}

/**
 * Platform Recommended Engagement Times
 */
export const RECOMMENDED_TIMES_BY_PLATFORM: Record<string, string[]> = {
  LINKEDIN: ["08:30", "12:00", "17:15"],
  TWITTER: ["09:00", "12:30", "16:45", "20:00"],
  INSTAGRAM: ["11:30", "15:00", "19:30"],
  FACEBOOK: ["10:00", "13:30", "18:00"],
  TIKTOK: ["14:00", "18:30", "21:00"],
  YOUTUBE: ["15:00", "18:00"],
  PINTEREST: ["14:30", "20:30"],
  THREADS: ["09:30", "14:00", "19:00"],
  BLUESKY: ["11:00", "16:00"],
  MASTODON: ["10:30", "15:30"],
  GOOGLE_BUSINESS: ["09:00", "13:00"],
  SUBSTACK_NOTES: ["08:00", "13:30", "17:00"],
};

export function getRecommendedTimes(platform?: string): string[] {
  if (platform && RECOMMENDED_TIMES_BY_PLATFORM[platform]) {
    return RECOMMENDED_TIMES_BY_PLATFORM[platform];
  }
  return ["09:00", "12:30", "17:00"];
}

/**
 * Finds the next available posting schedule slot for a given channel or workspace
 */
export async function getNextAvailablePostingDate(params: {
  workspaceId: string;
  socialAccountId?: string | null;
  fromDate?: Date;
}): Promise<Date> {
  const { workspaceId, socialAccountId } = params;
  const start = params.fromDate ? new Date(params.fromDate) : new Date();

  // 1. Fetch recurring schedule slots (channel-specific first, fallback to workspace-wide)
  let slots = await prisma.postingScheduleSlot.findMany({
    where: {
      workspaceId,
      ...(socialAccountId ? { socialAccountId } : {}),
      isActive: true,
    },
    orderBy: [{ dayOfWeek: "asc" }, { time: "asc" }],
  });

  if (slots.length === 0 && socialAccountId) {
    slots = await prisma.postingScheduleSlot.findMany({
      where: {
        workspaceId,
        socialAccountId: null,
        isActive: true,
      },
      orderBy: [{ dayOfWeek: "asc" }, { time: "asc" }],
    });
  }

  // Fallback defaults if workspace has zero slots set
  if (slots.length === 0) {
    const fallback = new Date(start.getTime() + 2 * 3600 * 1000); // 2 hours from now
    return fallback;
  }

  // 2. Fetch existing scheduled posts to avoid double booking
  const existingJobs = await prisma.publishingJob.findMany({
    where: {
      post: { workspaceId },
      ...(socialAccountId ? { socialAccountId } : {}),
      status: { in: ["PENDING", "RUNNING"] },
      scheduledAt: { gte: start },
    },
    select: { scheduledAt: true },
  });

  const bookedTimestamps = new Set(
    existingJobs.map((j) => Math.floor(j.scheduledAt.getTime() / 60000))
  );

  // 3. Scan the next 14 days for the first slot that is in the future and not booked
  for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
    const checkDate = new Date(start.getTime() + dayOffset * 86400 * 1000);
    const dayOfWeek = checkDate.getUTCDay();

    const daySlots = slots.filter((s) => s.dayOfWeek === dayOfWeek);
    for (const slot of daySlots) {
      const [h, m] = slot.time.split(":").map(Number);
      const slotUtc = getUtcForZonedTime(
        checkDate.getUTCFullYear(),
        checkDate.getUTCMonth() + 1,
        checkDate.getUTCDate(),
        h,
        m,
        slot.timezone || "UTC"
      );

      // Must be at least 3 minutes in the future
      if (slotUtc.getTime() > Date.now() + 180000) {
        const slotMinute = Math.floor(slotUtc.getTime() / 60000);
        if (!bookedTimestamps.has(slotMinute)) {
          return slotUtc;
        }
      }
    }
  }

  // Default to 1 hour from now if all searched slots are full
  return new Date(start.getTime() + 3600 * 1000);
}
