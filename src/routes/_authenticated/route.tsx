import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { me } from "@/lib/auth.functions";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { isAdmin } = await me();
    // Redirect to home (never to the secret sign-in path) so it isn't leaked.
    if (!isAdmin) throw redirect({ to: "/" });
    return { isAdmin };
  },
  component: () => <Outlet />,
});
