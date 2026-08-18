import Link from "next/link";
import { PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui";
import { requireVerifiedSession } from "@/lib/auth/session";
import { listAllCompanies, listUsers } from "@/lib/data/repository";
import { assertPlatformAdmin } from "@/lib/permissions";

export default async function AdminPage() {
  const { user } = await requireVerifiedSession("/admin");
  if (!user) throw new Error("User profile is required.");
  assertPlatformAdmin(user.platformRole);
  const [companies, users] = await Promise.all([listAllCompanies(), listUsers()]);

  return (
    <>
      <PageHeader title="Platform Admin" description="Protected tools for manually approving businesses, assigning first owners and reviewing accounts." />
      <div className="grid gap-4 md:grid-cols-3">
        <Card><p className="text-sm text-ink/60">Companies</p><p className="mt-2 text-3xl font-semibold">{companies.length}</p></Card>
        <Card><p className="text-sm text-ink/60">Users</p><p className="mt-2 text-3xl font-semibold">{users.length}</p></Card>
        <Card><p className="text-sm text-ink/60">Admin access</p><p className="mt-2 text-sm font-semibold text-pine">Server verified</p></Card>
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-3">
        <Link className="rounded-lg border border-line bg-white p-5 font-semibold hover:border-pine" href="/admin/companies">Companies</Link>
        <Link className="rounded-lg border border-line bg-white p-5 font-semibold hover:border-pine" href="/admin/users">Users</Link>
        <Link className="rounded-lg border border-line bg-white p-5 font-semibold hover:border-pine" href="/admin/moderation">Moderation</Link>
      </div>
    </>
  );
}
