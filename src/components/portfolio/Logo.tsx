/**
 * The site's "OK" monogram mark. Mirrors public/favicon.svg.
 * The rounded square uses `currentColor`, so color it via a text-* class
 * (e.g. `text-primary`); the letters stay white for contrast in both themes.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label={`${"OK"} logo`}>
      <rect width="64" height="64" rx="14" fill="currentColor" />
      <text
        x="32"
        y="34"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace"
        fontSize="26"
        fontWeight={700}
        letterSpacing="-1"
        fill="#ffffff"
      >
        OK
      </text>
    </svg>
  );
}
