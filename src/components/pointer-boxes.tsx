// The C pointer boxes (DESIGN.md section 7, explorer): one box per variable
// with its value before and after writing through the pointer, and an arrow
// from the pointer to the variable it points to. The target and every value
// come from the verified output (src/lib/explorer-data.ts); no address is ever
// shown, because addresses change on every run and cannot be verified.

import type { PointerBox } from "@/lib/explorer-data";

export function PointerBoxes({ pointer, target, boxes }: { pointer: string; target: string; boxes: PointerBox[] }) {
  const columns = boxes.length;
  const targetIndex = boxes.findIndex((box) => box.name === target);
  return (
    <div data-pointer-boxes data-pointer-target={target}>
      <p className="text-small font-bold text-ink-muted">Memory after the program ran</p>
      <div aria-hidden="true" className="mt-2">
        <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
          {boxes.map((box) => {
            const isTarget = box.name === target;
            return (
              <div key={box.name} data-pointer-box={box.name} className="flex flex-col items-center">
                <span className="font-mono text-code font-bold">{box.name}</span>
                <span
                  className={`mt-1 flex min-h-16 w-full flex-col items-center justify-center rounded-control border-2 transition-colors duration-base ${
                    isTarget ? "border-primary bg-primary-tint" : "border-edge bg-surface"
                  }`}
                >
                  <span className="font-mono text-h3 font-bold">{box.after}</span>
                  {box.before !== box.after && <span className="text-small text-ink-muted">was {box.before}</span>}
                </span>
              </div>
            );
          })}
        </div>
        {/* The arrows: one per box, only the one to the target is shown. The
            drawing stretches with the row, so the lines keep a fixed stroke. */}
        <div className="relative h-12">
          <svg viewBox={`0 0 ${columns * 2} 2`} preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible">
            {boxes.map((box, index) => (
              <line
                key={box.name}
                x1={columns}
                y1={2}
                x2={index * 2 + 1}
                y2={0.2}
                vectorEffect="non-scaling-stroke"
                className={`stroke-primary transition-opacity duration-base ${index === targetIndex ? "opacity-100" : "opacity-0"}`}
                strokeWidth={2.5}
              />
            ))}
          </svg>
          <div className="absolute inset-x-0 top-0 grid" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
            {boxes.map((box, index) => (
              <svg key={box.name} viewBox="0 0 12 8" className={`mx-auto -mt-1 w-3 fill-primary transition-opacity duration-base ${index === targetIndex ? "opacity-100" : "opacity-0"}`}>
                <path d="M6 0 L12 8 L0 8 Z" />
              </svg>
            ))}
          </div>
        </div>
        <div className="grid" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
          <div className="flex flex-col items-center" style={{ gridColumnStart: Math.ceil(columns / 2) }}>
            <span className="flex min-h-12 w-full items-center justify-center rounded-control border-2 border-primary bg-surface font-mono text-code">
              &amp;{target}
            </span>
            <span className="mt-1 font-mono text-code font-bold">{pointer}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
