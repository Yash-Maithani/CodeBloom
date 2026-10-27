// The parts of a lesson page (DESIGN.md section 7): examples, common mistakes,
// practice questions, the recap and the previous and next links. All render on
// the server; only the code block inside them is interactive.

import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import { CodeBlock } from "@/components/code-block";
import { OutputPanel } from "@/components/output-panel";
import { PracticeSet, type PracticeItem } from "@/components/practice-set";
import { InlineText } from "@/components/prose";
import { StepThrough, TraceTable } from "@/components/step-through";
import { backLinkStyles, buttonStyles } from "@/components/styles";
import type { LoadedLesson, RenderedExample, RenderedVisual } from "@/lib/lessons";
import { plainText as plain } from "@/lib/prose";

export function LessonCodeBlock({
  example,
  regionLabel,
  mistake,
  showOutput,
}: {
  example: RenderedExample;
  regionLabel: string;
  mistake?: boolean;
  showOutput?: boolean;
}) {
  return (
    <CodeBlock
      caption={example.caption}
      regionLabel={regionLabel}
      languageLabel={example.languageLabel}
      code={example.code}
      lines={example.lines}
      notes={example.notes}
      expectedOutput={example.result}
      kind={example.kind}
      mistake={mistake}
      showOutput={showOutput}
      exampleId={example.id}
    />
  );
}

function Labeled({ label, text }: { label: string; text: string }) {
  return (
    <p className="mt-4 max-w-measure">
      <strong>{label}</strong> <InlineText text={text} />
    </p>
  );
}

export function Mistakes({ lesson }: { lesson: LoadedLesson }) {
  return lesson.mistakes.map((mistake) => {
    const language = mistake.rendered.languageLabel;
    return (
      <section
        key={mistake.rendered.id}
        aria-label={`Common mistake: ${plain(mistake.title)}`}
        className="mt-8 rounded-panel border border-l-3 border-rule border-l-warning bg-warning-tint p-4 md:p-6"
      >
        <h3 className="flex items-start gap-3 font-heading text-xl font-semibold">
          <TriangleAlert aria-hidden="true" size={20} strokeWidth={1.75} className="mt-1 shrink-0 text-warning" />
          <InlineText text={mistake.title} />
        </h3>
        <div className="mt-4">
          <LessonCodeBlock
            example={mistake.rendered}
            regionLabel={`${language} code with a mistake: ${plain(mistake.title)}`}
            mistake
          />
        </div>
        <Labeled label="What happens:" text={mistake.whatHappens} />
        {mistake.howToRead && <Labeled label="How to read it:" text={mistake.howToRead} />}
        {mistake.whyEasyToMiss && <Labeled label="Why it is easy to miss:" text={mistake.whyEasyToMiss} />}
        <Labeled label="Fix:" text={mistake.fix} />
        {mistake.renderedFix && (
          <div className="mt-4">
            <LessonCodeBlock example={mistake.renderedFix} regionLabel={`${language} code: the fix for ${plain(mistake.title)}`} />
          </div>
        )}
      </section>
    );
  });
}

const practiceLabel = (language: string, index: number) => `${language} code for practice question ${index + 1}`;

/** Practice questions: the code and solutions are rendered here on the server,
 *  the interaction happens in the client component PracticeSet. */
export function Practice({ lesson }: { lesson: LoadedLesson }) {
  const language = lesson.course.name;
  const items: PracticeItem[] = lesson.practice.map((question, index) => {
    const answer = question.options.find((option) => option.correct)!;
    return {
      question: question.source.question,
      hints: question.source.hints,
      options: question.options,
      code: question.rendered && (
        <LessonCodeBlock example={question.rendered} regionLabel={practiceLabel(language, index)} showOutput={false} />
      ),
      solution: (
        // Native disclosure: works with Enter and Space and is announced as
        // open or closed, with no JavaScript. Available at any time (FR-P4).
        <details className="group" data-solution={index + 1}>
          <summary className={`${buttonStyles.secondary} cursor-pointer list-none [&::-webkit-details-marker]:hidden`}>
            <span className="group-open:hidden">Show solution</span>
            <span className="hidden group-open:inline">Hide solution</span>
          </summary>
          <div className="mt-4 max-w-lesson">
            {question.rendered ? (
              <OutputPanel kind={question.rendered.kind} text={question.rendered.result} of={practiceLabel(language, index)} />
            ) : (
              <p className="max-w-measure">
                <strong>Answer:</strong> <InlineText text={answer.text} />
              </p>
            )}
            <p className="mt-4 max-w-measure">
              <InlineText text={question.source.explanation} />
            </p>
          </div>
        </details>
      ),
    };
  });
  return <PracticeSet items={items} />;
}

const navLinkStyles =
  "flex h-full flex-col gap-1 rounded-panel border border-rule-strong bg-sheet p-4 transition-colors hover:bg-accent-tint";

export function LessonNav({
  lesson,
  previous,
  next,
}: {
  lesson: LoadedLesson;
  previous?: LoadedLesson;
  next?: LoadedLesson;
}) {
  const courseName = lesson.course.name;
  return (
    <nav aria-label="Lesson navigation" className="mt-16 border-t border-rule pt-8">
      <ul className="grid max-w-lesson gap-4 sm:grid-cols-2">
        {previous && (
          <li>
            <Link href={previous.href} rel="prev" className={navLinkStyles}>
              <span className="text-sm text-ink-muted">Previous lesson</span>
              <span className="font-bold text-accent underline decoration-1 underline-offset-3">{previous.source.title}</span>
            </Link>
          </li>
        )}
        <li className="sm:col-start-2">
          {next ? (
            <Link href={next.href} rel="next" className={`${navLinkStyles} sm:text-right`}>
              <span className="text-sm text-ink-muted">Next lesson</span>
              <span className="font-bold text-accent underline decoration-1 underline-offset-3">{next.source.title}</span>
            </Link>
          ) : (
            <div className="p-4">
              <p>This is the last published lesson in the {courseName} course.</p>
              <Link href={`/courses/${lesson.course.slug}`} className={backLinkStyles}>
                Back to the {courseName} course
              </Link>
            </div>
          )}
        </li>
      </ul>
    </nav>
  );
}

/** A step-through visual with its text equivalent (DESIGN.md "Step-through visuals"). */
export function VisualBlock({ visual }: { visual: RenderedVisual }) {
  const headingId = `visual-${visual.id}`;
  return (
    <section aria-labelledby={headingId} data-visual={visual.id} className="max-w-lesson">
      <h3 id={headingId} className="font-heading text-xl font-semibold">
        <InlineText text={visual.title} />
      </h3>
      <p className="mt-2 max-w-measure text-sm text-ink-muted">
        Move one line at a time. Every value shown comes from really running this program.
      </p>
      <div className="mt-4">
        <StepThrough visual={visual} />
      </div>
      <details data-trace-details className="mt-4">
        <summary className={`${buttonStyles.secondary} cursor-pointer list-none [&::-webkit-details-marker]:hidden`}>
          All steps as a table
        </summary>
        <div className="mt-4">
          <TraceTable visual={visual} />
        </div>
      </details>
      {/* Without JavaScript the buttons cannot work, so the stepper is hidden
          and the table is shown open instead. */}
      <noscript>
        <style>{`[data-visual="${visual.id}"] [data-stepper], [data-visual="${visual.id}"] [data-trace-details] { display: none; }`}</style>
        <div className="mt-4">
          <TraceTable visual={visual} />
        </div>
      </noscript>
    </section>
  );
}
