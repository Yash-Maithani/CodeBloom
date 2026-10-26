import { Info } from "lucide-react";

// A "Note" callout (DESIGN.md section 7, callouts): side information with an
// icon and a visible title. The other two kinds, Analogy and Common mistake,
// are added when lessons need them.
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
