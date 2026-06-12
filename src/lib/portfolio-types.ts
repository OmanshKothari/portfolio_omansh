export type Project = {
  id: string;
  slug: string;
  title: string;
  description: string;
  long_description: string | null;
  tags: string[];
  github_url: string | null;
  demo_url: string | null;
  cover_url: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content_html: string;
  topic: string;
  published: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
};

export type TimelineItem = {
  id: string;
  dates: string;
  company: string;
  role: string;
  points: string[];
  sort_order: number;
  created_at: string;
  updated_at: string;
};

/** A named group of skills shown on the dashboard, e.g. { category: "Languages", items: ["Go", "TypeScript"] }. */
export type SkillGroup = {
  category: string;
  items: string[];
};

/** A single hero stat, e.g. { value: "3+", label: "Years Experience" }. */
export type Stat = {
  value: string;
  label: string;
};

export type SiteSettings = {
  name: string;
  role: string;
  tagline: string;
  /** Rich-text bio stored as HTML (authored with RichEditor). */
  about: string;
  contact_email: string;
  linkedin_url: string;
  github_url: string;
  /** Hosted resume PDF URL — swap it any time from the admin profile; empty hides the buttons. */
  resume_url: string;
  skills: SkillGroup[];
  /** Headline numbers shown in the home-page hero. */
  stats: Stat[];
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  created_at: string;
};

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
