import { prisma } from "@/lib/db/client";

export async function getNextQueueSlot(workspaceId: string): Promise<Date> {
  const slots = await prisma.postingScheduleSlot.findMany({
    where: { workspaceId, isActive: true },
    orderBy: [{ dayOfWeek: "asc" }, { time: "asc" }],
  });

  const now = new Date();
  if (slots.length === 0) {
    // Default queue slot: next day at 10:00 AM UTC
    const fallback = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    fallback.setUTCHours(10, 0, 0, 0);
    return fallback;
  }

  // Find the next slot in the future
  const currentDay = now.getUTCDay();
  const currentHour = now.getUTCHours();
  const currentMinute = now.getUTCMinutes();
  const currentTimeMinutes = currentHour * 60 + currentMinute;

  for (const slot of slots) {
    const [h, m] = slot.time.split(":").map(Number);
    const slotMinutes = h * 60 + m;

    if (slot.dayOfWeek === currentDay && slotMinutes > currentTimeMinutes + 5) {
      const scheduled = new Date(now);
      scheduled.setUTCHours(h, m, 0, 0);
      return scheduled;
    }
  }

  // Otherwise, wrap around to next week's first slot
  for (let dayOffset = 1; dayOffset <= 7; dayOffset++) {
    const targetDay = (currentDay + dayOffset) % 7;
    const matchingSlot = slots.find((s) => s.dayOfWeek === targetDay);
    if (matchingSlot) {
      const [h, m] = matchingSlot.time.split(":").map(Number);
      const scheduled = new Date(now.getTime() + dayOffset * 24 * 60 * 60 * 1000);
      scheduled.setUTCHours(h, m, 0, 0);
      return scheduled;
    }
  }

  return new Date(now.getTime() + 2 * 60 * 60 * 1000);
}
