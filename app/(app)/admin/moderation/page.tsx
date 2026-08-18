import { PageHeader } from "@/components/app-shell";
import { EmptyState } from "@/components/ui";
import { requireVerifiedSession } from "@/lib/auth/session";
import { assertPlatformAdmin } from "@/lib/permissions";

export default async function AdminModerationPage() {
  const { user } = await requireVerifiedSession("/admin/moderation");
  if (!user) throw new Error("User profile is required.");
  assertPlatformAdmin(user.platformRole);

  return (
    <>
      <PageHeader title="Moderation" description="Name and job/skill validation blocks clearly inappropriate profile fields while avoiding overly aggressive rules for legitimate names." />
      <EmptyState title="No moderation records yet." body="Flagged profile changes and administrator actions will appear here once real records exist." />
    </>
  );
}
