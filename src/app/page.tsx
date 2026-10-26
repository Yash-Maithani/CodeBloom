// Development page. It only proves that the design tokens and fonts from
// DESIGN.md render. It is replaced by the real homepage in Milestone 1.
// Class names are written out in full on purpose: Tailwind finds classes by
// scanning the source for complete strings, so they cannot be built dynamically.

const colorTokens = [
  { name: "paper", role: "Page background", swatch: "bg-paper" },
  { name: "sheet", role: "Raised surfaces: lesson column, cards, inputs", swatch: "bg-sheet" },
  { name: "code", role: "Code and output panel background", swatch: "bg-code" },
  { name: "ink", role: "Body text, headings, icons, focus ring", swatch: "bg-ink" },
  { name: "ink-muted", role: "Secondary text, line numbers, captions", swatch: "bg-ink-muted" },
  { name: "rule", role: "Decorative dividers only", swatch: "bg-rule" },
  { name: "rule-strong", role: "Control edges", swatch: "bg-rule-strong" },
  { name: "accent", role: "Links, primary buttons, current item", swatch: "bg-accent" },
  { name: "accent-hover", role: "Hover and pressed accent", swatch: "bg-accent-hover" },
  { name: "accent-tint", role: "Highlighted line, selected option", swatch: "bg-accent-tint" },
  { name: "on-accent", role: "Text and icons on accent", swatch: "bg-on-accent" },
  { name: "success", role: "Correct answers, passed checks", swatch: "bg-success" },
  { name: "success-tint", role: "Correct feedback background", swatch: "bg-success-tint" },
  { name: "error", role: "Wrong answers, form errors", swatch: "bg-error" },
  { name: "error-tint", role: "Error feedback background", swatch: "bg-error-tint" },
  { name: "warning", role: "Common-mistake callouts", swatch: "bg-warning" },
  { name: "warning-tint", role: "Common-mistake background", swatch: "bg-warning-tint" },
  { name: "syntax-literal", role: "Strings and numbers in code", swatch: "bg-syntax-literal" },
];

const textPairs = [
  { fg: "ink", bg: "paper", className: "bg-paper text-ink" },
  { fg: "ink-muted", bg: "code", className: "bg-code text-ink-muted" },
  { fg: "accent", bg: "sheet", className: "bg-sheet text-accent" },
  { fg: "on-accent", bg: "accent", className: "bg-accent text-on-accent" },
  { fg: "success", bg: "success-tint", className: "bg-success-tint text-success" },
  { fg: "error", bg: "error-tint", className: "bg-error-tint text-error" },
  { fg: "warning", bg: "warning-tint", className: "bg-warning-tint text-warning" },
  { fg: "syntax-literal", bg: "code", className: "bg-code text-syntax-literal" },
];

const spacingSteps = [
  { step: "1", px: 4, bar: "w-1" },
  { step: "2", px: 8, bar: "w-2" },
  { step: "3", px: 12, bar: "w-3" },
  { step: "4", px: 16, bar: "w-4" },
  { step: "6", px: 24, bar: "w-6" },
  { step: "8", px: 32, bar: "w-8" },
  { step: "12", px: 48, bar: "w-12" },
  { step: "16", px: 64, bar: "w-16" },
  { step: "24", px: 96, bar: "w-24" },
];

const typeScale = [
  { token: "text-xs", note: "14px, smallest size allowed", className: "text-xs" },
  { token: "text-sm", note: "16px, interface text", className: "text-sm" },
  { token: "text-base", note: "18px, lesson prose", className: "text-base" },
  { token: "text-lg", note: "21px, lead paragraph", className: "text-lg" },
  { token: "text-xl", note: "24px, h3", className: "text-xl" },
  { token: "text-2xl", note: "30px, h2", className: "text-2xl" },
];

export default function Page() {
  return (
    <main className="mx-auto w-full max-w-site px-4 py-12 sm:px-6 md:py-16 lg:px-8">
      <header className="max-w-measure">
        <h1 className="font-heading text-3xl font-semibold" data-role="heading">
          Design tokens check
        </h1>
        <p className="mt-4 text-base">
          This development page only checks that CodeBloom&apos;s color, type,
          spacing and radius tokens and its three fonts load. It is not the
          homepage.
        </p>
      </header>

      <section aria-labelledby="colors" className="mt-12 md:mt-16">
        <h2 id="colors" className="font-heading text-2xl font-semibold">
          Color tokens
        </h2>
        <p className="mt-2 max-w-measure text-base">
          The active theme is the one your system or the page forces. Each
          swatch uses its token class.
        </p>
        <ul className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {colorTokens.map((token) => (
            <li key={token.name} className="flex flex-col gap-2">
              <div
                aria-hidden="true"
                data-token={token.name}
                className={`h-12 rounded-control border border-rule-strong ${token.swatch}`}
              />
              <span className="font-bold">{token.name}</span>
              <span className="text-xs text-ink-muted">{token.role}</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="pairs" className="mt-12 md:mt-16">
        <h2 id="pairs" className="font-heading text-2xl font-semibold">
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
        <h2 id="type" className="font-heading text-2xl font-semibold">
          Typography
        </h2>
        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div>
            <h3 className="font-heading text-xl font-semibold">
              Literata 600 (headings)
            </h3>
            <p className="mt-2 font-heading text-xl font-semibold" data-role="heading-specimen">
              Every beginner deserves a patient explanation.
            </p>
          </div>
          <div>
            <h3 className="font-heading text-xl font-semibold">
              Atkinson Hyperlegible Next 400 and 700 (body)
            </h3>
            <p className="mt-2 text-base" data-role="body-specimen">
              Every beginner deserves a patient explanation.{" "}
              <strong className="font-bold">This sentence is bold.</strong>
            </p>
            <p className="mt-2 text-base" data-role="glyph-sans">
              Easily confused characters: l 1 I O 0 o
            </p>
          </div>
          <div className="lg:col-span-2">
            <h3 className="font-heading text-xl font-semibold">
              Atkinson Hyperlegible Mono 400 and 700 (code)
            </h3>
            <pre
              className="mt-2 overflow-x-auto rounded-panel border border-rule bg-code p-4 font-mono text-mono"
              data-role="code-specimen"
              role="region"
              tabIndex={0}
              aria-label="Code sample"
            >
              <code>
                <span className="italic text-ink-muted"># a comment is italic</span>
                {"\n"}age = <span className="text-syntax-literal">17</span>
                {"\n"}
                <span className="font-bold">if</span> age &gt;= 18:
                {"\n    "}
                <span className="font-bold">print</span>(
                <span className="text-syntax-literal">&quot;adult&quot;</span>)
                {"\n"}glyphs ={" "}
                <span className="text-syntax-literal">&quot;l 1 I O 0 o&quot;</span>
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
              <span className="ml-4 text-xs text-ink-muted">{size.note}</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="space" className="mt-12 md:mt-16">
        <h2 id="space" className="font-heading text-2xl font-semibold">
          Spacing and radius
        </h2>
        <ul className="mt-6 flex flex-col gap-2">
          {spacingSteps.map((space) => (
            <li key={space.step} className="flex items-center gap-4">
              <span className="w-24 text-sm">
                {space.step} ({space.px}px)
              </span>
              <span
                aria-hidden="true"
                className={`h-4 bg-accent ${space.bar}`}
              />
            </li>
          ))}
        </ul>
        <ul className="mt-8 flex flex-wrap gap-6">
          <li className="flex flex-col items-start gap-2">
            <span
              aria-hidden="true"
              className="h-12 w-24 rounded-control border border-rule-strong bg-sheet"
            />
            <span className="text-sm">control (4px)</span>
          </li>
          <li className="flex flex-col items-start gap-2">
            <span
              aria-hidden="true"
              className="h-12 w-24 rounded-button border border-rule-strong bg-sheet"
            />
            <span className="text-sm">button (6px)</span>
          </li>
          <li className="flex flex-col items-start gap-2">
            <span
              aria-hidden="true"
              className="h-12 w-24 rounded-panel border border-rule-strong bg-sheet"
            />
            <span className="text-sm">panel (8px)</span>
          </li>
          <li className="flex flex-col items-start gap-2">
            <span
              aria-hidden="true"
              className="flex size-6 items-center justify-center rounded-round bg-accent text-xs font-bold text-on-accent"
            >
              1
            </span>
            <span className="text-sm">round (number markers only)</span>
          </li>
        </ul>
      </section>
    </main>
  );
}
