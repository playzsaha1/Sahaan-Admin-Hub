import Link from "next/link";
import { PageHeader } from "@/components/app-shell";
import { Card, EmptyState } from "@/components/ui";
import { requireVerifiedSession } from "@/lib/auth/session";
import { listCompaniesForUser } from "@/lib/data/repository";

export default async function CompaniesPage() {
  const session = await requireVerifiedSession("/companies");
  const companies = await listCompaniesForUser(session.uid);

  return (
    <>
      <PageHeader title="Companies" description="Businesses are created and activated only by the Sahaan Admin Hub platform administrator." />
      {companies.length ? (
        <div className="grid gap-3">
          {companies.map((company) => (
            <Card key={company.id}>
              <Link className="font-semibold text-pine" href={`/company/${company.id}`}>{company.businessName}</Link>
              <p className="mt-2 text-sm text-ink/65">{company.businessCategory}</p>
              <p className="mt-1 text-xs font-semibold uppercase text-ink/45">{company.status}</p>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="No companies yet." body="There is no self-service company creation. Approved businesses are activated by a platform administrator." />
      )}
    </>
  );
}
