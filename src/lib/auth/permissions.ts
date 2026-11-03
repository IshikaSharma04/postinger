import { Role } from "@prisma/client";

export function canPublishDirectly(role: Role): boolean {
  return role === "OWNER" || role === "ADMIN" || role === "MANAGER";
}

export function canSubmitForApproval(role: Role): boolean {
  return role === "CONTRIBUTOR" || role === "MEMBER";
}

export function canApprovePost(role: Role): boolean {
  return role === "OWNER" || role === "ADMIN" || role === "MANAGER";
}

export function canManageChannels(role: Role): boolean {
  return role === "OWNER" || role === "ADMIN";
}

export function canManageTeam(role: Role): boolean {
  return role === "OWNER" || role === "ADMIN";
}

export function canCreateDraft(role: Role): boolean {
  return role !== "VIEWER";
}
