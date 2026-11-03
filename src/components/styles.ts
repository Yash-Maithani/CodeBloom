// Class lists shared by several components, so buttons and links look and
// behave the same everywhere (DESIGN.md section 7). Written out in full because
// Tailwind only generates classes it can find as complete strings.

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-control px-6 py-3 text-ui font-bold transition-colors";

/** Buttons and button-styled links. Height is 48px: 12px padding twice plus a 24px line. */
export const buttonStyles = {
  primary: `${buttonBase} bg-primary text-on-primary hover:bg-primary-hover active:bg-primary-hover`,
  secondary: `${buttonBase} border border-edge bg-surface text-ink hover:bg-primary-tint active:bg-primary-tint`,
} as const;

/** Links inside text: always underlined; the underline thickens on hover. */
export const textLinkStyles =
  "text-primary underline decoration-1 underline-offset-3 transition-colors hover:decoration-2 active:text-primary-hover";

/** The link back to the page above ("All courses", "Python course"): 48px tall. */
export const backLinkStyles = `inline-flex py-3 text-ui ${textLinkStyles}`;
