import Link from "next/link";
import { Zap, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-warm-white flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-violet-700 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-semibold text-charcoal text-lg">Postinger</span>
        </div>
        <p className="text-6xl font-semibold text-gray-200 mb-2">404</p>
        <h1 className="text-xl font-semibold text-charcoal mb-2">Page not found</h1>
        <p className="text-sm text-gray-500 mb-7">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-violet-700 hover:text-violet-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
