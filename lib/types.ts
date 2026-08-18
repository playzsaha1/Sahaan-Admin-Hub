export type PlatformRole = "user" | "platformAdmin";

export type CompanyStatus = "Pending" | "Active" | "Suspended" | "Rejected";
export type VerificationStatus = "Unreviewed" | "Business details verified" | "Rejected";
export type CompanyRole = "Owner" | "Admin" | "Manager" | "Worker";
export type MemberStatus = "Active" | "Removed";
export type InvitationStatus = "Pending" | "Accepted" | "Declined" | "Cancelled" | "Expired";
export type JobStatus = "New" | "Scheduled" | "On The Way" | "In Progress" | "Completed" | "Cancelled";

export type AppUser = {
  id: string;
  email: string;
  emailVerified: boolean;
  fullName: string;
  jobSkill: string;
  platformRole: PlatformRole;
  status: "Active" | "Suspended";
  createdAt: string;
  updatedAt: string;
};

export type Company = {
  id: string;
  businessName: string;
  abn?: string;
  businessCategory: string;
  businessEmail: string;
  businessPhone: string;
  website?: string;
  serviceArea?: string;
  ownerUserId: string;
  verificationNotes?: string;
  verificationStatus: VerificationStatus;
  status: CompanyStatus;
  createdAt: string;
  updatedAt: string;
};

export type CompanyMember = {
  id: string;
  companyId: string;
  userId: string;
  role: CompanyRole;
  status: MemberStatus;
  createdAt: string;
  updatedAt: string;
};

export type CompanyInvitation = {
  id: string;
  companyId: string;
  companyName: string;
  invitedUserId: string;
  inviterUserId: string;
  proposedRole: CompanyRole;
  status: InvitationStatus;
  createdAt: string;
  expiresAt?: string;
};

export type Client = {
  id: string;
  companyId: string;
  name: string;
  email?: string;
  phone?: string;
  serviceAddress?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type Job = {
  id: string;
  companyId: string;
  clientId?: string;
  title: string;
  jobType: string;
  description?: string;
  address?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  assignedWorkerUserId?: string;
  internalNotes?: string;
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
};

export type AuditLog = {
  id: string;
  actorUserId: string;
  action: string;
  companyId?: string;
  targetId?: string;
  timestamp: string;
};

export type ModerationRecord = {
  id: string;
  userId: string;
  field: "fullName" | "jobSkill";
  reason: string;
  valueHash: string;
  createdAt: string;
  resolvedAt?: string;
};
