import Link from "next/link";
import { PageHeader } from "@/components/app-shell";
import { Card, EmptyState, StatusPill } from "@/components/ui";
import { requireVerifiedSession } from "@/lib/auth/session";
import { listCompaniesForUser } from "@/lib/data/repository";
import { ArrowRight, Building2 } from "lucide-react";

export default async function CompaniesPage() {
  const session = await requireVerifiedSession("/companies");
  const companies = await listCompaniesForUser(session.uid);

  return (
    <>
      <PageHeader title="Companies" description="Businesses are created and activated only by the Sahaan Admin Hub platform administrator." />
      {companies.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {companies.map((company) => (
            <Card key={company.id} className="flex flex-col justify-between hover:border-pine/50 transition">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-pine/10 text-pine">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <Link className="font-semibold text-lg text-ink hover:text-pine transition" href={`/company/${company.id}`}>
                      {company.businessName}
                    </Link>
                  </div>
                  <StatusPill status={company.status} />
                </div>
                <p className="mt-2 text-sm text-ink/70">{company.businessCategory}</p>
                {company.serviceArea ? (
                  <p className="mt-1 text-xs text-ink/50">📍 {company.serviceArea}</p>
                ) : null}
              </div>
              <div className="mt-4 pt-3 border-t border-line flex items-center justify-between text-xs font-semibold text-pine">
                <span>View workspace</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="No companies yet." body="There is no self-service company creation. Approved businesses are activated by a platform administrator." />
      )}
    </>
  );
}
