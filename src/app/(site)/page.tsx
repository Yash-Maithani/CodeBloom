import { courses } from "@content/courses";
import { homeExample } from "@content/home-example";
import { CodeBlock } from "@/components/code-block";
import { Container } from "@/components/container";
import { CourseCard } from "@/components/course-card";
import { buttonStyles } from "@/components/styles";
import { checkNotes } from "@/lib/code-notes";
import { CODE_LANGUAGES, readExample } from "@/lib/examples";
import { highlight } from "@/lib/highlight";
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
    title: "Common mistakes",
    text: "Errors beginners often make, what happens when you make them, and how to fix them.",
  },
  {
    title: "Practice with hints (planned)",
    text: "Questions with hints you reveal one at a time, and solutions that explain why. Practice arrives after the first lessons.",
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
  const example = await readExample(homeExample.language, homeExample.file);
  const lines = await highlight(example.code, example.language);
  checkNotes(homeExample.notes, lines.length, `${homeExample.language}/${homeExample.file}`);

  return (
    <>
      <section aria-labelledby="hero-title">
        <Container className="py-12 md:py-16">
          <div className="max-w-measure">
            <h1 id="hero-title" className="font-heading text-3xl font-semibold md:text-4xl">
              Learn to program with patient, line-by-line explanations
            </h1>
            <p className="mt-6 text-lg">
              CodeBloom is a learning site for beginners studying C, C++, Java or Python. Lessons
              will explain code in plain English, with a note beside each line that matters and the
              output the code really prints.
            </p>
            <p className="mt-4 text-ink-muted">
              CodeBloom is new. The first lessons are being written, and each course page shows
              what it will cover.
            </p>
            <Link href="/courses" className={`mt-8 ${buttonStyles.primary}`}>
              Browse the courses
            </Link>
          </div>

          <div className="mt-12">
            <CodeBlock
              caption={homeExample.caption}
              languageLabel={CODE_LANGUAGES[example.language].label}
              code={example.code}
              lines={lines}
              notes={homeExample.notes}
              expectedOutput={example.expectedOutput}
            />
          </div>
        </Container>
      </section>

      <section aria-labelledby="lesson-steps-title" className="border-t border-rule">
        <Container className="py-12 md:py-16">
          <h2 id="lesson-steps-title" className="font-heading text-2xl font-semibold">
            How each lesson will work
          </h2>
          <ol className="mt-8 flex max-w-measure flex-col gap-8">
            {lessonSteps.map((step, index) => (
              <li key={step.title} className="flex gap-4">
                <span aria-hidden="true" className="w-6 shrink-0 font-heading text-xl font-semibold text-ink-muted">
                  {index + 1}
                </span>
                <div>
                  <h3 className="font-heading text-xl font-semibold">{step.title}</h3>
                  <p className="mt-2 text-base">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section aria-labelledby="courses-title" className="border-t border-rule">
        <Container className="py-12 md:py-16">
          <h2 id="courses-title" className="font-heading text-2xl font-semibold">
            Choose a language
          </h2>
          <p className="mt-4 max-w-measure text-base">
            Each course starts from zero. No lessons are published yet. Open a course to see the
            topics it will cover.
          </p>
          <ul className="mt-8 grid gap-6 sm:grid-cols-2">
            {courses.map((course) => (
              <li key={course.slug} className="flex">
                <CourseCard course={course} headingLevel="h3" />
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section aria-labelledby="story-title" className="border-t border-rule">
        <Container className="py-12 md:py-16">
          <h2 id="story-title" className="font-heading text-2xl font-semibold">
            Why CodeBloom exists
          </h2>
          <div className="mt-6 flex max-w-measure flex-col gap-4 text-base">
            {story.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
