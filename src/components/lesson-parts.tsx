// The parts of a lesson page (DESIGN.md section 7): examples, common mistakes,
// practice questions, the recap and the previous and next links. All render on
// the server; only the code block inside them is interactive.

import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import { CodeBlock } from "@/components/code-block";
import { OutputPanel } from "@/components/output-panel";
import { InlineText } from "@/components/prose";
import { buttonStyles, textLinkStyles } from "@/components/styles";
import type { LoadedLesson, RenderedExample } from "@/lib/lessons";

/** Titles may contain `code`; screen reader labels use the words without the backticks. */
const plain = (text: string) => text.replaceAll("`", "").replaceAll("**", "");

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

export function Practice({ lesson }: { lesson: LoadedLesson }) {
  return (
    <ol className="mt-6 flex flex-col gap-12">
      {lesson.practice.map((question, index) => (
        <li key={question.rendered.id}>
          <p className="max-w-measure">
            <strong>Question {index + 1}.</strong> <InlineText text={question.question} />
          </p>
          <div className="mt-4">
            <LessonCodeBlock
              example={question.rendered}
              regionLabel={`${question.rendered.languageLabel} code for practice question ${index + 1}`}
              showOutput={false}
            />
          </div>
          {/* Native disclosure: works with Enter and Space, and screen readers
              announce whether it is open, with no JavaScript. */}
          <details className="group mt-4" data-solution={question.rendered.id}>
            <summary className={`${buttonStyles.secondary} cursor-pointer list-none [&::-webkit-details-marker]:hidden`}>
              <span className="group-open:hidden">Show solution</span>
              <span className="hidden group-open:inline">Hide solution</span>
            </summary>
            <div className="mt-4 max-w-lesson">
              <OutputPanel kind={question.rendered.kind} text={question.rendered.result} />
              <p className="mt-4 max-w-measure">
                <InlineText text={question.explanation} />
              </p>
            </div>
          </details>
        </li>
      ))}
    </ol>
  );
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
              <Link href={`/courses/${lesson.course.slug}`} className={`inline-flex py-3 ${textLinkStyles}`}>
                Back to the {courseName} course
              </Link>
            </div>
          )}
        </li>
      </ul>
    </nav>
  );
}
