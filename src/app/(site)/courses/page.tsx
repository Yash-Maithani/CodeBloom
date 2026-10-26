import type { Metadata } from "next";
import { courses } from "@content/courses";
import { Container } from "@/components/container";
import { CourseCard } from "@/components/course-card";

export const metadata: Metadata = {
  title: "Courses",
  description: "Beginner courses in C, C++, Java and Python. No lessons are published yet.",
};

export default function CoursesPage() {
  return (
    <Container className="py-12 md:py-16">
      <h1 className="font-heading text-3xl font-semibold">Courses</h1>
      <p className="mt-4 max-w-measure text-lg">
        Four beginner courses. No lessons are published yet. Open a course to see the topics it will
        cover.
      </p>
      <ul className="mt-8 grid gap-6 sm:grid-cols-2">
        {courses.map((course) => (
          <li key={course.slug} className="flex">
            <CourseCard course={course} headingLevel="h2" />
          </li>
        ))}
      </ul>
    </Container>
  );
}
