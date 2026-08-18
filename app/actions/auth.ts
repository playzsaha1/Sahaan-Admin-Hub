"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { authenticateUser, registerUser } from "@/lib/data/repository";
import { sessionCookieName } from "@/lib/auth/session";
import { signupSchema } from "@/lib/validation";

const thirtyDaysMs = 60 * 60 * 24 * 30 * 1000;

export async function setSessionCookie(userId: string) {
  cookies().set(sessionCookieName, userId, {
    maxAge: thirtyDaysMs / 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/"
  });
}

export async function loginWithCredentials(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const email = formData.get("email")?.toString() ?? "";
  const password = formData.get("password")?.toString() ?? "";

  if (!email || !password) {
    return { success: false, error: "Please provide both email and password." };
  }

  try {
    const user = await authenticateUser(email, password);
    await setSessionCookie(user.id);
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Invalid email or password." };
  }
}

export async function signupWithCredentials(formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    const rawInput = {
      fullName: formData.get("fullName")?.toString() ?? "",
      email: formData.get("email")?.toString() ?? "",
      password: formData.get("password")?.toString() ?? "",
      jobSkill: formData.get("jobSkill")?.toString() ?? ""
    };

    const parsed = signupSchema.parse(rawInput);
    const user = await registerUser(parsed);
    await setSessionCookie(user.id);
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unable to register account." };
  }
}

export async function quickDemoLogin(email: string) {
  try {
    const user = await authenticateUser(email, "password123456");
    await setSessionCookie(user.id);
  } catch {
    // ignore
  }
  redirect("/dashboard");
}

export async function logout() {
  cookies().delete(sessionCookieName);
  redirect("/login");
}
