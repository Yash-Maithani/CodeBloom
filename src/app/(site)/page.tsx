import { courses } from "@content/courses";
import { homeExample } from "@content/home-example";
import { Container } from "@/components/container";
import { CourseCard } from "@/components/course-card";
import { Figure } from "@/components/figure";
import { buttonStyles, textLinkStyles } from "@/components/styles";
import { Trail } from "@/components/trail";
import { checkNotes } from "@/lib/code-notes";
import { CODE_LANGUAGES, readExample } from "@/lib/examples";
import { figureFromVisual } from "@/lib/figure-data";
import { highlight } from "@/lib/highlight";
import { allLessons, courseStatusSentence, publishedByCourse, publishedStatusLine } from "@/lib/site-lessons";
import { assertVerified, readRecord } from "@/lib/verified";
import Link from "next/link";

// A real sequence, so the steps are numbered (DESIGN.md: numbering only for sequences).
const lessonSteps = [
  {
    title: "The idea in plain words",
    text: "What the concept is and why it is useful, often with an everyday comparison. When the comparison stops being accurate, the lesson says so.",
  },
  {
    title: "A short example with notes",
    text: "Small programs that build on each other, with notes beside the lines that matter, like the example above.",
  },
  {
    title: "The real output",
    text: "Every runnable example is run before it is published, so the output shown is what the code actually printed.",
  },
  {
    title: "Step through it",
    text: "In some lessons you move through a program one line at a time and watch each value change. Every step comes from a recorded run.",
  },
  {
    title: "Common mistakes",
    text: "Errors beginners often make, what happens when you make them, and how to fix them.",
  },
  {
    title: "Practice questions",
    text: "A few questions at the end of the lesson. Check your answer for instant feedback, show hints one at a time, or open the written solution.",
  },
  {
    title: "Try it in the playground",
    text: "Python examples open in the playground, where you can change the code and run it in your browser. C, C++ and Java are not supported there yet.",
  },
];

// The owner's own words, unchanged (approved for Milestone 1).
const story = [
  "When I started university, I was excited to learn programming. At first, things were going well. But as the pace of classes increased, I started feeling confused and lost.",
  "I kept asking myself questions. How is this code structured? How does it actually work? Why are we writing this? What happens when one loop runs inside another? I didn't just want to know what to write. I wanted to understand why I was writing it and what the computer was doing with it.",
  "As I struggled to keep up, I found myself memorizing code instead of understanding it. That was never how I wanted to learn programming. I wanted to understand the logic, see how everything connected, and eventually build things of my own.",
  "That's why I created CodeBloom.",
  "I want to make learning programming more visual, interactive, and easier to follow, especially for beginners who feel lost when concepts move too quickly. Instead of simply showing you what code to write, CodeBloom aims to help you understand how it works, one concept and one line at a time.",
  "Because learning to program should be about understanding what you build, not just memorizing what to type.",
];

export default async function HomePage() {
  // Read at build time from the checked example files (see content/home-example.ts).
  const exampleId = `${homeExample.language}/${homeExample.file}`;
  const example = await readExample(homeExample.language, homeExample.file);
  // The same publish gate as lessons: the build stops if this example was not verified.
  await assertVerified(await readRecord(), exampleId, example.kind, example.sourceFile, example.expectationFile);
  const lines = await highlight(example.code, example.language);
  checkNotes(homeExample.notes, lines.length, exampleId);

  // Everything said about lessons comes from the lesson data, so it cannot go stale.
  const byCourse = await publishedByCourse();
  const statusLine = await publishedStatusLine();
  const statusSentence = await courseStatusSentence();
  const lessons = await allLessons();
  const python = byCourse.get("python") ?? [];
  // The lesson that teaches with this example, and its recorded trace (step-through visual).
  const exampleLesson = lessons.find((lesson) => lesson.source.status === "published" && lesson.body.some((block) => block.type === "example" && block.example.id === exampleId));
  const visual = exampleLesson?.body.flatMap((block) => (block.type === "visual" && block.visual.steps.length > 0 ? [block.visual] : [])).find((v) => v.lines.length === lines.length);
  const figure = visual ? figureFromVisual(visual) : { lines: lines.map((tokens) => ({ tokens })), path: undefined, output: example.expectedOutput, predictLine: undefined };
  const conditionNote = homeExample.notes.find((note) => note.startLine === 2);

  return (
    <>
      <section aria-labelledby="hero-title">
        <Container className="py-16 lg:py-24">
          <div className="lg:grid lg:grid-cols-12 lg:items-center lg:gap-12">
            <div className="lg:col-span-6">
              <h1 id="hero-title" className="font-heading text-display">
                Learn to program with patient, line-by-line explanations
              </h1>
              <p className="mt-6 max-w-measure text-lead">
                CodeBloom is a learning site for beginners studying C, C++, Java or Python. Lessons explain code in plain English, with a note beside each line that
                matters and the output the code really prints.
              </p>
              <p data-status-line className="mt-4 text-ui text-ink-muted">
                {statusLine}
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                {python[0] && (
                  <Link href={python[0].href} className={buttonStyles.primary}>
                    Start Python lesson 1
                  </Link>
                )}
                <Link href="/courses" className={buttonStyles.secondary}>
                  Browse the courses
                </Link>
              </div>
            </div>
            <div className="mt-12 min-w-0 lg:col-span-6 lg:mt-0">
              <Figure
                title="Your turn: what does this print?"
                regionLabel={`${CODE_LANGUAGES[example.language].label} code: ${homeExample.caption}`}
                lines={figure.lines}
                path={figure.path}
                output={figure.output}
                note={conditionNote ? { line: 2, text: conditionNote.text } : undefined}
                predict={{ line: figure.predictLine }}
              />
              {exampleLesson && (
                <p className="mt-4 text-small text-ink-muted">
                  The path and output come from a recorded run of this program, from the lesson{" "}
                  <Link href={exampleLesson.href} className={textLinkStyles}>
                    {exampleLesson.source.title}
                  </Link>
                  .
                </p>
              )}
            </div>
          </div>
        </Container>
      </section>

      {python.length > 0 && (
        <section aria-labelledby="trail-title" className="border-t border-rule bg-surface">
          <Container className="py-16 lg:py-24">
            <h2 id="trail-title" className="font-heading text-h2">
              The Python path
            </h2>
            <p className="mt-4 max-w-measure text-body">
              {python.length} lessons, in order. Each one builds on the lessons before it.
            </p>
            <div className="mt-10">
              <Trail label="Python lessons in order" stops={python.map((lesson) => ({ title: lesson.source.title, href: lesson.href }))} />
            </div>
          </Container>
        </section>
      )}

      <section aria-labelledby="lesson-steps-title" className="border-t border-rule">
        <Container className="py-16 lg:py-24">
          <h2 id="lesson-steps-title" className="font-heading text-h2">
            How each lesson works
          </h2>
          <ol className="mt-10 grid gap-x-12 gap-y-10 md:grid-cols-2">
            {lessonSteps.map((step, index) => (
              <li key={step.title} className="flex gap-4">
                <span aria-hidden="true" className="flex size-12 shrink-0 items-center justify-center rounded-round border-2 border-primary font-heading text-h3 text-primary">
                  {index + 1}
                </span>
                <div>
                  <h3 className="font-heading text-h3">{step.title}</h3>
                  <p className="mt-2 max-w-measure text-body">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section aria-labelledby="courses-title" className="border-t border-rule">
        <Container className="py-16 lg:py-24">
          <h2 id="courses-title" className="font-heading text-h2">
            Choose a language
          </h2>
          <p className="mt-4 max-w-measure text-body">
            Each course starts from zero. {statusSentence}
          </p>
          <ul className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {courses.map((course) => (
              <li key={course.slug} className="flex">
                <CourseCard course={course} headingLevel="h3" lessonCount={byCourse.get(course.slug)?.length ?? 0} />
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section aria-labelledby="story-title" className="border-t border-rule bg-surface">
        <Container className="py-16 lg:py-24">
          <h2 id="story-title" className="font-heading text-h2">
            Why CodeBloom exists
          </h2>
          <div className="mt-6 flex max-w-measure flex-col gap-4 text-body">
            {story.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
