import React from "react";

interface PostingerLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showWordmark?: boolean;
  light?: boolean;
}

/**
 * Original Postinger Brand Icon & Wordmark
 * Layered forward broadcast cards with precision emerald node.
 */
export function PostlyLogo({
  className = "",
  size = "md",
  showWordmark = true,
  light = false,
}: PostingerLogoProps) {
  const sizeMap = {
    sm: { icon: "w-6 h-6", text: "text-lg", gap: "gap-2" },
    md: { icon: "w-8 h-8", text: "text-2xl", gap: "gap-2.5" },
    lg: { icon: "w-10 h-10", text: "text-3xl", gap: "gap-3" },
    xl: { icon: "w-12 h-12", text: "text-4xl", gap: "gap-3.5" },
  };

  const { icon, text, gap } = sizeMap[size];

  return (
    <div className={`inline-flex items-center ${gap} ${className}`}>
      {/* Postinger Icon Mark */}
      <div className={`relative ${icon} flex-shrink-0 flex items-center justify-center`}>
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-sm transition-transform group-hover:scale-105"
        >
          {/* Base rounded badge */}
          <rect width="40" height="40" rx="10" fill={light ? "#242424" : "#121212"} />
          
          {/* Layer 1: Back publishing card */}
          <path
            d="M10 14C10 12.3431 11.3431 11 13 11H27C28.6569 11 30 12.3431 30 14V17H10V14Z"
            fill="#FFFFFF"
            fillOpacity="0.25"
          />
          {/* Layer 2: Middle scheduled card */}
          <path
            d="M8 18C8 16.3431 9.34315 15 11 15H29C30.6569 15 32 16.3431 32 18V21H8V18Z"
            fill="#FFFFFF"
            fillOpacity="0.5"
          />
          {/* Layer 3: Main active dispatch card with mint accent node */}
          <rect
            x="8"
            y="21"
            width="24"
            height="11"
            rx="4"
            fill="#FFFFFF"
          />
          {/* Precision focal broadcast dot in Postinger Electric Mint */}
          <circle cx="26" cy="26.5" r="2.5" fill="#98E376" />
          <path
            d="M13 25H20M13 28H17"
            stroke="#121212"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {showWordmark && (
        <div className="flex items-baseline tracking-tight font-extrabold select-none">
          <span className={`${text} ${light ? "text-white" : "text-[#121212]"}`}>
            Postinger
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#98E376] ml-0.5 inline-block" />
        </div>
      )}
    </div>
  );
}

// Named alias so imports for either PostlyLogo or PostingerLogo resolve cleanly
export const PostingerLogo = PostlyLogo;
export default PostlyLogo;
