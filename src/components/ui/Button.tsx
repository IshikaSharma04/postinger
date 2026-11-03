import { cn } from "@/lib/utils/helpers";
import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-[#0d0d0e] text-white hover:bg-[#242428] active:scale-[0.98] shadow-xs border border-black/90",
        cobalt:
          "bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98] shadow-sm shadow-blue-500/20",
        secondary:
          "bg-white text-[#0d0d0e] border border-[#e4e4e0] hover:bg-[#f4f4f2] hover:border-[#d1d1cc] shadow-xs active:scale-[0.98]",
        ghost:
          "text-[#57575d] hover:text-[#0d0d0e] hover:bg-[#f2f2f0]",
        danger:
          "bg-red-600 text-white hover:bg-red-700 active:scale-[0.98] shadow-xs",
        outline:
          "border border-[#e4e4e0] text-[#0d0d0e] hover:bg-[#f4f4f2]",
        link:
          "text-blue-600 hover:text-blue-700 underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        sm: "h-7 px-3 text-xs rounded-lg",
        md: "h-9 px-4 text-sm rounded-xl",
        lg: "h-11 px-6 text-sm rounded-xl",
        icon: "h-9 w-9 rounded-xl",
        "icon-sm": "h-7 w-7 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-0.5 h-4 w-4 flex-shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
