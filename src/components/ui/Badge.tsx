import { cn } from "@/lib/utils/helpers";
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-gray-100 text-gray-700 border border-gray-200/60",
        cobalt: "bg-blue-50 text-blue-700 border border-blue-200/60",
        violet: "bg-blue-50 text-blue-700 border border-blue-200/60",
        success: "bg-emerald-50 text-emerald-700 border border-emerald-200/60",
        warning: "bg-amber-50 text-amber-700 border border-amber-200/60",
        error: "bg-red-50 text-red-700 border border-red-200/60",
        info: "bg-sky-50 text-sky-700 border border-sky-200/60",
        outline: "border border-gray-200 text-gray-600",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-1 text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "sm",
    },
  }
);

interface BadgeProps extends VariantProps<typeof badgeVariants> {
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

export function Badge({ children, variant, size, className, dot }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)}>
      {dot && (
        <span
          className={cn(
            "inline-block w-1.5 h-1.5 rounded-full",
            variant === "success" && "bg-emerald-500",
            variant === "error" && "bg-red-500",
            variant === "warning" && "bg-amber-500",
            (variant === "cobalt" || variant === "violet" || variant === "info") && "bg-blue-500",
            (!variant || variant === "default") && "bg-gray-400",
          )}
        />
      )}
      {children}
    </span>
  );
}

// ── Post Status Badge ─────────────────────────────────────────────────────────

const statusConfig: Record<
  string,
  { label: string; variant: BadgeProps["variant"] }
> = {
  DRAFT: { label: "Draft", variant: "default" },
  SCHEDULED: { label: "Scheduled", variant: "cobalt" },
  PROCESSING: { label: "Processing", variant: "warning" },
  PUBLISHED: { label: "Published", variant: "success" },
  FAILED: { label: "Failed", variant: "error" },
  CANCELLED: { label: "Cancelled", variant: "default" },
};

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] ?? { label: status, variant: "default" as const };
  return (
    <Badge variant={config.variant} dot>
      {config.label}
    </Badge>
  );
}
