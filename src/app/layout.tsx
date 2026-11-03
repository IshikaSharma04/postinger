import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/layout/Providers";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "Postinger — Social Media Management & Scheduling Platform",
    template: "%s | Postinger",
  },
  description:
    "Plan, schedule, and publish your social media content across all platforms from one clean workspace.",
  keywords: ["social media", "scheduling", "content planning", "social media management", "postinger"],
  authors: [{ name: "Postinger" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: "Postinger — Social Media Scheduling",
    description: "Plan, schedule, and publish social media content from one workspace.",
    siteName: "Postinger",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body
        className="min-h-screen antialiased"
        style={{ fontFamily: "var(--font-inter, 'Inter', system-ui, sans-serif)" }}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

