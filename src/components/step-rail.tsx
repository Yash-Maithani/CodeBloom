"use client";

// The step rail (DESIGN.md section 7): the lesson's sections as numbered steps.
// From 1024px it stays beside the lesson and marks the step being read; below
// that it is a slim bar, "Step N of M" and the step's title, that stays under
// the top of the screen and opens the full list. Every step is always on the
// page; the rail only links to them. It shows where you are, not what you have
// finished: "passed" means above the current step, and nothing is stored.
//
// Stickiness is set by the page through `className`: the element that sticks
// must be a direct child of the tall layout, or it has no room to move.

import { useEffect, useId, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { ChevronDown } from "lucide-react";

export type RailStep = { id: string; label: string };

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Scrolls to a step's heading and moves focus to it (smooth unless reduced motion). */
function goTo(id: string) {
  const heading = document.getElementById(id);
  if (!heading) return false;
  if (!heading.hasAttribute("tabindex")) heading.setAttribute("tabindex", "-1");
  heading.focus({ preventScroll: true });
  heading.scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth", block: "start" });
  history.pushState(null, "", `#${id}`);
  return true;
}

function Steps({ steps, current, onPick }: { steps: RailStep[]; current: string | null; onPick: (id: string) => void }) {
  const currentIndex = steps.findIndex((step) => step.id === current);
  return (
    <ol className="flex flex-col gap-1">
      {steps.map((step, index) => {
        const isCurrent = index === currentIndex;
        const passed = index < currentIndex;
        return (
          <li key={step.id}>
            <a
              href={`#${step.id}`}
              aria-current={isCurrent ? "step" : undefined}
              data-passed={passed ? "" : undefined}
              onClick={(event) => {
                if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
                event.preventDefault();
                onPick(step.id);
              }}
              className={`flex min-h-12 items-center gap-3 rounded-control border-l-4 px-3 py-2 text-ui transition-colors duration-fast hover:bg-surface ${
                isCurrent ? "border-primary bg-surface font-bold" : "border-transparent"
              }`}
            >
              <span
                aria-hidden="true"
                className={`flex size-8 shrink-0 items-center justify-center rounded-round border-2 font-heading text-small transition-colors duration-fast ${
                  isCurrent ? "border-primary text-primary" : passed ? "border-primary-tint bg-primary-tint text-ink" : "border-edge text-ink"
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
  className = "",
}: {
  steps: RailStep[];
  title: string;
  /** The navigation's name; a page with two rails needs two names */
  label?: string;
  /** gallery only */
  current?: string;
  /** layout and stickiness, from the page */
  className?: string;
}) {
  const [current, setCurrent] = useState<string | null>(forced ?? steps[0]?.id ?? null);
  const [open, setOpen] = useState(false);
  const picked = useRef<string | null>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (forced || !("IntersectionObserver" in window)) return;
    const headings = steps.map((step) => document.getElementById(step.id)).filter((el): el is HTMLElement => el !== null);
    const footer = document.querySelector("footer");
    // The current step is the last one whose heading has passed the top third
    // of the screen; at the very bottom of the page, the last heading in view.
    // After a click on a step, that step stays current until the learner scrolls.
    const update = () => {
      const line = window.innerHeight / 3;
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      const passed = headings.filter((el) => el.getBoundingClientRect().top < (atBottom ? window.innerHeight : line));
      const natural = (passed.at(-1) ?? headings[0])?.id ?? null;
      setCurrent(picked.current ?? natural);
    };
    const release = () => {
      picked.current = null;
    };
    const observer = new IntersectionObserver(update, { rootMargin: "0px 0px -66% 0px" });
    headings.forEach((el) => observer.observe(el));
    const bottom = new IntersectionObserver(update, { threshold: [0, 1] });
    if (footer) bottom.observe(footer);
    const events = ["wheel", "touchmove", "keydown"] as const;
    events.forEach((name) => window.addEventListener(name, release, { passive: true }));
    return () => {
      observer.disconnect();
      bottom.disconnect();
      events.forEach((name) => window.removeEventListener(name, release));
    };
  }, [steps, forced]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      toggle.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function pick(id: string) {
    // Close the list first, so the scroll target is measured on the final layout.
    flushSync(() => setOpen(false));
    if (forced) return;
    picked.current = id;
    setCurrent(id);
    goTo(id);
  }

  const index = Math.max(0, steps.findIndex((step) => step.id === current));

  return (
    <nav aria-label={label} data-step-rail className={className}>
      <div data-rail-full className="rail-scroll hidden lg:block">
        <p className="mb-2 px-3 text-small text-ink-muted">{title}</p>
        <Steps steps={steps} current={current} onPick={pick} />
      </div>
      <div data-rail-bar className="relative -mx-4 border-b border-rule bg-canvas px-4 md:-mx-6 md:px-6 lg:hidden">
        <button
          ref={toggle}
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((value) => !value)}
          className="flex min-h-12 w-full items-center gap-3 py-2 text-left text-ui"
        >
          <span className="shrink-0 text-small text-ink-muted">
            Step {index + 1} of {steps.length}
          </span>
          <span className="min-w-0 flex-1 truncate font-bold">{steps[index]?.label}</span>
          <ChevronDown aria-hidden="true" size={20} strokeWidth={1.75} className={`shrink-0 transition-transform duration-base ${open ? "rotate-180" : ""}`} />
        </button>
        <div id={panelId} hidden={!open} className="rail-panel absolute inset-x-0 top-full border-b border-rule bg-canvas px-2 pb-3 shadow-float md:px-4">
          <Steps steps={steps} current={current} onPick={pick} />
        </div>
      </div>
    </nav>
  );
}
