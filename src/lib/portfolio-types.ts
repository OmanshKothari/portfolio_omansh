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

export type SiteSettings = {
  name: string;
  role: string;
  tagline: string;
  contact_email: string;
  linkedin_url: string;
  github_url: string;
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
