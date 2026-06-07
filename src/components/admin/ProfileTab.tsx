import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getSiteSettings, updateSiteSettings, DEFAULT_SETTINGS } from "@/lib/settings.functions";
import { FormRow } from "./primitives";

type ProfileForm = typeof DEFAULT_SETTINGS;

/** Admin tab: edit the single-row site profile shown across the public site. */
export function ProfileTab() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["site-settings"],
    queryFn: () => getSiteSettings(),
  });
  const [form, setForm] = useState<ProfileForm>(DEFAULT_SETTINGS);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Seed the form once settings arrive from the server.
  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const set =
    (k: keyof ProfileForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    setSaved(false);
    try {
      await updateSiteSettings({ data: form });
      qc.invalidateQueries({ queryKey: ["site-settings"] });
      setSaved(true);
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;

  const inputClass = "w-full rounded-md border border-input bg-background px-3 py-2 text-sm";

  return (
    <section className="max-w-lg">
      <h2 className="mb-1 text-sm font-medium text-foreground">Profile</h2>
      <p className="mb-4 text-sm text-muted-foreground">
        Shown across the site — sidebar, home page hero, and contact page.
      </p>
      <form onSubmit={submit} className="space-y-4">
        <FormRow label="Name">
          <input required value={form.name} onChange={set("name")} className={inputClass} />
        </FormRow>
        <FormRow label="Role / headline">
          <input value={form.role} onChange={set("role")} className={inputClass} />
        </FormRow>
        <FormRow label="Tagline">
          <textarea
            value={form.tagline}
            onChange={set("tagline")}
            rows={2}
            className={inputClass}
          />
        </FormRow>
        <FormRow label="Contact email">
          <input
            type="email"
            value={form.contact_email}
            onChange={set("contact_email")}
            className={inputClass}
          />
        </FormRow>
        <FormRow label="LinkedIn URL">
          <input value={form.linkedin_url} onChange={set("linkedin_url")} className={inputClass} />
        </FormRow>
        <FormRow label="GitHub URL">
          <input value={form.github_url} onChange={set("github_url")} className={inputClass} />
        </FormRow>
        {err && <p className="text-sm text-destructive">{err}</p>}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={busy}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {busy ? "Saving…" : "Save profile"}
          </button>
          {saved && <span className="font-mono text-xs text-muted-foreground">Saved.</span>}
        </div>
      </form>
    </section>
  );
}
