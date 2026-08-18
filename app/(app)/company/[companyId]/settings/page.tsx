import { CompanyNav, PageHeader } from "@/components/app-shell";
import { EmptyState } from "@/components/ui";

export default function CompanySettingsPage({ params }: { params: { companyId: string } }) {
  return (
    <>
      <CompanyNav companyId={params.companyId} />
      <PageHeader title="Company Settings" description="Only authorized company owners can manage company settings." />
      <EmptyState title="No editable settings in V1." body="Company creation, activation and suspension are controlled by the platform administrator." />
    </>
  );
}
