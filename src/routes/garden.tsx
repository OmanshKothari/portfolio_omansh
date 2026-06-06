import { createFileRoute, Outlet } from "@tanstack/react-router";

// Layout route for /garden. Renders the matched child — the list
// (garden.index.tsx) at /garden, or the detail (garden.$slug.tsx) at
// /garden/$slug. Each child renders its own <Shell>, so this stays minimal.
export const Route = createFileRoute("/garden")({
  component: () => <Outlet />,
});
