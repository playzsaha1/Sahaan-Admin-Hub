import { AppShell } from "@/components/app-shell";
import { requireVerifiedSession } from "@/lib/auth/session";
import { listCompaniesForUser } from "@/lib/data/repository";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await requireVerifiedSession("/dashboard");
  const companies = await listCompaniesForUser(session.uid);
  return (
    <AppShell user={session.user} companies={companies}>
      {children}
    </AppShell>
  );
}
