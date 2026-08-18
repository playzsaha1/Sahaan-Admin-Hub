import Link from "next/link";
import { logout } from "@/app/actions/auth";
import type { AppUser, Company } from "@/lib/types";

const userLinks = [
  ["/dashboard", "Home"],
  ["/profile", "My Profile"],
  ["/invitations", "Company Invitations"],
  ["/companies", "Companies"],
  ["/settings", "Settings"]
];

export function AppShell({ user, companies, children }: { user: AppUser | null; companies: Company[]; children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-white/86 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link href="/dashboard" className="text-base font-bold tracking-normal text-ink">
            Sahaan Admin Hub
          </Link>
          <form action={logout}>
            <button className="rounded-md border border-line bg-white px-3 py-2 text-sm font-semibold hover:border-pine">Logout</button>
          </form>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:grid-cols-[240px_1fr]">
        <aside className="rounded-lg border border-line bg-white p-3">
          <nav className="grid gap-1">
            {userLinks.map(([href, label]) => (
              <Link key={href} className="rounded-md px-3 py-2 text-sm font-medium text-ink/72 hover:bg-mist hover:text-ink" href={href}>
                {label}
              </Link>
            ))}
            {user?.platformRole === "platformAdmin" ? (
              <Link className="rounded-md px-3 py-2 text-sm font-medium text-pine hover:bg-mist" href="/admin">
                Platform Admin
              </Link>
            ) : null}
          </nav>
          {companies.length ? (
            <div className="mt-5 border-t border-line pt-4">
              <p className="px-3 text-xs font-semibold uppercase text-ink/45">Company hubs</p>
              <div className="mt-2 grid gap-1">
                {companies.map((company) => (
                  <Link key={company.id} className="rounded-md px-3 py-2 text-sm font-medium text-ink/72 hover:bg-mist hover:text-ink" href={`/company/${company.id}`}>
                    {company.businessName}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </aside>
        <main>{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-semibold tracking-normal text-ink">{title}</h1>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-ink/68">{description}</p>
    </div>
  );
}

export function CompanyNav({ companyId }: { companyId: string }) {
  const links = [
    ["", "Dashboard"],
    ["/schedule", "Schedule"],
    ["/jobs", "Jobs"],
    ["/clients", "Clients"],
    ["/workers", "Workers"],
    ["/invitations", "Invitations"],
    ["/settings", "Company Settings"]
  ];
  return (
    <nav className="mb-5 flex gap-2 overflow-x-auto">
      {links.map(([path, label]) => (
        <Link key={label} href={`/company/${companyId}${path}`} className="whitespace-nowrap rounded-md border border-line bg-white px-3 py-2 text-sm font-semibold text-ink/72 hover:border-pine hover:text-ink">
          {label}
        </Link>
      ))}
    </nav>
  );
}
