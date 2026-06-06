import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="md:pl-64">
        <div className="mx-auto max-w-4xl px-6 py-12 md:px-12 md:py-16">{children}</div>
      </main>
    </div>
  );
}

export function PageHeader({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) {
  return (
    <header className="mb-12">
      {eyebrow && <div className="mb-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">{eyebrow}</div>}
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
      {description && <p className="mt-3 max-w-2xl text-muted-foreground">{description}</p>}
    </header>
  );
}

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-muted px-2.5 py-0.5 font-mono text-[11px] text-muted-foreground">
      {children}
    </span>
  );
}
