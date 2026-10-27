"use client";

// Interactive practice questions (SPEC.md FR-P1 to FR-P5, DESIGN.md "Quiz and
// feedback"). A client component only for what needs the browser: choosing an
// option, checking it, revealing hints one at a time, and counting the
// questions answered correctly on this page.
//
// Honest by design: nothing is stored. The count is what happened on this page
// during this visit, and it says so. The code blocks and solutions are rendered
// on the server and passed in, so this component sends no lesson logic to the
// browser beyond the options, hints and feedback text.

import { useId, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { CircleCheck, CircleX } from "lucide-react";
import { OutputLines } from "@/components/output-lines";
import { InlineText } from "@/components/prose";
import { buttonStyles } from "@/components/styles";
import type { RenderedOption } from "@/lib/lessons";

export type PracticeOption = RenderedOption;

export type PracticeItem = {
  question: string;
  options: PracticeOption[];
  hints: string[];
  /** Server-rendered code block, for predict-the-output questions */
  code?: ReactNode;
  /** Server-rendered "Show solution" disclosure */
  solution: ReactNode;
};

// `attempt` changes on every check, so checking again (even the same option)
// replaces the message and screen readers announce it again.
/** For useSyncExternalStore: "is React running in the browser?" never changes after hydration. */
const noSubscription = () => () => {};

type Feedback = { kind: "correct" | "wrong"; why: string; attempt: number } | { kind: "empty"; attempt: number } | null;

function Question({ item, number, onCorrect }: { item: PracticeItem; number: number; onCorrect: () => void }) {
  const name = useId();
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [answered, setAnswered] = useState(false);
  const [hintsShown, setHintsShown] = useState(0);
  const [attempt, setAttempt] = useState(0);
  // The buttons only work once React has taken over the page. Until then they
  // are kept invisible and out of the tab order (their space is reserved, so
  // nothing moves), so no control is shown that does nothing.
  const ready = useSyncExternalStore(noSubscription, () => true, () => false);
  const checkRef = useRef<HTMLButtonElement>(null);

  function choose(index: number) {
    setSelected(index);
    // Feedback belongs to the option that was checked. A new choice clears it,
    // so old feedback is never shown or announced next to a different option.
    setFeedback(null);
  }

  function check() {
    const next = attempt + 1;
    setAttempt(next);
    if (selected === null) {
      setFeedback({ kind: "empty", attempt: next });
      return;
    }
    const option = item.options[selected];
    setFeedback({ kind: option.correct ? "correct" : "wrong", why: option.why, attempt: next });
    if (option.correct && !answered) {
      setAnswered(true);
      onCorrect();
    }
  }

  function showHint() {
    const next = hintsShown + 1;
    setHintsShown(next);
    // The hint button disappears after the last hint. Focus moves to Check
    // answer, the natural next step; the hint itself is announced by the live
    // list below, once.
    if (next === item.hints.length) requestAnimationFrame(() => checkRef.current?.focus());
  }

  return (
    <li data-question={number}>
      {/* min-w-0: a fieldset is never narrower than its content by default, so the
          code block inside it would widen the whole page on a phone. */}
      <fieldset className="min-w-0">
        <legend className="max-w-measure">
          <strong>Question {number}.</strong> <InlineText text={item.question} />
        </legend>
        {item.code && <div className="mt-4">{item.code}</div>}
        <div className="mt-4 flex max-w-lesson flex-col gap-2">
          {item.options.map((option, index) => (
            <label
              key={index}
              className="flex min-w-0 cursor-pointer items-start gap-3 rounded-control border border-rule-strong bg-sheet px-4 py-3 transition-colors hover:bg-accent-tint has-[:checked]:border-2 has-[:checked]:border-accent has-[:checked]:bg-accent-tint"
            >
              <input
                type="radio"
                name={name}
                value={index}
                checked={selected === index}
                onChange={() => choose(index)}
                className="mt-1 size-4 shrink-0 accent-accent"
              />
              {option.output ? <OutputLines text={option.text} empty="Nothing is printed" /> : <InlineText text={option.text} />}
            </label>
          ))}
        </div>
      </fieldset>

      <div className={`mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 ${ready ? "" : "invisible"}`} inert={!ready}>
        <button ref={checkRef} type="button" onClick={check} className={buttonStyles.primary}>
          Check answer
        </button>
        {hintsShown < item.hints.length && (
          <button type="button" onClick={showHint} className={buttonStyles.secondary}>
            Show hint {hintsShown + 1} of {item.hints.length}
          </button>
        )}
        {answered && (
          <p data-status className="flex items-center gap-2 text-sm font-bold text-success">
            <CircleCheck aria-hidden="true" size={20} strokeWidth={1.75} className="shrink-0" />
            Answered correctly
          </p>
        )}
      </div>

      {/* Feedback is announced through a polite live region (DESIGN.md). The
          region stays in the page; its content changes after each check. */}
      <div role="status" data-feedback-region className="mt-4 max-w-measure">
        {feedback?.kind === "empty" && <p key={feedback.attempt}>Choose an answer first.</p>}
        {feedback && feedback.kind !== "empty" && (
          <div
            key={feedback.attempt}
            data-feedback={feedback.kind}
            className={`flex gap-3 rounded-panel border border-l-3 border-rule p-4 ${
              feedback.kind === "correct" ? "border-l-success bg-success-tint" : "border-l-error bg-error-tint"
            }`}
          >
            <span className="flex h-6 shrink-0 items-center">
              {feedback.kind === "correct" ? (
                <CircleCheck aria-hidden="true" size={20} strokeWidth={1.75} className="text-success" />
              ) : (
                <CircleX aria-hidden="true" size={20} strokeWidth={1.75} className="text-error" />
              )}
            </span>
            <div>
              <p className="font-bold">{feedback.kind === "correct" ? "Correct" : "Not quite"}</p>
              <p className="mt-1">
                <InlineText text={feedback.why} />
              </p>
              {feedback.kind === "wrong" && hintsShown < item.hints.length && (
                <p className="mt-2 text-sm">Try again, or show a hint.</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Always in the page, empty at first: a live region added together with
          its content is often not announced. */}
      <ol aria-live="polite" data-hints className={`flex max-w-measure flex-col gap-2 ${hintsShown > 0 ? "mt-4" : ""}`}>
        {item.hints.slice(0, hintsShown).map((hint, index) => (
          <li key={index} className="rounded-control border border-l-3 border-rule border-l-rule-strong bg-sheet px-4 py-2">
            <strong>Hint {index + 1}:</strong> <InlineText text={hint} />
          </li>
        ))}
      </ol>

      <div className="mt-4">{item.solution}</div>
    </li>
  );
}

export function PracticeSet({ items }: { items: PracticeItem[] }) {
  const [correct, setCorrect] = useState(0);
  return (
    <>
      <p data-practice-summary className="mt-2 text-sm text-ink-muted">
        {correct} of {items.length} {items.length === 1 ? "question" : "questions"} answered correctly on this page
      </p>
      <ol className="mt-8 flex flex-col gap-12">
        {items.map((item, index) => (
          <Question key={index} item={item} number={index + 1} onCorrect={() => setCorrect((count) => count + 1)} />
        ))}
      </ol>
    </>
  );
}
