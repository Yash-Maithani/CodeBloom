import type { MetadataRoute } from "next";
import { courses } from "@content/courses";
import { SITE_URL } from "@/lib/site";
import { allLessons } from "@/lib/site-lessons";

// sitemap.xml, built at build time. The playground pages for single lesson
// examples are left out: they repeat code that is already on lesson pages.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lessons = (await allLessons()).filter((lesson) => lesson.source.status === "published");
  const paths = ["/", "/courses", ...courses.map((course) => `/courses/${course.slug}`), ...lessons.map((lesson) => lesson.href), "/playground"];
  return paths.map((path) => ({ url: new URL(path, SITE_URL).toString() }));
}
