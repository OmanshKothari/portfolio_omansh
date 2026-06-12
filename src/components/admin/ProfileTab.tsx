import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { getSiteSettings, updateSiteSettings, DEFAULT_SETTINGS } from "@/lib/settings.functions";
import { RichEditor } from "@/components/portfolio/RichEditor";
import type { SkillGroup, Stat } from "@/lib/portfolio-types";
import { FormRow } from "./primitives";

type ProfileForm = typeof DEFAULT_SETTINGS;

const INPUT_CLASS = "w-full rounded-md border border-input bg-background px-3 py-2 text-sm";

/** Normalize skills before saving: trim, drop empty items and empty groups. */
function cleanSkills(skills: SkillGroup[]): SkillGroup[] {
  return skills
    .map((g) => ({
      category: g.category.trim(),
      items: g.items.map((s) => s.trim()).filter(Boolean),
    }))
    .filter((g) => g.category || g.items.length > 0);
}

/** Normalize hero stats before saving: trim, drop rows missing a value or label. */
function cleanStats(stats: Stat[]): Stat[] {
  return stats
    .map((s) => ({ value: s.value.trim(), label: s.label.trim() }))
    .filter((s) => s.value || s.label);
}

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
    (
      k:
        | "name"
        | "role"
        | "tagline"
        | "contact_email"
        | "linkedin_url"
        | "github_url"
        | "resume_url",
    ) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    setSaved(false);
    try {
      await updateSiteSettings({
        data: { ...form, skills: cleanSkills(form.skills), stats: cleanStats(form.stats) },
      });
      qc.invalidateQueries({ queryKey: ["site-settings"] });
      setSaved(true);
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <section className="max-w-2xl">
      <h2 className="mb-1 text-sm font-medium text-foreground">Profile</h2>
      <p className="mb-4 text-sm text-muted-foreground">
        Shown across the site — sidebar, home page hero, about, skills, and contact page.
      </p>
      <form onSubmit={submit} className="space-y-4">
        <FormRow label="Name">
          <input required value={form.name} onChange={set("name")} className={INPUT_CLASS} />
        </FormRow>
        <FormRow label="Role / headline">
          <input value={form.role} onChange={set("role")} className={INPUT_CLASS} />
        </FormRow>
        <FormRow label="Tagline (one line)">
          <textarea
            value={form.tagline}
            onChange={set("tagline")}
            rows={2}
            className={INPUT_CLASS}
          />
        </FormRow>

        <FormRow label="Stats (shown in hero)">
          <StatsEditor value={form.stats} onChange={(stats) => setForm((f) => ({ ...f, stats }))} />
        </FormRow>

        <FormRow label="About (rich text)">
          <RichEditor
            value={form.about}
            onChange={(html) => setForm((f) => ({ ...f, about: html }))}
            placeholder="A short bio — who you are and what you build…"
          />
        </FormRow>

        <FormRow label="Skills (grouped by category)">
          <SkillsEditor
            value={form.skills}
            onChange={(skills) => setForm((f) => ({ ...f, skills }))}
          />
        </FormRow>

        <FormRow label="Contact email">
          <input
            type="email"
            value={form.contact_email}
            onChange={set("contact_email")}
            className={INPUT_CLASS}
          />
        </FormRow>
        <FormRow label="LinkedIn URL">
          <input value={form.linkedin_url} onChange={set("linkedin_url")} className={INPUT_CLASS} />
        </FormRow>
        <FormRow label="GitHub URL">
          <input value={form.github_url} onChange={set("github_url")} className={INPUT_CLASS} />
        </FormRow>
        <FormRow label="Resume URL (hosted PDF — shown as a button in the hero and footer)">
          <input
            value={form.resume_url}
            onChange={set("resume_url")}
            placeholder="https://…/omansh-kothari-resume.pdf"
            className={INPUT_CLASS}
          />
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

/**
 * Editor for category-grouped skills. Items are kept as raw lines while editing
 * (so newlines persist); they're trimmed/filtered on save via cleanSkills().
 */
function SkillsEditor({
  value,
  onChange,
}: {
  value: SkillGroup[];
  onChange: (skills: SkillGroup[]) => void;
}) {
  const updateGroup = (index: number, patch: Partial<SkillGroup>) =>
    onChange(value.map((g, i) => (i === index ? { ...g, ...patch } : g)));
  const addGroup = () => onChange([...value, { category: "", items: [] }]);
  const removeGroup = (index: number) => onChange(value.filter((_, i) => i !== index));

  return (
    <div className="space-y-3">
      {value.map((group, i) => (
        <div key={i} className="space-y-2 rounded-md border border-border p-3">
          <div className="flex items-center gap-2">
            <input
              value={group.category}
              onChange={(e) => updateGroup(i, { category: e.target.value })}
              placeholder="Category (e.g. Languages)"
              className={INPUT_CLASS}
            />
            <button
              type="button"
              onClick={() => removeGroup(i)}
              aria-label="Remove category"
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <textarea
            value={group.items.join("\n")}
            onChange={(e) => updateGroup(i, { items: e.target.value.split("\n") })}
            rows={3}
            placeholder="One skill per line (e.g. Go, TypeScript, PostgreSQL)"
            className={INPUT_CLASS}
          />
        </div>
      ))}
      <button
        type="button"
        onClick={addGroup}
        className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent"
      >
        <Plus className="h-3.5 w-3.5" /> Add category
      </button>
    </div>
  );
}

/**
 * Editor for hero stats: a list of {value, label} rows.
 * `value` is the bold headline (e.g. "3+"), `label` the caption (e.g. "Years Experience").
 */
function StatsEditor({ value, onChange }: { value: Stat[]; onChange: (stats: Stat[]) => void }) {
  const updateStat = (index: number, patch: Partial<Stat>) =>
    onChange(value.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  const addStat = () => onChange([...value, { value: "", label: "" }]);
  const removeStat = (index: number) => onChange(value.filter((_, i) => i !== index));

  return (
    <div className="space-y-2">
      {value.map((stat, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            value={stat.value}
            onChange={(e) => updateStat(i, { value: e.target.value })}
            placeholder="Value (e.g. 3+)"
            className={INPUT_CLASS + " sm:max-w-40"}
          />
          <input
            value={stat.label}
            onChange={(e) => updateStat(i, { label: e.target.value })}
            placeholder="Label (e.g. Years Experience)"
            className={INPUT_CLASS}
          />
          <button
            type="button"
            onClick={() => removeStat(i)}
            aria-label="Remove stat"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addStat}
        className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent"
      >
        <Plus className="h-3.5 w-3.5" /> Add stat
      </button>
    </div>
  );
}
