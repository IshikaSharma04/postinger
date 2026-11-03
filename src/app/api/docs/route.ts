import { NextResponse } from "next/server";

export async function GET() {
  const spec = {
    openapi: "3.0.3",
    info: {
      title: "Postinger Public Developer API",
      version: "1.0.0",
      description: "Automate scheduling, draft generation, queue management, and social cross-posting.",
    },
    servers: [{ url: "http://localhost:3001/api/v1", description: "Postinger API Server" }],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "pst_...",
          description: "Use your API key generated from Postinger workspace settings.",
        },
      },
      schemas: {
        Post: {
          type: "object",
          properties: {
            id: { type: "string" },
            body: { type: "string" },
            status: { type: "string", enum: ["DRAFT", "SCHEDULED", "PUBLISHED", "FAILED"] },
            postFormat: { type: "string", enum: ["POST", "REEL", "STORY", "CAROUSEL", "THREAD", "SHORTS", "PIN"] },
            tags: { type: "array", items: { type: "string" } },
            scheduledAt: { type: "string", format: "date-time" },
          },
        },
      },
    },
    security: [{ BearerAuth: [] }],
    paths: {
      "/posts": {
        get: {
          summary: "List workspace posts",
          description: "Returns the 50 most recent posts for the authenticated workspace.",
          responses: {
            200: { description: "Successful response" },
            401: { description: "Unauthorized — missing or invalid key" },
            403: { description: "Forbidden — insufficient scope" },
          },
        },
        post: {
          summary: "Create a new post or draft",
          description: "Creates a new content item in your workspace pipeline.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["body"],
                  properties: {
                    body: { type: "string" },
                    tags: { type: "array", items: { type: "string" } },
                    hashtags: { type: "array", items: { type: "string" } },
                    action: { type: "string", enum: ["DRAFT", "QUEUE", "SCHEDULE"] },
                    scheduledAt: { type: "string", format: "date-time" },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "Post created successfully" },
            400: { description: "Invalid input" },
            401: { description: "Unauthorized" },
          },
        },
      },
    },
  };

  return NextResponse.json(spec);
}
