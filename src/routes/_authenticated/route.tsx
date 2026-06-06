import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { me } from "@/lib/auth.functions";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { isAdmin } = await me();
    if (!isAdmin) throw redirect({ to: "/auth" });
    return { isAdmin };
  },
  component: () => <Outlet />,
});
