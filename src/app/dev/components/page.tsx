// Component gallery at /dev/components (DESIGN.md section 7). Every component
// and state, in light and dark side by side, built from real lesson content and
// verified runs; nothing here is invented. Linked from nowhere and not indexed.
// That is not access control: anyone with the address can open it. Delete it
// before launch (Milestone 7), together with /dev/tokens and public/dev/.

import type { Metadata } from "next";
import { courses } from "@content/courses";
import { AnalogyCallout, NoteCallout } from "@/components/callout";
import { CourseCard } from "@/components/course-card";
import { ExplorerBlock } from "@/components/explorer-block";
import { Figure, PathTaken } from "@/components/figure";
import { HighlighterMark } from "@/components/highlighter-mark";
import { LessonCodeBlock, Mistakes, Practice } from "@/components/lesson-parts";
import { InlineText, ProseBlocks } from "@/components/prose";
import { StepRail } from "@/components/step-rail";
import { ThemeToggle } from "@/components/theme-toggle";
import { buttonStyles, textLinkStyles } from "@/components/styles";
import { ValueChip } from "@/components/value-chip";
import { figureFromVisual } from "@/lib/figure-data";
import type { LoadedLesson, RenderedExample, RenderedVisual } from "@/lib/lessons";
import { allLessons, publishedByCourse } from "@/lib/site-lessons";

export const metadata: Metadata = {
  title: "Component gallery",
  robots: { index: false, follow: false },
};

/** Shows its children twice: once in the light theme, once in dark. Wide
    components (code, figures) are stacked so each gets the full width. */
function Both({ children, stack = false }: { children: React.ReactNode; stack?: boolean }) {
  return (
    <div className={`grid gap-4 ${stack ? "" : "xl:grid-cols-2"}`}>
      {(["light", "dark"] as const).map((theme) => (
        // The dark copy repeats the light one, so it is inert: screen readers and
        // the keyboard use the light copy, and region names stay unique.
        <div key={theme} data-theme={theme} inert={theme === "dark"} className="min-w-0 rounded-card border border-rule p-4 md:p-6">
          <p className="mb-4 text-small text-ink-muted">{theme === "light" ? "Light (interactive)" : "Dark, for viewing"}</p>
          {children}
        </div>
      ))}
    </div>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="mt-16">
      <h2 id={id} className="font-heading text-h2">
        {title}
      </h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function State({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-2">
      <span className="text-small text-ink-muted">{label}</span>
      {children}
    </div>
  );
}

function bodyExample(lesson: LoadedLesson, id: string): RenderedExample {
  const block = lesson.body.find((b) => b.type === "example" && b.example.id === id);
  if (block?.type !== "example") throw new Error(`gallery: ${id} is not shown in ${lesson.href}`);
  return block.example;
}

function bodyVisual(lesson: LoadedLesson, id: string): RenderedVisual {
  const block = lesson.body.find((b) => b.type === "visual" && b.visual.id === id);
  if (block?.type !== "visual") throw new Error(`gallery: visual ${id} is not in ${lesson.href}`);
  return block.visual;
}

export default async function ComponentGallery() {
  const lessons = await allLessons();
  const decisions = lessons.find((l) => l.href === "/courses/python/decisions");
  const arrays = lessons.find((l) => l.body.some((b) => b.type === "example" && b.example.typedInput !== undefined));
  if (!decisions || !arrays) throw new Error("gallery: lessons missing");
  const byCourse = await publishedByCourse();
  const vote = bodyVisual(decisions, "vote");
  const voteFigure = figureFromVisual(vote);
  const explorerIn = (href: string) => {
    const found = lessons.find((l) => l.href === href)?.body.flatMap((b) => (b.type === "explorer" ? [b.explorer] : []))[0];
    if (!found) throw new Error(`gallery: no explorer in ${href}`);
    return found;
  };
  const voteExplorer = explorerIn("/courses/python/decisions");
  const pointerExplorer = explorerIn("/courses/c/pointers");
  const compare = bodyExample(decisions, "python/compare");
  const typed = arrays.body.flatMap((b) => (b.type === "example" && b.example.typedInput !== undefined ? [b.example] : []))[0];
  const voteNote = vote.steps.find((step) => step.note && step.line === 2)?.note;
  // The lesson's sections in page order: The idea, its own headings, then the fixed ones.
  const steps = ["The idea", ...decisions.body.flatMap((b) => (b.type === "prose" && b.block.type === "heading" ? [b.block.text] : [])), "Common mistakes", "Practice", "Recap"];

  return (
    <main id="main" className="mx-auto w-full max-w-page px-4 py-12 md:px-6 lg:px-10">
      <h1 className="font-heading text-h1">Component gallery</h1>
      <p className="mt-4 max-w-measure text-lead">
        Every component of the Trailhead design in each of its states, in light and dark. The code, notes, outputs and traces are real lesson content from verified runs. Development page only.
      </p>

      <Section id="buttons" title="Buttons and links">
        <Both>
          <div className="flex flex-wrap gap-6">
            {(["primary", "secondary"] as const).map((kind) => (
              <div key={kind} className="flex flex-col gap-4">
                <p className="font-bold">{kind === "primary" ? "Primary (the learner's own action)" : "Secondary"}</p>
                <div className="flex flex-wrap gap-4">
                  <State label="Default">
                    <button type="button" className={buttonStyles[kind]}>Check answer</button>
                  </State>
                  <State label="Hover">
                    <button type="button" data-state="hover" className={buttonStyles[kind]}>Check answer</button>
                  </State>
                  <State label="Focus">
                    <button type="button" data-state="focus" className={buttonStyles[kind]}>Check answer</button>
                  </State>
                  <State label="Pressed">
                    <button type="button" data-state="pressed" className={buttonStyles[kind]}>Check answer</button>
                  </State>
                  <State label="Disabled">
                    <button type="button" aria-disabled="true" className={buttonStyles[kind]}>Check answer</button>
                  </State>
                  <State label="Loading">
                    <button type="button" aria-disabled="true" className={buttonStyles[kind]}>Running…</button>
                  </State>
                </div>
              </div>
            ))}
            <div className="flex flex-col gap-4">
              <p className="font-bold">Link</p>
              <div className="flex flex-wrap gap-6">
                <State label="Default">
                  <a href="#buttons" className={textLinkStyles}>Python course</a>
                </State>
                <State label="Hover">
                  <a href="#buttons" data-state="hover" className={textLinkStyles}>Python course</a>
                </State>
              </div>
            </div>
          </div>
        </Both>
      </Section>

      <Section id="theme" title="Theme toggle">
        <p className="mb-4 max-w-measure text-ui text-ink-muted">
          In the header. The moon shows in light mode and switches to dark; the sun shows in dark mode. The real button reads the page theme; these copies are fixed previews.
        </p>
        <div className="grid gap-4 xl:grid-cols-2">
          {(["light", "dark"] as const).map((theme) => (
            <div key={theme} data-theme={theme} inert={theme === "dark"} className="flex flex-wrap gap-6 rounded-card border border-rule p-4 md:p-6">
              <State label="Default">
                <ThemeToggle preview={theme} />
              </State>
              <State label="Hover">
                <ThemeToggle preview={theme} state="hover" />
              </State>
              <State label="Focus">
                <ThemeToggle preview={theme} state="focus" />
              </State>
            </div>
          ))}
        </div>
      </Section>

      <Section id="cards" title="Course cards">
        <Both>
          <ul className="grid gap-6 md:grid-cols-3">
            {[courses.find((c) => c.slug === "python")!, courses.find((c) => c.slug === "c")!, courses.find((c) => c.slug === "java")!].map((course, index) => (
              <li key={course.slug} className="flex">
                <CourseCard course={course} headingLevel="h3" lessonCount={byCourse.get(course.slug)?.length ?? 0} state={index === 1 ? "hover" : undefined} />
              </li>
            ))}
          </ul>
          <p className="mt-3 text-small text-ink-muted">Published (teal band), lifted as on hover and keyboard focus, and planned (grey band).</p>
        </Both>
      </Section>

      <Section id="chips" title="Value chip and path taken">
        <Both>
          <div className="flex flex-col gap-4">
            <State label="Value chip (only on a line a note or explorer is about)">
              <ValueChip>False</ValueChip>
            </State>
            <State label="Path taken, from the vote trace">
              <PathTaken steps={voteFigure.path} />
            </State>
          </div>
        </Both>
      </Section>

      <Section id="callouts" title="Callouts">
        <Both>
          <div className="flex flex-col gap-4">
            {decisions.source.analogy && <AnalogyCallout analogy={decisions.source.analogy} />}
            <NoteCallout title="Note">
              <InlineText text={decisions.source.objective} />
            </NoteCallout>
          </div>
        </Both>
      </Section>

      <Section id="code" title="Code block, notes and ink connector">
        <p className="mb-4 max-w-measure text-ui text-ink-muted">
          From 1024px, hover a note or Tab to the notes and use the arrow keys: the line is highlighted and an ink connector joins them. Below 1024px each note sits under its line.
        </p>
        <Both stack>
          <LessonCodeBlock example={compare} regionLabel={`${compare.languageLabel} code: comparisons`} />
        </Both>
      </Section>

      <Section id="typed" title="Typed input panel">
        <Both stack>
          <LessonCodeBlock example={typed} regionLabel={`${typed.languageLabel} code: typed input`} />
        </Both>
      </Section>

      <Section id="figure" title="Figure with path taken and predict then run">
        <Both stack>
          <Figure
            title={vote.title}
            regionLabel={`${vote.languageLabel} code: ${vote.title}`}
            lines={voteFigure.lines}
            path={voteFigure.path}
            output={voteFigure.output}
            note={voteNote ? { line: 2, text: voteNote } : undefined}
            predict={{ line: voteFigure.predictLine }}
          />
        </Both>
      </Section>

      <Section id="explorer" title="Explorer">
        <p className="mb-4 max-w-measure text-ui text-ink-muted">
          Explorers show only verified variants: every value is a real run that check:examples reran. The slider from the Decisions lesson and the pointer boxes from the C Pointers lesson.
        </p>
        <Both stack>
          <div className="flex flex-col gap-8">
            <ExplorerBlock data={voteExplorer} />
            <ExplorerBlock data={pointerExplorer} />
          </div>
        </Both>
      </Section>

      <Section id="rail" title="Step rail">
        <Both>
          <div className="max-w-rail">
            <StepRail title="Python, lesson 5 of 13" steps={steps.map((label, i) => ({ id: `gallery-step-${i}`, label }))} current="gallery-step-1" />
          </div>
        </Both>
      </Section>

      <Section id="marks" title="Highlighter mark">
        <Both>
          <div className="flex flex-col gap-3 text-body">
            <p>
              Drawn: a choice like this is called a <HighlighterMark><strong>decision</strong></HighlighterMark>.
            </p>
            <p>
              Before it scrolls into view: every decision depends on a <HighlighterMark state="pending"><strong>condition</strong></HighlighterMark>.
            </p>
          </div>
        </Both>
      </Section>

      <Section id="mistake" title="Mistake block">
        <Both stack>
          <Mistakes lesson={{ ...decisions, mistakes: decisions.mistakes.slice(0, 1) }} />
        </Both>
      </Section>

      <Section id="practice" title="Practice question and bloom">
        <p className="mb-4 max-w-measure text-ui text-ink-muted">Choose the correct option and press Check answer to see the feedback and the bloom.</p>
        <Both stack>
          <Practice lesson={{ ...decisions, practice: decisions.practice.slice(0, 1) }} />
        </Both>
      </Section>

      <Section id="preview" title="Real content preview: Making decisions with if and else">
        <div className="grid gap-8">
          <div>
            <p className="mb-2 font-bold">Current page (screenshot of main before the redesign)</p>
            <picture>
              <source media="(min-width: 64rem)" srcSet="/dev/current-lesson-1440.jpg" />
              <img src="/dev/current-lesson-360.jpg" alt="The current Python Decisions lesson: title, goal and the start of The idea, in the Annotated Notebook design." className="w-full max-w-full rounded-panel border border-rule" />
            </picture>
          </div>
          <div>
            <p className="mb-2 font-bold">With the new components</p>
            <div className="rounded-card border border-rule bg-canvas p-4 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,3fr)] lg:gap-10 lg:p-10">
              <StepRail title="Python, lesson 5 of 13" label="Steps in the preview lesson" steps={steps.map((label, i) => ({ id: `preview-step-${i}`, label }))} current="preview-step-0" />
              <div className="mt-6 min-w-0 lg:mt-0">
                <h3 className="font-heading text-h1">{decisions.source.title}</h3>
                <p className="mt-4 max-w-measure text-lead">
                  <strong>Goal:</strong> <InlineText text={decisions.source.objective} />
                </p>
                <div className="mt-8 rounded-card border border-rule bg-surface p-6">
                  <p className="text-small font-bold text-primary">Step 1</p>
                  <h4 className="mt-1 font-heading text-h2">The idea</h4>
                  <div className="mt-4 max-w-measure text-body">{decisions.concept && <ProseBlocks blocks={decisions.concept.slice(0, 2)} />}</div>
                </div>
                <div className="mt-8">
                  <Figure title={vote.title} regionLabel={`${vote.languageLabel} code: preview`} lines={voteFigure.lines} path={voteFigure.path} output={voteFigure.output} predict={{ line: voteFigure.predictLine }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </main>
  );
}
