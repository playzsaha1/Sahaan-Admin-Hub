import Link from "next/link";
import { Card } from "@/components/ui";
import { SignupForm } from "@/components/auth-forms";

export default function SignupPage() {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <Card className="w-full max-w-lg">
        <h1 className="text-2xl font-semibold text-ink">Create your account</h1>
        <p className="mt-2 text-sm leading-6 text-ink/65">
          Individual accounts include only your full name and job or skill for V1. Email verification is required before invitations or company access.
        </p>
        <div className="mt-6">
          <SignupForm />
        </div>
        <p className="mt-5 text-sm text-ink/65">
          Already have an account? <Link className="font-semibold text-pine" href="/login">Log in</Link>
        </p>
      </Card>
    </main>
  );
}
