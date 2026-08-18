import Link from "next/link";
import { Card } from "@/components/ui";
import { LoginForm } from "@/components/auth-forms";

export default function LoginPage({ searchParams }: { searchParams: { returnTo?: string } }) {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-semibold text-ink">Log in</h1>
        <p className="mt-2 text-sm leading-6 text-ink/65">Use your Sahaan Admin Hub account. Passwords are handled by Firebase Authentication.</p>
        <div className="mt-6">
          <LoginForm returnTo={searchParams.returnTo || "/dashboard"} />
        </div>
        <p className="mt-5 text-sm text-ink/65">
          No account yet? <Link className="font-semibold text-pine" href="/signup">Create one</Link>
        </p>
      </Card>
    </main>
  );
}
