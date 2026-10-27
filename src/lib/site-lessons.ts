// The site's own lessons, loaded and checked once per build. Pages import from
// here; tests call buildLessons in ./lessons.ts with their own fixtures.

import "server-only";
import path from "node:path";
import { courses } from "@content/courses";
import { lessonSources } from "@content/lessons";
import { buildLessons, opensInPlayground, publishedIn, type LoadedLesson, type RenderedExample } from "./lessons.ts";
import { RECORD_PATH } from "./verified.ts";

let cache: Promise<LoadedLesson[]> | undefined;

export function allLessons(): Promise<LoadedLesson[]> {
  cache ??= buildLessons({
    courses,
    sources: lessonSources,
    contentRoot: path.join(process.cwd(), "content"),
    recordPath: RECORD_PATH,
  });
  return cache;
}

/** Published lessons of every course, by course slug, in course order. */
export async function publishedByCourse(): Promise<Map<string, LoadedLesson[]>> {
  const lessons = await allLessons();
  return new Map(courses.map((course) => [course.slug, publishedIn(lessons, course)]));
}

/** Every example a published lesson links to the playground, with that lesson. Each gets its own playground page. */
export async function playgroundExamples(): Promise<Array<{ example: RenderedExample; lesson: LoadedLesson }>> {
  const python = (await publishedByCourse()).get("python") ?? [];
  return python.flatMap((lesson) =>
    [
      ...lesson.body.flatMap((block) => (block.type === "example" ? [block.example] : [])),
      ...lesson.mistakes.flatMap((mistake) => (mistake.renderedFix ? [mistake.renderedFix] : [])),
    ]
      .filter(opensInPlayground)
      .map((example) => ({ example, lesson })),
  );
}

/** "C", "C and Python", "C, C++ and Python" */
export function joinNames(names: string[]): string {
  return names.length <= 1 ? (names[0] ?? "") : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

/** One honest sentence about which courses have lessons, built from the data so it cannot go stale. */
export async function courseStatusSentence(): Promise<string> {
  const byCourse = await publishedByCourse();
  const withLessons = courses.filter((c) => (byCourse.get(c.slug) ?? []).length > 0).map((c) => c.name);
  const without = courses.filter((c) => (byCourse.get(c.slug) ?? []).length === 0).map((c) => c.name);
  if (withLessons.length === 0) return "No lessons are published yet. Open a course to see the topics it will cover.";
  if (without.length === 0) return "Every course has published lessons.";
  return `${joinNames(withLessons)} ${withLessons.length === 1 ? "has" : "have"} published lessons. ${joinNames(without)} ${
    without.length === 1 ? "lists" : "list"
  } planned topics only, for now.`;
}
