import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Sidebar, MobileNav } from "./Sidebar";
import { DEFAULT_SETTINGS } from "@/lib/settings.functions";
import { siteSettingsQuery } from "@/lib/queries";

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <Sidebar />
      <MobileNav />
      <main id="main-content" tabIndex={-1} className="pt-16 outline-none md:pl-64 md:pt-0">
        <div className="mx-auto max-w-4xl px-6 py-12 md:px-12 md:py-16">
          {children}
          <Footer />
        </div>
      </main>
    </div>
  );
}

function Footer() {
  const { data } = useQuery(siteSettingsQuery());
  const settings = data ?? DEFAULT_SETTINGS;
  const externalLink = (url: string) => (url.startsWith("http") ? url : undefined);
  const github = externalLink(settings.github_url);
  const linkedin = externalLink(settings.linkedin_url);
  const resume = externalLink(settings.resume_url);

  return (
    <footer className="mt-20 border-t border-border pt-6">
      <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-xs text-muted-foreground">
        <span>
          © {new Date().getFullYear()} {settings.name}
        </span>
        <div className="flex gap-5">
          {github && (
            <a href={github} target="_blank" rel="noreferrer" className="hover:text-foreground">
              GitHub
            </a>
          )}
          {linkedin && (
            <a href={linkedin} target="_blank" rel="noreferrer" className="hover:text-foreground">
              LinkedIn
            </a>
          )}
          {resume && (
            <a href={resume} target="_blank" rel="noreferrer" className="hover:text-foreground">
              Résumé
            </a>
          )}
          <Link to="/contact" className="hover:text-foreground">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <header className="mb-12">
      {eyebrow && (
        <div className="mb-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">
          {eyebrow}
        </div>
      )}
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
