import { CompanyNav, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui";
import { requireVerifiedSession } from "@/lib/auth/session";
import { getCompany, listClients, listCompanyMembers, listJobs } from "@/lib/data/repository";

export default async function CompanyDashboardPage({ params }: { params: { companyId: string } }) {
  const session = await requireVerifiedSession(`/company/${params.companyId}`);
  const company = await getCompany(params.companyId);
  const [members, clients, jobs] = await Promise.all([
    listCompanyMembers(params.companyId, session.uid),
    listClients(params.companyId, session.uid).catch(() => []),
    listJobs(params.companyId, session.uid).catch(() => [])
  ]);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      <CompanyNav companyId={params.companyId} />
      <PageHeader title={company?.businessName ?? "Company"} description="Operational counts are derived from real company records only." />
      <div className="grid gap-4 md:grid-cols-4">
        <Card><p className="text-sm text-ink/60">Today's Jobs</p><p className="mt-2 text-3xl font-semibold">{jobs.filter((job) => job.date === today).length}</p></Card>
        <Card><p className="text-sm text-ink/60">Workers</p><p className="mt-2 text-3xl font-semibold">{members.length}</p></Card>
        <Card><p className="text-sm text-ink/60">Clients</p><p className="mt-2 text-3xl font-semibold">{clients.length}</p></Card>
        <Card><p className="text-sm text-ink/60">Completed Jobs</p><p className="mt-2 text-3xl font-semibold">{jobs.filter((job) => job.status === "Completed").length}</p></Card>
      </div>
    </>
  );
}
