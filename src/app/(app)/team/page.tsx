"use client";

import { useQuery } from "@tanstack/react-query";
import { Users, Plus, Crown, Shield, User } from "lucide-react";
import { PageHeader, Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState, Spinner } from "@/components/ui/States";
import { formatDate, cn } from "@/lib/utils/helpers";

function useWorkspace() {
  return useQuery({
    queryKey: ["workspaces"],
    queryFn: async () => {
      const res = await fetch("/api/workspaces");
      const json = await res.json();
      return (json.data ?? [])[0] ?? null;
    },
  });
}

function useMembers(workspaceId: string | undefined) {
  return useQuery({
    queryKey: ["members", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      const res = await fetch(`/api/team?workspaceId=${workspaceId}`);
      const json = await res.json();
      return json.data ?? [];
    },
    enabled: !!workspaceId,
  });
}

const ROLE_ICONS: Record<string, React.ReactNode> = {
  OWNER: <Crown className="w-3 h-3 text-amber-500" />,
  ADMIN: <Shield className="w-3 h-3 text-blue-500" />,
  MEMBER: <User className="w-3 h-3 text-gray-400" />,
};

const ROLE_BADGES: Record<string, string> = {
  OWNER: "text-amber-700 bg-amber-50 border-amber-200",
  ADMIN: "text-blue-700 bg-blue-50 border-blue-200",
  MEMBER: "text-gray-600 bg-gray-50 border-gray-200",
};

export default function TeamPage() {
  const { data: workspace } = useWorkspace();
  const { data: members = [], isLoading } = useMembers(workspace?.id);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Team"
        description={`${members.length} member${members.length !== 1 ? "s" : ""} in ${workspace?.name ?? "your workspace"}`}
        action={
          <Button size="sm">
            <Plus className="w-3.5 h-3.5" />
            Invite Member
          </Button>
        }
      />

      <Card className="mb-5">
        <h3 className="text-sm font-semibold text-charcoal mb-1">Role Permissions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
          {[
            { role: "OWNER", desc: "Full access to all settings, billing, and member management" },
            { role: "ADMIN", desc: "Manage posts, accounts, and team members. Cannot delete workspace." },
            { role: "MEMBER", desc: "Create and manage own posts. View team content." },
          ].map(({ role, desc }) => (
            <div key={role} className="border border-gray-100 rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                {ROLE_ICONS[role]}
                <span className={cn(
                  "text-xs font-semibold px-2 py-0.5 rounded border",
                  ROLE_BADGES[role]
                )}>
                  {role}
                </span>
              </div>
              <p className="text-xs text-gray-500">{desc}</p>
            </div>
          ))}
        </div>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <Spinner />
        </div>
      ) : members.length === 0 ? (
        <EmptyState
          icon={<Users className="w-6 h-6" />}
          title="No team members"
          description="Invite collaborators to your workspace."
        />
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Member</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Role</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden sm:table-cell">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {members.map((m: Record<string, unknown>) => {
                const user = m.user as Record<string, string>;
                return (
                  <tr key={m.id as string} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-semibold text-violet-700">
                            {user?.name?.[0]?.toUpperCase() ?? "?"}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-charcoal">{user?.name ?? "Unknown"}</p>
                          <p className="text-xs text-gray-400">{user?.email ?? ""}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        {ROLE_ICONS[m.role as string]}
                        <span className={cn(
                          "text-xs font-medium px-2 py-0.5 rounded border",
                          ROLE_BADGES[m.role as string]
                        )}>
                          {m.role as string}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden sm:table-cell text-xs text-gray-500">
                      {formatDate(m.joinedAt as string)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
