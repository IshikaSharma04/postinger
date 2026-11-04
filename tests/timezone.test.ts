import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { getUtcForZonedTime } from "@/lib/queue/timezone";

describe("Timezone & DST Slot Calculations", () => {
  test("calculates correct UTC instant before and after US Daylight Saving Time (DST) end", () => {
    // US Eastern DST ended on Sunday, November 3, 2024 at 02:00 AM.
    // Before fallback (Nov 2, 2024): EDT is UTC-4.
    // 09:00 EDT should be 13:00 UTC.
    const beforeDstEnd = getUtcForZonedTime(2024, 11, 2, 9, 0, "America/New_York");
    assert.equal(beforeDstEnd.toISOString(), "2024-11-02T13:00:00.000Z");

    // After fallback (Nov 3, 2024 at 09:00): EST is UTC-5.
    // 09:00 EST should be 14:00 UTC.
    const afterDstEnd = getUtcForZonedTime(2024, 11, 3, 9, 0, "America/New_York");
    assert.equal(afterDstEnd.toISOString(), "2024-11-03T14:00:00.000Z");

    // The elapsed time between 09:00 Nov 2 and 09:00 Nov 3 should be 25 hours due to the fallback hour
    const elapsedHours = (afterDstEnd.getTime() - beforeDstEnd.getTime()) / (1000 * 60 * 60);
    assert.equal(elapsedHours, 25);
  });

  test("calculates correct UTC instant across European DST transition", () => {
    // Europe/London DST (BST, UTC+1) ended on Sunday, October 27, 2024 at 02:00 AM to GMT (UTC+0).
    const summerLondon = getUtcForZonedTime(2024, 10, 26, 10, 0, "Europe/London");
    assert.equal(summerLondon.toISOString(), "2024-10-26T09:00:00.000Z");

    const winterLondon = getUtcForZonedTime(2024, 10, 28, 10, 0, "Europe/London");
    assert.equal(winterLondon.toISOString(), "2024-10-28T10:00:00.000Z");
  });

  test("handles standard UTC timezone consistently", () => {
    const utcTime = getUtcForZonedTime(2025, 6, 15, 14, 30, "UTC");
    assert.equal(utcTime.toISOString(), "2025-06-15T14:30:00.000Z");
  });
});
