import { CompanyNav, PageHeader } from "@/components/app-shell";
import { EmptyState } from "@/components/ui";
import { requireVerifiedSession } from "@/lib/auth/session";
import { listJobs } from "@/lib/data/repository";

export default async function SchedulePage({ params }: { params: { companyId: string } }) {
  const session = await requireVerifiedSession(`/company/${params.companyId}/schedule`);
  const jobs = await listJobs(params.companyId, session.uid);

  return (
    <>
      <CompanyNav companyId={params.companyId} />
      <PageHeader title="Schedule" description="Day, week and month views show actual scheduled jobs only." />
      {jobs.some((job) => job.date) ? (
        <div className="grid gap-3">
          {jobs.filter((job) => job.date).map((job) => (
            <div key={job.id} className="rounded-lg border border-line bg-white p-4">
              <p className="font-semibold">{job.date} {job.startTime}</p>
              <p className="mt-1 text-sm text-ink/65">{job.title}</p>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="No scheduled jobs yet." body="Scheduled jobs will populate the calendar once real jobs have dates and times." />
      )}
    </>
  );
}
