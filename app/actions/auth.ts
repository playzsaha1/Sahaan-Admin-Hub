"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminAuth } from "@/lib/firebase/admin";
import { createUserProfile } from "@/lib/data/repository";
import { sessionCookieName } from "@/lib/auth/session";
import { signupSchema } from "@/lib/validation";

const fiveDaysMs = 60 * 60 * 24 * 5 * 1000;

export async function createSession(idToken: string) {
  const sessionCookie = await adminAuth().createSessionCookie(idToken, { expiresIn: fiveDaysMs });
  cookies().set(sessionCookieName, sessionCookie, {
    maxAge: fiveDaysMs / 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/"
  });
}

export async function completeSignup(input: unknown, idToken: string) {
  const parsed = signupSchema.parse(input);
  const decoded = await adminAuth().verifyIdToken(idToken, true);
  if (decoded.email !== parsed.email) throw new Error("Authenticated email did not match signup email.");

  await createUserProfile({
    id: decoded.uid,
    email: parsed.email,
    emailVerified: Boolean(decoded.email_verified),
    fullName: parsed.fullName,
    jobSkill: parsed.jobSkill
  });

  await createSession(idToken);
}

export async function logout() {
  cookies().delete(sessionCookieName);
  redirect("/login");
}
