import React from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Clock } from "lucide-react";
import { PostlyLogo } from "@/components/brand/PostlyLogo";
import { BLOG_POSTS } from "@/lib/blog/posts";

export default function BlogIndexPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900">
      {/* Header */}
      <header className="border-b border-zinc-100 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <PostlyLogo size="md" />
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-xs font-bold text-zinc-700 hover:text-zinc-900 px-3 py-2">
            Log in
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs"
          >
            Get Started Free
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 px-6 max-w-4xl mx-auto text-center space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
          The Postinger Journal
        </span>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-zinc-900">
          Stories, Strategy & Creator Workflows
        </h1>
        <p className="text-base text-zinc-600 max-w-2xl mx-auto">
          Tactical guides on multi-channel scheduling, creator psychology, algorithm updates, and building a sustainable audience.
        </p>
      </section>

      {/* Posts List */}
      <section className="px-6 max-w-5xl mx-auto pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {BLOG_POSTS.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="p-6 rounded-3xl border border-zinc-200 bg-white shadow-xs hover:border-zinc-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span className="font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded-md">
                    {post.category}
                  </span>
                  <span>{post.readTime}</span>
                </div>

                <h2 className="font-bold text-base text-zinc-900 group-hover:text-blue-600 transition-colors leading-snug">
                  {post.title}
                </h2>

                <p className="text-xs text-zinc-600 line-clamp-3 leading-relaxed">
                  {post.excerpt}
                </p>
              </div>

              <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-xs">
                <span className="font-medium text-zinc-500">{post.date}</span>
                <span className="font-bold text-blue-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                  Read article →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
