import { Link, useRouterState } from "@tanstack/react-router";
import { Moon, Sun, LogIn, LogOut, Settings } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "./theme";
import { useAuth } from "./auth-context";
import { getSiteSettings, DEFAULT_SETTINGS } from "@/lib/settings.functions";

const nav = [
  { to: "/", label: "Dashboard" },
  { to: "/projects", label: "Projects" },
  { to: "/garden", label: "Digital Garden" },
  { to: "/timeline", label: "Career Timeline" },
  { to: "/contact", label: "Contact" },
] as const;

export function Sidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { theme, toggle } = useTheme();
  const { isAdmin, signOut } = useAuth();
  const { data } = useQuery({ queryKey: ["site-settings"], queryFn: () => getSiteSettings() });
  const settings = data ?? DEFAULT_SETTINGS;
  const initials = settings.name.split(" ").map((n) => n[0]).join("").slice(0, 3);

  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar px-6 py-8 md:flex">
      <div className="flex flex-col items-start gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-sm font-mono text-muted-foreground">
          {initials}
        </div>
        <div>
          <div className="text-sm font-medium text-foreground">{settings.name}</div>
          {settings.role && <div className="font-mono text-xs text-muted-foreground">{settings.role}</div>}
        </div>
      </div>

      <nav className="mt-12 flex flex-col gap-1">
        {nav.map((item) => {
          const active = pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={
                "rounded-md px-3 py-2 text-sm transition-colors " +
                (active
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground")
              }
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {isAdmin && (
        <nav className="mt-8 flex flex-col gap-1 border-t border-sidebar-border pt-4">
          <div className="px-3 pb-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Admin
          </div>
          <Link
            to="/admin"
            className={
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors " +
              (pathname.startsWith("/admin")
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-foreground")
            }
          >
            <Settings className="h-3.5 w-3.5" />
            Manage Content
          </Link>
        </nav>
      )}

      <div className="mt-auto space-y-3">
        <div className="flex items-center justify-between border-t border-sidebar-border pt-4">
          <span className="font-mono text-xs text-muted-foreground">
            {theme === "dark" ? "dark" : "light"}
          </span>
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
        {isAdmin ? (
          <button
            onClick={() => signOut()}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-border px-3 py-1.5 font-mono text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <LogOut className="h-3 w-3" /> Sign out
          </button>
        ) : (
          <Link
            to="/auth"
            className="flex items-center justify-center gap-2 rounded-md border border-border px-3 py-1.5 font-mono text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <LogIn className="h-3 w-3" /> Admin sign in
          </Link>
        )}
      </div>
    </aside>
  );
}
