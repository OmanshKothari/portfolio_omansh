import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Shell, PageHeader } from "@/components/portfolio/Shell";
import { getSiteSettings, DEFAULT_SETTINGS } from "@/lib/settings.functions";
import { submitContactForm } from "@/lib/contact.functions";
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
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [error, setError] = useState<string | null>(null);

  const { data } = useQuery({ queryKey: ["site-settings"], queryFn: () => getSiteSettings() });
  const settings = data ?? DEFAULT_SETTINGS;
  const hasLinkedin = settings.linkedin_url && settings.linkedin_url.startsWith("http");

  const submitMutation = useMutation({
    mutationFn: (input: typeof formData) => submitContactForm({ data: input }),
    onSuccess: () => {
      setFormData({ name: "", email: "", message: "" });
      setError(null);
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : "Failed to send message");
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    try {
      await submitMutation.mutateAsync(formData);
    } catch {
      // Error surfaced via onError → `error` state; nothing else to do here.
    }
  };

  const isLoading = submitMutation.isPending;
  const isSuccess = submitMutation.isSuccess;

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

      {isSuccess && (
        <div className="mb-6 rounded-md border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          Thanks for reaching out! I'll get back to you soon.
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-lg space-y-5">
        <Field label="Full Name">
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
            placeholder="Jane Smith"
            disabled={isLoading}
          />
        </Field>
        <Field label="Email Address">
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
            placeholder="jane@example.com"
            disabled={isLoading}
          />
        </Field>
        <Field label="Message">
          <textarea
            required
            rows={5}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
            placeholder="What's on your mind?"
            disabled={isLoading}
          />
        </Field>
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={isLoading || isSuccess}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Sending…" : "Send Message"}
          </button>
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
