import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AnalogyCallout } from "@/components/callout";
import { ConceptDiagram } from "@/components/concept-diagram";
import { Container } from "@/components/container";
import { LessonCodeBlock, LessonNav, Mistakes, Practice, VisualBlock } from "@/components/lesson-parts";
import { InlineText, ProseBlocks, type ProseExtras } from "@/components/prose";
import { ExplorerBlock } from "@/components/explorer-block";
import { StepRail } from "@/components/step-rail";
import { backLinkStyles, textLinkStyles } from "@/components/styles";
import { lineAnchor } from "@/lib/anchors";
import { figureFromVisual } from "@/lib/figure-data";
import { neighbours, publishedIn, sameConceptElsewhere, type LessonBlock, type LoadedLesson, type RenderedExample, type RenderedVisual } from "@/lib/lessons";
import { plainText, type Inline, type ProseBlock } from "@/lib/prose";
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

const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** A lesson step: one card with a number and a heading (DESIGN.md section 8). */
type Step = { id: string; title: string; blocks: LessonBlock[] };

function StepCard({ step, number, children }: { step: Step; number: number; children: React.ReactNode }) {
  return (
    <section aria-labelledby={step.id} data-step={step.id} className="mt-8 rounded-card border border-rule bg-surface p-4 text-body md:p-8 lg:p-10">
      <p className="text-small font-bold text-primary">Step {number}</p>
      <h2 id={step.id} className="mt-1 scroll-mt-24 font-heading text-h2 lg:scroll-mt-16">
        {step.title}
      </h2>
      {children}
    </section>
  );
}

/** Variables the example gives a value to, with the lines that use them, for prose term links. */
function termsOf(example: RenderedExample): ProseExtras["terms"] {
  const text = example.lines.map((tokens) => tokens.map((t) => t.text).join(""));
  const assigned = new Set([...example.code.matchAll(/\b([A-Za-z_]\w*)\s*=(?!=)/g)].map((m) => m[1]));
  const terms = new Map<string, { anchors: string[]; lines: number[] }>();
  for (const name of assigned) {
    const lines = text.flatMap((line, index) => (new RegExp(`\\b${name}\\b`).test(line) ? [index + 1] : []));
    if (lines.length > 0) terms.set(name, { anchors: lines.map((line) => lineAnchor(example.id, line)), lines });
  }
  return terms;
}

/** The first three terms the lesson defines in bold get a highlighter mark. */
function markedTerms(blocks: ProseBlock[]): Set<string> {
  const strong = (parts: Inline[]) => parts.flatMap((part) => (part.type === "strong" ? [part.text] : []));
  const found = blocks.flatMap((block) => (block.type === "paragraph" ? strong(block.content) : block.type === "list" ? block.items.flatMap(strong) : []));
  return new Set([...new Set(found)].slice(0, 3));
}

export default async function LessonPage(props: LessonPageProps) {
  const { lessons, lesson } = await findPublished(props);
  if (!lesson) notFound();
  const { previous, next } = neighbours(lessons, lesson);
  const sameConcept = sameConceptElsewhere(lessons, lesson);
  const inCourse = publishedIn(lessons, lesson.course);
  const courseHref = `/courses/${lesson.course.slug}`;
  // Numbers for examples without a caption, so every code region has its own name.
  const uncaptioned = lesson.body.flatMap((block) => (block.type === "example" && !block.example.caption ? [block.example.id] : []));
  const visuals = lesson.body.flatMap((block) => (block.type === "visual" ? [block.visual] : []));
  const sameCode = (example: RenderedExample, visual: RenderedVisual) =>
    visual.lines.map((tokens) => tokens.map((t) => t.text).join("")).join("\n") === example.code;

  // Split the lesson into steps at its headings. Anything before the first
  // heading (usually the analogy) belongs to The idea.
  const idea: Step = { id: "the-idea", title: "The idea", blocks: [] };
  const steps: Step[] = [];
  for (const block of lesson.body) {
    if (block.type === "prose" && block.block.type === "heading") steps.push({ id: slugify(block.block.text), title: block.block.text, blocks: [] });
    else (steps.at(-1) ?? idea).blocks.push(block);
  }
  const allSteps = [
    ...(lesson.concept || idea.blocks.length > 0 ? [idea] : []),
    ...steps,
    ...(lesson.mistakes.length > 0 ? [{ id: "common-mistakes", title: "Common mistakes", blocks: [] }] : []),
    ...(lesson.practice.length > 0 ? [{ id: "practice", title: "Practice", blocks: [] }] : []),
    { id: "recap", title: "Recap", blocks: [] },
  ];

  const prose = [...(lesson.concept ?? []), ...lesson.body.flatMap((b) => (b.type === "prose" ? [b.block] : []))];
  // Shared by every prose block, in page order: each mark is used once.
  const marks = markedTerms(prose);

  // Each step starts without term links; after an example, the prose that
  // follows it in the same step links that example's variables (once each).
  function renderBlocks(blocks: LessonBlock[]) {
    let terms: ProseExtras["terms"];
    let linked: Set<string> | undefined;
    return blocks.map((block, index) => {
      if (block.type === "prose") {
        return (
          <div key={index} className="max-w-measure">
            <ProseBlocks blocks={[block.block]} extras={{ marks, terms, linked }} />
          </div>
        );
      }
      if (block.type === "visual") {
        return (
          <div key={index} className="mt-8">
            <VisualBlock visual={block.visual} />
          </div>
        );
      }
      if (block.type === "explorer") {
        return (
          <div key={index} className="mt-8">
            <ExplorerBlock data={block.explorer} />
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
      // Prose after this example links its variables to their lines.
      terms = termsOf(example);
      linked = new Set();
      const visual = visuals.find((v) => sameCode(example, v));
      return (
        <div key={index} className="mt-8">
          <LessonCodeBlock
            playground
            example={example}
            regionLabel={`${example.languageLabel} code: ${example.caption ? plainText(example.caption) : `example ${exampleNumber}`}`}
            predict={example.kind === "output" ? { line: visual ? figureFromVisual(visual).predictLine : undefined } : undefined}
          />
        </div>
      );
    });
  }

  return (
    <Container className="py-12 lg:py-16">
      <div className="lg:grid lg:grid-cols-12 lg:gap-10">
        {/* The rail itself is the grid child, so it can stick for the whole height of the lesson. */}
        <StepRail
          className="sticky top-0 z-10 lg:top-6 lg:col-span-3 lg:self-start"
          title={`${lesson.course.name}, lesson ${inCourse.indexOf(lesson) + 1} of ${inCourse.length}`}
          steps={allSteps.map((s) => ({ id: s.id, label: s.title }))}
        />

        <div data-lesson-main className="relative mt-8 min-w-0 lg:col-span-9 lg:mt-0">
          <div className="max-w-measure">
            <Link href={courseHref} className={backLinkStyles}>
              {lesson.course.name} course
            </Link>
            <h1 className="mt-4 font-heading text-h1">{lesson.source.title}</h1>
            <p className="mt-4 text-lead">
              <strong>Goal:</strong> <InlineText text={lesson.source.objective} />
            </p>
          </div>

          {allSteps.map((step, index) => {
            const number = index + 1;
            if (step.id === "the-idea") {
              return (
                <StepCard key={step.id} step={step} number={number}>
                  {sameConcept.length > 0 && (
                    <p className="mt-2 text-ui text-ink-muted">
                      This part is the same in the{" "}
                      {sameConcept.map((other, i) => (
                        <span key={other.href}>
                          {i > 0 && " and "}
                          <Link href={other.href} className={textLinkStyles}>
                            {other.course.name} lesson
                          </Link>
                        </span>
                      ))}
                      .
                    </p>
                  )}
                  {lesson.concept && (
                    // The shared idea: the same text in every language that teaches this concept.
                    <div data-concept-text className="max-w-measure">
                      <ProseBlocks blocks={lesson.concept} extras={{ marks }} />
                    </div>
                  )}
                  {lesson.source.concept && <ConceptDiagram concept={lesson.source.concept} />}
                  {renderBlocks(step.blocks)}
                </StepCard>
              );
            }
            if (step.id === "common-mistakes") {
              return (
                <StepCard key={step.id} step={step} number={number}>
                  <Mistakes lesson={lesson} />
                </StepCard>
              );
            }
            if (step.id === "practice") {
              return (
                <StepCard key={step.id} step={step} number={number}>
                  <p className="mt-4 max-w-measure">Choose an answer and check it. Hints and the solution are there when you want them.</p>
                  <Practice lesson={lesson} />
                </StepCard>
              );
            }
            if (step.id === "recap") {
              return (
                <StepCard key={step.id} step={step} number={number}>
                  <ul className="mt-4 flex max-w-measure list-disc flex-col gap-2 pl-8">
                    {lesson.source.recap.map((point) => (
                      <li key={point}>
                        <InlineText text={point} />
                      </li>
                    ))}
                  </ul>
                </StepCard>
              );
            }
            return (
              <StepCard key={step.id} step={step} number={number}>
                {renderBlocks(step.blocks)}
              </StepCard>
            );
          })}

          <LessonNav lesson={lesson} previous={previous} next={next} />
        </div>
      </div>
    </Container>
  );
}
