import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { courses, findCourse } from "@content/courses";
import { NoteCallout } from "@/components/callout";
import { Container } from "@/components/container";
import { InlineText } from "@/components/prose";
import { buttonStyles, textLinkStyles } from "@/components/styles";
import { publishedByCourse } from "@/lib/site-lessons";

// One page per course, built at build time from content/courses.ts and the
// published lessons. dynamicParams = false: an address for a course that is not
// in the list (for example /courses/rust) gets the 404 page instead of an empty page.
export const dynamicParams = false;

export function generateStaticParams() {
  return courses.map((course) => ({ slug: course.slug }));
}

type CoursePageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: CoursePageProps): Promise<Metadata> {
  const course = findCourse((await params).slug);
  if (!course) return {};
  const count = (await publishedByCourse()).get(course.slug)?.length ?? 0;
  const status = count === 0 ? "No lessons are published yet." : `${count} ${count === 1 ? "lesson is" : "lessons are"} published.`;
  return { title: `${course.name} course`, description: `${course.description} ${status}` };
}

export default async function CoursePage({ params }: CoursePageProps) {
  const course = findCourse((await params).slug);
  if (!course) notFound();
  const lessons = (await publishedByCourse()).get(course.slug) ?? [];
  const published = new Set(lessons.map((lesson) => lesson.source.slug));
  // Topics without a published lesson. Drafts stay here too, as plain text.
  const planned = course.topics.filter((topic) => !topic.lesson || !published.has(topic.lesson));

  return (
    <Container className="py-12 md:py-16">
      <div className="max-w-measure">
        <Link href="/courses" className={`inline-flex py-3 text-sm ${textLinkStyles}`}>
          All courses
        </Link>
        <h1 className="mt-4 font-heading text-3xl font-semibold">{course.name}</h1>
        <p className="mt-4 text-lg">{course.description}</p>

        {lessons.length === 0 ? (
          <div className="mt-8">
            <NoteCallout title="No lessons yet">
              This course has no published lessons. The topics below are the plan and may change as
              lessons are written.
            </NoteCallout>
          </div>
        ) : (
          <Link href={lessons[0].href} className={`mt-8 ${buttonStyles.primary}`}>
            Start the first lesson
          </Link>
        )}

        <h2 className="mt-12 font-heading text-2xl font-semibold">Who this course is for</h2>
        <p className="mt-4 text-base">
          Complete beginners and students taking a {course.name} course. You do not need any
          programming experience.
        </p>

        {lessons.length > 0 && (
          <>
            <h2 className="mt-12 font-heading text-2xl font-semibold">Lessons</h2>
            <ol data-lessons className="mt-6 flex list-decimal flex-col gap-6 pl-8 text-base">
              {lessons.map((lesson) => (
                <li key={lesson.href}>
                  <Link href={lesson.href} className={`font-bold ${textLinkStyles}`}>
                    {lesson.source.title}
                  </Link>
                  <p className="mt-1 text-ink-muted">
                    <InlineText text={lesson.source.objective} />
                  </p>
                </li>
              ))}
            </ol>
          </>
        )}

        {planned.length > 0 && (
          <>
            <h2 className="mt-12 font-heading text-2xl font-semibold">Planned topics</h2>
            <p className="mt-2 text-ink-muted">Planned and subject to change, in the order they are planned.</p>
            {/* Plain text on purpose: these topics have no lesson page yet (SPEC.md FR-C2). */}
            <ul data-planned-topics className="mt-6 flex list-disc flex-col gap-2 pl-8 text-base">
              {planned.map((topic) => (
                <li key={topic.title}>{topic.title}</li>
              ))}
            </ul>
          </>
        )}
      </div>
    </Container>
  );
}
