"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { connectAccountSchema, type ConnectAccountInput } from "@/lib/validators/schemas";
import { cn } from "@/lib/utils/helpers";
import { PLATFORMS } from "./types";

interface ConnectAccountFormProps {
  onSubmit: (data: ConnectAccountInput) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function ConnectAccountForm({
  onSubmit,
  onCancel,
  isSubmitting,
}: ConnectAccountFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ConnectAccountInput>({
    resolver: zodResolver(connectAccountSchema),
    defaultValues: { platform: "TWITTER" },
  });

  const selectedPlatform = watch("platform");

  function handleFormSubmit(data: ConnectAccountInput) {
    onSubmit(data);
  }

  return (
    <Card className="animate-fade-in border-blue-200 shadow-md">
      <h3 className="text-sm font-bold text-charcoal mb-3">Connect Social Channel</h3>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-2">Select Platform</label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {PLATFORMS.map((p) => (
              <label key={p.value} className="cursor-pointer">
                <input
                  type="radio"
                  value={p.value}
                  className="sr-only"
                  {...register("platform")}
                />
                <div
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer",
                    selectedPlatform === p.value
                      ? "border-blue-600 bg-blue-50 text-blue-800 shadow-xs ring-1 ring-blue-500/20"
                      : "border-gray-200 text-gray-600 hover:border-gray-300 bg-white"
                  )}
                >
                  <span
                    className="w-5 h-5 rounded flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                    style={{ backgroundColor: p.color }}
                  >
                    {p.icon}
                  </span>
                  <span className="truncate">{p.label}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            id="handle"
            label="Handle / Account Username"
            placeholder="@username (e.g. acme_design)"
            error={errors.handle?.message}
            {...register("handle")}
          />
          <Input
            id="displayName"
            label="Display Name (optional)"
            placeholder="e.g. Acme Studio"
            error={errors.displayName?.message}
            {...register("displayName")}
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" loading={isSubmitting} size="sm">
            Connect Account
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              reset();
              onCancel();
            }}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}
