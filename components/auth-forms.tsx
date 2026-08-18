"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { loginWithCredentials, signupWithCredentials, quickDemoLogin } from "@/app/actions/auth";
import { Shield, Briefcase, UserCheck } from "lucide-react";

export function LoginForm({ returnTo = "/dashboard" }: { returnTo?: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await loginWithCredentials(formData);
      if (res.success) {
        router.push(returnTo);
        router.refresh();
      } else {
        setError(res.error || "Unable to log in.");
      }
    });
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-4">
        <div>
          <label className="block text-xs font-semibold text-ink/70 mb-1.5">Email Address</label>
          <input
            className="h-11 w-full rounded-md border border-line bg-white px-3 text-sm outline-none ring-pine/20 transition focus:border-pine focus:ring-4"
            name="email"
            type="email"
            placeholder="e.g. admin@sahaan.example"
            defaultValue="admin@sahaan.example"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-ink/70 mb-1.5">Password</label>
          <input
            className="h-11 w-full rounded-md border border-line bg-white px-3 text-sm outline-none ring-pine/20 transition focus:border-pine focus:ring-4"
            name="password"
            type="password"
            placeholder="Password"
            defaultValue="password123456"
            required
          />
        </div>
        {error ? <p className="rounded-md bg-coral/10 p-3 text-sm text-coral font-medium">{error}</p> : null}
        <button
          type="submit"
          disabled={pending}
          className="h-11 rounded-md bg-pine px-4 font-semibold text-white transition hover:bg-pine-dark disabled:opacity-60"
        >
          {pending ? "Logging in..." : "Log In"}
        </button>
      </form>

      <div className="border-t border-line pt-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-ink/50 text-center mb-3">
          Instant One-Click Demo Logins
        </p>
        <div className="grid gap-2">
          <button
            type="button"
            onClick={() => {
              startTransition(async () => {
                await quickDemoLogin("admin@sahaan.example");
              });
            }}
            disabled={pending}
            className="flex items-center justify-between rounded-md border border-line bg-mist/60 px-3 py-2.5 text-xs font-medium text-ink hover:border-pine hover:bg-white transition"
          >
            <span className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-brass" />
              <span className="font-semibold">Platform Admin</span>
            </span>
            <span className="text-ink/60">admin@sahaan.example</span>
          </button>

          <button
            type="button"
            onClick={() => {
              startTransition(async () => {
                await quickDemoLogin("owner@sahaan.example");
              });
            }}
            disabled={pending}
            className="flex items-center justify-between rounded-md border border-line bg-mist/60 px-3 py-2.5 text-xs font-medium text-ink hover:border-pine hover:bg-white transition"
          >
            <span className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-pine" />
              <span className="font-semibold">Company Owner (Sarah)</span>
            </span>
            <span className="text-ink/60">owner@sahaan.example</span>
          </button>

          <button
            type="button"
            onClick={() => {
              startTransition(async () => {
                await quickDemoLogin("worker@sahaan.example");
              });
            }}
            disabled={pending}
            className="flex items-center justify-between rounded-md border border-line bg-mist/60 px-3 py-2.5 text-xs font-medium text-ink hover:border-pine hover:bg-white transition"
          >
            <span className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-pine-dark" />
              <span className="font-semibold">Assigned Worker (Alex)</span>
            </span>
            <span className="text-ink/60">worker@sahaan.example</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export function SignupForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await signupWithCredentials(formData);
      if (res.success) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setError(res.error || "Unable to create account.");
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div>
        <label className="block text-xs font-semibold text-ink/70 mb-1.5">Full Name</label>
        <input
          className="h-11 w-full rounded-md border border-line bg-white px-3 text-sm outline-none ring-pine/20 transition focus:border-pine focus:ring-4"
          name="fullName"
          placeholder="e.g. Marcus Vance"
          required
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-ink/70 mb-1.5">Trade / Job Skill</label>
        <input
          className="h-11 w-full rounded-md border border-line bg-white px-3 text-sm outline-none ring-pine/20 transition focus:border-pine focus:ring-4"
          name="jobSkill"
          placeholder="e.g. Commercial HVAC Technician"
          required
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-ink/70 mb-1.5">Email</label>
        <input
          className="h-11 w-full rounded-md border border-line bg-white px-3 text-sm outline-none ring-pine/20 transition focus:border-pine focus:ring-4"
          name="email"
          type="email"
          placeholder="you@company.com"
          required
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-ink/70 mb-1.5">Password</label>
        <input
          className="h-11 w-full rounded-md border border-line bg-white px-3 text-sm outline-none ring-pine/20 transition focus:border-pine focus:ring-4"
          name="password"
          type="password"
          placeholder="At least 6 characters"
          required
          minLength={6}
        />
      </div>
      {error ? <p className="rounded-md bg-coral/10 p-3 text-sm text-coral font-medium">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="h-11 rounded-md bg-pine px-4 font-semibold text-white transition hover:bg-pine-dark disabled:opacity-60"
      >
        {pending ? "Creating Account..." : "Create Account"}
      </button>
    </form>
  );
}
