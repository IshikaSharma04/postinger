"use client";

import { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, CheckCircle2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { PostlyLogo } from "@/components/brand/PostlyLogo";
import { registerSchema, type RegisterInput } from "@/lib/validators/schemas";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams?.get("email") ?? "";

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: initialEmail,
      name: "Creator",
    },
  });

  const passwordValue = watch("password") || "";
  const hasMinLength = passwordValue.length >= 8;
  const hasUppercase = /[A-Z]/.test(passwordValue);
  const hasNumberOrSymbol = /[0-9!@#$%^&*]/.test(passwordValue);

  async function onSubmit(data: RegisterInput) {
    setServerError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!json.success) {
        setServerError(json.error ?? "Registration failed");
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/login"), 1500);
    } catch {
      setServerError("Network error. Please try again.");
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#161616] flex items-center justify-center p-6 text-white">
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 rounded-full bg-[#98E376]/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-[#98E376]" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Account created!</h2>
          <p className="text-sm text-zinc-400">Redirecting you to sign in…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#161616] text-white flex">
      {/* ── Left Column: Form (matching Screenshot 5) ───────────────── */}
      <div className="w-full lg:w-[480px] xl:w-[520px] flex-shrink-0 p-8 sm:p-12 lg:p-14 flex flex-col justify-between">
        <div>
          {/* Logo */}
          <Link href="/" className="inline-block mb-12">
            <PostlyLogo size="md" light />
          </Link>

          {/* Heading */}
          <h1 style={{ color: "#ffffff" }} className="text-3xl font-extrabold text-white tracking-tight mb-2">
            Create a Postinger Account
          </h1>
          <p style={{ color: "#d4d4d8" }} className="text-sm text-zinc-300 mb-8">
            Already have an account?{" "}
            <Link href="/login" className="text-[#98E376] font-semibold underline hover:text-[#b4f598] transition-colors">
              Log in instead
            </Link>
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <input type="hidden" {...register("name")} />

            <div>
              <label style={{ color: "#f4f4f5" }} className="block text-xs font-semibold text-zinc-300 mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="Your email address"
                style={{ color: "#ffffff", backgroundColor: "#202022" }}
                className="w-full h-12 px-4 rounded-xl border border-zinc-700 text-white placeholder-zinc-400 text-sm focus:outline-none focus:border-[#98E376] focus:ring-1 focus:ring-[#98E376] transition-all"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-red-400 mt-1.5">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label style={{ color: "#f4f4f5" }} className="block text-xs font-semibold text-zinc-300 mb-2">
                Create Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Your password"
                  style={{ color: "#ffffff", backgroundColor: "#202022" }}
                  className="w-full h-12 px-4 pr-11 rounded-xl border border-zinc-700 text-white placeholder-zinc-400 text-sm focus:outline-none focus:border-[#98E376] focus:ring-1 focus:ring-[#98E376] transition-all"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-400 mt-1.5">{errors.password.message}</p>
              )}

              {/* Password checklist (matching Screenshot 5) */}
              <div className="mt-3 space-y-1.5 text-xs">
                <div className={`flex items-center gap-2 ${hasMinLength ? "text-[#98E376]" : "text-zinc-500"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${hasMinLength ? "bg-[#98E376]" : "bg-zinc-600"}`} />
                  <span>At least 8 characters long</span>
                </div>
                <div className={`flex items-center gap-2 ${hasUppercase ? "text-[#98E376]" : "text-zinc-500"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${hasUppercase ? "bg-[#98E376]" : "bg-zinc-600"}`} />
                  <span>Contains 1 uppercase character</span>
                </div>
                <div className={`flex items-center gap-2 ${hasNumberOrSymbol ? "text-[#98E376]" : "text-zinc-500"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${hasNumberOrSymbol ? "bg-[#98E376]" : "bg-zinc-600"}`} />
                  <span>Contains 1 number or symbol</span>
                </div>
              </div>
            </div>

            {serverError && (
              <div className="p-3 rounded-xl bg-red-950/50 border border-red-800 text-red-300 text-xs">
                {serverError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 rounded-full bg-[#98E376] hover:bg-[#85DC61] text-[#121212] font-bold text-sm transition-all active:scale-95 disabled:opacity-50 mt-4 shadow-sm"
            >
              {isSubmitting ? "Creating account…" : "Sign Up"}
            </button>
          </form>
        </div>

        {/* Footer legal links */}
        <div className="pt-8 text-xs text-zinc-500 flex items-center gap-4">
          <button type="button" onClick={() => toast.info("Coming soon!")} className="hover:text-zinc-300 underline">Terms of Service</button>
          <button type="button" onClick={() => toast.info("Coming soon!")} className="hover:text-zinc-300 underline">Privacy Policy</button>
          <button type="button" onClick={() => toast.info("Coming soon!")} className="hover:text-zinc-300 underline">Security</button>
        </div>
      </div>

      {/* ── Right Column: Insights Showcase Card (matching Screenshot 5) ── */}
      <div className="hidden lg:flex flex-1 p-8 xl:p-12 items-center justify-center">
        <div className="w-full max-w-2xl bg-[#FAFAF8] text-[#121212] rounded-[36px] p-8 sm:p-10 shadow-2xl border border-zinc-200">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#98E376]/40 text-[#25523B] text-[11px] font-extrabold uppercase tracking-wider mb-4">
            NEW
          </div>
          <h2 className="text-3xl font-extrabold text-[#121212] tracking-tight mb-2">
            Introducing Insights
          </h2>
          <p className="text-sm text-zinc-600 mb-8">
            Analytics that show you your next move
          </p>

          {/* Interactive Insights Mockup */}
          <div className="bg-white rounded-2xl p-5 border border-zinc-200/80 shadow-md space-y-4">
            {/* Top filter row */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 text-xs">
              <div className="flex items-center gap-2 font-bold text-zinc-800">
                <span className="w-5 h-5 rounded-md bg-zinc-100 flex items-center justify-center text-[10px]">㗊</span>
                <span>All Channels</span>
              </div>
              <div className="flex items-center gap-1.5 text-zinc-500 font-medium text-[11px]">
                <span className="px-2 py-0.5 rounded-full bg-[#98E376]/30 text-black font-bold">7 days</span>
                <span className="px-2 py-0.5">30 days</span>
                <span className="px-2 py-0.5">Month to date</span>
              </div>
            </div>

            {/* Weekly Takeaways Banner */}
            <div className="bg-[#F5EDFC] rounded-xl p-3 border border-purple-100 text-xs">
              <span className="text-[10px] font-extrabold text-[#7C3AED] uppercase tracking-wider block mb-1">
                WEEKLY TAKEAWAYS ⌃
              </span>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-zinc-900">Publish Your Overdue Draft</p>
                  <p className="text-[11px] text-zinc-600">You have 2 drafts waiting to be scheduled.</p>
                </div>
                <span className="text-xs font-bold text-[#7C3AED] underline">View Drafts</span>
              </div>
            </div>

            {/* Summary Stats Grid */}
            <div className="grid grid-cols-4 gap-3 text-center">
              <div className="bg-zinc-50 rounded-xl p-3 border border-zinc-100">
                <p className="text-[11px] text-zinc-500 font-medium">Posts</p>
                <p className="text-lg font-bold text-zinc-900">67</p>
                <p className="text-[10px] text-emerald-600 font-semibold">+1.7%</p>
              </div>
              <div className="bg-zinc-50 rounded-xl p-3 border border-zinc-100">
                <p className="text-[11px] text-zinc-500 font-medium">Followers</p>
                <p className="text-lg font-bold text-zinc-900">2.2k</p>
                <p className="text-[10px] text-emerald-600 font-semibold">+2.6%</p>
              </div>
              <div className="bg-zinc-50 rounded-xl p-3 border border-zinc-100">
                <p className="text-[11px] text-zinc-500 font-medium">Likes</p>
                <p className="text-lg font-bold text-zinc-900">7,295</p>
                <p className="text-[10px] text-emerald-600 font-semibold">+8.3%</p>
              </div>
              <div className="bg-zinc-50 rounded-xl p-3 border border-zinc-100">
                <p className="text-[11px] text-zinc-500 font-medium">Impressions</p>
                <p className="text-lg font-bold text-zinc-900">520k</p>
                <p className="text-[10px] text-emerald-600 font-semibold">+12%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#161616] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#98E376] border-t-transparent animate-spin" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
