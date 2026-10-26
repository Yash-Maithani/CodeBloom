import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { courses, findCourse } from "@content/courses";
import { NoteCallout } from "@/components/callout";
import { Container } from "@/components/container";
import { textLinkStyles } from "@/components/styles";

// One page per course, built at build time from content/courses.ts.
// dynamicParams = false: an address for a course that is not in the list
// (for example /courses/rust) gets the 404 page instead of an empty page.
export const dynamicParams = false;

export function generateStaticParams() {
  return courses.map((course) => ({ slug: course.slug }));
}

type CoursePageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: CoursePageProps): Promise<Metadata> {
  const course = findCourse((await params).slug);
  return course
    ? { title: `${course.name} course`, description: `${course.description} No lessons are published yet.` }
    : {};
}

export default async function CoursePage({ params }: CoursePageProps) {
  const course = findCourse((await params).slug);
  if (!course) notFound();

  return (
    <Container className="py-12 md:py-16">
      <div className="max-w-measure">
        <Link href="/courses" className={`inline-flex py-3 text-sm ${textLinkStyles}`}>
          All courses
        </Link>
        <h1 className="mt-4 font-heading text-3xl font-semibold">{course.name}</h1>
        <p className="mt-4 text-lg">{course.description}</p>

        <div className="mt-8">
          <NoteCallout title="No lessons yet">
            This course has no published lessons. The topics below are the plan and may change as
            lessons are written.
          </NoteCallout>
        </div>

        <h2 className="mt-12 font-heading text-2xl font-semibold">Who this course is for</h2>
        <p className="mt-4 text-base">
          Complete beginners and students taking a {course.name} course. You do not need any
          programming experience.
        </p>

        <h2 className="mt-12 font-heading text-2xl font-semibold">Planned topics</h2>
        <p className="mt-2 text-ink-muted">Planned and subject to change.</p>
        {/* Plain text on purpose: there are no lesson pages to link to yet (SPEC.md FR-C2). */}
        <ol data-planned-topics className="mt-6 flex list-decimal flex-col gap-2 pl-8 text-base">
          {course.plannedTopics.map((topic) => (
            <li key={topic}>{topic}</li>
          ))}
        </ol>
      </div>
    </Container>
  );
}
