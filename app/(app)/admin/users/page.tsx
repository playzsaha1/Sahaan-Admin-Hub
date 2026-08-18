import { PageHeader } from "@/components/app-shell";
import { EmptyState, StatusPill } from "@/components/ui";
import { requireVerifiedSession } from "@/lib/auth/session";
import { listUsers } from "@/lib/data/repository";
import { assertPlatformAdmin } from "@/lib/permissions";

export default async function AdminUsersPage() {
  const { user } = await requireVerifiedSession("/admin/users");
  if (!user) throw new Error("User profile is required.");
  assertPlatformAdmin(user.platformRole);
  const users = await listUsers();

  return (
    <>
      <PageHeader title="Users" description="Private email addresses are available only in the platform admin area." />
      {users.length ? (
        <div className="overflow-hidden rounded-lg border border-line bg-white shadow-soft">
          <table className="w-full text-left text-sm">
            <thead className="bg-mist/80 text-xs font-semibold uppercase tracking-wider text-ink/70">
              <tr>
                <th className="p-3.5">Name</th>
                <th className="p-3.5">Email</th>
                <th className="p-3.5">Job / Skill</th>
                <th className="p-3.5">Verified</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {users.map((candidate) => (
                <tr key={candidate.id} className="hover:bg-mist/30 transition-colors">
                  <td className="p-3.5 font-medium text-ink">{candidate.fullName}</td>
                  <td className="p-3.5 text-ink/70 font-mono text-xs">{candidate.email}</td>
                  <td className="p-3.5 text-ink/70">{candidate.jobSkill}</td>
                  <td className="p-3.5">
                    <StatusPill status={candidate.emailVerified ? "Verified" : "Pending"} />
                  </td>
                  <td className="p-3.5">
                    <StatusPill status={candidate.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState title="No users yet." body="New accounts will appear here after real signups." />
      )}
    </>
  );
}
