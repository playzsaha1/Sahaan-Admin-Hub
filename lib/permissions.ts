import type { Company, CompanyMember, CompanyRole, JobStatus, PlatformRole } from "@/lib/types";

export type Capability =
  | "company:view"
  | "company:settings"
  | "members:view"
  | "members:manage"
  | "clients:view"
  | "clients:manage"
  | "jobs:view"
  | "jobs:manage"
  | "schedule:view"
  | "schedule:manage";

const roleCapabilities: Record<CompanyRole, Capability[]> = {
  Owner: [
    "company:view",
    "company:settings",
    "members:view",
    "members:manage",
    "clients:view",
    "clients:manage",
    "jobs:view",
    "jobs:manage",
    "schedule:view",
    "schedule:manage"
  ],
  Admin: [
    "company:view",
    "members:view",
    "members:manage",
    "clients:view",
    "clients:manage",
    "jobs:view",
    "jobs:manage",
    "schedule:view",
    "schedule:manage"
  ],
  Manager: ["company:view", "members:view", "clients:view", "jobs:view", "jobs:manage", "schedule:view", "schedule:manage"],
  Worker: ["company:view", "jobs:view", "schedule:view"]
};

export function isPlatformAdmin(platformRole: PlatformRole) {
  return platformRole === "platformAdmin";
}

export function can(member: CompanyMember | null | undefined, capability: Capability) {
  if (!member || member.status !== "Active") return false;
  return roleCapabilities[member.role].includes(capability);
}

export function assertCompanyAccessible(company: Company | null | undefined, member: CompanyMember | null | undefined, capability: Capability) {
  if (!company) throw new Error("Company not found.");
  if (company.status !== "Active") throw new Error("Company is not active.");
  if (!can(member, capability)) throw new Error("You do not have permission for this company action.");
}

export function assertPlatformAdmin(platformRole: PlatformRole) {
  if (!isPlatformAdmin(platformRole)) throw new Error("Platform administrator access is required.");
}

export function nextWorkerStatus(current: JobStatus, requested: JobStatus) {
  const transitions: Partial<Record<JobStatus, JobStatus[]>> = {
    Scheduled: ["On The Way"],
    "On The Way": ["In Progress"],
    "In Progress": ["Completed"]
  };
  return transitions[current]?.includes(requested) ?? false;
}
