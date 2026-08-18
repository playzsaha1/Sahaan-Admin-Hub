"use server";

import { revalidatePath } from "next/cache";
import { requireVerifiedSession } from "@/lib/auth/session";
import { createClient, createCompanyAsPlatformAdmin, createInvitation, createJob, respondToInvitation } from "@/lib/data/repository";
import { assertPlatformAdmin } from "@/lib/permissions";

function formValue(formData: FormData, key: string) {
  return formData.get(key)?.toString() ?? "";
}

export async function adminCreateCompany(formData: FormData) {
  const { user } = await requireVerifiedSession("/admin/companies");
  if (!user) throw new Error("User profile is required.");
  assertPlatformAdmin(user.platformRole);

  await createCompanyAsPlatformAdmin(user, {
    businessName: formValue(formData, "businessName"),
    abn: formValue(formData, "abn"),
    businessCategory: formValue(formData, "businessCategory"),
    businessEmail: formValue(formData, "businessEmail"),
    businessPhone: formValue(formData, "businessPhone"),
    website: formValue(formData, "website"),
    serviceArea: formValue(formData, "serviceArea"),
    ownerUserId: formValue(formData, "ownerUserId"),
    verificationNotes: formValue(formData, "verificationNotes"),
    verificationStatus: formValue(formData, "verificationStatus") || "Unreviewed",
    status: formValue(formData, "status") || "Pending"
  });
  revalidatePath("/admin/companies");
}

export async function inviteWorker(formData: FormData) {
  const { user } = await requireVerifiedSession(`/company/${formValue(formData, "companyId")}/invitations`);
  if (!user) throw new Error("User profile is required.");
  await createInvitation(user, {
    companyId: formValue(formData, "companyId"),
    invitedUserId: formValue(formData, "invitedUserId"),
    proposedRole: formValue(formData, "proposedRole")
  });
  revalidatePath(`/company/${formValue(formData, "companyId")}/invitations`);
}

export async function answerInvitation(formData: FormData) {
  const { user } = await requireVerifiedSession("/invitations");
  if (!user) throw new Error("User profile is required.");
  const response = formValue(formData, "response");
  if (response !== "Accepted" && response !== "Declined") throw new Error("Invalid invitation response.");
  await respondToInvitation(user, formValue(formData, "invitationId"), response);
  revalidatePath("/invitations");
  revalidatePath("/companies");
}

export async function addClient(formData: FormData) {
  const companyId = formValue(formData, "companyId");
  const { user } = await requireVerifiedSession(`/company/${companyId}/clients`);
  if (!user) throw new Error("User profile is required.");
  await createClient(user, {
    companyId,
    name: formValue(formData, "name"),
    email: formValue(formData, "email"),
    phone: formValue(formData, "phone"),
    serviceAddress: formValue(formData, "serviceAddress"),
    notes: formValue(formData, "notes")
  });
  revalidatePath(`/company/${companyId}/clients`);
}

export async function addJob(formData: FormData) {
  const companyId = formValue(formData, "companyId");
  const { user } = await requireVerifiedSession(`/company/${companyId}/jobs`);
  if (!user) throw new Error("User profile is required.");
  await createJob(user, {
    companyId,
    clientId: formValue(formData, "clientId"),
    title: formValue(formData, "title"),
    jobType: formValue(formData, "jobType"),
    description: formValue(formData, "description"),
    address: formValue(formData, "address"),
    date: formValue(formData, "date"),
    startTime: formValue(formData, "startTime"),
    endTime: formValue(formData, "endTime"),
    assignedWorkerUserId: formValue(formData, "assignedWorkerUserId"),
    internalNotes: formValue(formData, "internalNotes"),
    status: formValue(formData, "status") || "New"
  });
  revalidatePath(`/company/${companyId}/jobs`);
  revalidatePath(`/company/${companyId}/schedule`);
}
