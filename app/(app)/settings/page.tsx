import { PageHeader } from "@/components/app-shell";
import { EmptyState } from "@/components/ui";

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" description="Account deletion and advanced privacy settings are planned carefully so company records are not destroyed accidentally." />
      <EmptyState title="No account settings available yet." body="V1 keeps settings intentionally small while the secure company foundation is established." />
    </>
  );
}
