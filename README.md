# Sahaan Admin Hub

Secure full-stack administration and workforce management foundation for approved service businesses.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Firebase Authentication
- Firestore through Firebase Admin server actions
- Zod validation

## Current V1 foundation

- Public landing page, login, signup, email verification notice and logout.
- Individual user profile with full name and job/skill only.
- Moderation safeguards for names and job/skill fields.
- Protected user dashboard, profile, invitations, companies and settings routes.
- Platform admin area for viewing users and manually creating approved companies.
- Company hub for dashboard counts, workers, worker search/invitations, clients, jobs, schedule and settings.
- Central role-based permissions for Owner, Admin, Manager and Worker.
- Server-side authorization checks for company data isolation and platform admin actions.
- Firestore rules and security model documentation.
- Empty states instead of fake businesses, workers, clients, jobs or statistics.

## Setup

1. Copy `.env.example` to `.env.local`.
2. Configure Firebase client and Firebase Admin environment variables.
3. Set `PLATFORM_ADMIN_EMAILS` to a comma-separated list of approved platform administrator emails.
4. Install dependencies with `pnpm install`.
5. Run `pnpm dev`.

No secrets should be committed. `.env` and `.env*.local` are ignored.
