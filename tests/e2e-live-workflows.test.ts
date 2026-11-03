import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import fs from "node:fs";
import { prisma } from "../src/lib/db/client";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const COOKIE_FILE = "/tmp/postly_test_cookies.txt";

describe("Postly Live End-to-End Buffer Workflows", async () => {
  let cookieHeader = "";
  let workspaceId = "";
  let accountId = "";
  let draftPostId = "";

  test("1. Authenticates demo user and obtains session cookie", async () => {
    // Clean any prior cookie file
    if (fs.existsSync(COOKIE_FILE)) fs.unlinkSync(COOKIE_FILE);

    // Fetch CSRF and credentials login via curl
    const csrfRaw = execSync(`curl -s -c "${COOKIE_FILE}" "${BASE_URL}/api/auth/csrf"`).toString();
    const csrfData = JSON.parse(csrfRaw);
    assert.ok(csrfData.csrfToken, "CSRF token must exist");

    execSync(
      `curl -s -b "${COOKIE_FILE}" -c "${COOKIE_FILE}" -X POST "${BASE_URL}/api/auth/callback/credentials" ` +
        `-d "csrfToken=${csrfData.csrfToken}&email=demo@postly.app&password=Demo1234!" -o /dev/null`
    );

    const cookieContent = fs.readFileSync(COOKIE_FILE, "utf-8");
    assert.ok(cookieContent.includes("authjs.session-token"), "Must have received authjs.session-token");

    // Extract session token
    const match = cookieContent.match(/authjs\.session-token\t([^\s]+)/);
    assert.ok(match, "Must extract authjs.session-token value");
    cookieHeader = `authjs.session-token=${match[1]}`;

    // Verify user & default workspace in DB
    const user = await prisma.user.findUnique({
      where: { email: "demo@postly.app" },
      include: {
        workspaceMembers: {
          include: { workspace: true },
        },
      },
    });

    assert.ok(user, "Demo user must exist in database");
    assert.ok(user.workspaceMembers.length > 0, "Demo user must have a workspace");
    workspaceId = user.workspaceMembers[0].workspace.id;
  });

  test("2. Fetches connected social accounts for the workspace", async () => {
    const res = await fetch(`${BASE_URL}/api/accounts?workspaceId=${workspaceId}`, {
      headers: { Cookie: cookieHeader },
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    const accounts = body.data || body.accounts || [];
    assert.ok(Array.isArray(accounts), "Should return array of accounts");
    assert.ok(accounts.length > 0, "Demo workspace should have connected accounts");
    accountId = accounts[0].id;
  });

  test("3. Creates a draft post with channel selection", async () => {
    const res = await fetch(`${BASE_URL}/api/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
      body: JSON.stringify({
        workspaceId,
        body: "Testing our Buffer-style publishing engine on Postly! 🚀 #buildinpublic",
        accountIds: [accountId],
        action: "DRAFT",
      }),
    });

    assert.equal(res.status, 201);
    const body = await res.json();
    const post = body.data || body;
    assert.ok(post.id);
    assert.equal(post.status, "DRAFT");
    assert.equal(post.body, "Testing our Buffer-style publishing engine on Postly! 🚀 #buildinpublic");
    draftPostId = post.id;
  });

  test("4. Fetches the draft post for editing in Composer", async () => {
    const res = await fetch(`${BASE_URL}/api/posts/${draftPostId}?workspaceId=${workspaceId}`, {
      headers: { Cookie: cookieHeader },
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    const post = body.data || body;
    assert.equal(post.id, draftPostId);
    assert.equal(post.status, "DRAFT");
  });

  test("5. Updates and schedules the draft post for a future date/time", async () => {
    const scheduledAt = new Date(Date.now() + 86400000 * 2).toISOString(); // 2 days ahead
    const updatedBody = "Testing our Buffer-style publishing engine on Postly! 🚀 #buildinpublic — Updated and ready for queue";

    const res = await fetch(`${BASE_URL}/api/posts/${draftPostId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
      body: JSON.stringify({
        workspaceId,
        body: updatedBody,
        scheduledAt,
        action: "SCHEDULE",
      }),
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    const updatedPost = body.data || body;
    assert.equal(updatedPost.id, draftPostId);
    assert.equal(updatedPost.status, "SCHEDULED");
    assert.equal(updatedPost.body, updatedBody);
    assert.ok(updatedPost.scheduledAt);
  });

  test("6. Verifies scheduled post appears in post listings and calendar", async () => {
    // Verify in GET /api/posts
    const res = await fetch(`${BASE_URL}/api/posts?workspaceId=${workspaceId}&status=SCHEDULED`, {
      headers: { Cookie: cookieHeader },
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    const posts = body.data?.posts || body.posts || [];
    const found = posts.find((p: any) => p.id === draftPostId);
    assert.ok(found, "Scheduled post must be present in GET /api/posts?status=SCHEDULED");
    assert.equal(found.status, "SCHEDULED");
  });

  test("7. Connects and disconnects a social media channel", async () => {
    // Connect YouTube channel
    const connectRes = await fetch(`${BASE_URL}/api/accounts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
      body: JSON.stringify({
        workspaceId,
        platform: "YOUTUBE",
        handle: "techchannel_live",
        accountName: "Tech Channel Live",
      }),
    });

    assert.equal(connectRes.status, 201);
    const connectBody = await connectRes.json();
    const newAccount = connectBody.data || connectBody;
    assert.equal(newAccount.platform, "YOUTUBE");
    assert.equal(newAccount.handle, "techchannel_live");

    // Disconnect the newly created account
    const disconnectRes = await fetch(`${BASE_URL}/api/accounts?id=${newAccount.id}&workspaceId=${workspaceId}`, {
      method: "DELETE",
      headers: { Cookie: cookieHeader },
    });

    assert.equal(disconnectRes.status, 200);
    const disconnectData = await disconnectRes.json();
    assert.equal(disconnectData.data?.success ?? disconnectData.success, true);

    // Verify it is no longer listed
    const checkRes = await fetch(`${BASE_URL}/api/accounts?workspaceId=${workspaceId}`, {
      headers: { Cookie: cookieHeader },
    });
    const checkBody = await checkRes.json();
    const currentAccounts = checkBody.data || checkBody.accounts || [];
    const stillThere = currentAccounts.some((a: any) => a.id === newAccount.id);
    assert.equal(stillThere, false, "Disconnected account must be removed from workspace accounts");
  });

  test("8. Executes instant publishing job and validates worker outcome", async () => {
    // Create a post with action PUBLISH_NOW
    const res = await fetch(`${BASE_URL}/api/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
      body: JSON.stringify({
        workspaceId,
        body: "Live instant publish test via Postly worker! ⚡ #instantpublishing",
        accountIds: [accountId],
        action: "PUBLISH_NOW",
      }),
    });

    assert.equal(res.status, 201);
    const body = await res.json();
    const post = body.data || body;
    assert.ok(post.id);

    // Give worker job a moment to complete
    await new Promise((r) => setTimeout(r, 1200));

    // Verify post status in database
    const publishedPost = await prisma.post.findUnique({
      where: { id: post.id },
      include: {
        publishingJobs: true,
      },
    });

    assert.ok(publishedPost);
    assert.equal(publishedPost.status, "PUBLISHED", "Post must transition to PUBLISHED status");
    assert.ok(publishedPost.publishingJobs.length > 0, "Publishing job record must exist");
    assert.equal(publishedPost.publishingJobs[0].status, "COMPLETED");
  });
});
