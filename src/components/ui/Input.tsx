import { cn } from "@/lib/utils/helpers";
import { forwardRef } from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, label, hint, leftIcon, rightElement, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-semibold mb-1.5"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "var(--color-text-tertiary)" }}>
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={id}
            className={cn(
              "w-full h-10 rounded-xl px-3 text-sm transition-all duration-200 outline-none",
              leftIcon && "pl-9",
              rightElement && "pr-9",
              className
            )}
            style={{
              background: "var(--color-surface-subtle)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text)",
            }}
            onFocus={e => {
              e.currentTarget.style.borderColor = "var(--color-brand-500)";
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.15)";
            }}
            onBlur={e => {
              e.currentTarget.style.borderColor = error ? "rgba(220,38,38,0.6)" : "var(--color-border)";
              e.currentTarget.style.boxShadow = "";
            }}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--color-text-tertiary)" }}>
              {rightElement}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-xs font-medium flex items-center gap-1"
            style={{ color: "rgba(220,38,38,0.9)" }}>
            {error}
          </p>
        )}
        {hint && !error && (
          <p className="mt-1.5 text-xs" style={{ color: "var(--color-text-tertiary)" }}>
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

// ── Textarea ──────────────────────────────────────────────────────────────────

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  label?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, label, hint, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-semibold mb-1.5"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          className={cn(
            "w-full rounded-xl px-3 py-2.5 text-sm resize-y transition-all duration-200 outline-none",
            className
          )}
          style={{
            background: "var(--color-surface-subtle)",
            border: "1px solid var(--color-border)",
            color: "var(--color-text)",
          }}
          onFocus={e => {
            e.currentTarget.style.borderColor = "var(--color-brand-500)";
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.15)";
          }}
          onBlur={e => {
            e.currentTarget.style.borderColor = error ? "rgba(220,38,38,0.6)" : "var(--color-border)";
            e.currentTarget.style.boxShadow = "";
          }}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-xs font-medium" style={{ color: "rgba(220,38,38,0.9)" }}>
            {error}
          </p>
        )}
        {hint && !error && (
          <p className="mt-1.5 text-xs" style={{ color: "var(--color-text-tertiary)" }}>
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
