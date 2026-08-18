import { addClient } from "@/app/actions/company";
import { CompanyNav, PageHeader } from "@/components/app-shell";
import { Card, EmptyState, Field, SubmitButton, TextArea } from "@/components/ui";
import { requireVerifiedSession } from "@/lib/auth/session";
import { listClients } from "@/lib/data/repository";

export default async function ClientsPage({ params }: { params: { companyId: string } }) {
  const session = await requireVerifiedSession(`/company/${params.companyId}/clients`);
  const clients = await listClients(params.companyId, session.uid);

  return (
    <>
      <CompanyNav companyId={params.companyId} />
      <PageHeader title="Clients" description="Client records belong to this company and are protected by company membership permissions." />
      <Card className="mb-5">
        <form action={addClient} className="grid gap-4 md:grid-cols-2">
          <input type="hidden" name="companyId" value={params.companyId} />
          <Field label="Client name" name="name" required />
          <Field label="Email, optional" name="email" type="email" />
          <Field label="Phone, optional" name="phone" />
          <Field label="Service address, optional" name="serviceAddress" />
          <div className="md:col-span-2"><TextArea label="Notes, optional" name="notes" /></div>
          <SubmitButton>Create client</SubmitButton>
        </form>
      </Card>
      {clients.length ? (
        <div className="grid gap-3">
          {clients.map((client) => (
            <Card key={client.id}>
              <h2 className="font-semibold">{client.name}</h2>
              <p className="mt-2 text-sm text-ink/65">{client.email || client.phone || "No optional contact details saved."}</p>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="No clients added yet." body="Create real client records when the business is ready to manage them." />
      )}
    </>
  );
}
