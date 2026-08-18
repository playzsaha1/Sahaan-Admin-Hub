import "server-only";

import { assertCompanyAccessible, assertPlatformAdmin, can, nextWorkerStatus } from "@/lib/permissions";
import type {
  AppUser,
  AuditLog,
  Client,
  Company,
  CompanyInvitation,
  CompanyMember,
  Job,
  JobStatus,
  ModerationRecord
} from "@/lib/types";
import { clientSchema, companySchema, inviteSchema, jobSchema } from "@/lib/validation";

type StoredUser = AppUser & { passwordHash: string };

function now() {
  return new Date().toISOString();
}

function generateId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

// Global in-memory storage for database-free operation
const globalStore = globalThis as unknown as {
  __sahaan_db__?: {
    users: StoredUser[];
    companies: Company[];
    companyMembers: CompanyMember[];
    companyInvitations: CompanyInvitation[];
    clients: Client[];
    jobs: Job[];
    auditLogs: AuditLog[];
    moderationRecords: ModerationRecord[];
  };
};

if (!globalStore.__sahaan_db__) {
  const t = now();
  const today = t.slice(0, 10);

  const defaultUsers: StoredUser[] = [
    {
      id: "usr_admin",
      email: "admin@sahaan.example",
      passwordHash: "password123456",
      emailVerified: true,
      fullName: "Sahaan Administrator",
      jobSkill: "Platform Operations & Governance",
      platformRole: "platformAdmin",
      status: "Active",
      createdAt: t,
      updatedAt: t
    },
    {
      id: "usr_owner_sarah",
      email: "owner@sahaan.example",
      passwordHash: "password123456",
      emailVerified: true,
      fullName: "Sarah Jenkins",
      jobSkill: "Master Electrician & Contractor",
      platformRole: "user",
      status: "Active",
      createdAt: t,
      updatedAt: t
    },
    {
      id: "usr_worker_alex",
      email: "worker@sahaan.example",
      passwordHash: "password123456",
      emailVerified: true,
      fullName: "Alex Miller",
      jobSkill: "Field Technician",
      platformRole: "user",
      status: "Active",
      createdAt: t,
      updatedAt: t
    },
    {
      id: "usr_worker_david",
      email: "david@sahaan.example",
      passwordHash: "password123456",
      emailVerified: true,
      fullName: "David Chen",
      jobSkill: "Commercial HVAC Specialist",
      platformRole: "user",
      status: "Active",
      createdAt: t,
      updatedAt: t
    }
  ];

  const defaultCompany: Company = {
    id: "cmp_apex_services",
    businessName: "Apex Trade & Electrical Hub",
    abn: "45 123 456 789",
    businessCategory: "Electrical & Facilities Maintenance",
    businessEmail: "dispatch@apextrade.example",
    businessPhone: "+1 (555) 019-2834",
    website: "https://apextrade.example",
    serviceArea: "Metro & Greater Metropolitan Area",
    ownerUserId: "usr_owner_sarah",
    verificationNotes: "Business license, insurance certificate, and trade accreditation verified by admin.",
    verificationStatus: "Business details verified",
    status: "Active",
    createdAt: t,
    updatedAt: t
  };

  const defaultMembers: CompanyMember[] = [
    {
      id: "mem_sarah",
      companyId: "cmp_apex_services",
      userId: "usr_owner_sarah",
      role: "Owner",
      status: "Active",
      createdAt: t,
      updatedAt: t
    },
    {
      id: "mem_alex",
      companyId: "cmp_apex_services",
      userId: "usr_worker_alex",
      role: "Worker",
      status: "Active",
      createdAt: t,
      updatedAt: t
    }
  ];

  const defaultClients: Client[] = [
    {
      id: "clt_highland",
      companyId: "cmp_apex_services",
      name: "Highland Residences Management",
      email: "facilities@highlandapts.example",
      phone: "+1 (555) 349-1120",
      serviceAddress: "742 Evergreen Terrace, Suite 100",
      notes: "Gate code: #4920. Security desk on arrival.",
      createdAt: t,
      updatedAt: t
    },
    {
      id: "clt_metro_retail",
      companyId: "cmp_apex_services",
      name: "Metro Central Shopping Hub",
      email: "ops@metrocentral.example",
      phone: "+1 (555) 883-9912",
      serviceAddress: "1200 Market Street, Loading Bay 4",
      notes: "Work permit required before after-hours roof access.",
      createdAt: t,
      updatedAt: t
    }
  ];

  const defaultJobs: Job[] = [
    {
      id: "job_switchboard_01",
      companyId: "cmp_apex_services",
      clientId: "clt_highland",
      title: "Main Switchboard Inspection & Breaker Replacement",
      jobType: "Commercial Electrical",
      description: "Perform thermal imaging on circuit panel and replace faulty 40A dual-pole breaker in mechanical room B.",
      address: "742 Evergreen Terrace, Suite 100",
      date: today,
      startTime: "09:00",
      endTime: "11:30",
      assignedWorkerUserId: "usr_worker_alex",
      internalNotes: "Customer requested priority completion before tenant operating hours.",
      status: "In Progress",
      createdAt: t,
      updatedAt: t
    },
    {
      id: "job_lighting_02",
      companyId: "cmp_apex_services",
      clientId: "clt_metro_retail",
      title: "Emergency Exit Lighting Compliance Test",
      jobType: "Safety & Compliance",
      description: "90-minute battery discharge testing across 24 fixtures and sign-off compliance certificate.",
      address: "1200 Market Street",
      date: today,
      startTime: "13:00",
      endTime: "15:30",
      assignedWorkerUserId: "usr_worker_alex",
      internalNotes: "Ladder kit needed for atrium section.",
      status: "Scheduled",
      createdAt: t,
      updatedAt: t
    }
  ];

  globalStore.__sahaan_db__ = {
    users: defaultUsers,
    companies: [defaultCompany],
    companyMembers: defaultMembers,
    companyInvitations: [
      {
        id: "inv_david",
        companyId: "cmp_apex_services",
        companyName: "Apex Trade & Electrical Hub",
        invitedUserId: "usr_worker_david",
        inviterUserId: "usr_owner_sarah",
        proposedRole: "Worker",
        status: "Pending",
        createdAt: t
      }
    ],
    clients: defaultClients,
    jobs: defaultJobs,
    auditLogs: [
      {
        id: "aud_01",
        actorUserId: "usr_admin",
        action: "company.created",
        companyId: "cmp_apex_services",
        targetId: "cmp_apex_services",
        timestamp: t
      }
    ],
    moderationRecords: []
  };
}

const db = globalStore.__sahaan_db__;

function clean<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined && v !== "")) as T;
}

export async function getUserById(userId: string): Promise<AppUser | null> {
  const user = db.users.find((u) => u.id === userId);
  if (!user) return null;
  const { passwordHash: _, ...publicUser } = user;
  return publicUser;
}

export async function getUserByEmail(email: string): Promise<(AppUser & { passwordHash: string }) | null> {
  const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  return user ?? null;
}

export async function authenticateUser(email: string, password: string): Promise<AppUser> {
  const normalizedEmail = email.trim().toLowerCase();
  const user = db.users.find((u) => u.email.toLowerCase() === normalizedEmail);
  
  if (!user) {
    throw new Error("No account found with this email address.");
  }
  
  if (user.passwordHash !== password) {
    throw new Error("Incorrect password.");
  }
  
  if (user.status !== "Active") {
    throw new Error("This account is currently suspended.");
  }
  
  const { passwordHash: _, ...publicUser } = user;
  return publicUser;
}

export async function registerUser(input: {
  fullName: string;
  email: string;
  password: string;
  jobSkill: string;
}): Promise<AppUser> {
  const normalizedEmail = input.email.trim().toLowerCase();
  const existing = db.users.find((u) => u.email.toLowerCase() === normalizedEmail);
  
  if (existing) {
    throw new Error("An account with this email address already exists.");
  }
  
  const timestamp = now();
  const newUser: StoredUser = {
    id: generateId("usr"),
    email: normalizedEmail,
    passwordHash: input.password,
    emailVerified: true, // Self-contained instant verification
    fullName: input.fullName.trim(),
    jobSkill: input.jobSkill.trim(),
    platformRole: normalizedEmail.includes("admin") ? "platformAdmin" : "user",
    status: "Active",
    createdAt: timestamp,
    updatedAt: timestamp
  };
  
  db.users.push(newUser);
  const { passwordHash: _, ...publicUser } = newUser;
  return publicUser;
}

export async function createUserProfile(input: Pick<AppUser, "id" | "email" | "emailVerified" | "fullName" | "jobSkill">) {
  const timestamp = now();
  const existing = db.users.find((u) => u.id === input.id);
  if (existing) {
    existing.fullName = input.fullName;
    existing.jobSkill = input.jobSkill;
    existing.updatedAt = timestamp;
    return;
  }
  db.users.push({
    ...input,
    passwordHash: "password123456",
    platformRole: input.email.toLowerCase().includes("admin") ? "platformAdmin" : "user",
    status: "Active",
    createdAt: timestamp,
    updatedAt: timestamp
  });
}

export async function updateUserProfile(userId: string, input: Pick<AppUser, "fullName" | "jobSkill">) {
  const user = db.users.find((u) => u.id === userId);
  if (!user) throw new Error("User not found.");
  user.fullName = input.fullName;
  user.jobSkill = input.jobSkill;
  user.updatedAt = now();
}

export async function listUsers(): Promise<AppUser[]> {
  return db.users.map(({ passwordHash: _, ...user }) => user);
}

export async function searchUsers(query = "", skill = ""): Promise<AppUser[]> {
  const users = await listUsers();
  const normalizedQuery = query.trim().toLowerCase();
  const normalizedSkill = skill.trim().toLowerCase();
  return users.filter((user) => {
    const matchesQuery =
      !normalizedQuery ||
      user.fullName.toLowerCase().includes(normalizedQuery) ||
      user.jobSkill.toLowerCase().includes(normalizedQuery);
    const matchesSkill = !normalizedSkill || user.jobSkill.toLowerCase() === normalizedSkill;
    return user.status === "Active" && user.emailVerified && matchesQuery && matchesSkill;
  });
}

export async function listSkillFilters(): Promise<string[]> {
  const users = await listUsers();
  return Array.from(new Set(users.map((user) => user.jobSkill).filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

export async function getCompany(companyId: string): Promise<Company | null> {
  const company = db.companies.find((c) => c.id === companyId);
  return company ?? null;
}

export async function listCompaniesForUser(userId: string): Promise<Company[]> {
  const userMemberships = db.companyMembers.filter((m) => m.userId === userId && m.status === "Active");
  const companyIds = userMemberships.map((m) => m.companyId);
  return db.companies.filter((c) => companyIds.includes(c.id));
}

export async function listAllCompanies(): Promise<Company[]> {
  return [...db.companies].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getMembership(companyId: string, userId: string): Promise<CompanyMember | null> {
  const member = db.companyMembers.find((m) => m.companyId === companyId && m.userId === userId && m.status === "Active");
  return member ?? null;
}

export async function createCompanyAsPlatformAdmin(actor: AppUser, input: unknown) {
  assertPlatformAdmin(actor.platformRole);
  const parsed = companySchema.parse(input);

  const owner = await getUserById(parsed.ownerUserId);
  if (!owner || !owner.emailVerified) throw new Error("Owner account must exist and have verified email.");

  const timestamp = now();
  const companyId = generateId("cmp");
  
  const newCompany: Company = clean({
    id: companyId,
    businessName: parsed.businessName,
    abn: parsed.abn,
    businessCategory: parsed.businessCategory,
    businessEmail: parsed.businessEmail,
    businessPhone: parsed.businessPhone,
    website: parsed.website,
    serviceArea: parsed.serviceArea,
    ownerUserId: parsed.ownerUserId,
    verificationNotes: parsed.verificationNotes,
    verificationStatus: parsed.verificationStatus,
    status: parsed.status,
    createdAt: timestamp,
    updatedAt: timestamp
  });

  const newMember: CompanyMember = {
    id: generateId("mem"),
    companyId,
    userId: parsed.ownerUserId,
    role: "Owner",
    status: "Active",
    createdAt: timestamp,
    updatedAt: timestamp
  };

  db.companies.unshift(newCompany);
  db.companyMembers.push(newMember);

  await writeAudit(actor.id, "company.created", companyId, companyId);
}

export async function listCompanyMembers(companyId: string, viewerId: string): Promise<Array<CompanyMember & { user?: AppUser | null }>> {
  const company = await getCompany(companyId);
  const viewerMember = await getMembership(companyId, viewerId);
  assertCompanyAccessible(company, viewerMember, "members:view");

  const members = db.companyMembers.filter((m) => m.companyId === companyId && m.status === "Active");
  return members.map((m) => ({
    ...m,
    user: db.users.find((u) => u.id === m.userId) ?? null
  }));
}

export async function createInvitation(actor: AppUser, input: unknown) {
  const parsed = inviteSchema.parse(input);
  const company = await getCompany(parsed.companyId);
  const actorMember = await getMembership(parsed.companyId, actor.id);
  assertCompanyAccessible(company, actorMember, "members:manage");
  if (!company) throw new Error("Company not found.");

  const invitedUser = await getUserById(parsed.invitedUserId);
  if (!invitedUser || !invitedUser.emailVerified) throw new Error("Invited user must have a verified account.");

  const existing = db.companyInvitations.find(
    (inv) => inv.companyId === parsed.companyId && inv.invitedUserId === parsed.invitedUserId && inv.status === "Pending"
  );
  if (existing) throw new Error("This user already has a pending invitation.");

  const timestamp = now();
  const invitationId = generateId("inv");
  const newInvitation: CompanyInvitation = {
    id: invitationId,
    companyId: parsed.companyId,
    companyName: company.businessName,
    invitedUserId: parsed.invitedUserId,
    inviterUserId: actor.id,
    proposedRole: parsed.proposedRole,
    status: "Pending",
    createdAt: timestamp
  };

  db.companyInvitations.push(newInvitation);
  await writeAudit(actor.id, "member.invited", parsed.companyId, invitationId);
}

export async function listInvitationsForUser(userId: string): Promise<CompanyInvitation[]> {
  return db.companyInvitations
    .filter((inv) => inv.invitedUserId === userId && inv.status === "Pending")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function respondToInvitation(actor: AppUser, invitationId: string, response: "Accepted" | "Declined") {
  const invitation = db.companyInvitations.find((inv) => inv.id === invitationId);
  if (!invitation) throw new Error("Invitation not found.");
  if (invitation.invitedUserId !== actor.id) throw new Error("This invitation belongs to another user.");
  if (invitation.status !== "Pending") throw new Error("This invitation is no longer pending.");

  const timestamp = now();
  invitation.status = response;

  if (response === "Accepted") {
    db.companyMembers.push({
      id: generateId("mem"),
      companyId: invitation.companyId,
      userId: actor.id,
      role: invitation.proposedRole,
      status: "Active",
      createdAt: timestamp,
      updatedAt: timestamp
    });
    await writeAudit(actor.id, "invitation.accepted", invitation.companyId, invitation.id);
  } else {
    await writeAudit(actor.id, "invitation.declined", invitation.companyId, invitation.id);
  }
}

export async function listClients(companyId: string, viewerId: string): Promise<Client[]> {
  const company = await getCompany(companyId);
  const member = await getMembership(companyId, viewerId);
  assertCompanyAccessible(company, member, "clients:view");
  return db.clients.filter((c) => c.companyId === companyId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function createClient(actor: AppUser, input: unknown) {
  const parsed = clientSchema.parse(input);
  const company = await getCompany(parsed.companyId);
  const member = await getMembership(parsed.companyId, actor.id);
  assertCompanyAccessible(company, member, "clients:manage");
  
  const timestamp = now();
  const clientId = generateId("clt");
  const newClient: Client = clean({
    id: clientId,
    ...parsed,
    createdAt: timestamp,
    updatedAt: timestamp
  });

  db.clients.unshift(newClient);
  await writeAudit(actor.id, "client.created", parsed.companyId, clientId);
}

export async function listJobs(companyId: string, viewerId: string): Promise<Job[]> {
  const company = await getCompany(companyId);
  const member = await getMembership(companyId, viewerId);
  assertCompanyAccessible(company, member, "jobs:view");

  let jobs = db.jobs.filter((j) => j.companyId === companyId);
  if (member?.role === "Worker") {
    jobs = jobs.filter((j) => j.assignedWorkerUserId === viewerId);
  }
  return jobs.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function createJob(actor: AppUser, input: unknown) {
  const parsed = jobSchema.parse(input);
  const company = await getCompany(parsed.companyId);
  const member = await getMembership(parsed.companyId, actor.id);
  assertCompanyAccessible(company, member, "jobs:manage");
  
  const timestamp = now();
  const jobId = generateId("job");
  const newJob: Job = clean({
    id: jobId,
    ...parsed,
    createdAt: timestamp,
    updatedAt: timestamp
  });

  db.jobs.unshift(newJob);
  await writeAudit(actor.id, "job.created", parsed.companyId, jobId);
}

export async function workerUpdateJobStatus(actor: AppUser, companyId: string, jobId: string, requestedStatus: JobStatus) {
  const company = await getCompany(companyId);
  const member = await getMembership(companyId, actor.id);
  assertCompanyAccessible(company, member, "jobs:view");
  
  const job = db.jobs.find((j) => j.id === jobId);
  if (!job) throw new Error("Job not found.");
  if (job.companyId !== companyId) throw new Error("Job does not belong to this company.");
  if (member?.role === "Worker" && job.assignedWorkerUserId !== actor.id) throw new Error("This job is not assigned to you.");
  if (member?.role === "Worker" && !nextWorkerStatus(job.status, requestedStatus)) throw new Error("That job status transition is not allowed.");
  if (!can(member, "jobs:manage") && member?.role !== "Worker") throw new Error("You do not have permission to update this job.");
  
  job.status = requestedStatus;
  job.updatedAt = now();
  await writeAudit(actor.id, "job.status_updated", companyId, jobId);
}

export async function listCompanyAudit(companyId: string, viewerId: string): Promise<AuditLog[]> {
  const company = await getCompany(companyId);
  const member = await getMembership(companyId, viewerId);
  assertCompanyAccessible(company, member, "company:settings");
  return db.auditLogs.filter((a) => a.companyId === companyId).sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

async function writeAudit(actorUserId: string, action: string, companyId?: string, targetId?: string) {
  db.auditLogs.unshift({
    id: generateId("aud"),
    actorUserId,
    action,
    companyId,
    targetId,
    timestamp: now()
  });
}
