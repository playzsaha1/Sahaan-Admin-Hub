import { z } from "zod";
import { moderationIssue } from "@/lib/moderation";

const moderated = (field: "fullName" | "jobSkill") =>
  z.string().trim().min(2).superRefine((value, ctx) => {
    const issue = moderationIssue(value, field);
    if (issue) ctx.addIssue({ code: z.ZodIssueCode.custom, message: issue });
  });

export const signupSchema = z.object({
  fullName: moderated("fullName"),
  email: z.string().trim().email(),
  password: z.string().min(12, "Use at least 12 characters."),
  jobSkill: moderated("jobSkill")
});

export const profileSchema = z.object({
  fullName: moderated("fullName"),
  jobSkill: moderated("jobSkill")
});

export const companySchema = z.object({
  businessName: z.string().trim().min(2).max(140),
  abn: z.string().trim().regex(/^\d{11}$/, "ABN must be 11 digits.").optional().or(z.literal("")),
  businessCategory: z.string().trim().min(2).max(80),
  businessEmail: z.string().trim().email(),
  businessPhone: z.string().trim().min(6).max(40),
  website: z.string().trim().url().optional().or(z.literal("")),
  serviceArea: z.string().trim().max(160).optional(),
  ownerUserId: z.string().trim().min(1),
  verificationNotes: z.string().trim().max(2000).optional(),
  verificationStatus: z.enum(["Unreviewed", "Business details verified", "Rejected"]),
  status: z.enum(["Pending", "Active", "Suspended", "Rejected"])
});

export const inviteSchema = z.object({
  companyId: z.string().min(1),
  invitedUserId: z.string().min(1),
  proposedRole: z.enum(["Admin", "Manager", "Worker"])
});

export const clientSchema = z.object({
  companyId: z.string().min(1),
  name: z.string().trim().min(2).max(140),
  email: z.string().trim().email().optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional(),
  serviceAddress: z.string().trim().max(240).optional(),
  notes: z.string().trim().max(2000).optional()
});

export const jobSchema = z.object({
  companyId: z.string().min(1),
  clientId: z.string().optional(),
  title: z.string().trim().min(2).max(140),
  jobType: z.string().trim().min(2).max(100),
  description: z.string().trim().max(2000).optional(),
  address: z.string().trim().max(240).optional(),
  date: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  assignedWorkerUserId: z.string().optional(),
  internalNotes: z.string().trim().max(2000).optional(),
  status: z.enum(["New", "Scheduled", "On The Way", "In Progress", "Completed", "Cancelled"])
});
