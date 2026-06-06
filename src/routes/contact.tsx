import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Shell, PageHeader } from "@/components/portfolio/Shell";
import { getSiteSettings, DEFAULT_SETTINGS } from "@/lib/settings.functions";
import { SITE_NAME } from "@/lib/site-config";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: `Contact — ${SITE_NAME}` },
      { name: "description", content: "Get in touch via the form or on LinkedIn." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [sent, setSent] = useState(false);
  const { data } = useQuery({ queryKey: ["site-settings"], queryFn: () => getSiteSettings() });
  const settings = data ?? DEFAULT_SETTINGS;
  const hasLinkedin = settings.linkedin_url && settings.linkedin_url.startsWith("http");
  return (
    <Shell>
      <PageHeader eyebrow="Contact" title="Get in touch" />

      <p className="mb-10 text-muted-foreground">
        Looking to connect? Fill out the form below
        {hasLinkedin ? (
          <>
            {" "}or find me on{" "}
            <a href={settings.linkedin_url} target="_blank" rel="noreferrer" className="text-primary hover:underline">
              LinkedIn
            </a>
          </>
        ) : null}
        {settings.contact_email ? (
          <>
            {" "}or email{" "}
            <a href={`mailto:${settings.contact_email}`} className="text-primary hover:underline">
              {settings.contact_email}
            </a>
          </>
        ) : null}
        .
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSent(true);
        }}
        className="max-w-lg space-y-5"
      >
        <Field label="Full Name">
          <input
            type="text"
            required
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
            placeholder="Jane Smith"
          />
        </Field>
        <Field label="Email Address">
          <input
            type="email"
            required
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
            placeholder="jane@example.com"
          />
        </Field>
        <Field label="Message">
          <textarea
            required
            rows={5}
            className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
            placeholder="What's on your mind?"
          />
        </Field>
        <div className="flex items-center gap-4">
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Send Message
          </button>
          {sent && <span className="font-mono text-xs text-muted-foreground">Thanks — I&apos;ll reply soon.</span>}
        </div>
      </form>
    </Shell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
