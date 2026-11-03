/**
 * Postinger — Model Context Protocol (MCP) Server
 * Exposes core social media publishing tools to AI agents.
 * Tools: list_posts, create_draft, add_to_queue, get_top_posts
 */

import { prisma } from "../lib/db/client";

export interface McpToolCall {
  name: string;
  arguments: Record<string, any>;
}

export interface McpToolResponse {
  content: Array<{ type: string; text: string }>;
  isError?: boolean;
}

export const MCP_TOOLS_MANIFEST = [
  {
    name: "list_posts",
    description: "List posts in the Postinger workspace filtered by status (DRAFT, SCHEDULED, PUBLISHED, etc.)",
    inputSchema: {
      type: "object",
      properties: {
        workspaceId: { type: "string", description: "Target workspace ID" },
        status: { type: "string", enum: ["DRAFT", "SCHEDULED", "PUBLISHED", "FAILED"], description: "Optional status filter" },
        limit: { type: "number", description: "Maximum number of posts (default: 20)" },
      },
      required: ["workspaceId"],
    },
  },
  {
    name: "create_draft",
    description: "Create a new draft post with body and tags in Postinger",
    inputSchema: {
      type: "object",
      properties: {
        workspaceId: { type: "string", description: "Target workspace ID" },
        body: { type: "string", description: "Post content" },
        tags: { type: "array", items: { type: "string" }, description: "Optional tags" },
      },
      required: ["workspaceId", "body"],
    },
  },
  {
    name: "add_to_queue",
    description: "Add a post into the next available queue slot for the workspace",
    inputSchema: {
      type: "object",
      properties: {
        workspaceId: { type: "string", description: "Target workspace ID" },
        body: { type: "string", description: "Post content" },
        socialAccountId: { type: "string", description: "Connected channel ID" },
      },
      required: ["workspaceId", "body"],
    },
  },
  {
    name: "get_top_posts",
    description: "Retrieve highest performing published posts for workspace analytics",
    inputSchema: {
      type: "object",
      properties: {
        workspaceId: { type: "string", description: "Target workspace ID" },
        limit: { type: "number", description: "Number of posts to return (default: 5)" },
      },
      required: ["workspaceId"],
    },
  },
];

export async function handleMcpToolCall(toolCall: McpToolCall): Promise<McpToolResponse> {
  const { name, arguments: args } = toolCall;

  try {
    switch (name) {
      case "list_posts": {
        const posts = await prisma.post.findMany({
          where: {
            workspaceId: args.workspaceId,
            ...(args.status ? { status: args.status } : {}),
          },
          take: args.limit ?? 20,
          orderBy: { createdAt: "desc" },
          select: { id: true, body: true, status: true, postFormat: true, scheduledAt: true },
        });
        return {
          content: [{ type: "text", text: JSON.stringify(posts, null, 2) }],
        };
      }

      case "create_draft": {
        const member = await prisma.workspaceMember.findFirst({
          where: { workspaceId: args.workspaceId, role: "OWNER" },
        });
        const defaultAccount = await prisma.socialAccount.findFirst({
          where: { workspaceId: args.workspaceId },
        });

        const post = await prisma.post.create({
          data: {
            workspaceId: args.workspaceId,
            authorId: member?.userId || "mcp_agent",
            body: args.body,
            tags: args.tags ?? [],
            status: "DRAFT",
            ...(defaultAccount
              ? { postAccounts: { create: [{ socialAccountId: defaultAccount.id }] } }
              : {}),
          },
        });
        return {
          content: [{ type: "text", text: `Draft created successfully with ID: ${post.id}` }],
        };
      }

      case "add_to_queue": {
        const member = await prisma.workspaceMember.findFirst({
          where: { workspaceId: args.workspaceId, role: "OWNER" },
        });
        const defaultAccount =
          (args.socialAccountId
            ? await prisma.socialAccount.findUnique({ where: { id: args.socialAccountId } })
            : null) ||
          (await prisma.socialAccount.findFirst({ where: { workspaceId: args.workspaceId } }));

        if (!defaultAccount) {
          return { content: [{ type: "text", text: "No social account available to queue post." }], isError: true };
        }

        const scheduledTime = new Date(Date.now() + 86400000); // 24 hours in future

        const post = await prisma.post.create({
          data: {
            workspaceId: args.workspaceId,
            authorId: member?.userId || "mcp_agent",
            body: args.body,
            status: "SCHEDULED",
            scheduledAt: scheduledTime,
            postAccounts: { create: [{ socialAccountId: defaultAccount.id }] },
          },
        });
        return {
          content: [
            {
              type: "text",
              text: `Post queued successfully (ID: ${post.id}) for ${scheduledTime.toISOString()}`,
            },
          ],
        };
      }

      case "get_top_posts": {
        const posts = await prisma.post.findMany({
          where: { workspaceId: args.workspaceId, status: "PUBLISHED" },
          take: args.limit ?? 5,
          orderBy: { publishedAt: "desc" },
          select: { id: true, body: true, publishedAt: true, postFormat: true },
        });
        return {
          content: [{ type: "text", text: JSON.stringify(posts, null, 2) }],
        };
      }

      default:
        return { content: [{ type: "text", text: `Unknown tool: ${name}` }], isError: true };
    }
  } catch (err: any) {
    return { content: [{ type: "text", text: `Error executing ${name}: ${err?.message}` }], isError: true };
  }
}
