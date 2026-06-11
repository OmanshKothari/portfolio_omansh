import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Moon, Sun, LogOut, Settings, Menu, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "./theme";
import { useAuth } from "./auth-context";
import { Logo } from "./Logo";
import { DEFAULT_SETTINGS } from "@/lib/settings.functions";
import { siteSettingsQuery } from "@/lib/queries";

const nav = [
  { to: "/", label: "Home" },
  { to: "/projects", label: "Projects" },
  { to: "/garden", label: "Digital Garden" },
  { to: "/timeline", label: "Career Timeline" },
  { to: "/contact", label: "Contact" },
] as const;

export function Sidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { theme, toggle } = useTheme();
  const { isAdmin, signOut } = useAuth();
  const { data } = useQuery(siteSettingsQuery());
  const settings = data ?? DEFAULT_SETTINGS;

  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar px-6 py-8 md:flex">
      <div className="flex flex-col items-start gap-3">
        <Link to="/" aria-label="Home">
          <Logo className="h-12 w-12 text-primary" />
        </Link>
        <div>
          <div className="text-sm font-medium text-foreground">{settings.name}</div>
          {settings.role && (
            <div className="font-mono text-xs text-muted-foreground">{settings.role}</div>
          )}
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
        {/* Sign-in is intentionally not linked here — admin reaches login via a
            secret URL (see /auth/$key). Only the signed-in admin sees Sign out. */}
        {isAdmin && (
          <button
            onClick={() => signOut()}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-border px-3 py-1.5 font-mono text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <LogOut className="h-3 w-3" /> Sign out
          </button>
        )}
      </div>
    </aside>
  );
}

/** Height of the fixed mobile top bar (matches `pt-16`/`top-16` on the Shell + menu). */
const MOBILE_BAR_H = "h-16";

/**
 * Mobile navigation: a fixed top bar with a hamburger that opens a slide-down
 * menu. Hidden at `md` and up, where the desktop Sidebar takes over.
 */
export function MobileNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { theme, toggle } = useTheme();
  const { isAdmin, signOut } = useAuth();
  const { data } = useQuery(siteSettingsQuery());
  const settings = data ?? DEFAULT_SETTINGS;
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Close the menu whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // While open: lock body scroll, allow Escape to close, and trap Tab inside
  // the menu (the page behind it is hidden, so focus must not escape into it).
  // On close, focus returns to the toggle.
  useEffect(() => {
    if (!open) return;
    const root = rootRef.current;
    const focusables = () =>
      root
        ? Array.from(root.querySelectorAll<HTMLElement>("a[href], button:not([disabled])"))
        : [];
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key !== "Tab") return;
      const els = focusables();
      if (els.length === 0) return;
      const first = els[0];
      const last = els[els.length - 1];
      const active = document.activeElement;
      const inside = active instanceof HTMLElement && root?.contains(active);
      if (e.shiftKey && (active === first || !inside)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || !inside)) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      toggleRef.current?.focus();
    };
  }, [open]);

  const linkClass = (active: boolean) =>
    "rounded-md px-3 py-2.5 text-sm transition-colors " +
    (active
      ? "bg-accent text-foreground"
      : "text-muted-foreground hover:bg-accent hover:text-foreground");

  return (
    <div ref={rootRef} className="md:hidden">
      <header
        className={
          "fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-sidebar-border bg-sidebar px-5 " +
          MOBILE_BAR_H
        }
      >
        <Link to="/" aria-label="Home" className="flex items-center gap-2">
          <Logo className="h-8 w-8 text-primary" />
          <span className="text-sm font-medium text-foreground">{settings.name}</span>
        </Link>
        <button
          ref={toggleRef}
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {open && (
        <nav className="fixed inset-x-0 bottom-0 top-16 z-30 flex flex-col overflow-y-auto bg-sidebar px-5 py-6">
          <div className="flex flex-col gap-1">
            {nav.map((item) => (
              <Link key={item.to} to={item.to} className={linkClass(pathname === item.to)}>
                {item.label}
              </Link>
            ))}
          </div>

          {isAdmin && (
            <div className="mt-4 flex flex-col gap-1 border-t border-sidebar-border pt-4">
              <div className="px-3 pb-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Admin
              </div>
              <Link
                to="/admin"
                className={"flex items-center gap-2 " + linkClass(pathname.startsWith("/admin"))}
              >
                <Settings className="h-3.5 w-3.5" /> Manage Content
              </Link>
            </div>
          )}

          <div className="mt-auto flex items-center justify-between gap-3 border-t border-sidebar-border pt-4">
            <button
              onClick={toggle}
              aria-label="Toggle theme"
              className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 font-mono text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {theme === "dark" ? "dark" : "light"}
            </button>
            {isAdmin && (
              <button
                onClick={() => signOut()}
                className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 font-mono text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <LogOut className="h-3 w-3" /> Sign out
              </button>
            )}
          </div>
        </nav>
      )}
    </div>
  );
}
