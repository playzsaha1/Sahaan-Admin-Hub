import { CompanyNav, PageHeader } from "@/components/app-shell";
import { EmptyState, StatusPill } from "@/components/ui";
import { requireVerifiedSession } from "@/lib/auth/session";
import { listCompanyMembers } from "@/lib/data/repository";

export default async function WorkersPage({ params }: { params: { companyId: string } }) {
  const session = await requireVerifiedSession(`/company/${params.companyId}/workers`);
  const members = await listCompanyMembers(params.companyId, session.uid);

  return (
    <>
      <CompanyNav companyId={params.companyId} />
      <PageHeader title="Workers" description="Removing a worker removes only their membership from this company, not their individual account." />
      {members.length ? (
        <div className="overflow-hidden rounded-lg border border-line bg-white shadow-soft">
          <table className="w-full text-left text-sm">
            <thead className="bg-mist/80 text-xs font-semibold uppercase tracking-wider text-ink/70">
              <tr>
                <th className="p-3.5">Name</th>
                <th className="p-3.5">Job / Skill</th>
                <th className="p-3.5">Company Role</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-mist/30 transition-colors">
                  <td className="p-3.5 font-medium text-ink">{member.user?.fullName ?? "Unknown user"}</td>
                  <td className="p-3.5 text-ink/70">{member.user?.jobSkill ?? "—"}</td>
                  <td className="p-3.5">
                    <span className="inline-flex rounded-md bg-mist px-2 py-0.5 text-xs font-semibold text-ink">
                      {member.role}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <StatusPill status={member.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState title="No workers added yet." body="Workers appear only after a verified account accepts a company invitation." />
      )}
    </>
  );
}
