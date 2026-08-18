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
