import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/client";
import { ShieldCheck, Users, Briefcase, FileText, Activity } from "lucide-react";

export const metadata = {
  title: "System Administration | Postinger",
  robots: { index: false, follow: false },
};

const SYSTEM_ADMIN_EMAILS = (process.env.SYSTEM_ADMIN_EMAILS ?? "admin@postinger.app,admin@postly.app")
  .split(",")
  .map((e) => e.trim().toLowerCase());

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const userEmail = session.user.email?.toLowerCase();
  const isSystemAdmin = userEmail && SYSTEM_ADMIN_EMAILS.includes(userEmail);

  // Strictly block unauthorized access at server render time
  if (!isSystemAdmin) {
    redirect("/dashboard");
  }

  const [totalUsers, totalWorkspaces, totalPosts, totalJobs] = await Promise.all([
    prisma.user.count(),
    prisma.workspace.count(),
    prisma.post.count(),
    prisma.publishingJob.count(),
  ]);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <div className="p-2.5 rounded-lg bg-red-500/10 text-red-500">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">System Administration</h1>
          <p className="text-sm text-muted-foreground">Internal infrastructure health and telemetry</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Registered Users</span>
            <Users className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold">{totalUsers}</div>
        </div>

        <div className="p-5 rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Workspaces</span>
            <Briefcase className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold">{totalWorkspaces}</div>
        </div>

        <div className="p-5 rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Created Posts</span>
            <FileText className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold">{totalPosts}</div>
        </div>

        <div className="p-5 rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Queue Jobs</span>
            <Activity className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold">{totalJobs}</div>
        </div>
      </div>
    </div>
  );
}
