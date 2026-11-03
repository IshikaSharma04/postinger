"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2, ArrowRight, Mail } from "lucide-react";
import { PostlyLogo } from "@/components/brand/PostlyLogo";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"LOADING" | "SUCCESS" | "ERROR">("LOADING");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("ERROR");
      setMessage("No verification token found in URL. Please check your email link or view the local dev mailbox.");
      return;
    }

    async function verify() {
      try {
        const res = await fetch("/api/auth/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();
        if (data.success) {
          setStatus("SUCCESS");
          setMessage("Your email address has been successfully verified!");
        } else {
          setStatus("ERROR");
          setMessage(data.error || "Verification failed. The link may have expired.");
        }
      } catch (e) {
        setStatus("ERROR");
        setMessage("A network error occurred while verifying your token.");
      }
    }

    verify();
  }, [token]);

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
          <PostlyLogo size="lg" />
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-8 shadow-xs border border-zinc-200 rounded-3xl text-center">
          {status === "LOADING" && (
            <div className="py-8 space-y-4">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
              <h2 className="text-lg font-bold text-zinc-900">Verifying your email...</h2>
              <p className="text-xs text-zinc-500">Checking your secure verification token.</p>
            </div>
          )}

          {status === "SUCCESS" && (
            <div className="py-4 space-y-5">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-zinc-900">Email Verified!</h2>
                <p className="text-xs text-zinc-500 mt-2">{message}</p>
              </div>

              <div className="pt-4">
                <Link
                  href="/onboarding"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-xs"
                >
                  Continue to Onboarding Questionnaire
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}

          {status === "ERROR" && (
            <div className="py-4 space-y-5">
              <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 mx-auto flex items-center justify-center">
                <XCircle className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-zinc-900">Verification Issue</h2>
                <p className="text-xs text-zinc-500 mt-2">{message}</p>
              </div>

              <div className="pt-4 space-y-3">
                <Link
                  href="/dev/mailbox"
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  Open Local Dev Mailbox
                </Link>
                <Link
                  href="/login"
                  className="w-full inline-flex items-center justify-center py-2.5 px-4 rounded-xl font-semibold text-xs text-zinc-700 bg-zinc-100 hover:bg-zinc-200 transition-colors"
                >
                  Go to Login
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-50 flex items-center justify-center">Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
