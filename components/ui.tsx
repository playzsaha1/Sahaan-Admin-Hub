import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function ButtonLink({ href, children, variant = "primary" }: { href: string; children: ReactNode; variant?: "primary" | "secondary" }) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-semibold transition",
        variant === "primary" && "bg-pine text-white hover:bg-pine-dark",
        variant === "secondary" && "border border-line bg-white text-ink hover:border-pine"
      )}
    >
      {children}
    </Link>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cn("rounded-lg border border-line bg-white p-5 shadow-soft", className)}>{children}</section>;
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-dashed border-line bg-white/72 p-8 text-center">
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      <p className="mt-2 text-sm text-ink/65">{body}</p>
    </div>
  );
}

export function Field({ label, name, type = "text", required = false, placeholder, defaultValue }: { label: string; name: string; type?: string; required?: boolean; placeholder?: string; defaultValue?: string }) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-ink">
      {label}
      <input
        className="h-10 rounded-md border border-line bg-white px-3 text-sm outline-none ring-pine/20 transition focus:border-pine focus:ring-4"
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
      />
    </label>
  );
}

export function TextArea({ label, name, defaultValue }: { label: string; name: string; defaultValue?: string }) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-ink">
      {label}
      <textarea className="min-h-24 rounded-md border border-line bg-white px-3 py-2 text-sm outline-none ring-pine/20 transition focus:border-pine focus:ring-4" name={name} defaultValue={defaultValue} />
    </label>
  );
}

export function Select({ label, name, values }: { label: string; name: string; values: string[] }) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-ink">
      {label}
      <select className="h-10 rounded-md border border-line bg-white px-3 text-sm outline-none ring-pine/20 transition focus:border-pine focus:ring-4" name={name}>
        {values.map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </select>
    </label>
  );
}

export function SubmitButton({ children }: { children: ReactNode }) {
  return <button className="inline-flex h-10 items-center justify-center rounded-md bg-pine px-4 text-sm font-semibold text-white transition hover:bg-pine-dark">{children}</button>;
}

export type StatusVariant = "active" | "pending" | "rejected" | "info" | "neutral";

export function getStatusVariant(status: string): StatusVariant {
  const s = status.toLowerCase();
  if (["active", "business details verified", "accepted", "completed", "yes", "verified"].includes(s)) {
    return "active";
  }
  if (["pending", "unreviewed", "scheduled", "new"].includes(s)) {
    return "pending";
  }
  if (["rejected", "suspended", "cancelled", "declined", "removed", "no"].includes(s)) {
    return "rejected";
  }
  if (["in progress", "on the way"].includes(s)) {
    return "info";
  }
  return "neutral";
}

export function StatusPill({ status, variant }: { status: string; variant?: StatusVariant }) {
  const resolvedVariant = variant || getStatusVariant(status);

  const styleMap: Record<StatusVariant, { pill: string; dot: string }> = {
    active: {
      pill: "bg-emerald-50 text-emerald-800 border-emerald-200/80",
      dot: "bg-emerald-500"
    },
    pending: {
      pill: "bg-amber-50 text-amber-800 border-amber-200/80",
      dot: "bg-amber-500"
    },
    rejected: {
      pill: "bg-rose-50 text-rose-800 border-rose-200/80",
      dot: "bg-rose-500"
    },
    info: {
      pill: "bg-sky-50 text-sky-800 border-sky-200/80",
      dot: "bg-sky-500"
    },
    neutral: {
      pill: "bg-slate-50 text-slate-700 border-slate-200",
      dot: "bg-slate-400"
    }
  };

  const { pill, dot } = styleMap[resolvedVariant];

  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide", pill)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", dot)} />
      {status}
    </span>
  );
}
