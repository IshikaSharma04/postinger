import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import fs from "node:fs";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/db/client";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const COOKIE_FILE_ATTACKER = "/tmp/postly_attacker_cookies.txt";

describe("Tenant Data Isolation & Security Access Control", async () => {
  let attackerCookieHeader = "";
  let demoWorkspaceId = "";
  let attackerWorkspaceId = "";

  before(async () => {
    // 1. Ensure demo workspace exists
    const demoWorkspace = await prisma.workspace.findUnique({
      where: { slug: "demo-workspace" },
    });
    assert.ok(demoWorkspace, "Demo workspace must exist");
    demoWorkspaceId = demoWorkspace.id;

    // 2. Ensure an isolated attacker user exists with their OWN workspace
    const attackerEmail = "attacker@securitytest.app";
    const passwordHash = await bcrypt.hash("Demo1234!", 10);
    
    let attackerUser = await prisma.user.findUnique({
      where: { email: attackerEmail },
    });
    if (!attackerUser) {
      attackerUser = await prisma.user.create({
        data: {
          name: "Attacker User",
          email: attackerEmail,
          passwordHash,
        },
      });
    }

    // Ensure attacker has their own isolated workspace
    let attackerWs = await prisma.workspace.findUnique({
      where: { slug: "attacker-isolated-workspace" },
    });
    if (!attackerWs) {
      attackerWs = await prisma.workspace.create({
        data: {
          name: "Attacker Workspace",
          slug: "attacker-isolated-workspace",
          members: {
            create: [{ userId: attackerUser.id, role: "OWNER" }],
          },
        },
      });
    }
    attackerWorkspaceId = attackerWs.id;

    // Ensure attacker is NOT in demo workspace
    await prisma.workspaceMember.deleteMany({
      where: {
        workspaceId: demoWorkspaceId,
        userId: attackerUser.id,
      },
    });

    assert.notEqual(demoWorkspaceId, attackerWorkspaceId, "Workspaces must be completely distinct");
  });

  test("1. Authenticates isolated external user and obtains session", async () => {
    if (fs.existsSync(COOKIE_FILE_ATTACKER)) fs.unlinkSync(COOKIE_FILE_ATTACKER);

    const csrfRaw = execSync(`curl -s -c "${COOKIE_FILE_ATTACKER}" "${BASE_URL}/api/auth/csrf"`).toString();
    const csrfData = JSON.parse(csrfRaw);
    assert.ok(csrfData.csrfToken);

    execSync(
      `curl -s -b "${COOKIE_FILE_ATTACKER}" -c "${COOKIE_FILE_ATTACKER}" -X POST "${BASE_URL}/api/auth/callback/credentials" ` +
        `-d "csrfToken=${csrfData.csrfToken}&email=attacker@securitytest.app&password=Demo1234!" -o /dev/null`
    );

    const cookieContent = fs.readFileSync(COOKIE_FILE_ATTACKER, "utf-8");
    const match = cookieContent.match(/authjs\.session-token\t([^\s]+)/);
    assert.ok(match, "Attacker must obtain session token");
    attackerCookieHeader = `authjs.session-token=${match[1]}`;
  });

  test("2. Rejects external user trying to read Demo workspace posts (Tenant Isolation)", async () => {
    const res = await fetch(`${BASE_URL}/api/posts?workspaceId=${demoWorkspaceId}`, {
      headers: { Cookie: attackerCookieHeader },
    });
    assert.equal(res.status, 403, "External user must be forbidden from reading demo workspace posts");
  });

  test("3. Rejects external user trying to read Demo workspace social channels", async () => {
    const res = await fetch(`${BASE_URL}/api/accounts?workspaceId=${demoWorkspaceId}`, {
      headers: { Cookie: attackerCookieHeader },
    });
    assert.equal(res.status, 403, "External user must be forbidden from reading demo social channels");
  });

  test("4. Rejects external user trying to read Demo workspace scratchpad ideas", async () => {
    const res = await fetch(`${BASE_URL}/api/ideas?workspaceId=${demoWorkspaceId}`, {
      headers: { Cookie: attackerCookieHeader },
    });
    assert.equal(res.status, 403, "External user must be forbidden from reading demo ideas");
  });

  test("5. Rejects external user trying to view Demo workspace API keys", async () => {
    const res = await fetch(`${BASE_URL}/api/v1/keys?workspaceId=${demoWorkspaceId}`, {
      headers: { Cookie: attackerCookieHeader },
    });
    assert.equal(res.status, 403, "External user must be forbidden from reading demo API keys");
  });

  test("6. Rejects external user trying to view Demo workspace queue posting slots", async () => {
    const res = await fetch(`${BASE_URL}/api/queue/slots?workspaceId=${demoWorkspaceId}`, {
      headers: { Cookie: attackerCookieHeader },
    });
    assert.equal(res.status, 403, "External user must be forbidden from reading demo queue slots");
  });

  test("7. Rejects external user trying to access admin dashboard endpoint", async () => {
    const res = await fetch(`${BASE_URL}/api/admin/overview`, {
      headers: { Cookie: attackerCookieHeader },
    });
    // Either 403 Forbidden or 404/redirect - never 200
    assert.notEqual(res.status, 200, "Non-admin must not access admin routes");
  });
});
