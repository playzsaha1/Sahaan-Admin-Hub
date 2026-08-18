import { PageHeader } from "@/components/app-shell";
import { Card, EmptyState } from "@/components/ui";
import { requireVerifiedSession } from "@/lib/auth/session";
import { listCompaniesForUser, listInvitationsForUser } from "@/lib/data/repository";

export default async function DashboardPage() {
  const session = await requireVerifiedSession("/dashboard");
  const companies = await listCompaniesForUser(session.uid);
  const invitations = await listInvitationsForUser(session.uid);

  return (
    <>
      <PageHeader title="Home" description="Your individual Sahaan Admin Hub workspace." />
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm text-ink/60">Companies</p>
          <p className="mt-2 text-3xl font-semibold">{companies.length}</p>
        </Card>
        <Card>
          <p className="text-sm text-ink/60">Pending invitations</p>
          <p className="mt-2 text-3xl font-semibold">{invitations.length}</p>
        </Card>
        <Card>
          <p className="text-sm text-ink/60">Email verification</p>
          <p className="mt-2 text-sm font-semibold text-pine">Verified</p>
        </Card>
      </div>
      {!companies.length ? (
        <div className="mt-6">
          <EmptyState title="You do not belong to a company yet." body="A company owner can invite you after your account exists and your email is verified." />
        </div>
      ) : null}
    </>
  );
}
