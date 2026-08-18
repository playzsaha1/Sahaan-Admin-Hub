import { Card } from "@/components/ui";

export default function VerifyEmailPage() {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-semibold text-ink">Verify your email</h1>
        <p className="mt-3 text-sm leading-6 text-ink/65">
          Check your inbox for the verification link. You can log in after verification to participate in company invitations and management.
        </p>
      </Card>
    </main>
  );
}
