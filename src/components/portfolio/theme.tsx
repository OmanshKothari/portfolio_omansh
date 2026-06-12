import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
  type ReactNode,
} from "react";

type Theme = "light" | "dark";
export type Accent = "green" | "amber" | "indigo" | "teal";

/** Accent palettes selectable in the sidebar; tokens live in styles.css. */
export const ACCENTS: { id: Accent; label: string; swatch: string }[] = [
  { id: "green", label: "Botanical green", swatch: "oklch(0.55 0.17 152)" },
  { id: "amber", label: "Warm amber", swatch: "oklch(0.68 0.16 67)" },
  { id: "indigo", label: "Electric indigo", swatch: "oklch(0.55 0.2 277)" },
  { id: "teal", label: "Teal", swatch: "oklch(0.6 0.13 192)" },
];

const isAccent = (v: unknown): v is Accent =>
  v === "green" || v === "amber" || v === "indigo" || v === "teal";

const ThemeCtx = createContext<{
  theme: Theme;
  toggle: () => void;
  accent: Accent;
  setAccent: (a: Accent) => void;
}>({
  theme: "light",
  toggle: () => {},
  accent: "green",
  setAccent: () => {},
});

// useLayoutEffect so theme syncing happens before paint (no flash when state
// catches up with the inline init script), with a server-safe fallback.
const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [accent, setAccent] = useState<Accent>("green");

  // The inline script in __root.tsx already resolved theme + accent
  // (localStorage → OS preference) and set them on <html> before first paint;
  // just read its result.
  useIsoLayoutEffect(() => {
    const root = document.documentElement;
    setTheme(root.classList.contains("dark") ? "dark" : "light");
    if (isAccent(root.dataset.accent)) setAccent(root.dataset.accent);
  }, []);

  useIsoLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    if (accent === "green") delete root.dataset.accent;
    else root.dataset.accent = accent;
    try {
      localStorage.setItem("theme", theme);
      localStorage.setItem("accent", accent);
    } catch {}
  }, [theme, accent]);

  return (
    <ThemeCtx.Provider
      value={{
        theme,
        toggle: () => setTheme((t) => (t === "dark" ? "light" : "dark")),
        accent,
        setAccent,
      }}
    >
      {children}
    </ThemeCtx.Provider>
  );
}

export const useTheme = () => useContext(ThemeCtx);
