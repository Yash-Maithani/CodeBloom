import Link from "next/link";
import type { Course } from "@content/courses";

// A real count, never a promise (DESIGN.md section 7, cards).
function statusText(lessonCount: number) {
  if (lessonCount === 0) return "No lessons published yet";
  return lessonCount === 1 ? "1 lesson published" : `${lessonCount} lessons published`;
}

// One language on the homepage and the courses page (DESIGN.md section 7, cards).
// The title link is stretched over the whole card with an ::after layer, so the
// card has one link and one tab stop. The focus ring is drawn on the card.
export function CourseCard({
  course,
  headingLevel,
  lessonCount,
}: {
  course: Course;
  headingLevel: "h2" | "h3";
  /** Number of published lessons */
  lessonCount: number;
}) {
  const Heading = headingLevel;
  return (
    <article className="group relative flex w-full flex-col gap-2 rounded-panel border border-rule bg-surface p-6 transition-colors hover:border-edge has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-ink">
      <Heading className="font-heading text-h2">
        <Link
          href={`/courses/${course.slug}`}
          className="text-ink decoration-1 underline-offset-3 transition-colors group-hover:underline focus-visible:outline-none active:text-primary-hover after:absolute after:inset-0 after:content-['']"
        >
          {course.name}
        </Link>
      </Heading>
      <p className="text-ui">{course.summary}</p>
      <p className="text-ui text-ink-muted">{statusText(lessonCount)}</p>
    </article>
  );
}
