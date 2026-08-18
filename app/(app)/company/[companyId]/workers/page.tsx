import { CompanyNav, PageHeader } from "@/components/app-shell";
import { EmptyState } from "@/components/ui";
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
        <div className="overflow-hidden rounded-lg border border-line bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-mist text-ink/60"><tr><th className="p-3">Name</th><th className="p-3">Job / Skill</th><th className="p-3">Company Role</th><th className="p-3">Status</th></tr></thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id} className="border-t border-line">
                  <td className="p-3 font-medium">{member.user?.fullName ?? "Unknown user"}</td>
                  <td className="p-3">{member.user?.jobSkill ?? ""}</td>
                  <td className="p-3">{member.role}</td>
                  <td className="p-3">{member.status}</td>
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
