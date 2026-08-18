import { ShieldCheck, Users, CalendarDays } from "lucide-react";
import { ButtonLink, Card } from "@/components/ui";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-10 md:grid-cols-[1.15fr_0.85fr] md:py-20">
        <div className="flex min-h-[62vh] flex-col justify-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brass">Secure business administration</p>
          <h1 className="mt-5 max-w-3xl text-5xl font-semibold tracking-normal text-ink md:text-7xl">Sahaan Admin Hub</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-ink/70">
            Manage your team, clients, jobs and schedule from one secure workspace. Company access is manually approved by Sahaan Admin Hub administrators.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/login">Log In</ButtonLink>
            <ButtonLink href="/signup" variant="secondary">Create Account</ButtonLink>
            <ButtonLink href="mailto:admin@sahaan.example" variant="secondary">Contact</ButtonLink>
          </div>
        </div>
        <div className="grid content-center gap-4">
          {[
            [ShieldCheck, "Approval first", "Businesses cannot self-create workspaces. A platform administrator reviews and activates each company."],
            [Users, "Account-based invites", "Workers must already have verified individual accounts and accept invitations before company access is granted."],
            [CalendarDays, "Real operational records", "Dashboards, schedules and counts are derived from actual database records, with clear empty states."]
          ].map(([Icon, title, body]) => (
            <Card key={String(title)} className="shadow-none">
              <Icon className="h-5 w-5 text-pine" />
              <h2 className="mt-3 font-semibold text-ink">{title as string}</h2>
              <p className="mt-2 text-sm leading-6 text-ink/66">{body as string}</p>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
