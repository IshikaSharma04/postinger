import React from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { prisma } from "@/lib/db/client";
import { PostlyLogo } from "@/components/brand/PostlyLogo";
import {
  TwitterXIcon,
  LinkedInIcon,
  InstagramIcon,
  TikTokIcon,
} from "@/components/icons/SocialBrandIcons";

interface PageProps {
  params: Promise<{ handle: string }>;
}

export default async function PublicStartPage({ params }: PageProps) {
  const { handle } = await params;

  // Fetch from database with fallback
  let startPage: any = null;
  try {
    if ((prisma as any).startPage) {
      startPage = await (prisma as any).startPage.findUnique({
        where: { handle },
        include: {
          blocks: {
            where: { isActive: true },
            orderBy: { order: "asc" },
          },
        },
      });
    }
  } catch {
    startPage = null;
  }


  const title = startPage?.title ?? handle.replace(/[-_]/g, " ");
  const bio = startPage?.bio ?? "Creator & Social Media Strategist. Building with Postinger 🚀";
  const avatarUrl =
    startPage?.avatarUrl ??
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80";

  const blocks: Array<{ id: string; title: string; url: string | null }> =
    startPage?.blocks && startPage.blocks.length > 0
      ? startPage.blocks
      : [
          {
            id: "1",
            title: "🚀 Try Postinger Free (Social Workspace)",
            url: "/",
          },
          {
            id: "2",
            title: "📺 Watch: The Content Repurposing Masterclass",
            url: "https://youtube.com",
          },
          {
            id: "3",
            title: "💌 Join the 45,000+ Creator Newsletter",
            url: "https://example.com/newsletter",
          },
        ];


  return (
    <div className="min-h-screen bg-[#F4F0EB] text-[#121212] flex flex-col justify-between p-4 sm:p-6 antialiased font-sans">
      <div className="max-w-md w-full mx-auto pt-10 pb-12">
        {/* Profile Header */}
        <div className="text-center mb-6">
          <img
            src={avatarUrl}
            alt={title}
            className="w-24 h-24 rounded-full object-cover mx-auto mb-3.5 border-4 border-white shadow-xl shadow-zinc-950/5"
          />
          <h1 className="text-2xl font-extrabold text-[#121212] tracking-tight">
            {title}
          </h1>
          <p className="text-xs text-zinc-500 font-medium mt-0.5">@{handle}</p>
          <p className="text-sm text-zinc-600 mt-3 max-w-sm mx-auto leading-relaxed">
            {bio}
          </p>
        </div>

        {/* Social Icons */}
        <div className="flex items-center justify-center gap-3.5 mb-8">
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-white border border-[#E6E1D8] shadow-xs flex items-center justify-center text-zinc-700 hover:text-black hover:border-zinc-400 transition-all hover:scale-105"
          >
            <TwitterXIcon className="w-4 h-4" />
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-white border border-[#E6E1D8] shadow-xs flex items-center justify-center text-zinc-700 hover:text-[#0A66C2] hover:border-blue-200 transition-all hover:scale-105"
          >
            <LinkedInIcon className="w-4 h-4" />
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-white border border-[#E6E1D8] shadow-xs flex items-center justify-center text-zinc-700 hover:text-[#E4405F] hover:border-pink-200 transition-all hover:scale-105"
          >
            <InstagramIcon className="w-4 h-4" />
          </a>
          <a
            href="https://tiktok.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-white border border-[#E6E1D8] shadow-xs flex items-center justify-center text-zinc-700 hover:text-black hover:border-zinc-400 transition-all hover:scale-105"
          >
            <TikTokIcon className="w-4 h-4" />
          </a>
        </div>

        {/* Links List */}
        <div className="space-y-3">
          {blocks.map((block) => (
            <a
              key={block.id}
              href={block.url ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between p-4 rounded-2xl bg-white border border-[#E6E1D8] shadow-sm hover:shadow-md hover:border-zinc-300 transition-all hover:scale-[1.01]"
            >
              <span className="font-bold text-sm text-zinc-900 group-hover:text-blue-600 transition-colors">
                {block.title}
              </span>
              <ExternalLink className="w-4 h-4 text-zinc-400 group-hover:text-blue-600 transition-colors" />
            </a>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center pb-6 text-xs text-zinc-500 flex items-center justify-center gap-2">
        <span>Powered by</span>
        <Link href="/" className="inline-flex items-center gap-1 font-bold text-zinc-900 hover:underline">
          <PostlyLogo size="sm" showWordmark={true} />
        </Link>
      </footer>
    </div>
  );
}
