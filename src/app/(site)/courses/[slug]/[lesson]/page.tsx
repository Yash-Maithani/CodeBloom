import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AnalogyCallout } from "@/components/callout";
import { Container } from "@/components/container";
import { LessonCodeBlock, LessonNav, Mistakes, Practice } from "@/components/lesson-parts";
import { InlineText, ProseBlocks } from "@/components/prose";
import { backLinkStyles, textLinkStyles } from "@/components/styles";
import { neighbours, sameConceptElsewhere, type LoadedLesson } from "@/lib/lessons";
import { plainText } from "@/lib/prose";
import { allLessons } from "@/lib/site-lessons";

// One page per published lesson, built at build time. Drafts and unknown
// addresses get the 404 page (dynamicParams = false).
export const dynamicParams = false;

export async function generateStaticParams() {
  const lessons = await allLessons();
  return lessons
    .filter((lesson) => lesson.source.status === "published")
    .map((lesson) => ({ slug: lesson.course.slug, lesson: lesson.source.slug }));
}

type LessonPageProps = { params: Promise<{ slug: string; lesson: string }> };

async function findPublished({ params }: LessonPageProps): Promise<{ lessons: LoadedLesson[]; lesson?: LoadedLesson }> {
  const { slug, lesson: lessonSlug } = await params;
  const lessons = await allLessons();
  const lesson = lessons.find(
    (l) => l.course.slug === slug && l.source.slug === lessonSlug && l.source.status === "published",
  );
  return { lessons, lesson };
}

export async function generateMetadata(props: LessonPageProps): Promise<Metadata> {
  const { lesson } = await findPublished(props);
  if (!lesson) return {};
  return {
    title: `${lesson.source.title} in ${lesson.course.name}`,
    description: plainText(lesson.source.objective),
  };
}

export default async function LessonPage(props: LessonPageProps) {
  const { lessons, lesson } = await findPublished(props);
  if (!lesson) notFound();
  const { previous, next } = neighbours(lessons, lesson);
  const sameConcept = sameConceptElsewhere(lessons, lesson);
  const courseHref = `/courses/${lesson.course.slug}`;
  // Numbers for examples without a caption, so every code region has its own name.
  const uncaptioned = lesson.body.flatMap((block) => (block.type === "example" && !block.example.caption ? [block.example.id] : []));

  return (
    <Container className="py-12 md:py-16">
      <div className="max-w-measure">
        <Link href={courseHref} className={backLinkStyles}>
          {lesson.course.name} course
        </Link>
        <h1 className="mt-4 font-heading text-3xl font-semibold">{lesson.source.title}</h1>
        <p className="mt-4 text-lg">
          <strong>Goal:</strong> <InlineText text={lesson.source.objective} />
        </p>
      </div>

      {lesson.concept && (
        <section aria-labelledby="the-idea" className="max-w-measure text-base">
          <h2 id="the-idea" className="mt-12 font-heading text-2xl font-semibold md:mt-16">
            The idea
          </h2>
          {sameConcept.length > 0 && (
            <p className="mt-2 text-sm text-ink-muted">
              This part is the same in the{" "}
              {sameConcept.map((other, index) => (
                <span key={other.href}>
                  {index > 0 && " and "}
                  <Link href={other.href} className={textLinkStyles}>
                    {other.course.name} lesson
                  </Link>
                </span>
              ))}
              .
            </p>
          )}
          <ProseBlocks blocks={lesson.concept} />
        </section>
      )}

      <div className="text-base">
        {lesson.body.map((block, index) => {
          if (block.type === "prose") {
            return (
              <div key={index} className="max-w-measure">
                <ProseBlocks blocks={[block.block]} />
              </div>
            );
          }
          if (block.type === "analogy") {
            return (
              <div key={index} className="mt-8 max-w-measure">
                <AnalogyCallout analogy={block.analogy} />
              </div>
            );
          }
          const { example } = block;
          const exampleNumber = uncaptioned.indexOf(example.id) + 1;
          return (
            <div key={index} className="mt-8">
              <LessonCodeBlock
                example={example}
                regionLabel={`${example.languageLabel} code: ${example.caption ? plainText(example.caption) : `example ${exampleNumber}`}`}
              />
            </div>
          );
        })}

        {lesson.mistakes.length > 0 && (
          <section aria-labelledby="common-mistakes" className="max-w-lesson">
            <h2 id="common-mistakes" className="mt-12 font-heading text-2xl font-semibold md:mt-16">
              Common mistakes
            </h2>
            <Mistakes lesson={lesson} />
          </section>
        )}

        {lesson.practice.length > 0 && (
          <section aria-labelledby="practice">
            <h2 id="practice" className="mt-12 font-heading text-2xl font-semibold md:mt-16">
              Practice
            </h2>
            <p className="mt-4 max-w-measure">Choose an answer and check it. Hints and the solution are there when you want them.</p>
            <Practice lesson={lesson} />
          </section>
        )}

        <section aria-labelledby="recap" className="max-w-measure">
          <h2 id="recap" className="mt-12 font-heading text-2xl font-semibold md:mt-16">
            Recap
          </h2>
          <ul className="mt-4 flex list-disc flex-col gap-2 pl-8">
            {lesson.source.recap.map((point) => (
              <li key={point}>
                <InlineText text={point} />
              </li>
            ))}
          </ul>
        </section>
      </div>

      <LessonNav lesson={lesson} previous={previous} next={next} />
    </Container>
  );
}
