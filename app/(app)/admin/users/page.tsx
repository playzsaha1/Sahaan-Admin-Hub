import { PageHeader } from "@/components/app-shell";
import { EmptyState } from "@/components/ui";
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
        <div className="overflow-hidden rounded-lg border border-line bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-mist text-ink/60"><tr><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Job / Skill</th><th className="p-3">Verified</th><th className="p-3">Status</th></tr></thead>
            <tbody>{users.map((candidate) => <tr key={candidate.id} className="border-t border-line"><td className="p-3 font-medium">{candidate.fullName}</td><td className="p-3">{candidate.email}</td><td className="p-3">{candidate.jobSkill}</td><td className="p-3">{candidate.emailVerified ? "Yes" : "No"}</td><td className="p-3">{candidate.status}</td></tr>)}</tbody>
          </table>
        </div>
      ) : (
        <EmptyState title="No users yet." body="New accounts will appear here after real signups." />
      )}
    </>
  );
}
