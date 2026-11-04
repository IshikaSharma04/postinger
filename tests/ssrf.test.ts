import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isPrivateOrReservedIp, assertSafeUrl } from "../src/lib/security/ssrf";

describe("SSRF Guard", () => {
  it("detects private and loopback IPv4 addresses", () => {
    assert.equal(isPrivateOrReservedIp("127.0.0.1"), true);
    assert.equal(isPrivateOrReservedIp("127.1.2.3"), true);
    assert.equal(isPrivateOrReservedIp("10.0.0.1"), true);
    assert.equal(isPrivateOrReservedIp("172.16.0.1"), true);
    assert.equal(isPrivateOrReservedIp("172.31.255.255"), true);
    assert.equal(isPrivateOrReservedIp("192.168.1.1"), true);
    assert.equal(isPrivateOrReservedIp("169.254.169.254"), true);
    assert.equal(isPrivateOrReservedIp("0.0.0.0"), true);
  });

  it("detects IPv4-mapped IPv6 addresses", () => {
    assert.equal(isPrivateOrReservedIp("::ffff:127.0.0.1"), true);
    assert.equal(isPrivateOrReservedIp("::ffff:192.168.0.1"), true);
    assert.equal(isPrivateOrReservedIp("::ffff:10.1.2.3"), true);
  });

  it("detects unique-local IPv6 addresses (fc00::/7)", () => {
    assert.equal(isPrivateOrReservedIp("fc00::1"), true);
    assert.equal(isPrivateOrReservedIp("fd12:3456:789a:1::1"), true);
    assert.equal(isPrivateOrReservedIp("fd00::"), true);
  });

  it("detects link-local IPv6 addresses (fe80::/10)", () => {
    assert.equal(isPrivateOrReservedIp("fe80::1"), true);
    assert.equal(isPrivateOrReservedIp("febf::ffff"), true);
    assert.equal(isPrivateOrReservedIp("::1"), true);
  });

  it("permits public IPv4 addresses", () => {
    assert.equal(isPrivateOrReservedIp("8.8.8.8"), false);
    assert.equal(isPrivateOrReservedIp("1.1.1.1"), false);
    assert.equal(isPrivateOrReservedIp("93.184.216.34"), false);
  });

  it("rejects non-http/https protocols", async () => {
    await assert.rejects(() => assertSafeUrl("ftp://example.com"), /Only http and https/);
    await assert.rejects(() => assertSafeUrl("file:///etc/passwd"), /Only http and https/);
    await assert.rejects(() => assertSafeUrl("gopher://127.0.0.1"), /Only http and https/);
  });

  it("rejects blocked hostnames", async () => {
    await assert.rejects(() => assertSafeUrl("http://localhost/admin"), /prohibited/);
    await assert.rejects(() => assertSafeUrl("http://127.0.0.1:3000"), /prohibited/);
    await assert.rejects(() => assertSafeUrl("http://metadata.google.internal"), /prohibited/);
    await assert.rejects(() => assertSafeUrl("http://my-service.local"), /prohibited/);
  });
});
