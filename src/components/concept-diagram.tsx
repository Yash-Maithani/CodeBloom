// One small diagram per shared concept, in a hand-drawn ink style (DESIGN.md
// section 10, concept diagrams). Token colours only, so they follow the theme.
// The caption says everything the drawing shows; the drawing is labelled by it.
//
// Readable at 360px: every drawing is 300 units wide with labels in the `ui`
// size (16 units), and is shown at 1.2 times its size where there is room, so
// on a phone (about 296px for the drawing) labels stay at about 16px and on a
// wide screen they are about 19px.

import { useId } from "react";

const W = 300;
const ink = "fill-none stroke-ink";
const tint = "fill-primary-tint stroke-primary";
const label = "fill-ink font-sans text-ui";
const code = "fill-ink font-mono text-code";

/** A box whose sides bow a little, like a pen line. */
function Box({ x, y, w, h, tinted = false }: { x: number; y: number; w: number; h: number; tinted?: boolean }) {
  const d = `M${x},${y + 1} C${x + w * 0.35},${y - 1} ${x + w * 0.7},${y + 2} ${x + w},${y} C${x + w + 1},${y + h * 0.4} ${x + w - 1},${y + h * 0.75} ${x + w + 1},${y + h} C${x + w * 0.65},${y + h + 2} ${x + w * 0.3},${y + h - 1} ${x},${y + h + 1} C${x - 1},${y + h * 0.6} ${x + 1},${y + h * 0.3} ${x},${y + 1} Z`;
  return <path d={d} className={tinted ? tint : ink} />;
}

/** A slightly curved line with an open arrowhead at the end. */
function Arrow({ from, to, bend = 4 }: { from: [number, number]; to: [number, number]; bend?: number }) {
  const [x1, y1] = from;
  const [x2, y2] = to;
  const mx = (x1 + x2) / 2 + (y2 - y1 === 0 ? 0 : bend);
  const my = (y1 + y2) / 2 + (x2 - x1 === 0 ? 0 : bend);
  const angle = Math.atan2(y2 - my, x2 - mx);
  const head = (turn: number) => `${x2 - 10 * Math.cos(angle + turn)},${y2 - 10 * Math.sin(angle + turn)}`;
  return (
    <>
      <path d={`M${x1},${y1} Q${mx},${my} ${x2},${y2}`} className={ink} />
      <path d={`M${head(0.45)} L${x2},${y2} L${head(-0.45)}`} className={ink} />
    </>
  );
}

function Diamond({ cx, cy, r = 20 }: { cx: number; cy: number; r?: number }) {
  return <path d={`M${cx},${cy - r} L${cx + r + 1},${cy} L${cx},${cy + r} L${cx - r},${cy + 1} Z`} className={tint} />;
}

function Text({ x, y, children, mono = false, anchor = "start" }: { x: number; y: number; children: React.ReactNode; mono?: boolean; anchor?: "start" | "middle" | "end" }) {
  return (
    <text x={x} y={y} textAnchor={anchor} className={mono ? code : label}>
      {children}
    </text>
  );
}

/** Boxes in a row with an index under each, for collections and strings. */
function Row({ items, x, y, w, h = 44 }: { items: string[]; x: number; y: number; w: number; h?: number }) {
  return (
    <>
      {items.map((item, index) => (
        <g key={index}>
          <Box x={x + index * w} y={y} w={w - 6} h={h} tinted={index === 0} />
          <Text x={x + index * w + (w - 6) / 2} y={y + h / 2 + 6} mono anchor="middle">{item}</Text>
          <Text x={x + index * w + (w - 6) / 2} y={y + h + 24} mono anchor="middle">{index}</Text>
        </g>
      ))}
    </>
  );
}

const drawings: Record<string, { caption: string; height: number; art: React.ReactNode }> = {
  "first-program": {
    caption:
      "A program runs: the computer follows the instructions one after another, from the first to the last. An instruction that prints puts text in the output, which shows what the program did.",
    height: 200,
    art: (
      <>
        {["instruction", "print text", "instruction"].map((text, index) => (
          <g key={index}>
            <Text x={8} y={36 + index * 64} mono>{index + 1}</Text>
            <Box x={28} y={10 + index * 64} w={140} h={40} tinted={index === 1} />
            <Text x={98} y={36 + index * 64} anchor="middle">{text}</Text>
            {index < 2 && <Arrow from={[98, 52 + index * 64]} to={[98, 72 + index * 64]} />}
          </g>
        ))}
        <Arrow from={[172, 94]} to={[204, 94]} bend={0} />
        <Text x={250} y={70} anchor="middle">output</Text>
        <Box x={208} y={76} w={84} h={38} />
        <Text x={250} y={100} anchor="middle" mono>text</Text>
      </>
    ),
  },
  variables: {
    caption:
      "A variable: the name age keeps track of the value 17. Giving the variable a new value replaces the old one, and the name stays the same.",
    height: 140,
    art: (
      <>
        <Text x={65} y={26} anchor="middle">name</Text>
        <Box x={10} y={38} w={110} h={50} />
        <Text x={65} y={69} mono anchor="middle">age</Text>
        <Arrow from={[126, 63]} to={[174, 63]} />
        <Text x={235} y={26} anchor="middle">value</Text>
        <Box x={180} y={38} w={110} h={50} tinted />
        <Text x={235} y={69} mono anchor="middle">17</Text>
        <Text x={150} y={122} anchor="middle">keeps track of</Text>
      </>
    ),
  },
  "input-output": {
    caption:
      "Input and output: a person types, and the typed characters reach the program as input while it runs. The program responds and shows its output on the screen.",
    height: 236,
    art: (
      <>
        <Box x={60} y={8} w={180} h={40} />
        <Text x={150} y={34} anchor="middle">a person types</Text>
        <Arrow from={[150, 50]} to={[150, 92]} />
        <Text x={160} y={77}>input</Text>
        <Box x={60} y={96} w={180} h={42} tinted />
        <Text x={150} y={123} anchor="middle">the program</Text>
        <Arrow from={[150, 140]} to={[150, 182]} />
        <Text x={160} y={167}>output</Text>
        <Box x={60} y={186} w={180} h={40} />
        <Text x={150} y={212} anchor="middle">the screen</Text>
      </>
    ),
  },
  arithmetic: {
    caption:
      "The order of operations: in 2 + 3 * 4 the multiplication is done first, giving 2 + 12, and then the addition, giving 14. Brackets change the order: (2 + 3) * 4 is 20.",
    height: 196,
    art: (
      <>
        <rect x={142} y={12} width={58} height={26} rx={3} className="fill-mark" />
        <Text x={150} y={31} mono anchor="middle">2 + 3 * 4</Text>
        <Arrow from={[150, 44]} to={[150, 80]} />
        <Text x={162} y={67}>multiply first</Text>
        <rect x={157} y={86} width={28} height={26} rx={3} className="fill-mark" />
        <Text x={150} y={105} mono anchor="middle">2 + 12</Text>
        <Arrow from={[150, 118]} to={[150, 154]} />
        <Text x={162} y={141}>then add</Text>
        <Box x={120} y={158} w={60} h={34} tinted />
        <Text x={150} y={181} mono anchor="middle">14</Text>
      </>
    ),
  },
  decisions: {
    caption:
      "A decision: the program reaches a condition and goes down one of two paths, one when the condition is true and another when it is false. After either path it carries on with the same instructions.",
    height: 262,
    art: (
      <>
        <Arrow from={[150, 4]} to={[150, 36]} />
        <Diamond cx={150} cy={58} />
        <Text x={178} y={50}>condition</Text>
        <Arrow from={[130, 62]} to={[78, 108]} bend={-6} />
        <Text x={60} y={84} anchor="end">true</Text>
        <Arrow from={[170, 62]} to={[222, 108]} bend={6} />
        <Text x={244} y={90}>false</Text>
        <Box x={15} y={112} w={120} h={44} />
        <Text x={75} y={139} anchor="middle">one group</Text>
        <Box x={165} y={112} w={120} h={44} />
        <Text x={225} y={139} anchor="middle">other group</Text>
        <Arrow from={[75, 160]} to={[146, 204]} bend={6} />
        <Arrow from={[225, 160]} to={[154, 204]} bend={-6} />
        <Arrow from={[150, 208]} to={[150, 238]} />
        <Text x={162} y={232}>carry on</Text>
      </>
    ),
  },
  "several-choices": {
    caption:
      "Several choices: the program checks the conditions in order, from the top. The first one that is true runs its group and the rest are skipped. If none is true, the otherwise group runs. Then the program carries on.",
    height: 288,
    art: (
      <>
        {[0, 1].map((index) => (
          <g key={index}>
            <Box x={8} y={8 + index * 82} w={132} h={40} tinted />
            <Text x={74} y={34 + index * 82} anchor="middle">condition {index + 1}?</Text>
            <Arrow from={[142, 28 + index * 82]} to={[184, 28 + index * 82]} bend={0} />
            <Text x={163} y={20 + index * 82} anchor="middle">true</Text>
            <Box x={188} y={8 + index * 82} w={86} h={40} />
            <Text x={231} y={34 + index * 82} anchor="middle">group {index + 1}</Text>
            <Arrow from={[74, 50 + index * 82]} to={[74, 86 + index * 82]} />
            <Text x={84} y={73 + index * 82}>false</Text>
            <path d={`M276,${28 + index * 82} C284,${28 + index * 82} 290,${30 + index * 82} 292,${40 + index * 82}`} className={ink} />
          </g>
        ))}
        <Box x={8} y={172} w={132} h={40} />
        <Text x={74} y={198} anchor="middle">otherwise</Text>
        <path d="M292,40 C293,110 291,180 292,236" className={ink} />
        <Arrow from={[292, 236]} to={[256, 248]} bend={0} />
        <Arrow from={[74, 214]} to={[74, 240]} />
        <Box x={8} y={244} w={244} h={36} />
        <Text x={130} y={268} anchor="middle">carry on</Text>
      </>
    ),
  },
  "combined-conditions": {
    caption:
      "Combining conditions: A and B is true only when both are true. A or B is true when at least one of them is true. not A is the opposite of A. C, C++ and Java usually write and, or and not as &&, || and !.",
    height: 222,
    art: (
      <>
        {[
          ["A and B", "true when both are true"],
          ["A or B", "true when at least one is"],
          ["not A", "the opposite of A"],
        ].map(([expression, meaning], index) => (
          <g key={expression}>
            <Box x={8} y={8 + index * 72} w={284} h={62} />
            <rect x={20} y={16 + index * 72} width={expression.length * 10 + 16} height={24} rx={3} className="fill-primary-tint" />
            <Text x={28} y={33 + index * 72} mono>{expression}</Text>
            <Text x={22} y={60 + index * 72}>{meaning}</Text>
          </g>
        ))}
      </>
    ),
  },
  repetition: {
    caption:
      "A loop: the program checks whether to go round again. While the answer is yes it runs the group of instructions, one pass at a time, and comes back to the check. When the answer is no, it leaves the loop and carries on.",
    height: 232,
    art: (
      <>
        <Arrow from={[110, 4]} to={[110, 36]} />
        <Diamond cx={110} cy={58} />
        <Text x={140} y={40}>go round again?</Text>
        <Arrow from={[110, 80]} to={[110, 126]} />
        <Text x={120} y={108}>yes</Text>
        <Box x={55} y={130} w={110} h={44} />
        <Text x={110} y={157} anchor="middle">one pass</Text>
        <path d="M53,152 C22,152 16,118 18,90 C20,66 44,58 76,58" className={ink} />
        <Arrow from={[76, 58]} to={[88, 58]} bend={0} />
        <path d="M132,58 C180,57 220,59 252,58 C258,90 256,150 256,192" className={ink} />
        <Arrow from={[256, 180]} to={[256, 196]} bend={0} />
        <Text x={196} y={80}>no</Text>
        <Text x={256} y={220} anchor="middle">carry on</Text>
      </>
    ),
  },
  functions: {
    caption:
      "A function: your code calls the function by its name and passes it arguments. The function's instructions run, and it can give a return value back to the code that called it. Writing a function does not run it; calling it does.",
    height: 170,
    art: (
      <>
        <Box x={8} y={20} w={92} h={120} />
        <Text x={54} y={50} anchor="middle">your</Text>
        <Text x={54} y={70} anchor="middle">code</Text>
        <Text x={54} y={100} anchor="middle" mono>call</Text>
        <Text x={150} y={22} anchor="middle">arguments</Text>
        <Arrow from={[104, 42]} to={[196, 42]} bend={0} />
        <Box x={200} y={20} w={92} h={120} tinted />
        <Text x={246} y={46} anchor="middle">function</Text>
        {[66, 86, 106].map((y) => (
          <path key={y} d={`M216,${y} C236,${y - 1} 256,${y + 1} 276,${y}`} className={ink} />
        ))}
        <Arrow from={[196, 118]} to={[104, 118]} bend={0} />
        <Text x={150} y={140} anchor="middle">return</Text>
        <Text x={150} y={160} anchor="middle">value</Text>
      </>
    ),
  },
  "many-values": {
    caption:
      "A collection: many items kept in order under one name, here scores. Each item has an index, its position. The first index is 0, so the last of four items has index 3.",
    height: 156,
    art: (
      <>
        <Text x={22} y={22} mono>scores</Text>
        <Row items={["8", "5", "9", "7"]} x={22} y={34} w={66} />
        <Text x={150} y={148} anchor="middle">index: the position, from 0</Text>
      </>
    ),
  },
  text: {
    caption:
      "A string: a sequence of characters, here the five characters of Hello. Like the items of a collection, each character has a position, and the first position is 0.",
    height: 150,
    art: (
      <>
        <Text x={25} y={22} mono>&quot;Hello&quot;</Text>
        <Row items={["H", "e", "l", "l", "o"]} x={25} y={34} w={52} />
        <Text x={150} y={142} anchor="middle">one character per position</Text>
      </>
    ),
  },
  "key-value": {
    caption:
      "A key-value collection: each value is stored under a key, such as the age 36 under the name Ada. The program finds a value by asking for its key, not its position, and each key appears only once.",
    height: 170,
    art: (
      <>
        <Text x={65} y={22} anchor="middle">key</Text>
        <Text x={235} y={22} anchor="middle">value</Text>
        {[
          ["\"Ada\"", "36"],
          ["\"Grace\"", "45"],
        ].map(([key, value], index) => (
          <g key={key}>
            <Box x={10} y={34 + index * 54} w={110} h={40} tinted={index === 0} />
            <Text x={65} y={60 + index * 54} mono anchor="middle">{key}</Text>
            <Arrow from={[124, 54 + index * 54]} to={[176, 54 + index * 54]} bend={0} />
            <Box x={180} y={34 + index * 54} w={110} h={40} tinted={index === 0} />
            <Text x={235} y={60 + index * 54} mono anchor="middle">{value}</Text>
          </g>
        ))}
        <Text x={150} y={160} anchor="middle">each key appears once</Text>
      </>
    ),
  },
  files: {
    caption:
      "A file keeps text after the program ends. A program opens the file, writes text to it or reads text from it, and closes it. A later run can read back what an earlier run wrote.",
    height: 230,
    art: (
      <>
        <Box x={8} y={20} w={112} h={44} />
        <Text x={64} y={47} anchor="middle">a program</Text>
        <Arrow from={[124, 42]} to={[184, 42]} bend={0} />
        <Text x={154} y={32} anchor="middle">write</Text>
        <path d="M190,10 L264,10 L290,36 L290,110 L190,110 Z" className={tint} />
        <path d="M264,10 L264,36 L290,36" className={ink} />
        <Text x={240} y={70} anchor="middle">file</Text>
        <Arrow from={[200, 114]} to={[124, 156]} bend={-8} />
        <Text x={176} y={154}>read</Text>
        <Box x={8} y={140} w={112} h={44} />
        <Text x={64} y={167} anchor="middle">a later run</Text>
        <Text x={150} y={218} anchor="middle">open, use, close</Text>
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
      <svg
        role="img"
        aria-labelledby={id}
        viewBox={`0 0 ${W} ${drawing.height}`}
        width={W * 1.2}
        height={drawing.height * 1.2}
        className="h-auto max-w-full overflow-visible"
      >
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

/** Every concept that has a diagram, for the gallery and tests. */
export const DIAGRAM_CONCEPTS = Object.keys(drawings);
