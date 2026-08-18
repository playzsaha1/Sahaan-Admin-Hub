import { addJob } from "@/app/actions/company";
import { CompanyNav, PageHeader } from "@/components/app-shell";
import { Card, EmptyState, Field, Select, SubmitButton, TextArea } from "@/components/ui";
import { requireVerifiedSession } from "@/lib/auth/session";
import { listClients, listCompanyMembers, listJobs } from "@/lib/data/repository";

export default async function JobsPage({ params }: { params: { companyId: string } }) {
  const session = await requireVerifiedSession(`/company/${params.companyId}/jobs`);
  const [jobs, clients, members] = await Promise.all([
    listJobs(params.companyId, session.uid),
    listClients(params.companyId, session.uid).catch(() => []),
    listCompanyMembers(params.companyId, session.uid).catch(() => [])
  ]);

  return (
    <>
      <CompanyNav companyId={params.companyId} />
      <PageHeader title="Jobs" description="Jobs are generic enough for service businesses such as plumbing, electrical, cleaning, landscaping and maintenance." />
      <Card className="mb-5">
        <form action={addJob} className="grid gap-4 md:grid-cols-2">
          <input type="hidden" name="companyId" value={params.companyId} />
          <Field label="Job title" name="title" required />
          <Field label="Service / job type" name="jobType" required />
          <Select label="Status" name="status" values={["New", "Scheduled", "On The Way", "In Progress", "Completed", "Cancelled"]} />
          <label className="grid gap-1.5 text-sm font-medium text-ink">Client<select className="h-10 rounded-md border border-line bg-white px-3" name="clientId"><option value="">No client selected</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}</select></label>
          <Field label="Date" name="date" type="date" />
          <Field label="Start time" name="startTime" type="time" />
          <Field label="End time" name="endTime" type="time" />
          <label className="grid gap-1.5 text-sm font-medium text-ink">Assigned worker<select className="h-10 rounded-md border border-line bg-white px-3" name="assignedWorkerUserId"><option value="">Unassigned</option>{members.map((member) => <option key={member.id} value={member.userId}>{member.user?.fullName ?? member.userId}</option>)}</select></label>
          <div className="md:col-span-2"><TextArea label="Description" name="description" /></div>
          <div className="md:col-span-2"><TextArea label="Internal notes" name="internalNotes" /></div>
          <SubmitButton>Create job</SubmitButton>
        </form>
      </Card>
      {jobs.length ? (
        <div className="grid gap-3">
          {jobs.map((job) => (
            <Card key={job.id}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-semibold">{job.title}</h2>
                <span className="rounded-md bg-mist px-2 py-1 text-xs font-semibold">{job.status}</span>
              </div>
              <p className="mt-2 text-sm text-ink/65">{job.jobType}{job.date ? ` · ${job.date}` : ""}</p>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="No jobs added yet." body="Only real company jobs will appear here." />
      )}
    </>
  );
}
