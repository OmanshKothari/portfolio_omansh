import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/portfolio/auth-context";
import { login } from "@/lib/auth.functions";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Admin Sign In" },
      { name: "description", content: "Portfolio admin sign-in." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { isAdmin, refresh } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isAdmin) navigate({ to: "/admin" });
  }, [isAdmin, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await login({ data: { email, password } });
      await refresh();
      navigate({ to: "/admin" });
    } catch (e2: unknown) {
      setErr(e2 instanceof Error ? e2.message : "Invalid email or password.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <Link to="/" className="font-mono text-xs text-muted-foreground hover:text-foreground">
          ← back to site
        </Link>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight text-foreground">Admin sign in</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to manage projects, the digital garden, your timeline, and your profile.
        </p>

        <form onSubmit={submit} className="mt-8 space-y-4">
          <div>
            <label className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div>
            <label className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          {err && <p className="text-sm text-destructive">{err}</p>}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {busy ? "…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
