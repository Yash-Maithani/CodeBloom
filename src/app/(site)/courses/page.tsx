import type { Metadata } from "next";
import { courses } from "@content/courses";
import { Container } from "@/components/container";
import { CourseCard } from "@/components/course-card";
import { courseStatusSentence, publishedByCourse } from "@/lib/site-lessons";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Courses", description: `Beginner courses in C, C++, Java and Python. ${await courseStatusSentence()}` };
}

export default async function CoursesPage() {
  const byCourse = await publishedByCourse();
  return (
    <Container className="py-12 md:py-16">
      <h1 className="font-heading text-3xl font-semibold">Courses</h1>
      <p className="mt-4 max-w-measure text-lg">
        Four beginner courses, each starting from zero. {await courseStatusSentence()}
      </p>
      <ul className="mt-8 grid gap-6 sm:grid-cols-2">
        {courses.map((course) => (
          <li key={course.slug} className="flex">
            <CourseCard course={course} headingLevel="h2" lessonCount={byCourse.get(course.slug)?.length ?? 0} />
          </li>
        ))}
      </ul>
    </Container>
  );
}
