import { inviteWorker } from "@/app/actions/company";
import { CompanyNav, PageHeader } from "@/components/app-shell";
import { Card, EmptyState, Field, Select, SubmitButton } from "@/components/ui";
import { requireVerifiedSession } from "@/lib/auth/session";
import { listSkillFilters, searchUsers } from "@/lib/data/repository";

export default async function CompanyInvitationsPage({ params, searchParams }: { params: { companyId: string }; searchParams: { q?: string; skill?: string } }) {
  await requireVerifiedSession(`/company/${params.companyId}/invitations`);
  const [users, skills] = await Promise.all([searchUsers(searchParams.q, searchParams.skill), listSkillFilters()]);

  return (
    <>
      <CompanyNav companyId={params.companyId} />
      <PageHeader title="Invite Workers" description="Search existing verified users by full name or job/skill. Private emails are not exposed in search results." />
      <Card className="mb-5">
        <form className="grid gap-4 md:grid-cols-[1fr_220px_auto]">
          <Field label="Search" name="q" defaultValue={searchParams.q ?? ""} />
          <label className="grid gap-1.5 text-sm font-medium text-ink">Skill filter<select className="h-10 rounded-md border border-line bg-white px-3" name="skill"><option value="">All real skills</option>{skills.map((skill) => <option key={skill} value={skill}>{skill}</option>)}</select></label>
          <div className="self-end"><SubmitButton>Search</SubmitButton></div>
        </form>
      </Card>
      {users.length ? (
        <div className="grid gap-3">
          {users.map((user) => (
            <Card key={user.id} className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div><h2 className="font-semibold">{user.fullName}</h2><p className="text-sm text-ink/65">{user.jobSkill}</p></div>
              <form action={inviteWorker} className="flex gap-2">
                <input type="hidden" name="companyId" value={params.companyId} />
                <input type="hidden" name="invitedUserId" value={user.id} />
                <Select label="Role" name="proposedRole" values={["Worker", "Manager", "Admin"]} />
                <div className="self-end"><SubmitButton>Invite</SubmitButton></div>
              </form>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="No matching verified users." body="Workers must create and verify a Sahaan Admin Hub account before they can be invited." />
      )}
    </>
  );
}
