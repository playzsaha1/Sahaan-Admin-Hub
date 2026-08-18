"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword
} from "firebase/auth";
import { createSession, completeSignup } from "@/app/actions/auth";
import { getFirebaseAuth, hasClientFirebaseConfig } from "@/lib/firebase/client";

export function LoginForm({ returnTo = "/dashboard" }: { returnTo?: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, startTransition] = useTransition();

  async function onSubmit(formData: FormData) {
    setError("");
    if (!hasClientFirebaseConfig()) {
      setError("Firebase client environment variables are not configured yet.");
      return;
    }
    const email = formData.get("email")?.toString() ?? "";
    const password = formData.get("password")?.toString() ?? "";
    startTransition(async () => {
      try {
        const credential = await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
        const token = await credential.user.getIdToken(true);
        await createSession(token);
        router.push(returnTo);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to log in.");
      }
    });
  }

  async function resetPassword(formData: FormData) {
    setError("");
    setNotice("");
    const email = formData.get("email")?.toString() ?? "";
    if (!email) {
      setError("Enter your email before requesting a reset.");
      return;
    }
    await sendPasswordResetEmail(getFirebaseAuth(), email);
    setNotice("Password reset email sent if that account exists.");
  }

  return (
    <form action={onSubmit} className="grid gap-4">
      <input className="h-11 rounded-md border border-line px-3" name="email" type="email" placeholder="Email" required />
      <input className="h-11 rounded-md border border-line px-3" name="password" type="password" placeholder="Password" required />
      {error ? <p className="text-sm text-coral">{error}</p> : null}
      {notice ? <p className="text-sm text-pine">{notice}</p> : null}
      <button disabled={pending} className="h-11 rounded-md bg-pine px-4 font-semibold text-white disabled:opacity-60">
        {pending ? "Logging in..." : "Log In"}
      </button>
      <button formAction={resetPassword} className="text-left text-sm font-semibold text-pine" type="submit">
        Forgot password?
      </button>
    </form>
  );
}

export function SignupForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  async function onSubmit(formData: FormData) {
    setError("");
    if (!hasClientFirebaseConfig()) {
      setError("Firebase client environment variables are not configured yet.");
      return;
    }
    const input = {
      fullName: formData.get("fullName")?.toString() ?? "",
      email: formData.get("email")?.toString() ?? "",
      password: formData.get("password")?.toString() ?? "",
      jobSkill: formData.get("jobSkill")?.toString() ?? ""
    };
    startTransition(async () => {
      try {
        const credential = await createUserWithEmailAndPassword(getFirebaseAuth(), input.email, input.password);
        await sendEmailVerification(credential.user);
        const token = await credential.user.getIdToken(true);
        await completeSignup(input, token);
        router.push("/verify-email");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to create account.");
      }
    });
  }

  return (
    <form action={onSubmit} className="grid gap-4">
      <input className="h-11 rounded-md border border-line px-3" name="fullName" placeholder="Full name" required />
      <input className="h-11 rounded-md border border-line px-3" name="jobSkill" placeholder="Job / Skill" required />
      <input className="h-11 rounded-md border border-line px-3" name="email" type="email" placeholder="Email" required />
      <input className="h-11 rounded-md border border-line px-3" name="password" type="password" placeholder="Password" required minLength={12} />
      {error ? <p className="text-sm text-coral">{error}</p> : null}
      <button disabled={pending} className="h-11 rounded-md bg-pine px-4 font-semibold text-white disabled:opacity-60">
        {pending ? "Creating..." : "Create Account"}
      </button>
    </form>
  );
}
