import Link from "next/link";
import type { Course } from "@content/courses";

// A real count, never a promise (DESIGN.md section 7, cards).
function statusText(lessonCount: number) {
  if (lessonCount === 0) return "No lessons published yet";
  return lessonCount === 1 ? "1 lesson published" : `${lessonCount} lessons published`;
}

// One language on the homepage and the courses page (DESIGN.md section 7, course
// card): a teal band when lessons are published, a grey band when planned.
// The title link is stretched over the whole card with an ::after layer, so the
// card has one link and one tab stop. The focus ring is drawn on the card.
export function CourseCard({
  course,
  headingLevel,
  lessonCount,
  state,
}: {
  course: Course;
  headingLevel: "h2" | "h3";
  /** Number of published lessons */
  lessonCount: number;
  /** Forces a state in the component gallery only */
  state?: "hover";
}) {
  const Heading = headingLevel;
  return (
    <article
      data-state={state}
      className={`card-lift group relative flex w-full flex-col gap-2 rounded-card border border-t-8 border-rule bg-surface p-6 has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-ink ${
        lessonCount > 0 ? "border-t-primary" : "border-t-rule"
      }`}
    >
      <Heading className="font-heading text-h2">
        <Link
          href={`/courses/${course.slug}`}
          className="text-ink decoration-1 underline-offset-3 transition-colors group-hover:underline focus-visible:outline-none active:text-primary-hover after:absolute after:inset-0 after:content-['']"
        >
          {course.name}
        </Link>
      </Heading>
      <p className="text-ui">{course.summary}</p>
      <p className="mt-2">
        <span className={`inline-block rounded-chip px-2 py-1 text-small font-bold ${lessonCount > 0 ? "bg-primary-tint text-ink" : "bg-sunken text-ink-muted"}`}>
          {statusText(lessonCount)}
        </span>
      </p>
    </article>
  );
}
