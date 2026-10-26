import Link from "next/link";
import type { Course } from "@content/courses";

const statusText: Record<Course["status"], string> = {
  planned: "No lessons published yet",
};

// One language on the homepage and the courses page (DESIGN.md section 7, cards).
// The title link is stretched over the whole card with an ::after layer, so the
// card has one link and one tab stop. The focus ring is drawn on the card.
export function CourseCard({
  course,
  headingLevel,
}: {
  course: Course;
  headingLevel: "h2" | "h3";
}) {
  const Heading = headingLevel;
  return (
    <article className="group relative flex w-full flex-col gap-2 rounded-panel border border-rule bg-sheet p-6 transition-colors hover:border-rule-strong has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-ink">
      <Heading className="font-heading text-2xl font-semibold">
        <Link
          href={`/courses/${course.slug}`}
          className="text-ink decoration-1 underline-offset-3 transition-colors group-hover:underline focus-visible:outline-none active:text-accent-hover after:absolute after:inset-0 after:content-['']"
        >
          {course.name}
        </Link>
      </Heading>
      <p className="text-sm">{course.summary}</p>
      <p className="text-sm text-ink-muted">{statusText[course.status]}</p>
    </article>
  );
}
