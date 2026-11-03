import { assertSafeUrl } from "@/lib/security/ssrf";
import { prisma } from "@/lib/db/client";

export interface FeedItem {
  title: string;
  link: string;
  description?: string;
  pubDate?: string;
}

export async function parseRssFeed(feedUrl: string): Promise<FeedItem[]> {
  await assertSafeUrl(feedUrl);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(feedUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Postinger-FeedBot/1.0 (+https://postinger.app)",
        Accept: "application/rss+xml, application/xml, text/xml, application/atom+xml",
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch feed: HTTP ${res.status}`);
    }

    const xml = await res.text();
    return extractItemsFromXml(xml);
  } finally {
    clearTimeout(timeout);
  }
}

function extractItemsFromXml(xml: string): FeedItem[] {
  const items: FeedItem[] = [];
  const itemMatches = xml.match(/<item[\s\S]*?<\/item>/gi) || xml.match(/<entry[\s\S]*?<\/entry>/gi) || [];

  for (const block of itemMatches.slice(0, 10)) {
    const titleMatch = block.match(/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
    const linkMatch =
      block.match(/<link[^>]*href=["']([^"']+)["']/i) ||
      block.match(/<link[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i);
    const descMatch =
      block.match(/<description[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i) ||
      block.match(/<summary[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/summary>/i);

    const title = titleMatch ? cleanText(titleMatch[1]) : "Untitled Feed Item";
    const link = linkMatch ? cleanText(linkMatch[1]) : "";
    const description = descMatch ? cleanText(descMatch[1]) : "";

    if (title && title.length > 2) {
      items.push({ title, link, description });
    }
  }

  return items;
}

function cleanText(text: string): string {
  return text
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Syncs an RSS feed by fetching new items and saving them as scratchpad ideas
 */
export async function syncRssFeedToIdeas(feedId: string, authorId: string): Promise<number> {
  const feed = await prisma.rssFeed.findUnique({ where: { id: feedId } });
  if (!feed || !feed.isActive) return 0;

  const items = await parseRssFeed(feed.url);
  let createdCount = 0;

  for (const item of items) {
    const existing = await prisma.idea.findFirst({
      where: {
        workspaceId: feed.workspaceId,
        title: item.title,
      },
    });

    if (!existing) {
      await prisma.idea.create({
        data: {
          workspaceId: feed.workspaceId,
          authorId,
          title: item.title,
          content: `${item.description ? item.description.slice(0, 500) + "\n\n" : ""}Source: ${item.link}`,
          tags: ["RSS", "Feed"],
          status: "UNASSIGNED",
        },
      });
      createdCount++;
    }
  }

  await prisma.rssFeed.update({
    where: { id: feedId },
    data: { lastFetchedAt: new Date() },
  });

  return createdCount;
}
