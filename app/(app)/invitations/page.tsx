import { answerInvitation } from "@/app/actions/company";
import { PageHeader } from "@/components/app-shell";
import { Card, EmptyState, StatusPill, SubmitButton } from "@/components/ui";
import { requireVerifiedSession } from "@/lib/auth/session";
import { listInvitationsForUser } from "@/lib/data/repository";

export default async function InvitationsPage() {
  const session = await requireVerifiedSession("/invitations");
  const invitations = await listInvitationsForUser(session.uid);

  return (
    <>
      <PageHeader title="Company Invitations" description="Company access is only granted after you explicitly accept an invitation." />
      {invitations.length ? (
        <div className="grid gap-3">
          {invitations.map((invitation) => (
            <Card key={invitation.id} className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="font-semibold text-ink">{invitation.companyName}</h2>
                  <StatusPill status={invitation.status} />
                </div>
                <p className="text-sm text-ink/65">
                  Proposed role: <span className="font-semibold text-ink">{invitation.proposedRole}</span>
                </p>
              </div>
              <form action={answerInvitation} className="flex gap-2">
                <input type="hidden" name="invitationId" value={invitation.id} />
                <button className="h-10 rounded-md border border-line bg-white px-4 text-sm font-semibold hover:border-coral hover:text-coral transition" name="response" value="Declined">
                  Decline
                </button>
                <SubmitButton>Accept Invitation</SubmitButton>
                <input type="hidden" name="response" value="Accepted" />
              </form>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="No pending invitations." body="When a company owner invites you, the invitation will appear here." />
      )}
    </>
  );
}
