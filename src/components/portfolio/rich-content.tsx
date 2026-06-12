// Post-render enhancements for admin-authored rich HTML (garden posts and
// project write-ups): heading ids + optional table of contents, syntax
// highlighting, and mermaid diagram rendering. Everything heavy is imported
// lazily so routes without code or diagrams pay nothing.
import { useEffect, type RefObject } from "react";
import { slugify } from "@/lib/portfolio-types";
import { useTheme } from "./theme";

export type TocEntry = { id: string; text: string; level: 2 | 3 };

let mermaidRenderSeq = 0;

/**
 * Enhance the rich-HTML article rendered inside `ref`:
 *
 *  - assigns slugified ids to h1–h3 (deep-linkable); reports them via `onToc`
 *  - renders ```mermaid code blocks to inline SVG diagrams. The diagram
 *    source is kept on the element (data-mermaid) so toggling light/dark
 *    re-renders every diagram in the matching mermaid theme. Invalid sources
 *    stay visible as plain code blocks.
 *  - syntax-highlights the remaining code blocks with highlight.js
 *
 * `onToc` must be referentially stable (useCallback) — it is an effect dep.
 */
export function useRichContent(
  ref: RefObject<HTMLElement | null>,
  html: string | null | undefined,
  onToc?: (entries: TocEntry[]) => void,
) {
  const { theme } = useTheme();

  useEffect(() => {
    const el = ref.current;
    if (!el || html == null) return;

    const seen = new Map<string, number>();
    const entries = Array.from(el.querySelectorAll<HTMLElement>("h1, h2, h3")).map((h) => {
      let id = slugify(h.textContent ?? "") || "section";
      const n = (seen.get(id) ?? 0) + 1;
      seen.set(id, n);
      if (n > 1) id = `${id}-${n}`;
      h.id = id;
      return {
        id,
        text: h.textContent ?? "",
        level: h.tagName === "H3" ? (3 as const) : (2 as const),
      };
    });
    onToc?.(entries);

    let cancelled = false;

    // Mermaid targets: fresh ```mermaid blocks plus figures from a previous
    // run (the HTML prop didn't change on theme toggle, so React leaves our
    // mutated DOM alone and we re-render diagrams from the stored source).
    const targets = [
      ...Array.from(el.querySelectorAll<HTMLElement>("pre > code.language-mermaid")).map(
        (code) => ({ node: code.closest("pre") as HTMLElement, source: code.textContent ?? "" }),
      ),
      ...Array.from(el.querySelectorAll<HTMLElement>("figure.mermaid-diagram")).map((fig) => ({
        node: fig,
        source: fig.dataset.mermaid ?? "",
      })),
    ].filter((t) => t.node && t.source.trim() !== "");

    if (targets.length > 0) {
      import("mermaid").then(async ({ default: mermaid }) => {
        if (cancelled) return;
        mermaid.initialize({
          startOnLoad: false,
          // "strict" keeps scripts and click handlers out of diagram labels.
          securityLevel: "strict",
          theme: theme === "dark" ? "dark" : "neutral",
          fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
        });
        for (const { node, source } of targets) {
          try {
            const { svg } = await mermaid.render(`mermaid-svg-${mermaidRenderSeq++}`, source);
            if (cancelled) return;
            const fig = document.createElement("figure");
            fig.className = "mermaid-diagram";
            fig.dataset.mermaid = source;
            fig.innerHTML = svg;
            node.replaceWith(fig);
          } catch {
            // Invalid diagram source — leave the code block as-is.
          }
        }
      });
    }

    // [data-highlighted] keeps re-runs (theme toggle) from re-highlighting.
    const HLJS_TARGET = "pre code:not(.language-mermaid):not([data-highlighted])";
    if (el.querySelector(HLJS_TARGET)) {
      import("highlight.js/lib/common").then(({ default: hljs }) => {
        if (cancelled) return;
        el.querySelectorAll<HTMLElement>(HLJS_TARGET).forEach((block) => {
          hljs.highlightElement(block);
        });
      });
    }

    return () => {
      cancelled = true;
    };
  }, [ref, html, theme, onToc]);
}
