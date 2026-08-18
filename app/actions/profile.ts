"use server";

import { revalidatePath } from "next/cache";
import { requireVerifiedSession } from "@/lib/auth/session";
import { updateUserProfile } from "@/lib/data/repository";
import { profileSchema } from "@/lib/validation";

export async function saveProfile(formData: FormData) {
  const session = await requireVerifiedSession("/profile");
  const parsed = profileSchema.parse({
    fullName: formData.get("fullName"),
    jobSkill: formData.get("jobSkill")
  });

  await updateUserProfile(session.uid, parsed);
  revalidatePath("/profile");
  revalidatePath("/dashboard");
}
