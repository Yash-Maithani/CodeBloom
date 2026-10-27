import { Info, Lightbulb } from "lucide-react";
import { InlineText } from "@/components/prose";
import type { Analogy } from "@/lib/lesson-types";

// Callouts (DESIGN.md section 7): each kind has an icon and a visible title.
// The Common mistake callout is part of the lesson page (lesson-parts.tsx),
// because it holds a code block.

// A "Note" callout: side information.
export function NoteCallout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 rounded-panel border border-l-3 border-rule border-l-rule-strong bg-sheet p-4">
      <span className="flex h-6 shrink-0 items-center">
        <Info aria-hidden="true" size={20} strokeWidth={1.75} />
      </span>
      <div>
        <p className="font-bold">{title}</p>
        <div className="mt-1">{children}</div>
      </div>
    </div>
  );
}

/** An "Analogy" callout: the comparison, then where it stops being accurate. */
export function AnalogyCallout({ analogy }: { analogy: Analogy }) {
  return (
    <aside aria-label={`Analogy: ${analogy.title}`} className="flex gap-3 rounded-panel border border-l-3 border-rule border-l-accent bg-accent-tint p-4">
      <span className="flex h-6 shrink-0 items-center">
        <Lightbulb aria-hidden="true" size={20} strokeWidth={1.75} className="text-accent" />
      </span>
      <div>
        <p className="font-bold">Analogy: {analogy.title}</p>
        <p className="mt-1">
          <InlineText text={analogy.text} />
        </p>
        <p className="mt-3">
          <strong>Where the comparison stops:</strong> <InlineText text={analogy.limit} />
        </p>
      </div>
    </aside>
  );
}
