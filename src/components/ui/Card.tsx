import { cn } from "@/lib/utils/helpers";

interface CardProps {
  className?: string;
  children: React.ReactNode;
  noPadding?: boolean;
  hover?: boolean;
}

export function Card({ className, children, noPadding = false, hover = false }: CardProps) {
  return (
    <div
      className={cn(
        "bg-surface border border-app rounded-2xl shadow-card",
        !noPadding && "p-5",
        hover && "card-hover",
        className
      )}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function CardHeader({ title, description, action, className }: CardHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between gap-4 mb-4", className)}>
      <div>
        <h3 className="text-sm font-bold text-app">{title}</h3>
        {description && (
          <p className="text-xs text-secondary mt-0.5">{description}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

// ── Page Header ────────────────────────────────────────────────────────────────

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, action, className }: PageHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between gap-4 mb-7", className)}>
      <div>
        <h1 className="text-xl font-bold text-app tracking-tight">{title}</h1>
        {description && (
          <p className="text-sm text-secondary mt-0.5">{description}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
