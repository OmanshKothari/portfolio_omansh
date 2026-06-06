import { createFileRoute, Outlet } from "@tanstack/react-router";

// Layout route for /projects. Renders the matched child — the list
// (projects.index.tsx) at /projects, or the detail (projects.$slug.tsx) at
// /projects/$slug. Each child renders its own <Shell>, so this stays minimal.
export const Route = createFileRoute("/projects")({
  component: () => <Outlet />,
});
