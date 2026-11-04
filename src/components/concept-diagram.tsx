// One small diagram per shared concept, in a hand-drawn ink style (DESIGN.md
// section 10, concept diagrams). Token colours only, so they follow the theme.
// The caption says everything the drawing shows; the drawing is labelled by it.
// Drawn so far: variables, decisions and repetition (loops).

import { useId } from "react";

const stroke = "fill-none stroke-ink";
const label = "fill-ink font-sans text-small";

const drawings: Record<string, { caption: string; viewBox: string; art: React.ReactNode }> = {
  variables: {
    caption:
      "A variable: the name age keeps track of the value 17. Giving the variable a new value replaces the old one, and the name stays the same.",
    viewBox: "0 0 420 150",
    art: (
      <>
        <text x="22" y="40" className={label}>name</text>
        <path d="M24,60 C70,58 108,61 150,59 C153,76 151,96 152,110 C110,112 66,109 25,111 C23,94 26,76 24,60 Z" className={`${stroke}`} />
        <text x="62" y="92" className="fill-ink font-mono text-code">age</text>
        <path d="M156,84 C196,80 226,88 262,84" className={`${stroke}`} />
        <path d="M252,77 L264,84 L252,92" className={`${stroke}`} />
        <text x="272" y="40" className={label}>value</text>
        <path d="M272,58 C318,57 352,60 396,58 C398,76 397,96 397,111 C352,113 316,110 273,112 C271,94 274,76 272,58 Z" className="fill-primary-tint stroke-primary" />
        <text x="320" y="92" className="fill-ink font-mono text-code">17</text>
        <text x="172" y="134" className={label}>keeps track of</text>
      </>
    ),
  },
  decisions: {
    caption:
      "A decision: the program reaches a condition and goes down one of two paths, one when the condition is true and another when it is false. After either path it carries on with the same instructions.",
    viewBox: "0 0 460 170",
    art: (
      <>
        <path d="M14,86 C54,84 82,87 112,85" className={`${stroke}`} />
        <path d="M112,74 l12,11 -12,11 -12,-11z" className="fill-primary-tint stroke-primary" />
        <path d="M124,85 C152,60 172,42 214,38" className={`${stroke}`} />
        <path d="M124,85 C154,110 174,128 214,131" className={`${stroke}`} />
        <rect x="214" y="22" width="90" height="32" rx="4" className={`${stroke}`} />
        <rect x="214" y="115" width="90" height="32" rx="4" className={`${stroke}`} />
        <path d="M304,38 C334,40 352,60 372,84" className={`${stroke}`} />
        <path d="M304,131 C336,129 354,110 372,86" className={`${stroke}`} />
        <path d="M372,85 C400,86 424,84 452,85" className={`${stroke}`} />
        <text x="76" y="64" className={label}>condition</text>
        <text x="148" y="44" className={label}>true</text>
        <text x="148" y="142" className={label}>false</text>
        <text x="226" y="43" className={label}>one group</text>
        <text x="222" y="136" className={label}>other group</text>
        <text x="384" y="72" className={label}>carry on</text>
      </>
    ),
  },
  repetition: {
    caption:
      "A loop: the program checks whether to go round again. While the answer is yes it runs the group of instructions, one pass at a time, and comes back to the check. When the answer is no, it leaves the loop and carries on.",
    viewBox: "0 0 420 180",
    art: (
      <>
        <path d="M14,52 C40,51 60,53 86,52" className={`${stroke}`} />
        <path d="M98,40 l12,12 -12,12 -12,-12z" className="fill-primary-tint stroke-primary" />
        <text x="60" y="30" className={label}>go round again?</text>
        <path d="M98,64 C96,92 99,112 98,128" className={`${stroke}`} />
        <text x="106" y="98" className={label}>yes</text>
        <rect x="70" y="128" width="96" height="34" rx="4" className={`${stroke}`} />
        <text x="84" y="150" className={label}>one pass</text>
        <path d="M70,146 C30,148 22,110 28,84 C32,66 38,56 50,53" className={`${stroke}`} />
        <path d="M40,45 L52,52 L40,59" className={`${stroke}`} />
        <path d="M110,52 C200,51 300,53 400,52" className={`${stroke}`} />
        <text x="230" y="42" className={label}>no</text>
        <text x="318" y="76" className={label}>carry on</text>
      </>
    ),
  },
};

/** The diagram for a shared concept, or nothing if it has none yet. */
export function ConceptDiagram({ concept }: { concept: string }) {
  const id = useId();
  const drawing = drawings[concept];
  if (!drawing) return null;
  return (
    <figure data-concept-diagram={concept} className="mt-8">
      <svg role="img" aria-labelledby={id} viewBox={drawing.viewBox} className="w-full max-w-measure overflow-visible">
        {/* Line width in drawing units, so it scales with the drawing. */}
        <g strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
          {drawing.art}
        </g>
      </svg>
      <figcaption id={id} className="mt-3 max-w-measure text-ui text-ink-muted">
        {drawing.caption}
      </figcaption>
    </figure>
  );
}
