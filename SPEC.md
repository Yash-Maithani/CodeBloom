# CodeBloom product specification

This file defines what CodeBloom should do. The mission, audience and roadmap come from `CODEBLOOM_MASTER_BRIEF.md` (Sections 2, 5, 6 and 18); this file turns them into testable requirements. Visual rules are in `DESIGN.md`. Status is in `PROGRESS.md`.

Every requirement carries a label:

- **[C] Confirmed**: stated in the master brief or approved by the owner.
- **[A] Assumption**: proposed by Claude, needs owner confirmation before it is built.
- **[F] Future**: deliberately deferred.

## 1. Vision

A beginner should be able to open CodeBloom, pick a language, and come away understanding a concept well enough to use it in a new problem, without feeling stupid along the way. Lessons explain with plain language and examples, show code that has actually been run, let the learner follow execution step by step, and give practice with feedback that teaches. [C]

## 2. Users and their problems

| User | What gets in their way |
|---|---|
| Complete beginner, never programmed | Unexplained jargon; examples that assume prior knowledge; fear of making mistakes. |
| College student in a C, C++, Java or Python course, preparing for practicals or exams | Lecture notes that show syntax without reasons; cannot trace what a program does line by line; memorizes programs instead of understanding them. |
| Self-taught learner | Tutorials that jump steps or are walls of text; no feedback on whether they understood. |
| Example-first learner | Abstract definitions before any concrete case. |

Source: brief Section 2. [C]

## 3. Core user journeys

1. **First visit.** Within the first screen the visitor understands what CodeBloom is and who it is for, and can choose one of the four languages. [C]
2. **Choose a course.** The course page lists lessons in order, each with a one-line learning objective, and starts the first lesson in one action. [C]
3. **Learn a lesson.** The learner reads a short explanation, sees an annotated example with its real output, reviews common mistakes and a recap, then moves to the next lesson. [C]
4. **Practice.** The learner answers a question, gets immediate feedback that explains why, can reveal hints one at a time, and can view an explained solution. [C, Milestone 3]
5. **Follow execution.** For selected concepts, the learner steps forward and back through a program and watches variables or iterations change. [C, Milestone 4]
6. **Return.** The learner finds a lesson again from the course page. Remembering completed lessons between visits is an open decision (see Section 10). [A]

## 4. Functional requirements

### Homepage

- FR-H1 States in plain words what CodeBloom teaches and for whom. No vague headline. [C]
- FR-H2 Presents C, C++, Java and Python, each linking to a real course page. [C]
- FR-H3 Every call to action leads somewhere real. No placeholder controls. [C]
- FR-H4 Contains no testimonials, user counts, metrics, partner logos or claims that are not true today. [C]
- FR-H5 Shows a real annotated code example as the first thing a visitor sees, so the teaching style is visible immediately. [A]

### Course pages

- FR-C1 One page per language, listing lessons in order with their objectives. [C]
- FR-C2 A course with no published lessons yet says so plainly and points to a course that has lessons, instead of showing empty or dead links. [A]

### Lessons

- FR-L1 Lessons are structured files in the repository that follow one schema (Section 6). [C]
- FR-L2 Code examples show line-by-line explanations as margin notes, following `DESIGN.md`. [C]
- FR-L3 Runnable code and pseudocode are labeled differently. [C]
- FR-L4 Every runnable example shows its expected output, and that output comes from actually running the code. [C]
- FR-L5 Previous and next lesson navigation, plus a way back to the course page. [C]
- FR-L6 Code can be copied with one action; the copy contains only code, never notes or line numbers. [A]

### Practice (Milestone 3)

- FR-P1 Multiple-choice and predict-the-output questions. [C]
- FR-P2 Immediate feedback after each answer that explains why it is right or wrong. [C]
- FR-P3 Progressive hints, revealed one at a time by the learner. [C]
- FR-P4 Explained solutions available after an attempt or on request. [C]
- FR-P5 Completion indicators reflect real state only. [C]

### Visualizations (Milestone 4)

- FR-V1 Start with one or two step-through visualizations. Candidates: loop iteration tracing and variable state. [C]
- FR-V2 The learner controls every step (forward, back, restart). Nothing auto-plays. [A]
- FR-V3 Every visualization has a text equivalent that conveys the same information. [C]

## 5. Nonfunctional requirements

- NFR-1 Pages are statically or server rendered; client JavaScript only where interaction needs it. [C]
- NFR-2 Lesson content lives in the repository as structured files. No database for content. [C]
- NFR-3 Adding a fifth language requires new content and configuration, not new page code. [C]
- NFR-4 No user-submitted code runs on the application server, ever. [C]
- NFR-5 No secrets in the repository or client bundle. [C]
- NFR-6 Homepage and lesson pages score 90 or higher for performance and accessibility in Lighthouse mobile audits. [A]
- NFR-7 Works in the current and previous major versions of Chrome, Edge, Firefox and Safari, desktop and mobile. [A]

## 6. Educational requirements

### Lesson schema

Required in every lesson: [C]

- A learning objective written from the learner's point of view.
- A plain-language explanation of the concept and why it is useful.
- At least one minimal runnable example with margin notes on the important lines and its verified output.
- A short recap.

Optional blocks, chosen per concept rather than forced into every lesson: [C]

- Analogy, with a note on where it stops being accurate.
- A more challenging example.
- Common mistakes, each with the wrong code, what happens, and the fix.
- Practice exercises with progressive hints and explained solutions.
- A visualization.
- A small project or revision exercise.

When one concept is taught in several languages, the shared idea is explained once and language-specific syntax or behavior is called out separately. [C]

### Language targets

Examples use standard, portable code that compiles with current mainstream toolchains, and avoid compiler-specific headers or behavior (for example `conio.h`). Proposed language levels: C17, C++17, Java 17 or later, Python 3.12 or later. [A]

### When a lesson counts as verified

A lesson may be marked verified only when all of these are true: [C]

1. Every runnable example compiled and ran, and its stated output matches the real output exactly.
2. Every quiz answer, hint and explanation was checked against the question.
3. The text was read for unexplained jargon and misleading simplifications.
4. The page passed the reviews required by `CLAUDE.md` for its milestone.

## 7. Accessibility and responsive requirements

- AR-1 Meets WCAG 2.1 AA. [C]
- AR-2 Every feature, including quizzes, hints, margin notes and visualizations, works with a keyboard alone, with a visible focus indicator. [C]
- AR-3 Results of actions (quiz feedback, revealed hints, visualization steps) are announced to screen readers. [C]
- AR-4 Information is never conveyed by color alone. [C]
- AR-5 Respects the reduced-motion preference; no content depends on animation. [C]
- AR-6 Content reflows without horizontal page scrolling at 320 CSS pixels wide and remains usable at 200% zoom. Code blocks may scroll horizontally inside themselves. [C]
- AR-7 Touch targets are at least 44 by 44 CSS pixels. This is stricter than 2.1 AA and is a project choice. [A]
- AR-8 Layouts are designed and checked at 360, 768, 1024 and 1440 pixels wide. [A]

## 8. Initial release scope

Proposed first public release: Milestones 1 to 4 plus the launch checklist in brief Section 16 (Milestone 7). [A]

| In scope | Out of scope for the first release |
|---|---|
| Homepage, four course pages | Accounts and login |
| A small set of beginner lessons, starting with one or two languages | Database and server-side progress |
| Practice questions with hints and solutions | Code editor and playground |
| One or two step-through visualizations | Running learner code anywhere |
| Privacy policy and terms that describe real practice | Dashboards, bookmarks, history |

## 9. Acceptance criteria by milestone

### Milestone 0a: documentation [C]

- `CLAUDE.md`, `SPEC.md`, `DESIGN.md` and `PROGRESS.md` exist, follow the approved plan, contain no em dashes, and do not duplicate each other or the brief.

### Milestone 0b: project scaffold [C]

- Next.js, TypeScript and Tailwind app created with npm; versions recorded in `PROGRESS.md`.
- `lint`, `typecheck` and `build` scripts pass.
- One Playwright smoke test opens the home route and passes.
- `check:examples` script compiles and runs sample C, C++, Java and Python files and compares output.
- `DESIGN.md` tokens exist in code (CSS variables and Tailwind theme).
- Cloud sessions can run the checks on start.

The criteria for Milestones 1 to 4 below refine brief Section 18 and are [A] until confirmed when each milestone is planned.

### Milestone 1: homepage

- FR-H1 to FR-H5 met.
- Correct at 360, 768, 1024 and 1440 pixels; no horizontal page scroll.
- `website-design:web-review` and `design:accessibility-review` run; high-priority findings fixed and logged.

### Milestone 2: lesson architecture

- Lesson schema implemented and validated at build time.
- Course and lesson navigation work (FR-C1, FR-C2, FR-L5).
- At least three lessons meet the verified definition in Section 6.

### Milestone 3: practice

- FR-P1 to FR-P5 met for every published lesson that has exercises.
- Keyboard-only and screen reader walkthrough of a full question recorded in `PROGRESS.md`.

### Milestone 4: visualizations

- FR-V1 to FR-V3 met for the chosen concepts.
- Reduced-motion mode checked in the browser.

Milestones 5 to 7 get acceptance criteria when they are planned.

## 10. Exclusions and open decisions

### Not planned

Forums or community features, certificates, streaks or gamified counters, AI chat tutor, payments. Any of these needs a new owner decision. [A]

### Deferred [F]

Browser code editor, secure external execution service, accounts (Supabase is a candidate), persistent progress, dashboards, bookmarks and history.

### Open decisions

1. Lesson file format: MDX or typed data files. Decide in Milestone 2 after one sample lesson.
2. Which language or languages the first lessons use.
3. Whether the first release remembers completed lessons in browser storage.
4. When the light and dark theme toggle ships (tokens for both are already defined).
5. Hosting provider for previews and launch.
6. Whether to use any analytics. Default: none until the privacy policy covers it.
