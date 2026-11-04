// A course as a trail of numbered stops (DESIGN.md section 9, course page and
// homepage). Down the page below 1024px, across it from 1024px. A published
// lesson is a link with a teal marker; a planned topic is plain text with a
// dashed marker and the word "Planned", never a link. Numbers are a real
// sequence: lessons build on the ones before them.

import Link from "next/link";
import { InlineText } from "@/components/prose";

export type TrailStop = { title: string; href?: string; goal?: string };

export function Trail({
  stops,
  label,
  showGoals = false,
  across = true,
  start = 1,
  dataAttribute,
}: {
  stops: TrailStop[];
  label: string;
  /** Shows each stop's goal under its title (always down the page) */
  showGoals?: boolean;
  /** Runs across the page from 1024px; false keeps it down the page at every width */
  across?: boolean;
  /** The first stop's number, for a trail that continues another */
  start?: number;
  /** A data attribute for tests, for example "data-lessons" */
  dataAttribute?: string;
}) {
  const wide = (classes: string) => (across ? classes : "");
  return (
    <ol aria-label={label} data-trail {...(dataAttribute ? { [dataAttribute]: "" } : {})} className={`flex flex-col ${wide("lg:grid lg:auto-cols-fr lg:grid-flow-col lg:gap-2")}`}>
      {stops.map((stop, index) => (
        <li
          key={`${index}-${stop.title}`}
          data-trail-stop={stop.href ? "published" : "planned"}
          className={`relative pb-8 pl-16 before:absolute before:top-12 before:bottom-0 before:left-6 before:border-l-2 before:border-rule last:before:hidden ${wide(
            "lg:pt-16 lg:pb-0 lg:pl-0 lg:text-center lg:before:top-6 lg:before:bottom-auto lg:before:left-1/2 lg:before:w-full lg:before:border-t-2 lg:before:border-l-0",
          )}`}
        >
          <span
            aria-hidden="true"
            className={`absolute top-0 left-0 z-10 flex size-12 items-center justify-center rounded-round border-2 bg-surface font-heading text-h3 ${wide("lg:left-1/2 lg:-translate-x-1/2")} ${
              stop.href ? "border-primary text-primary" : "border-dashed border-edge text-ink-muted"
            }`}
          >
            {start + index}
          </span>
          <span className="sr-only">{stop.href ? `Lesson ${start + index}: ` : `Planned topic ${start + index}: `}</span>
          {stop.href ? (
            <Link href={stop.href} className={`inline-flex min-h-12 items-center font-bold text-ink underline decoration-1 underline-offset-3 hover:decoration-2 ${across ? "text-ui lg:min-h-0 lg:text-small" : "text-h3 font-heading"}`}>
              {stop.title}
            </Link>
          ) : (
            <span className={`inline-flex min-h-12 flex-wrap items-center gap-2 text-ink-muted ${across ? "text-ui lg:min-h-0 lg:justify-center lg:text-small" : "text-body"}`}>
              {stop.title}
              <span className="rounded-chip bg-sunken px-2 py-1 text-small font-bold">Planned</span>
            </span>
          )}
          {showGoals && stop.goal && (
            <p className={`mt-1 max-w-measure text-body text-ink-muted ${wide("lg:hidden")}`}>
              <InlineText text={stop.goal} />
            </p>
          )}
        </li>
      ))}
    </ol>
  );
}
