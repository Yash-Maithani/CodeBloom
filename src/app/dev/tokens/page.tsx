// Development page at /dev/tokens. It only proves that the design tokens and
// fonts from DESIGN.md render, and `npm run verify:browser` checks it.
// It is linked from nowhere and asks search engines not to index it. That is
// not access control: anyone with the address can open it. Delete it before
// launch (Milestone 7).
// Class names are written out in full on purpose: Tailwind finds classes by
// scanning the source for complete strings, so they cannot be built dynamically.

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Design tokens check",
  robots: { index: false, follow: false },
};

const colorTokens = [
  { name: "canvas", role: "Page background", swatch: "bg-canvas" },
  { name: "surface", role: "Cards, figures, header", swatch: "bg-surface" },
  { name: "sunken", role: "Code, inputs, output", swatch: "bg-sunken" },
  { name: "ink", role: "Text, icons, focus ring", swatch: "bg-ink" },
  { name: "ink-muted", role: "Secondary text, line numbers", swatch: "bg-ink-muted" },
  { name: "rule", role: "Decorative dividers only", swatch: "bg-rule" },
  { name: "edge", role: "Borders of controls", swatch: "bg-edge" },
  { name: "primary", role: "Links, current step, trail", swatch: "bg-primary" },
  { name: "primary-hover", role: "Hovered or pressed primary", swatch: "bg-primary-hover" },
  { name: "on-primary", role: "Text on primary", swatch: "bg-on-primary" },
  { name: "primary-tint", role: "Current line, selected option, chips", swatch: "bg-primary-tint" },
  { name: "action", role: "The learner's own action", swatch: "bg-action" },
  { name: "action-hover", role: "Hovered action", swatch: "bg-action-hover" },
  { name: "on-action", role: "Text on action", swatch: "bg-on-action" },
  { name: "action-edge", role: "Border and pressed edge of action buttons", swatch: "bg-action-edge" },
  { name: "mark", role: "Highlighter marks", swatch: "bg-mark" },
  { name: "literal", role: "Strings and numbers in code", swatch: "bg-literal" },
  { name: "success", role: "Correct answers", swatch: "bg-success" },
  { name: "success-tint", role: "Correct-answer panel", swatch: "bg-success-tint" },
  { name: "error", role: "Errors, wrong answers", swatch: "bg-error" },
  { name: "error-tint", role: "Error panel", swatch: "bg-error-tint" },
  { name: "warning", role: "Mistakes, time limits", swatch: "bg-warning" },
  { name: "warning-tint", role: "Mistake and warning panel", swatch: "bg-warning-tint" },
];

const textPairs = [
  { fg: "ink", bg: "canvas", className: "bg-canvas text-ink" },
  { fg: "ink-muted", bg: "sunken", className: "bg-sunken text-ink-muted" },
  { fg: "primary", bg: "surface", className: "bg-surface text-primary" },
  { fg: "on-primary", bg: "primary", className: "bg-primary text-on-primary" },
  { fg: "on-action", bg: "action", className: "bg-action text-on-action" },
  { fg: "ink", bg: "mark", className: "bg-mark text-ink" },
  { fg: "success", bg: "success-tint", className: "bg-success-tint text-success" },
  { fg: "error", bg: "error-tint", className: "bg-error-tint text-error" },
  { fg: "warning", bg: "warning-tint", className: "bg-warning-tint text-warning" },
  { fg: "literal", bg: "sunken", className: "bg-sunken text-literal" },
];

const spacingSteps = [
  { step: "1", px: 4, bar: "w-1" },
  { step: "2", px: 8, bar: "w-2" },
  { step: "3", px: 12, bar: "w-3" },
  { step: "4", px: 16, bar: "w-4" },
  { step: "6", px: 24, bar: "w-6" },
  { step: "8", px: 32, bar: "w-8" },
  { step: "10", px: 40, bar: "w-10" },
  { step: "12", px: 48, bar: "w-12" },
  { step: "16", px: 64, bar: "w-16" },
  { step: "24", px: 96, bar: "w-24" },
];

const typeScale = [
  { token: "text-display", note: "Homepage heading", className: "font-heading text-display" },
  { token: "text-h1", note: "Page titles", className: "font-heading text-h1" },
  { token: "text-h2", note: "Sections, lesson steps", className: "font-heading text-h2" },
  { token: "text-h3", note: "Figure and card titles", className: "font-heading text-h3" },
  { token: "text-lead", note: "Goals, intros", className: "text-lead" },
  { token: "text-body", note: "Prose", className: "text-body" },
  { token: "text-ui", note: "Buttons, labels", className: "text-ui" },
  { token: "text-small", note: "Captions, chips", className: "text-small" },
  { token: "text-code", note: "Code and output", className: "font-mono text-code" },
];

const radii = [
  { name: "chip", px: 6, className: "rounded-chip" },
  { name: "control", px: 8, className: "rounded-control" },
  { name: "panel", px: 10, className: "rounded-panel" },
  { name: "card", px: 12, className: "rounded-card" },
];

export default function TokensPage() {
  return (
    <main className="mx-auto w-full max-w-page px-4 py-12 md:px-6 md:py-16 lg:px-8">
      <header className="max-w-measure">
        <h1 className="font-heading text-h1" data-role="heading">
          Design tokens check
        </h1>
        <p className="mt-4 text-body">
          This development page only checks that CodeBloom&apos;s color, type,
          spacing and radius tokens and its three fonts load. It is not the
          homepage.
        </p>
      </header>

      <section aria-labelledby="colors" className="mt-12 md:mt-16">
        <h2 id="colors" className="font-heading text-h2">
          Color tokens
        </h2>
        <p className="mt-2 max-w-measure text-body">
          The active theme is the one your system or the page forces. Each
          swatch uses its token class.
        </p>
        <ul className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {colorTokens.map((token) => (
            <li key={token.name} className="flex flex-col gap-2">
              <div
                aria-hidden="true"
                data-token={token.name}
                className={`h-12 rounded-control border border-edge ${token.swatch}`}
              />
              <span className="font-bold">{token.name}</span>
              <span className="text-small text-ink-muted">{token.role}</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="pairs" className="mt-12 md:mt-16">
        <h2 id="pairs" className="font-heading text-h2">
          Text on surfaces
        </h2>
        <ul className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {textPairs.map((pair) => (
            <li
              key={`${pair.fg}-${pair.bg}`}
              data-fg={pair.fg}
              data-bg={pair.bg}
              className={`rounded-control border border-rule p-4 ${pair.className}`}
            >
              {pair.fg} on {pair.bg}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="type" className="mt-12 md:mt-16">
        <h2 id="type" className="font-heading text-h2">
          Typography
        </h2>
        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div>
            <h3 className="font-heading text-h3">
              Bricolage Grotesque 700 and 800 (headings)
            </h3>
            <p className="mt-2 font-heading text-h3" data-role="heading-specimen">
              <span className="font-extrabold">Bold 800.</span>{" "}
              Every beginner deserves a patient explanation.
            </p>
          </div>
          <div>
            <h3 className="font-heading text-h3">
              Atkinson Hyperlegible Next 400 and 700 (body)
            </h3>
            <p className="mt-2 text-body" data-role="body-specimen">
              Every beginner deserves a patient explanation.{" "}
              <strong className="font-bold">This sentence is bold.</strong>
            </p>
            <p className="mt-2 text-body" data-role="glyph-sans">
              Easily confused characters: l 1 I O 0 o
            </p>
          </div>
          <div className="lg:col-span-2">
            <h3 className="font-heading text-h3">
              Atkinson Hyperlegible Mono 400 and 700 (code)
            </h3>
            <pre
              className="mt-2 overflow-x-auto rounded-panel border border-rule bg-sunken p-4 font-mono text-code"
              data-role="code-specimen"
              role="region"
              tabIndex={0}
              aria-label="Code sample"
            >
              <code>
                <span className="italic text-ink-muted"># a comment is italic</span>
                {"\n"}age = <span className="text-literal">17</span>
                {"\n"}
                <span className="font-bold">if</span> age &gt;= 18:
                {"\n    "}
                <span className="font-bold">print</span>(
                <span className="text-literal">&quot;adult&quot;</span>)
                {"\n"}glyphs ={" "}
                <span className="text-literal">&quot;l 1 I O 0 o&quot;</span>
              </code>
            </pre>
          </div>
        </div>

        <ul className="mt-8 flex flex-col gap-3">
          {typeScale.map((size) => (
            <li key={size.token} className="border-b border-rule pb-3">
              <span className={size.className}>
                {size.token}
              </span>
              <span className="ml-4 text-small text-ink-muted">{size.note}</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="space" className="mt-12 md:mt-16">
        <h2 id="space" className="font-heading text-h2">
          Spacing and radius
        </h2>
        <ul className="mt-6 flex flex-col gap-2">
          {spacingSteps.map((space) => (
            <li key={space.step} className="flex items-center gap-4">
              <span className="w-24 text-ui">
                {space.step} ({space.px}px)
              </span>
              <span
                aria-hidden="true"
                className={`h-4 bg-primary ${space.bar}`}
              />
            </li>
          ))}
        </ul>
        <ul className="mt-8 flex flex-wrap gap-6">
          {radii.map((radius) => (
            <li key={radius.name} className="flex flex-col items-start gap-2">
              <span aria-hidden="true" className={`h-12 w-24 border border-edge bg-surface ${radius.className}`} />
              <span className="text-ui">
                {radius.name} ({radius.px}px)
              </span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
