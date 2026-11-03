import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { checkRateLimit } from "../src/lib/utils/rate-limit";

describe("Rate Limiting", () => {
  it("allows requests under the maximum limit", () => {
    const id = `test-user-${Date.now()}`;
    const r1 = checkRateLimit({ identifier: id, windowMs: 10000, max: 3 });
    assert.equal(r1.allowed, true);
    assert.equal(r1.remaining, 2);

    const r2 = checkRateLimit({ identifier: id, windowMs: 10000, max: 3 });
    assert.equal(r2.allowed, true);
    assert.equal(r2.remaining, 1);
  });

  it("blocks requests that exceed the limit", () => {
    const id = `blocked-user-${Date.now()}`;
    checkRateLimit({ identifier: id, windowMs: 10000, max: 2 });
    checkRateLimit({ identifier: id, windowMs: 10000, max: 2 });

    const r3 = checkRateLimit({ identifier: id, windowMs: 10000, max: 2 });
    assert.equal(r3.allowed, false);
    assert.equal(r3.remaining, 0);
  });
});
