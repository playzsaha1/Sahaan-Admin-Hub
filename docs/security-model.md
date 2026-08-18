# Sahaan Admin Hub Security Model

## Core rules

- Users start as normal individual accounts. Roles are assigned per company.
- Company creation is platform-admin only and is enforced in server actions.
- The `platformAdmin` role is assigned only from `PLATFORM_ADMIN_EMAILS` during profile creation. Normal users cannot grant it to themselves.
- Company records are isolated by `companyId` and checked through `getMembership()` before protected reads or writes.
- Workers must already have verified accounts and must accept invitations before membership is created.
- The UI never creates fake companies, workers, clients, jobs, invoices, notifications, analytics, activity feeds, testimonials or profiles.

## Sensitive operations

All sensitive writes run through server-side code:

- `adminCreateCompany`
- `inviteWorker`
- `answerInvitation`
- `addClient`
- `addJob`
- `workerUpdateJobStatus`

Each action verifies the authenticated session, email verification, target company status, active membership and required role capability before writing.

## Firestore

`firestore.rules` rejects direct client writes for companies, members, invitations, clients, jobs, audit logs and moderation records. Those writes should happen only through trusted server routes using Firebase Admin.

The rules assume company membership document IDs use this stable format:

```text
{companyId}_{userId}
```

If a different membership ID strategy is used in production, update the rules and repository together before deployment.

## Required minimum tests

1. User A cannot read User B private profile data.
2. Company A cannot read Company B clients or jobs.
3. Workers cannot promote themselves or change company IDs through crafted requests.
4. Normal users cannot access `/admin` or call platform admin actions.
5. A user cannot accept an invitation intended for another account.
6. Suspended companies reject protected operations.
7. Invalid profile names and job/skill fields are rejected on client and server paths.
