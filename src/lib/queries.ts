// Shared React Query options factories.
//
// Route loaders ensure these on the server (so SSR ships real content, not
// skeletons) and components read the same cache via useQuery — one definition
// per dataset keeps the keys from drifting between callers.
import { queryOptions } from "@tanstack/react-query";
import { getSiteSettings } from "./settings.functions";
import { listProjects, getProjectBySlug } from "./projects.functions";
import { listPublishedPosts, getPostBySlug } from "./blog.functions";
import { listTimeline } from "./timeline.functions";

export const siteSettingsQuery = () =>
  queryOptions({ queryKey: ["site-settings"], queryFn: () => getSiteSettings() });

export const projectsQuery = () =>
  queryOptions({ queryKey: ["projects-all"], queryFn: () => listProjects() });

export const projectQuery = (slug: string) =>
  queryOptions({ queryKey: ["project", slug], queryFn: () => getProjectBySlug({ data: { slug } }) });

export const postsQuery = () =>
  queryOptions({ queryKey: ["garden-all"], queryFn: () => listPublishedPosts() });

export const postQuery = (slug: string) =>
  queryOptions({ queryKey: ["garden", slug], queryFn: () => getPostBySlug({ data: { slug } }) });

export const timelineQuery = () =>
  queryOptions({ queryKey: ["timeline-all"], queryFn: () => listTimeline() });
