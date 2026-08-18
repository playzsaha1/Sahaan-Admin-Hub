import { addJob } from "@/app/actions/company";
import { CompanyNav, PageHeader } from "@/components/app-shell";
import { Card, EmptyState, Field, Select, StatusPill, SubmitButton, TextArea } from "@/components/ui";
import { requireVerifiedSession } from "@/lib/auth/session";
import { listClients, listCompanyMembers, listJobs } from "@/lib/data/repository";
import { Calendar, Clock, MapPin } from "lucide-react";

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
      <Card className="mb-6">
        <form action={addJob} className="grid gap-4 md:grid-cols-2">
          <input type="hidden" name="companyId" value={params.companyId} />
          <Field label="Job title" name="title" required placeholder="e.g. Annual Switchboard Inspection" />
          <Field label="Service / job type" name="jobType" required placeholder="e.g. Commercial Electrical" />
          <Select label="Status" name="status" values={["New", "Scheduled", "On The Way", "In Progress", "Completed", "Cancelled"]} />
          <label className="grid gap-1.5 text-sm font-medium text-ink">
            Client
            <select className="h-10 rounded-md border border-line bg-white px-3" name="clientId">
              <option value="">No client selected</option>
              {clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
            </select>
          </label>
          <Field label="Date" name="date" type="date" />
          <Field label="Start time" name="startTime" type="time" />
          <Field label="End time" name="endTime" type="time" />
          <label className="grid gap-1.5 text-sm font-medium text-ink">
            Assigned worker
            <select className="h-10 rounded-md border border-line bg-white px-3" name="assignedWorkerUserId">
              <option value="">Unassigned</option>
              {members.map((member) => <option key={member.id} value={member.userId}>{member.user?.fullName ?? member.userId}</option>)}
            </select>
          </label>
          <div className="md:col-span-2"><TextArea label="Description" name="description" /></div>
          <div className="md:col-span-2"><TextArea label="Internal notes" name="internalNotes" /></div>
          <SubmitButton>Create job</SubmitButton>
        </form>
      </Card>
      {jobs.length ? (
        <div className="grid gap-3">
          {jobs.map((job) => (
            <Card key={job.id} className="hover:border-pine/40 transition">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-semibold text-base text-ink">{job.title}</h2>
                <StatusPill status={job.status} />
              </div>
              <p className="mt-1 text-sm font-medium text-ink/75">{job.jobType}</p>
              {job.description ? <p className="mt-2 text-xs text-ink/60 line-clamp-2">{job.description}</p> : null}
              <div className="mt-3 pt-3 border-t border-line flex flex-wrap items-center gap-4 text-xs text-ink/65">
                {job.date ? (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-pine" /> {job.date}
                  </span>
                ) : null}
                {job.startTime ? (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-pine" /> {job.startTime} {job.endTime ? `- ${job.endTime}` : ""}
                  </span>
                ) : null}
                {job.address ? (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-pine" /> {job.address}
                  </span>
                ) : null}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="No jobs added yet." body="Only real company jobs will appear here." />
      )}
    </>
  );
}
