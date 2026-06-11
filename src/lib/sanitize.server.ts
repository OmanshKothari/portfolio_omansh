// Server-only HTML sanitization for admin-authored rich text.
//
// Only the signed-in admin can write this HTML, but sanitizing on write is
// defence in depth: if a session or upsert endpoint were ever compromised,
// the attacker would get defacement, not persistent XSS against visitors.
//
// Import ONLY via `await import(...)` inside server-function handlers.
import sanitizeHtmlLib from "sanitize-html";

// Allowlist mirrors what the TipTap editor (StarterKit + Link) can emit.
const OPTIONS: sanitizeHtmlLib.IOptions = {
  allowedTags: [
    "p", "br", "hr",
    "h1", "h2", "h3", "h4", "h5", "h6",
    "ul", "ol", "li",
    "blockquote", "pre", "code",
    "strong", "b", "em", "i", "s", "u", "mark",
    "a", "span", "img",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    img: ["src", "alt", "title", "width", "height"],
    code: ["class"],
    pre: ["class"],
    span: ["class"],
    ol: ["start", "type"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  // External links opened from rich text shouldn't get window.opener access.
  transformTags: {
    a: sanitizeHtmlLib.simpleTransform("a", { rel: "noopener noreferrer" }, true),
  },
};

/** Sanitize admin-authored rich-text HTML before it is stored. */
export function sanitizeRichHtml(html: string): string {
  return sanitizeHtmlLib(html, OPTIONS);
}
