import "server-only";

import { FieldValue } from "firebase-admin/firestore";
import { adminDb, hasAdminFirebaseConfig } from "@/lib/firebase/admin";
import { assertCompanyAccessible, assertPlatformAdmin, can, nextWorkerStatus } from "@/lib/permissions";
import type {
  AppUser,
  AuditLog,
  Client,
  Company,
  CompanyInvitation,
  CompanyMember,
  CompanyRole,
  Job,
  JobStatus
} from "@/lib/types";
import { clientSchema, companySchema, inviteSchema, jobSchema } from "@/lib/validation";

function now() {
  return new Date().toISOString();
}

function platformAdmins() {
  return new Set(
    (process.env.PLATFORM_ADMIN_EMAILS ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean)
  );
}

function configured() {
  return hasAdminFirebaseConfig();
}

function clean<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined && v !== "")) as T;
}

export async function getUserById(userId: string): Promise<AppUser | null> {
  if (!configured()) return null;
  const doc = await adminDb().collection("users").doc(userId).get();
  return doc.exists ? ({ id: doc.id, ...doc.data() } as AppUser) : null;
}

export async function createUserProfile(input: Pick<AppUser, "id" | "email" | "emailVerified" | "fullName" | "jobSkill">) {
  if (!configured()) throw new Error("Firebase is not configured.");
  const timestamp = now();
  const platformRole = platformAdmins().has(input.email.toLowerCase()) ? "platformAdmin" : "user";
  await adminDb()
    .collection("users")
    .doc(input.id)
    .set(
      {
        email: input.email,
        emailVerified: input.emailVerified,
        fullName: input.fullName,
        jobSkill: input.jobSkill,
        platformRole,
        status: "Active",
        createdAt: timestamp,
        updatedAt: timestamp
      },
      { merge: true }
    );
}

export async function updateUserProfile(userId: string, input: Pick<AppUser, "fullName" | "jobSkill">) {
  if (!configured()) throw new Error("Firebase is not configured.");
  await adminDb().collection("users").doc(userId).update({
    fullName: input.fullName,
    jobSkill: input.jobSkill,
    updatedAt: now()
  });
}

export async function listUsers(): Promise<AppUser[]> {
  if (!configured()) return [];
  const snap = await adminDb().collection("users").orderBy("createdAt", "desc").limit(100).get();
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as AppUser);
}

export async function searchUsers(query = "", skill = ""): Promise<AppUser[]> {
  if (!configured()) return [];
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
  if (!configured()) return null;
  const doc = await adminDb().collection("companies").doc(companyId).get();
  return doc.exists ? ({ id: doc.id, ...doc.data() } as Company) : null;
}

export async function listCompaniesForUser(userId: string): Promise<Company[]> {
  if (!configured()) return [];
  const memberships = await adminDb()
    .collection("companyMembers")
    .where("userId", "==", userId)
    .where("status", "==", "Active")
    .get();
  if (memberships.empty) return [];

  const companies = await Promise.all(memberships.docs.map((doc) => getCompany(doc.data().companyId)));
  return companies.filter((company): company is Company => Boolean(company));
}

export async function listAllCompanies(): Promise<Company[]> {
  if (!configured()) return [];
  const snap = await adminDb().collection("companies").orderBy("createdAt", "desc").limit(100).get();
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Company);
}

export async function getMembership(companyId: string, userId: string): Promise<CompanyMember | null> {
  if (!configured()) return null;
  const doc = await adminDb().collection("companyMembers").doc(`${companyId}_${userId}`).get();
  if (!doc.exists || doc.data()?.status !== "Active") return null;
  return { id: doc.id, ...doc.data() } as CompanyMember;
}

export async function createCompanyAsPlatformAdmin(actor: AppUser, input: unknown) {
  assertPlatformAdmin(actor.platformRole);
  const parsed = companySchema.parse(input);
  if (!configured()) throw new Error("Firebase is not configured.");

  const owner = await getUserById(parsed.ownerUserId);
  if (!owner || !owner.emailVerified) throw new Error("Owner account must exist and have verified email.");

  const db = adminDb();
  const timestamp = now();
  const companyRef = db.collection("companies").doc();
  const memberRef = db.collection("companyMembers").doc(`${companyRef.id}_${parsed.ownerUserId}`);

  await db.batch().set(companyRef, clean({
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
  })).set(memberRef, {
    companyId: companyRef.id,
    userId: parsed.ownerUserId,
    role: "Owner",
    status: "Active",
    createdAt: timestamp,
    updatedAt: timestamp
  }).commit();

  await writeAudit(actor.id, "company.created", companyRef.id, companyRef.id);
}

export async function listCompanyMembers(companyId: string, viewerId: string): Promise<Array<CompanyMember & { user?: AppUser | null }>> {
  const company = await getCompany(companyId);
  const viewerMember = await getMembership(companyId, viewerId);
  assertCompanyAccessible(company, viewerMember, "members:view");

  const snap = await adminDb().collection("companyMembers").where("companyId", "==", companyId).where("status", "==", "Active").get();
  return Promise.all(
    snap.docs.map(async (doc) => {
      const member = { id: doc.id, ...doc.data() } as CompanyMember;
      return { ...member, user: await getUserById(member.userId) };
    })
  );
}

export async function createInvitation(actor: AppUser, input: unknown) {
  const parsed = inviteSchema.parse(input);
  const company = await getCompany(parsed.companyId);
  const actorMember = await getMembership(parsed.companyId, actor.id);
  assertCompanyAccessible(company, actorMember, "members:manage");
  if (!company) throw new Error("Company not found.");

  const invitedUser = await getUserById(parsed.invitedUserId);
  if (!invitedUser || !invitedUser.emailVerified) throw new Error("Invited user must have a verified account.");

  const existing = await adminDb()
    .collection("companyInvitations")
    .where("companyId", "==", parsed.companyId)
    .where("invitedUserId", "==", parsed.invitedUserId)
    .where("status", "==", "Pending")
    .limit(1)
    .get();
  if (!existing.empty) throw new Error("This user already has a pending invitation.");

  const timestamp = now();
  const ref = adminDb().collection("companyInvitations").doc();
  await ref.set({
    companyId: parsed.companyId,
    companyName: company.businessName,
    invitedUserId: parsed.invitedUserId,
    inviterUserId: actor.id,
    proposedRole: parsed.proposedRole,
    status: "Pending",
    createdAt: timestamp
  });
  await writeAudit(actor.id, "member.invited", parsed.companyId, ref.id);
}

export async function listInvitationsForUser(userId: string): Promise<CompanyInvitation[]> {
  if (!configured()) return [];
  const snap = await adminDb()
    .collection("companyInvitations")
    .where("invitedUserId", "==", userId)
    .where("status", "==", "Pending")
    .orderBy("createdAt", "desc")
    .get();
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as CompanyInvitation);
}

export async function respondToInvitation(actor: AppUser, invitationId: string, response: "Accepted" | "Declined") {
  if (!configured()) throw new Error("Firebase is not configured.");
  const ref = adminDb().collection("companyInvitations").doc(invitationId);
  const doc = await ref.get();
  if (!doc.exists) throw new Error("Invitation not found.");
  const invitation = { id: doc.id, ...doc.data() } as CompanyInvitation;
  if (invitation.invitedUserId !== actor.id) throw new Error("This invitation belongs to another user.");
  if (invitation.status !== "Pending") throw new Error("This invitation is no longer pending.");

  const timestamp = now();
  if (response === "Accepted") {
    await adminDb().batch().update(ref, { status: "Accepted", updatedAt: timestamp }).set(adminDb().collection("companyMembers").doc(`${invitation.companyId}_${actor.id}`), {
      companyId: invitation.companyId,
      userId: actor.id,
      role: invitation.proposedRole,
      status: "Active",
      createdAt: timestamp,
      updatedAt: timestamp
    }).commit();
    await writeAudit(actor.id, "invitation.accepted", invitation.companyId, invitation.id);
  } else {
    await ref.update({ status: "Declined", updatedAt: timestamp });
    await writeAudit(actor.id, "invitation.declined", invitation.companyId, invitation.id);
  }
}

export async function listClients(companyId: string, viewerId: string): Promise<Client[]> {
  const company = await getCompany(companyId);
  const member = await getMembership(companyId, viewerId);
  assertCompanyAccessible(company, member, "clients:view");
  const snap = await adminDb().collection("clients").where("companyId", "==", companyId).orderBy("createdAt", "desc").get();
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Client);
}

export async function createClient(actor: AppUser, input: unknown) {
  const parsed = clientSchema.parse(input);
  const company = await getCompany(parsed.companyId);
  const member = await getMembership(parsed.companyId, actor.id);
  assertCompanyAccessible(company, member, "clients:manage");
  const timestamp = now();
  const ref = adminDb().collection("clients").doc();
  await ref.set(clean({ ...parsed, createdAt: timestamp, updatedAt: timestamp }));
  await writeAudit(actor.id, "client.created", parsed.companyId, ref.id);
}

export async function listJobs(companyId: string, viewerId: string): Promise<Job[]> {
  const company = await getCompany(companyId);
  const member = await getMembership(companyId, viewerId);
  assertCompanyAccessible(company, member, "jobs:view");
  let query = adminDb().collection("jobs").where("companyId", "==", companyId);
  if (member?.role === "Worker") query = query.where("assignedWorkerUserId", "==", viewerId);
  const snap = await query.orderBy("createdAt", "desc").get();
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Job);
}

export async function createJob(actor: AppUser, input: unknown) {
  const parsed = jobSchema.parse(input);
  const company = await getCompany(parsed.companyId);
  const member = await getMembership(parsed.companyId, actor.id);
  assertCompanyAccessible(company, member, "jobs:manage");
  const timestamp = now();
  const ref = adminDb().collection("jobs").doc();
  await ref.set(clean({ ...parsed, createdAt: timestamp, updatedAt: timestamp }));
  await writeAudit(actor.id, "job.created", parsed.companyId, ref.id);
}

export async function workerUpdateJobStatus(actor: AppUser, companyId: string, jobId: string, requestedStatus: JobStatus) {
  const company = await getCompany(companyId);
  const member = await getMembership(companyId, actor.id);
  assertCompanyAccessible(company, member, "jobs:view");
  const ref = adminDb().collection("jobs").doc(jobId);
  const doc = await ref.get();
  if (!doc.exists) throw new Error("Job not found.");
  const job = { id: doc.id, ...doc.data() } as Job;
  if (job.companyId !== companyId) throw new Error("Job does not belong to this company.");
  if (member?.role === "Worker" && job.assignedWorkerUserId !== actor.id) throw new Error("This job is not assigned to you.");
  if (member?.role === "Worker" && !nextWorkerStatus(job.status, requestedStatus)) throw new Error("That job status transition is not allowed.");
  if (!can(member, "jobs:manage") && member?.role !== "Worker") throw new Error("You do not have permission to update this job.");
  await ref.update({ status: requestedStatus, updatedAt: now() });
  await writeAudit(actor.id, "job.status_updated", companyId, jobId);
}

export async function listCompanyAudit(companyId: string, viewerId: string): Promise<AuditLog[]> {
  const company = await getCompany(companyId);
  const member = await getMembership(companyId, viewerId);
  assertCompanyAccessible(company, member, "company:settings");
  const snap = await adminDb().collection("auditLogs").where("companyId", "==", companyId).orderBy("timestamp", "desc").limit(100).get();
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as AuditLog);
}

async function writeAudit(actorUserId: string, action: string, companyId?: string, targetId?: string) {
  if (!configured()) return;
  await adminDb().collection("auditLogs").add({
    actorUserId,
    action,
    companyId,
    targetId,
    timestamp: FieldValue.serverTimestamp()
  });
}
