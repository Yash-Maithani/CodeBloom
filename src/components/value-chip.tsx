// A value from a verified run, shown beside the line a note or explorer is
// about (DESIGN.md section 7, value chip). Never on every line. The edge
// border keeps it visible on a highlighted line, which has the same tint.
export function ValueChip({ children }: { children: React.ReactNode }) {
  return <span className="inline-block rounded-chip border border-edge bg-primary-tint px-2 py-1 font-mono text-small text-ink">{children}</span>;
}
