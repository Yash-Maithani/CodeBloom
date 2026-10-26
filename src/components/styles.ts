// Class lists shared by several components, so buttons and links look and
// behave the same everywhere (DESIGN.md section 7). Written out in full because
// Tailwind only generates classes it can find as complete strings.

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-button px-6 py-3 text-sm font-bold transition-colors";

/** Buttons and button-styled links. Height is 48px: 12px padding twice plus a 24px line. */
export const buttonStyles = {
  primary: `${buttonBase} bg-accent text-on-accent hover:bg-accent-hover active:bg-accent-hover`,
  secondary: `${buttonBase} border border-rule-strong bg-sheet text-ink hover:bg-accent-tint active:bg-accent-tint`,
} as const;

/** Links inside text: always underlined; the underline thickens on hover. */
export const textLinkStyles =
  "text-accent underline decoration-1 underline-offset-3 transition-colors hover:decoration-2 active:text-accent-hover";
