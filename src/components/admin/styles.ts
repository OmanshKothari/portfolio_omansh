// Shared Tailwind class strings for the admin UI, kept separate from the
// component module so React Fast Refresh treats components cleanly.

/** Primary "New …" action button/link. */
export const PRIMARY_BTN =
  "inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90";

/** Neutral 8×8 icon button (e.g. edit). */
export const ICON_BTN =
  "inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground";

/** Destructive 8×8 icon button (e.g. delete). */
export const ICON_BTN_DANGER =
  "inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive";

/** className for an edit action rendered as a navigating <Link>. */
export const editLinkClass = ICON_BTN;
