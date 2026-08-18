import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getUserById } from "@/lib/data/repository";
import type { AppUser } from "@/lib/types";

export const sessionCookieName = process.env.SESSION_COOKIE_NAME || "sah_session";

export type AuthSession = {
  uid: string;
  email: string;
  emailVerified: boolean;
  user: AppUser | null;
};

export async function getSession(): Promise<AuthSession | null> {
  const userId = cookies().get(sessionCookieName)?.value;
  if (!userId) return null;

  try {
    const user = await getUserById(userId);
    if (!user) return null;
    return {
      uid: user.id,
      email: user.email,
      emailVerified: user.emailVerified,
      user
    };
  } catch {
    return null;
  }
}

export async function requireSession(returnTo = "/dashboard") {
  const session = await getSession();
  if (!session) redirect(`/login?returnTo=${encodeURIComponent(returnTo)}`);
  return session;
}

export async function requireVerifiedSession(returnTo = "/dashboard") {
  const session = await requireSession(returnTo);
  if (!session.emailVerified) redirect(`/verify-email?returnTo=${encodeURIComponent(returnTo)}`);
  return session;
}
