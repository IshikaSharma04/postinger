import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Calendar, Share2 } from "lucide-react";
import { PostlyLogo } from "@/components/brand/PostlyLogo";
import { BLOG_POSTS } from "@/lib/blog/posts";

export async function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export default async function BlogPostDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  if (!post) notFound();

  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900">
      {/* Header */}
      <header className="border-b border-zinc-100 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <PostlyLogo size="md" />
        </Link>
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-600 hover:text-zinc-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to all articles
        </Link>
      </header>

      {/* Article Body */}
      <article className="py-16 px-6 max-w-3xl mx-auto space-y-8">
        <div className="space-y-4">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded-full">
            {post.category}
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 leading-tight">
            {post.title}
          </h1>

          <div className="flex items-center gap-4 text-xs text-zinc-500 pt-2 border-b border-zinc-100 pb-4">
            <span className="font-semibold text-zinc-800">{post.author.name} · {post.author.role}</span>
            <span>·</span>
            <span>{post.date}</span>
            <span>·</span>
            <span>{post.readTime}</span>
          </div>
        </div>

        <div className="prose prose-zinc max-w-none text-zinc-700 leading-relaxed space-y-4 text-sm sm:text-base">
          {post.content.split("\n\n").map((para, i) => {
            if (para.startsWith("### ")) {
              return <h3 key={i} className="text-xl font-bold text-zinc-900 pt-4">{para.replace("### ", "")}</h3>;
            }
            if (para.startsWith("1. ") || para.startsWith("- ")) {
              return (
                <div key={i} className="pl-4 border-l-2 border-blue-500 my-2 space-y-1 text-sm">
                  {para.split("\n").map((line, j) => (
                    <p key={j} className="text-zinc-700">{line}</p>
                  ))}
                </div>
              );
            }
            return <p key={i} className="leading-relaxed">{para}</p>;
          })}
        </div>

        {/* CTA Banner */}
        <div className="p-8 rounded-3xl bg-blue-50 border border-blue-200 text-center space-y-3 mt-12">
          <h3 className="font-bold text-lg text-zinc-900">Put this strategy to work in your queue</h3>
          <p className="text-xs text-zinc-600 max-w-md mx-auto">
            Try Postinger free. Multi-channel composer, weekly schedule slots, and AI copy assistant included.
          </p>
          <div className="pt-2">
            <Link
              href="/signup"
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors"
            >
              Get Started Free →
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}
