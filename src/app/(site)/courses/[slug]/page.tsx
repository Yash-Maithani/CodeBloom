import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";
import Link from "next/link";
import { notFound } from "next/navigation";
import { courses, findCourse } from "@content/courses";
import { NoteCallout } from "@/components/callout";
import { Container } from "@/components/container";
import { backLinkStyles, buttonStyles } from "@/components/styles";
import { Trail } from "@/components/trail";
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
  return pageMetadata({ path: `/courses/${course.slug}`, title: `${course.name} course`, description: `${course.description} ${status}` });
}

export default async function CoursePage({ params }: CoursePageProps) {
  const course = findCourse((await params).slug);
  if (!course) notFound();
  const lessons = (await publishedByCourse()).get(course.slug) ?? [];
  const published = new Set(lessons.map((lesson) => lesson.source.slug));
  // Topics without a published lesson. Drafts stay here too, as plain text.
  const planned = course.topics.filter((topic) => !topic.lesson || !published.has(topic.lesson));

  return (
    <Container className="py-16 lg:py-24">
      <div className="lg:grid lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-6">
            <Link href="/courses" className={backLinkStyles}>
              All courses
            </Link>
            <h1 className="mt-4 font-heading text-h1">{course.name}</h1>
            <p className="mt-4 max-w-measure text-lead">{course.description}</p>
            {lessons.length === 0 ? (
              <div className="mt-8">
                <NoteCallout title="No lessons yet">
                  This course has no published lessons. The topics on this page are the plan and may change as lessons are written.
                </NoteCallout>
              </div>
            ) : (
              <>
                <p className="mt-4 text-ui text-ink-muted">
                  {lessons.length} {lessons.length === 1 ? "lesson" : "lessons"}
                  {planned.length === 0 ? ", all published" : ` published, ${planned.length} planned`}. Each lesson builds on the ones before it.
                </p>
                <Link href={lessons[0].href} className={`mt-8 ${buttonStyles.primary}`}>
                  Start the first lesson
                </Link>
              </>
            )}
            <h2 className="mt-12 font-heading text-h3">Who this course is for</h2>
            <p className="mt-2 max-w-measure text-body">
              Complete beginners and students taking a {course.name} course. You do not need any programming experience.
            </p>
          </div>
        </div>

        <div className="mt-16 min-w-0 lg:col-span-8 lg:mt-0">
          {lessons.length > 0 && (
            <section aria-labelledby="lessons-title">
              <h2 id="lessons-title" className="font-heading text-h2">
                Lessons
              </h2>
              <div className="mt-8">
                <Trail
                  label={`${course.name} lessons in order`}
                  across={false}
                  showGoals
                  dataAttribute="data-lessons"
                  stops={lessons.map((lesson) => ({ title: lesson.source.title, href: lesson.href, goal: lesson.source.objective }))}
                />
              </div>
            </section>
          )}
          {planned.length > 0 && (
            <section aria-labelledby="planned-title" className={lessons.length > 0 ? "mt-16" : ""}>
              <h2 id="planned-title" className="font-heading text-h2">
                Planned topics
              </h2>
              <p className="mt-2 text-ui text-ink-muted">Planned and subject to change. Listed in course order.</p>
              {/* Plain text on purpose: these topics have no lesson page yet (SPEC.md FR-C2). */}
              <div className="mt-8">
                <Trail
                  label={`${course.name} planned topics in order`}
                  across={false}
                  start={lessons.length + 1}
                  dataAttribute="data-planned-topics"
                  stops={planned.map((topic) => ({ title: topic.title }))}
                />
              </div>
            </section>
          )}
        </div>
      </div>
    </Container>
  );
}
