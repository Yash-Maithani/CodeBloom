// Class lists shared by several components, so buttons and links look and
// behave the same everywhere (DESIGN.md section 7). Written out in full because
// Tailwind only generates classes it can find as complete strings.
// data-state="hover" | "pressed" | "focus" forces a state, for the component
// gallery only; real pages never set it.

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-control border-2 px-6 py-3 text-ui font-bold transition-[background-color,border-color,transform,box-shadow] duration-fast ease-standard aria-disabled:cursor-not-allowed data-[state=focus]:outline-2 data-[state=focus]:outline-offset-2 data-[state=focus]:outline-ink";

/** Buttons and button-styled links (DESIGN.md section 7). At least 48px tall. */
export const buttonStyles = {
  // The learner's own action: marigold with an ink edge, which carries the
  // boundary in light mode, and a 4px pressed edge. Pressing moves it down.
  primary: `${buttonBase} border-action-edge bg-action text-on-action shadow-press hover:bg-action-hover data-[state=hover]:bg-action-hover active:translate-y-1 active:shadow-none data-[state=pressed]:translate-y-1 data-[state=pressed]:shadow-none motion-reduce:active:translate-y-0 motion-reduce:active:bg-action-hover aria-disabled:translate-y-0 aria-disabled:border-edge aria-disabled:bg-sunken aria-disabled:text-ink-muted aria-disabled:shadow-none`,
  secondary: `${buttonBase} border-edge bg-surface text-ink hover:bg-primary-tint data-[state=hover]:bg-primary-tint active:border-primary active:bg-primary-tint data-[state=pressed]:border-primary data-[state=pressed]:bg-primary-tint aria-disabled:bg-sunken aria-disabled:text-ink-muted`,
} as const;

/** Links inside text: always underlined; the underline thickens on hover. */
export const textLinkStyles =
  "text-primary underline decoration-1 underline-offset-3 transition-colors hover:decoration-2 data-[state=hover]:decoration-2 active:text-primary-hover";

/** The link back to the page above ("All courses", "Python course"): 48px tall. */
export const backLinkStyles = `inline-flex py-3 text-ui ${textLinkStyles}`;
