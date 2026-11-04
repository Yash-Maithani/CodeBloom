"use client";

// The step rail (DESIGN.md section 7): the lesson's sections as numbered steps.
// From 1024px it stays beside the lesson and marks the section being read;
// below that it is a "Steps in this lesson" disclosure at the top. Every step
// is always on the page; the rail only links to them. It shows where you are,
// not what you have finished: nothing is stored.

import { useEffect, useState } from "react";

export type RailStep = { id: string; label: string };

function Steps({ steps, current }: { steps: RailStep[]; current: string | null }) {
  return (
    <ol className="flex flex-col gap-1">
      {steps.map((step, index) => {
        const isCurrent = step.id === current;
        return (
          <li key={step.id}>
            <a
              href={`#${step.id}`}
              aria-current={isCurrent ? "location" : undefined}
              className={`flex min-h-12 items-center gap-3 rounded-control border-l-4 px-3 py-2 text-ui transition-colors duration-fast hover:bg-surface ${
                isCurrent ? "border-primary bg-surface font-bold" : "border-transparent"
              }`}
            >
              <span
                aria-hidden="true"
                className={`flex size-8 shrink-0 items-center justify-center rounded-round border-2 font-heading text-small ${
                  isCurrent ? "border-primary text-primary" : "border-edge text-ink"
                }`}
              >
                {index + 1}
              </span>
              {step.label}
            </a>
          </li>
        );
      })}
    </ol>
  );
}

export function StepRail({
  steps,
  title,
  label = "Steps in this lesson",
  current: forced,
}: {
  steps: RailStep[];
  title: string;
  /** The navigation's name; a page with two rails needs two names */
  label?: string;
  /** gallery only */
  current?: string;
}) {
  const [current, setCurrent] = useState<string | null>(forced ?? steps[0]?.id ?? null);

  useEffect(() => {
    if (forced || !("IntersectionObserver" in window)) return;
    // The current step is the last section whose heading has passed the top third of the screen.
    const headings = steps.map((step) => document.getElementById(step.id)).filter((el): el is HTMLElement => el !== null);
    const observer = new IntersectionObserver(
      () => {
        const passed = headings.filter((el) => el.getBoundingClientRect().top < window.innerHeight / 3);
        setCurrent((passed.at(-1) ?? headings[0])?.id ?? null);
      },
      { rootMargin: "0px 0px -66% 0px" },
    );
    headings.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [steps, forced]);

  return (
    <nav aria-label={label} data-step-rail>
      <div className="hidden lg:sticky lg:top-6 lg:block">
        <p className="mb-2 px-3 text-small text-ink-muted">{title}</p>
        <Steps steps={steps} current={current} />
      </div>
      <details className="rounded-card border border-rule bg-surface lg:hidden">
        <summary className="min-h-12 cursor-pointer px-4 py-3 text-ui font-bold">Steps in this lesson</summary>
        <div className="px-2 pb-3">
          <Steps steps={steps} current={current} />
        </div>
      </details>
    </nav>
  );
}
