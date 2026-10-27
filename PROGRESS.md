# CodeBloom progress

Current status and handoff. Requirements are in `SPEC.md`, design in `DESIGN.md`, working rules in `CLAUDE.md`. Status words are defined in `CLAUDE.md`.

Last updated: 2026-10-27

## Current milestone

**Milestone 3: interactive practice.** Implemented and Tested (Chromium only; light and dark; 320 to 1440px; keyboard only). Not yet Verified: the screen reader walkthrough is done by the owner with the checklist below, and Milestone 3 is marked Verified only after the owner reports the results. Awaiting owner review and a pull request opened by the owner. Nothing is Deployed.

Milestone 2 was merged by the owner in pull request 4 (`fe8edd2`).

### Screen reader checklist for the owner (one full question)

Windows, Narrator (Windows key + Ctrl + Enter) or NVDA, in Edge or Chrome, on `/courses/python/decisions` (local build or a preview). Note what is announced at each step and whether anything is missing, wrong or read twice.

1. Move to the Practice heading with heading navigation (NVDA: H; Narrator: Caps Lock + H). Expect "Practice, heading level 2", then "0 of 3 questions answered correctly on this page".
2. Press Tab until you reach Question 1. Expect the group name "Question 1. This is the delivery program again, with a larger order. What does it print?" and the first option announced as a radio button, "1 of 4".
3. Use the arrow keys to move through the options. Expect each to be read in full, the two-line option as "Line 1: Small order: delivery costs extra Line 2: Delivery fee: 5", and the last as "Nothing is printed".
4. Choose "Delivery fee: 5" (a wrong answer). Tab to "Check answer" and press Enter. Expect "Not quite", then "Line 4 is indented, so it belongs to the if and is skipped too...", then "Try again, or show a hint.", read without moving focus.
5. Press Enter on "Check answer" again without changing the answer. Expect the same feedback to be read again.
6. Tab to "Show hint 1 of 2" and press Enter. Expect "Hint 1: Is 80 less than 50?" to be read, and the button to become "Show hint 2 of 2". Press Enter again. Expect hint 2 to be read, and focus to move to "Check answer".
7. Shift + Tab back to the options, choose "Delivery fee: 0", then Tab to "Check answer" and press Enter. Expect "Correct" and the explanation. Then check that "Answered correctly" is next to the buttons and that the summary under the heading now says "1 of 3".
8. Tab to "Show solution" and press Enter. Expect it to be announced as expanded, with the button label now "Hide solution". Move into it and expect "Expected output for Python code for practice question 1" and "Delivery fee: 0", then the explanation.
9. Report: anything not announced, announced twice, or confusing, with the step number.

## Completed work

| Item | Status | Notes |
|---|---|---|
| Master brief added to `main` | Done (by owner) | Commit `04e1fdc` |
| Milestone 0a documentation | Done | Merged by the owner in pull request 1 (merge commit `ed6b9d4`) |
| Next.js, TypeScript strict, Tailwind app with npm | Tested | Versions below |
| `DESIGN.md` tokens in code | Verified in browser | `src/app/globals.css`: colors (light and dark), type scale, spacing, radius, shadow, motion, breakpoints, widths |
| Three fonts loaded with `next/font` | Verified in browser | Self-hosted at build time; no request to Google at run time |
| One token and font proof page | Verified in browser | `src/app/page.tsx`. Development page only, not the homepage. No links or buttons |
| `lint`, `typecheck`, `build` | Tested | Results in the log below |
| One Playwright smoke test | Tested | `tests/e2e/smoke.spec.ts` |
| Lesson example runner for C, C++, Java, Python | Tested | `scripts/lib/example-runner.mjs`, one tiny example per language in `content/examples/`, 10 runner tests |
| SessionStart hook | Tested | `.claude/settings.json` and `.claude/hooks/session-start.sh`. Seen installing in a brand-new cloud session on 2026-10-27 |
| Browser verification script | Tested | `scripts/verify-browser.mjs`, reads expected values from `DESIGN.md` |
| Git rules added to `CLAUDE.md` | Implemented | Section "Git and branch safety" |
| Milestone 0b | Done | Merged by the owner in pull request 2 (`3be88e0`) |
| D12 token names recorded in `DESIGN.md` | Done | `text-mono`, `max-w-measure`; values unchanged |
| D18, D19, D20 applied to `DESIGN.md` and `SPEC.md` | Done | Approved by the owner |
| Homepage `/` | Verified in browser | Hero, annotated example, lesson steps, course cards, owner's story |
| Courses page `/courses` and four course pages | Verified in browser | Planned topics as plain text, "No lessons yet" note, static, unknown courses return 404 |
| 404 page | Verified in browser | Header, footer and two links |
| Components: header, navigation, footer, course card, note callout, code block with margin notes | Verified in browser | `src/components/` |
| Token page moved to `/dev/tokens` | Tested | Linked from nowhere, `noindex, nofollow`. noindex is not access control: anyone with the address can open it. Delete before launch |
| 45 Playwright tests | Tested | Navigation crawl, honesty, keyboard, layout and themes, smoke, syntax roles, favicon links, and a guard that no Shiki code reaches the browser |
| Syntax colors in code blocks (D21) | Verified in browser | Shiki 4.5.0, server only. `src/lib/highlight.ts` maps Shiki scope names to the four `DESIGN.md` roles; `CodeBlock` is unchanged |
| Highlighter unit tests | Tested | `src/lib/highlight.test.ts`, 9 tests, `npm run test:unit` |
| Provisional favicon (D27) | Verified in browser | `public/icon.svg` and `public/icon-32.png`. Final favicon is still a launch item |
| Windows line-ending fix (D29) | Tested | `.gitattributes`; one normalizer used by the example loader, the highlighter and `check:examples`; 27 new regression tests. Tested on a CRLF copy under Node 20 on Linux, not on real Windows |
| ESLint 9 and Node requirement (D30, D31) | Tested | Peer warnings gone; `engines` now says Node 22.18 or newer; `test:runner` works on Node 20 and 22 |
| Milestone 1 | Done | Merged by the owner in pull request 3 (`6bc50d3`) |
| `server-only` guard (D36) | Tested | A client import of the highlighter, example loader, lesson loader or publish gate fails the build (negative control run) |
| Expected-failure examples (D34) | Tested | `.compile-error.txt` and `.run-error.txt`, matched exactly; 14 new runner tests |
| Verification record and publish gate (D35) | Tested | `content/verified-examples.json`; the build refuses unverified or changed examples on published pages and the homepage |
| Lesson schema, Markdown-subset parser, loader (D32) | Tested | `src/lib/lesson-types.ts`, `prose.ts`, `lessons.ts`; build-time checks for placeholders, notes, links, topics, text |
| Lesson page `/courses/<course>/<lesson>` | Verified in browser | Shared idea, analogy, annotated examples, common mistakes with real error messages, practice with Show solution, recap, previous and next |
| Course pages list published lessons | Verified in browser | Start button, numbered lessons with objectives, planned topics as plain text |
| Four lessons, 30 examples | Verified in browser | Text approved by the owner; 25 new examples, 7 of them meant to fail |
| Homepage and course status text from lesson data | Verified in browser | "Lessons explain", "first lessons are published for C and Python", lesson counts, example links to its lesson |
| `docs/lesson-authoring.md` | Done | Draft, verify, review, publish; capture commands checked against the real files |
| Copy code announces every click | Tested | Follow-up from Milestone 1. A second click inside two seconds is announced again, and "Copied" resets two seconds after the last click. `src/components/code-block.tsx`, `tests/e2e/copy.spec.ts` |
| Milestone 2 | Done | Merged by the owner in pull request 4 (`fe8edd2`) |
| Practice schema: predict-the-output and multiple choice (D46) | Tested | `src/lib/lesson-types.ts`; correct output read from the verified file; equality guard; build checks for options, hints and limits |
| Interactive practice component (D47, D48) | Tested | `src/components/practice-set.tsx`: radios in a fieldset, Check answer, live feedback, hints one at a time, Answered correctly, page count; nothing stored |
| 12 practice questions on the four lessons | Tested | Approved by the owner; 8 predict-the-output (existing verified examples), 4 multiple choice |
| Teaching-quality wording changes (D44) | Verified in browser | Four proposals from `design:design-critique`, approved by the owner: "output" and "memory" defined at first use, "program" and "running" defined in the shared idea, the C `main` note split across three places. Note schema unchanged |

## In progress

Nothing beyond owner review of Milestone 3 and the owner's screen reader walkthrough.

## Outstanding tasks

1. Owner runs the screen reader checklist above and reports the results; then Milestone 3 can be marked Verified in browser.
2. Owner reviews Milestone 3 and opens the pull request from `claude/milestone-3`.
3. Owner decides on the `design:design-critique` proposals for the questions (verification log, Milestone 3). They change approved text, so none was applied.
4. Launch items still open (brief Section 16): the final favicon, social sharing metadata, and removing `/dev/tokens`.
5. Owner answers the open decisions in `SPEC.md` Section 10 as each milestone needs them. Decision 3 (remembering completed lessons) stays open.

## Stack and versions (checked 2026-10-26)

| Package | Version | Note |
|---|---|---|
| next | 16.4.3 | Latest at scaffold time. App Router, Turbopack default |
| react, react-dom | 19.3.0 | What `create-next-app` 16.4.3 installs |
| typescript | 5.9.3 | See D8 |
| eslint | 9.39.5 | Moved down from 10.13.0, see D30. npm prints a deprecation notice for it |
| eslint-config-next | 16.4.3 | Same version as `next` |
| tailwindcss, @tailwindcss/postcss | 4.3.3 | Tailwind's documented PostCSS setup, see D9 |
| postcss | 8.5.31 | Required by the Tailwind plugin |
| @playwright/test | 1.63.0 (exact) | Matches the pre-installed Chromium, see D10 |
| @types/node | 22.20.5 | Matches the Node 22 in use |
| lucide-react | 1.61.0 | Icons (ISC). Added in Milestone 1, see D22 |
| shiki | 4.5.0 (exact) | Syntax highlighting, server only (MIT, 4 MB plus 14 MB of grammars and themes in `node_modules`, none sent to browsers). See D21 |
| server-only | 0.0.1 (exact) | Makes a client import of server code a build error (MIT, no dependencies, two tiny files). See D36 |
| Node, npm | 22.22.0, 10.9.4 | `engines` asks for Node 22.18 or newer, see D31 |

Official sources read: Next.js installation and ESLint pages (Node 20.9 minimum, TypeScript 5.1 minimum, ESLint 9 and 10 supported, Node 22.13 or newer needed for ESLint 10) and the Tailwind Next.js guide.

### Font and icon licenses (license files read 2026-10-26)

| Asset | License | Source |
|---|---|---|
| Literata | SIL Open Font License 1.1 | github.com/google/fonts, `ofl/literata/OFL.txt` |
| Atkinson Hyperlegible Next | SIL Open Font License 1.1 | `ofl/atkinsonhyperlegiblenext/OFL.txt` |
| Atkinson Hyperlegible Mono | SIL Open Font License 1.1 | `ofl/atkinsonhyperlegiblemono/OFL.txt` |
| Lucide icons | ISC | github.com/lucide-icons/lucide, `LICENSE` |

The OFL allows free use, self-hosting and embedding in a website; the font files must not be sold on their own.

## Known limitations

- `check:examples` is verified on Linux only. On Windows expect it to fail or misbehave: it starts `python3` (Windows normally has `python` or `py`), runs the compiled C and C++ programs without an `.exe` extension, assumes `gcc`, `g++`, `javac` and `java` are installed and on PATH, and stops a hung example by killing a Unix process group, which Windows does not have (it falls back to killing only the first process). Run it in WSL or a cloud session. Nothing in this project has been run on real Windows; the Windows checks so far are a simulation (a CRLF copy of the tree, Node 20, on Linux).
- Node 20 is not supported. Per the Node.js release schedule it reached end of life on 2026-04-30. `engines` asks for Node 22.18 or newer because `npm run test:unit` uses Node's built-in TypeScript support, which starts at 22.18.0 (measured: 22.17.1 fails, 22.18.0 passes). On Node 20 `npm ci` prints an `EBADENGINE` warning. With Node 20 the site, build, lint, typecheck, browser tests, `check:examples`, `test:runner` and `verify:browser` all passed in the simulation; only `test:unit` cannot run.
- `npm ci` prints a deprecation notice for ESLint 9.39.5 ("no longer supported"). It is the newest ESLint 9 (npm's `maintenance` tag), and it is the one that carries the notice. See D30 for the trade-off.
- A Windows working copy that was checked out before `.gitattributes` existed keeps CRLF files until Git rewrites them. The site no longer depends on that (D29), but a fresh clone gets LF.
- Build warning, still printed: Next.js says "Failed to find font override values" for Atkinson Hyperlegible Next and Mono, so it cannot generate size-matched fallback fonts. Measured in Milestone 1: Lighthouse CLS is 0 on every page, mobile and desktop. With every font file delayed by 2 seconds in Playwright, CLS is 0.0368 (home), 0.0478 (courses) and 0.0164 (course page) at 360px, and 0.0201, 0.0138 and 0.0022 at 1440px. All are below the 0.1 "good" threshold, so no fix was made. Not silenced.
- A direct request to `/favicon.ico` still returns 404. Browsers that find the icon links do not make it, and Lighthouse no longer reports it. A crawler or old browser that asks for it anyway would get a 404.
- Lighthouse mobile performance varies between runs in this container, with no code change in between: homepage 74, 96, 98 and 97 in Milestone 1, then 86 (before the favicon) and 96 (after) in the Shiki session. Total blocking time moves between about 110 and 770 ms. Desktop is steady at 100.
- The comment role is covered by unit tests only. The homepage example has no comment, so the browser tests check keywords and literals.
- Error messages in lessons are matched exactly against the cloud toolchain (gcc 13.3.0, Python 3.13.17, `C.UTF-8`). On another version, `check:examples` may fail for the 7 error examples until a person reviews the new messages. gcc prints curly quotes around names under this locale; they are shown as captured (D34).
- Every output and error panel is a tab stop, even when it does not scroll (D40). On a lesson page this adds one stop per example.
- The publish gate compares file hashes only. Changing the runner's compiler flags would not invalidate the record; rerun `check:examples` after any runner change.
- The lesson loader and publish gate read files at build time only, with Turbopack tracing turned off for those reads (D37). If a lesson page ever becomes dynamic, it would fail at run time; all lesson routes are static with `dynamicParams = false`.
- Practice answers are in the page, so this is practice, not grading. Nothing is stored: a reload starts every question fresh (D48).
- With JavaScript off, Check answer and the hints are hidden; the options and Show solution still work. Before the page is interactive the buttons are invisible and unfocusable, with their space reserved (CLS 0).
- One output option scrolls inside its row at 320px (the two-line delivery option on Python Decisions); it then becomes focusable so keyboard users can scroll it.
- The fact used in C first program question 3 (running without recompiling shows the old message) is not a `check:examples` example, because it needs the source edited after compiling. It was tested by hand (verification log, 2026-10-27).
- On a phone, code inside a Common mistake callout has less room (callout padding plus code gutter); long lines scroll inside the panel.
- The "Your first C program" commands were tested on Linux only; the lesson says so.
- Keywords come from an explicit scope list in `highlight.ts`. A keyword the list misses stays plain, which is harmless; a type name such as Java's `String` is never bold. Add scopes when a lesson shows a missed keyword.
- `npm run test:unit` prints a Node warning (`MODULE_TYPELESS_PACKAGE_JSON`) because `package.json` has no `"type"` field. It is harmless. Setting `"type": "module"` was not done because it changes how every config file loads.
- The example runner is not a sandbox. It runs repository files with the permissions of whoever runs it. It is safe for reviewed files only. See `CLAUDE.md` Security.
- Italic Atkinson Mono is loaded (4 Mono files in total) because code comments are italic. File weight is not optimized yet.
- Dark-theme token values appear twice in `globals.css` (system preference and forced `data-theme`), because CSS cannot share one rule between them. The verify script checks both paths.
- No real screen reader (NVDA, VoiceOver) was used. Accessibility checks so far are automated and structural.
- Only Chromium was tested. Firefox and Safari were not.
- Context7 is not available in this environment; official docs are fetched directly instead.
- The design direction was not compared with real reference sites, because UXKIN is not connected.
- `design:design-critique` and `design:design-system` were first run in Milestone 2 (see the verification log).

## Verification log

| Date | What | Result |
|---|---|---|
| 2026-10-26 | Repository inspection | Empty repository: one commit adding the master brief; no code. |
| 2026-10-26 | `frontend-design:frontend-design`, `website-design:web-design-system` | Direction A, Annotated Notebook, written to `DESIGN.md` (Milestone 0a). |
| 2026-10-26 | `npm run lint` (ESLint 10.13.0 with `eslint-config-next`) | Exit 0, no warnings. |
| 2026-10-26 | `npm run typecheck` (TypeScript 5.9.3, strict) | Exit 0. |
| 2026-10-26 | `npm run build` | Exit 0. Routes `/` and `/_not-found` prerendered as static. Two font fallback warnings, see Known limitations. |
| 2026-10-26 | `npm run test:e2e` | 1 passed: route returns 200, title and heading, three font families loaded, no console errors. |
| 2026-10-26 | `npm run check:examples` | 4 of 4 passed (C17, C++17, Java, Python), 0 problems. Expected output `Fruit: 7` was captured from real runs. |
| 2026-10-26 | `npm run test:runner` | 10 of 10 passed: output mismatch, non-zero exit, hang stopped at timeout, endless output stopped, C warning fails compile, missing expected file, symlink refused, unexpected files refused, empty language folder fails. |
| 2026-10-26 | `npm run verify:browser` in Chromium | 114 of 114 checks passed. Details below. |
| 2026-10-26 | Negative control for the verify script | Changed one hex digit of `accent`: the script failed with the computed and documented values, then the change was reverted and all 114 checks passed again. |
| 2026-10-26 | `design:accessibility-review` plus axe-core 4.14.0 scan (kept outside the repo), keyboard, reflow, text spacing | 0 axe violations in both themes. One item needed review and was fixed: the code sample had `aria-label` without a role, now `role="region"`. Reflow at 320, 360 and 640px has no horizontal page scroll; text-spacing override (WCAG 1.4.12) causes no overflow or clipping. |
| 2026-10-26 | SessionStart hook, run by hand | Local session: no action. Cloud session without stamp: `npm ci` ran (about 15 s). Repeat: skipped. Changed lockfile hash: reinstalled. Out-of-sync lockfile: clear failure message, exit 1. npm missing: clear message, exit 1. Run from other directories and by bare file name: works. |
| 2026-10-26 | `npm audit`, `npm ls` | 0 vulnerabilities, no invalid or missing packages. |
| 2026-10-26 | Document hygiene | No em or en dashes in authored files. No raw hex values outside `globals.css`. `CODEBLOOM_MASTER_BRIEF.md`, `SPEC.md` and `DESIGN.md` unchanged. |
| 2026-10-26 | SessionStart hook on resume (Milestone 1 session) | Ran automatically at resume: "node_modules already matches package-lock.json, install skipped." Earlier in the same container it did not run, because the checkout then predated `.claude/`; run by hand it installed 366 packages in 18.5 s, then skipped on the second run. |
| 2026-10-26 | Shiki 4.5.0 evaluated in a scratch folder (not in the repo) | Correct tokens for C, C++, Java and Python, including C++ raw strings, Java text blocks, Python f-strings and triple-quoted strings, and comment markers inside strings. 45 packages, 23 MB in `node_modules`, highlighter start 37 ms. Decision D21 was then approved by the owner (see the Shiki rows below). |
| 2026-10-26 | `design:ux-copy` on all Milestone 1 copy | Lead changed to future tense ("Lessons will explain"); example caption "An example of how lessons explain code"; lesson step 3 says "run", not "compiled and run", because Python is not compiled like C or Java; copy button "Copy code" with a failure message that says what to do. Owner's story kept word for word. |
| 2026-10-26 | `frontend-design:frontend-design` | Composition: left-aligned stacked hero with the annotated code block as the one bold element; plain numerals for lesson steps so they are not confused with note markers; 2 by 2 course cards. |
| 2026-10-26 | `website-design:landing-page` | Built the homepage, courses page, course pages and 404 to `DESIGN.md`. |
| 2026-10-26 | `website-design:web-review` (rendered at 375, 768 and 1440 px, light and dark, keyboard) | No must-fix items; call to action visible above the fold at 375 by 667. Fixed: planned-topic numbers 10 and 11 hung outside the column; phone code gutter narrowed by 16 px. Deferred to launch: favicon and social preview metadata. |
| 2026-10-26 | `design:accessibility-review` with axe-core 4.14.0 (outside the repo) | 0 violations and 0 items needing review on `/`, `/courses`, `/courses/c` and the 404 page, light and dark, 360 and 1440 px. Reflow at 320 px and at 200% zoom with text-spacing overrides: no horizontal scroll; only intentionally screen-reader-only elements are clipped. Fixed: footer links C, C++ and Java were narrower than 44 px (now at least 48 by 48); "Notes on this code" was announced twice. Accessibility tree checked: code region, then the notes list with "Line 1:", "Line 2:", "Lines 4 to 5:". |
| 2026-10-26 | Lighthouse 13.5.0 (outside the repo), Playwright Chromium | Desktop: performance 100, accessibility 100, best practices 96, SEO 100 on all three pages; CLS 0. Mobile: performance 74 then 96, 98, 97 on reruns (home), 98 (courses), 96 (course page); accessibility 100; CLS 0 everywhere. Best practices 96 is the favicon 404. |
| 2026-10-26 | Final gates on the Milestone 1 code | `lint` 0 problems, `typecheck` 0 errors, `build` all routes static (two known font warnings), `test:e2e` 34 of 34 passed, `check:examples` 5 of 5, `test:runner` 10 of 10, `verify:browser` 114 of 114 (now on `/dev/tokens`), `npm audit --omit=dev` 0 vulnerabilities, no server-only code in client chunks. |
| 2026-10-26 | Negative control for the navigation tests | Added a footer link to a page that does not exist: the crawl test and the link test both failed; the link was removed. |
| 2026-10-26 | Shiki 4.5.0 installed (exact), `src/lib/highlight.ts` rewritten | Probed the real scope names for C, C++, Java and Python before writing the mapping. Findings that shaped it: the `f` of an f-string and the `0x` of a hex number are `storage.type` scopes inside literals; Java type names such as `String` are plain `storage.type`; word operators (`new`, `and`, `not`, `instanceof`) are scoped as operators; Javadoc tags carry keyword scopes inside comments; the Java imported package name is scoped as a modifier. Rules: comment beats literal beats keyword, symbols stay plain, keywords come from an explicit list. Edge spaces are moved out of styled spans. The tokens of every line are checked to rebuild the source line exactly, or the build stops. |
| 2026-10-26 | `npm run test:unit` | 9 of 9 passed: C directives, suffixes, escapes and comments; C++ `new` and raw strings; Java types, `instanceof`, Javadoc, text blocks and imports; Python f-strings, hex, `#` inside a string, `and`/`not`/`None`; scope rules; exact line rebuild with blank lines and tabs; all example files; unknown language fails loudly. A wider hand review of structs, templates, namespaces, interfaces, records, lambdas, `with`, `try` and `global` found one false bold (the Java import name), now fixed and tested. |
| 2026-10-26 | Syntax roles in the browser (`syntax.spec.ts`) | Homepage example, light and dark: keywords `if` and `else` are weight 700 in `ink`; `17`, `18` and both strings use the `syntax-literal` color read from the token; everything else is plain. With forced colors active the code text is identical and keywords stay bold. |
| 2026-10-26 | Guard against Shiki in the browser (`bundle.spec.ts`) | Passes: no Shiki or scope-table marker in any file under `.next/static`, and none in any script downloaded across 8 routes. Positive control passes (markers exist in Shiki's Python grammar and in the server build). Negative control: making `CodeBlock` import the highlighter as a value failed the disk scan on dozens of chunks, then was reverted. The browser-download test alone did not fail in that control, because grammar files download only when `highlight()` runs in the browser; the disk scan is the stricter check. |
| 2026-10-26 | Client JavaScript size, previous commit against now | 13 files, 574.6 KB before and 575.8 KB with Shiki and the icon links. Homepage HTML grew from 47,364 to 48,359 bytes (more spans for colors). About 7 MB of grammar code exists only in the server build output. |
| 2026-10-26 | Provisional favicon, Lighthouse 13.5.0 before and after | Before: best practices 96 on all six runs (home, courses, course page; mobile and desktop); the only console error was the `/favicon.ico` 404. After: best practices 100 on all six, console errors none, accessibility 100 and SEO 100 unchanged. Performance: desktop 100 on all three pages; mobile 96 (home), 98 (courses), 95 (course page), within the known run-to-run variance. CLS 0 everywhere. |
| 2026-10-26 | `design:accessibility-review` approach with axe-core 4.14.0 (outside the repo) | 28 scans (`/`, `/courses`, four course pages, 404; light and dark; 360 and 1440 px): 0 violations, 0 items needing review. Syntax colors use only existing tokens, so no new contrast pairs exist; `syntax-literal` on `code` is documented at 6.46:1 light and 9.46:1 dark and is checked by `verify:browser`. |
| 2026-10-26 | Final gates on the Shiki and favicon code | `lint` exit 0, `typecheck` exit 0 (from a clean build folder), `build` exit 0 with all routes static and the two known font warnings, `test:e2e` 45 of 45, `check:examples` 5 of 5, `test:runner` 10 of 10, `test:unit` 9 of 9, `verify:browser` 114 of 114, `npm audit` 0 vulnerabilities (all and production only). |
| 2026-10-26 | Windows crash reproduced (owner report) | Converted the homepage example to CRLF and ran `npm run build`: `highlight(python): line 1 changed while splitting. source: "age = 17\r" rebuilt: "age = 17"`. Cause: Shiki treats `\r\n` as one line break and drops the `\r`, so the highlighter's own safety check (every rebuilt line must equal its source line) refused the input, correctly, but a harmless line-ending difference should not stop the build. The repository itself was already all LF (60 text files, 1 binary). |
| 2026-10-26 | Line-ending regression tests (`npm run test:unit`, 36 tests) | 27 new: the loader with LF, CRLF, no final newline, final line ending in a lone `\r`, old-Mac `\r`, mixed endings, trailing spaces, blank lines and tabs; CRLF copies of the real example files must load identically to the LF originals; for all four languages, CRLF, CRLF plus a trailing `\r`, lone `\r` and mixed endings must give the same tokens as LF and rebuild the normalized source exactly (expected values written independently of the code under test). Negative control: with the normalizer turned into a no-op, 25 of 36 failed, including the owner's exact error message; restored, 36 of 36 pass. `test:runner` gained 2 tests (12 total): CRLF source and expected files pass; a missing blank line or a trailing space still fails. |
| 2026-10-26 | `.gitattributes` checked in a scratch repository | Cloned with `core.autocrlf=true` and `core.eol=crlf`, as on Windows. Without the file: example and shell script check out as CRLF. With it: LF everywhere, the PNG is untouched and byte-identical. Renormalizing the committed tree changes 0 stored files, so adding the file causes no diff noise. |
| 2026-10-26 | ESLint peer ranges verified | `eslint-plugin-import` 2.32.0 declares peer ESLint up to ^9, `eslint-plugin-jsx-a11y` 6.10.2 up to ^9, `eslint-plugin-react` 7.37.5 up to ^9.7. These are the latest releases, so none widens to 10. `npm ls` reported ESLint 10.13.0 as invalid for all three. `eslint-config-next` itself accepts `>=9`; `react-hooks` and `typescript-eslint` already include 10. After moving to ESLint 9.39.5: `npm ls` reports 0 invalid or peer problems and lint exits 0. |
| 2026-10-27 | SessionStart hook in a brand-new cloud session | "installing dependencies with npm ci..." then "dependencies installed", no errors. On resume it printed "install skipped". |
| 2026-10-27 | Baseline | `main` at `6bc50d39639b5b2766abf8d31b2defbe34806460` at the start of Milestone 2. |
| 2026-10-27 | Draft examples run before the plan (scratchpad) | All 25 new examples run with the runner's flags before the text was shown to the owner. The first C misspelled-name example also triggered `-Werror=unused-variable`; redesigned so the message is identical with plain `gcc` (checked). The `-Wconversion` claim was checked both ways. A missing-quote mistake was rejected because its message differs under `-Werror`. |
| 2026-10-27 | `server-only` negative control | A client component importing the highlighter as a value: build failed with "You're importing a module that depends on server-only". Reverted. |
| 2026-10-27 | `npm run test:runner` | 26 of 26 (12 before plus 14 new: run-error pass, path removal, no error, different message, trailing spaces, stdout before failing, compile-error pass and clean compile, compiler failure under run-error, compiled program failing, Python compile-error refused, two expectation files refused, record determinism, CRLF hashes, failed run keeps the record). Negative control: path removal turned off made 2 tests fail. |
| 2026-10-27 | `npm run check:examples` | 30 of 30 (5 old, 25 new; 3 C compile errors and 4 Python run errors among them). Rerun gives a byte-identical record. Captured error files match the approved text, including gcc's curly quotes and 20 trailing spaces. |
| 2026-10-27 | `npm run test:unit` | 71 of 71: highlighter and loader (36), prose parser (16), lesson loader and publish gate (16), prose rendering in React (3). Negative controls: publish gate turned off failed 3 gate tests; inline code rendered as raw HTML failed all 3 rendering tests. |
| 2026-10-27 | `npm run test:e2e` | 91 of 91. Negative control: swapping the two C topics failed the course order and previous/next tests. |
| 2026-10-27 | `npm run verify:browser` | 114 of 114. |
| 2026-10-27 | `lint`, `typecheck`, `build` | Exit 0. Build: all routes static, four lesson pages prerendered, only the two known font warnings. Seven "dynamic filesystem access" warnings appeared and were fixed (D37), not silenced. |
| 2026-10-27 | `frontend-design:frontend-design` (lesson page composition) | Left-aligned single column, annotated code block as the one bold element, tinted surfaces only for the analogy and mistake callouts, "Goal:" lead instead of a label above the h1, no arrows in navigation text. |
| 2026-10-27 | `design:ux-copy` | Changed: "2 lessons published", "Try each question before you open its solution.", "Planned and subject to change. Listed in course order." |
| 2026-10-27 | `design:accessibility-review` with axe-core 4.14.0 (outside the repo) | 36 scans (9 pages, light and dark, 360 and 1440px). Found and fixed: output and error panels that scroll were not focusable named regions (`scrollable-region-focusable`); long inline code overflowed at 320px with text-spacing overrides. After fixes: 0 violations; remaining "needs review" items are code tokens whose background axe cannot determine (documented token pairs). Reflow at 320px and 640px (200% zoom) with WCAG 1.4.12 spacing: no overflow. New contrast pairs measured in the browser: lowest 5.91:1 (warning icon on warning-tint). Accessibility tree: one h1, ordered h2 and h3, unique region names, solutions exposed as "Show solution" groups. No real screen reader used. |
| 2026-10-27 | `website-design:web-review` (375, 768, 1440px, light and dark) | No must-fix items. Fixed: course pages now list lessons before "Who this course is for". Noted: dark warning-tint area is heavy (kept); phone code inside mistake callouts is tight (scrolls). |
| 2026-10-27 | `design:design-system` audit | 0 raw hex values, 0 arbitrary values in new code, all spacing on the 4px scale, radius tokens only. Fixed: lesson and course h2 spacing now 48px, 64px from 768px; shared `backLinkStyles`. |
| 2026-10-27 | `design:design-critique` on teaching quality (four lessons) | Strengths: each lesson builds from the shared idea to parallel examples; the same misspelled-name mistake shows compile-time (C) against run-time (Python) detection; every term in bold is defined where it appears; notes explain why lines work (right side first, then assignment); simplifications are accurate (Python types, undefined behavior, compiling). Load: 263 to 432 words before the first example (the shared idea adds 166 to 228); 3 to 7 new bold terms per lesson; notes average about 20 words, longest about 40. Proposals, not applied because the text is approved: (1) define "output" at first use (Python Variables note 2 and C lesson 1 note 3); (2) define "memory" where it first appears in C Variables ("set aside the right amount of memory"); (3) split C lesson 1's line 3 note, which introduces function, hands back a value, `(void)` and braces at once; (4) Python Variables is the first published Python lesson, and the shared idea uses "program" and "runs" before the Python section defines a program. Visual: lessons are long on phones because practice repeats full C programs; acceptable since every example must be runnable. |
| 2026-10-27 | `/code-review` | 10 findings. Fixed 7 (layout test locator, list or heading straight after a paragraph line now refused, captions render inline markup, one `plainText` helper, course h2 spacing, mistake padding back to `p-4`, uncaptioned example numbering). Declined 3 with reasons: repeated Copy code announcement (Milestone 1 behavior, suggested as a task), `backLinkStyles` in body-size links, output panels always focusable (D40). |
| 2026-10-27 | `/security-review` | No high or medium findings. The runner still spawns without a shell with checked file names; rendering uses React text only; all lesson routes are static. |
| 2026-10-27 | Lighthouse 13.5.0 mobile (outside the repo) | `/courses/c/first-program` 97, `/courses/python/variables` 95, `/courses/python/decisions` 96, `/courses/c` 94 performance; accessibility, best practices and SEO 100 on all four; CLS 0. |
| 2026-10-27 | `docs/lesson-authoring.md` capture commands | Rerun against the committed files: identical byte for byte. The first version of the Python error command kept the full path; corrected with `sed` before committing. |
| 2026-10-27 | Milestone 3 start | `main` at `fe8edd2a08e1c1320a09749bc87335fcb6d83b23` (Milestone 2 merged). New branch `claude/milestone-3` created from it on the owner's instruction (no force-push of the old branch). No SessionStart hook output appeared in this session's context; the install stamp matched `main`'s lockfile, so dependencies were current. |
| 2026-10-27 | Facts behind the new questions, tested before writing them | Verified outputs read from the 8 practice `.expected.txt` files. Plain gcc 13.3: declaring `apples` twice in one block gives "redefinition of 'apples'"; `10 = apples;` gives "lvalue required as left operand of assignment". Python 3.13: `if age == 18` without a colon gives "SyntaxError: expected ':'". Compiling a program, editing its source and running it again without compiling printed the old message. |
| 2026-10-27 | `npm run test:unit` | 77 of 77 (6 new for practice: correct option from the verified file at its position; wrong output equal to the real output refused, also with trailing spaces or CRLF; predict limits; hint limits and text checks; choice option rules; practice examples go through the publish gate). Negative control: equality guard turned off failed its test. |
| 2026-10-27 | `npm run test:e2e` | 112 of 112, including 17 in the new `practice.spec.ts`: wrong answer gives that option's explanation, correct answer, nothing chosen, counted once, hints one at a time with focus kept, keyboard only (Space, arrows, Tab, Enter), fieldset and radio names including "Line 1:" for multi-line output, real separate lines in monospace, every correct predict option equals its verified file (by trying every option), solution at any time, choice solution names the answer, nothing stored across a reload, repeated check re-announced, new choice clears feedback, hints region present before the first hint, and without JavaScript. Negative control: inverting the correct-answer check failed 6 tests. |
| 2026-10-27 | Bundle size (all JavaScript under `.next/static`) | Before (`main`, `fe8edd2`): 13 files, 578.5 KB raw, 180.7 KB gzip. After: 14 files, 594.1 KB raw, 186.3 KB gzip (+15.6 KB raw, +5.6 KB gzip, the practice chunk, measured before the code-review fixes). Final, after the fixes: 14 files, 594.5 KB raw, 186.4 KB gzip, so +16.0 KB raw and +5.7 KB gzip against `main`. The chunk is referenced only by lesson pages, not by the homepage or course pages. |
| 2026-10-27 | Final gates on the Milestone 3 code | `lint` and `typecheck` exit 0; `build` all routes static, only the two known font warnings; `test:e2e` 112 of 112; `check:examples` 30 of 30 (record unchanged); `test:runner` 26 of 26; `test:unit` 77 of 77; `verify:browser` 114 of 114; `npm audit --omit=dev` 0 vulnerabilities. |
| 2026-10-27 | `design:ux-copy` on practice text | No changes: "Check answer", "Choose an answer first.", "Correct" and "Not quite" (DESIGN.md wording), "Try again, or show a hint.", "Show hint 1 of 3", "Answered correctly", "1 of 3 questions answered correctly on this page", "Nothing is printed", "Answer:". |
| 2026-10-27 | `design:accessibility-review` with axe-core 4.14.0 (outside the repo) | 32 scans: four lessons, light and dark, 360 and 1440px, before and after answering, hints and solutions. Found and fixed: the one output option that scrolls at 360px was not focusable (`scrollable-region-focusable`); now focusable only when it scrolls. After: 0 violations; only the known "partially obscured" contrast items on long code lines. Contrast measured in the browser: feedback text on success-tint 13.63 (light) and 11.84 (dark), on error-tint 13.69 and 12.27; check icon 5.98 and 6.98; x icon 6.09 and 6.94; "Answered correctly" in success 6.53 and 8.54; summary 6.95 and 8.00; selected option 13.50 and 10.15. No new target under 44px. Keyboard flow covered by Playwright. No screen reader: see the owner's checklist. |
| 2026-10-27 | `design:design-critique` on the questions | All 8 predict questions require tracing execution; every distractor maps to a real misconception (`=` as equality, `print` showing the name, assignments printing, `%d` printed literally, rounding, `printf` adding new lines, `\n` printed literally, indentation not grouping, `>=` against `>`, a comparison printing its operand), each corrected by its own explanation. Proposals, not applied because the text is approved: (1) C first program Q3: the correct option is the only one without a "because", a shape cue; give all options the same shape; (2) Python Variables Q3: the correct option repeats the lesson's wording; phrase it as an observable consequence; (3) C Variables Q2 hint 2 points straight at the answer; make it a scaffold. Noted: after a correct answer, a later wrong check shows "Not quite" beside "Answered correctly"; both are true. |
| 2026-10-27 | `/code-review` | 10 findings. Fixed 6: feedback tied to the checked option (a new choice clears it); every check re-announced; hints live region present before the first hint; focus after the last hint moves to Check answer, not the list; one option type; buttons hidden and unfocusable until the page is interactive. The authoring guide update was already planned. Declined 4 with reasons: the old-message fact cannot be a `check:examples` example (tested by hand); "same block" redeclaration wording kept as the owner required; one ResizeObserver per output option is negligible (about ten per page). |
| 2026-10-27 | Lighthouse 13.5.0 mobile (outside the repo) | Performance: `/courses/c/first-program` 96, `/courses/c/variables` 95, `/courses/python/variables` 94, `/courses/python/decisions` 94. Accessibility, best practices and SEO 100 on all four. CLS 0 everywhere. |
| 2026-10-26 | Windows simulation: CRLF copy of the whole tree, Node 20.20.2, Linux | `npm ci` exit 0 with two notices only (`EBADENGINE` for Node 22.18 and the ESLint 9 deprecation). `lint`, `typecheck`, `build` (homepage renders), `test:e2e` 45 of 45, `check:examples` 5 of 5, `test:runner` 12 of 12, `verify:browser` 114 of 114 all exit 0. Found and fixed on the way: `test:runner` used a glob that `node --test` only understands from Node 21 on (now an explicit file path, tested on Node 20.20.2 and 22.22.0); `test:unit` cannot run on Node 20, and its real minimum is Node 22.18.0 (measured), not the 22.13 that `engines` said. |
| 2026-10-27 | Copy code repeat clicks (follow-up queued in Milestone 1) | Cause: the state was a plain string, so a second click inside two seconds set "copied" to "copied". React saw no change, so the timer kept counting from the first click and nothing new was added to the status region for screen readers. Fix: each click stores a new object with an attempt number; the effect restarts the two-second timer, and the status message is keyed by the attempt, so each click adds a new message. 4 new tests in `tests/e2e/copy.spec.ts`, written first and run on the unfixed code: 3 failed (the second click was not announced; the label had already reset at 3000 ms, 2000 ms after the first click; a repeated failure was not announced) and 1 passed, a click after the label had reset, as a control. With the fix 4 of 4 pass. The label timing uses Playwright's fake clock, so it is not a race. "Announced" is checked as text added to the live region (a MutationObserver), which is what screen readers react to; a real screen reader was not used. Gates: `lint`, `typecheck`, `build` exit 0; `test:e2e` 95 of 95; `check:examples` 30 of 30; `test:runner` 26 of 26; `test:unit` 71 of 71; `verify:browser` 114 of 114; `npm audit` 0 vulnerabilities. |
| 2026-10-27 | Re-review of the `backLinkStyles` code-review finding | The original log entry names the finding but records neither its text nor a reason, so this is a fresh review of the code, not a reconstruction of the reviewer's thinking. Concern: links back to the page above should look and behave the same everywhere. Measured in Chromium at 360 and 1440 px: the course page link, the lesson page link and the end-of-lesson "Back to the ... course" link all render at 16px and 48px tall. The in-prose links, which are body size, render at 18px and use only `textLinkStyles`; `backLinkStyles` is used on no body-size link, so that wording of the finding does not describe the code. One real but minor defect: the end-of-lesson link repeated the classes inline without `text-sm`, so it matched only because its container inherits 16px. Moved into the 18px lesson body it would have grown to 18px while the shared links stayed at 16px. Fixed: it now uses `backLinkStyles`; measured before and after, identical (16px, 184 by 48 px at both widths). Kept as they are: `text-sm` in `backLinkStyles` (16px is the interface size in `DESIGN.md`, and these links sit above the heading, not inside prose); the 404 links and the footer links, which repeat `inline-flex py-3` but have other roles (forward navigation, a footer list), so sharing the back link style would couple unrelated things. No test added: the change has no visual effect, so a test would pass both before and after and could not show that the fix works. |
| 2026-10-27 | Wording changes D44 applied | Five content files, 8 insertions and 6 deletions, each old text matched exactly once. Words (whitespace-separated, whole file before and after): shared idea +18, C lesson 1 prose +45, C lesson 1 notes -13 (the `main` note 39 to 21 words, the `return` note 19 to 24), C Variables +17, Python Variables +10. Checked that no other text contradicts the new wording: the remaining mentions of `(void)` and "hands back" agree with it, and "memory" appears only in the changed sentence. The new paragraph claims every program in these lessons uses `int main(void)`; all 13 C examples do. |
| 2026-10-27 | Accessibility scan after the wording and link changes (axe-core 4.14.0, outside the repo) | 36 scans (`/`, `/courses`, two course pages, four lesson pages, 404; light and dark; 360 and 1440 px): 0 violations, 8 items needing review, three identical runs. The same scan on the code from before these changes (`478ef08`) gives the same 8 items, so the changes did not cause them. They are `color-contrast` on long code lines and error messages at 360 px: axe reports "partially obscured" because the element extends past its scroll container, so it cannot compute a ratio. This matches the earlier Milestone 2 row; the contrast pairs themselves are documented and measured by `verify:browser`. The first run of this scan reported one false violation on the homepage (dark, 1440 px): the scan changed the theme and ran axe while the 120 ms colour transitions were still running, so axe sampled a half-faded colour. The scan now emulates reduced motion (which makes the tokens instant) and waits 300 ms; after that it was stable. The three changed lessons were also fetched from the built site: new wording present, old wording gone. |

### What `verify:browser` covers

Scenarios: light and dark forced with `data-theme` while the browser preference is set to the opposite theme, each at 360px and 1440px; no forced theme with the browser preferring light, then dark; reduced motion. In each scenario:

- 18 color tokens computed by the browser match `DESIGN.md`, and every swatch renders its token.
- 32 contrast pairs: ratio calculated in the browser matches the documented value to two decimals and meets AA (4.5:1 text, 3:1 non-text). The 8 text samples on the page also match.
- 9 type sizes with line heights, 9 spacing steps, 3 radii and the motion duration match `DESIGN.md`.
- Literata 600, Atkinson Next 400 and 700, Atkinson Mono 400, 700 and 400 italic are loaded and used; font files come from our own origin and none from Google.
- No horizontal overflow, focus ring is 2px solid `ink` with 2px offset, no console errors, warnings, failed requests or HTTP errors.

Screenshots are saved to `screenshots/` (`light-360.png`, `light-1440.png`, `dark-360.png`, `dark-1440.png`). The folder is ignored by Git and not committed.

## Decisions

| ID | Date | Decision | Reason |
|---|---|---|---|
| D1 | 2026-10-26 | Work on the session branch given for each session. Milestone 0a used `claude/determined-goodall-chim8e`; Milestone 0b used `claude/jolly-ritchie-f2d1ef`; Milestone 1 uses `claude/determined-goodall-chim8e` again, restarted from `main` at `3be88e0` because its earlier pull request was merged | Brief Section 15 says to use the session's branch. |
| D2 | 2026-10-26 | npm as package manager | Owner choice; simplest for learning. |
| D3 | 2026-10-26 | Design direction A, Annotated Notebook | Owner choice. |
| D4 | 2026-10-26 | Success feedback is blue, not green | Keeps the green accent distinct from "correct"; easier to tell apart from red. |
| D5 | 2026-10-26 | Literata, Atkinson Hyperlegible Next and Mono | Legibility of easily confused characters for beginners reading code. |
| D6 | 2026-10-26 | No `ARCHITECTURE.md`, lesson guide or testing guide yet | Would be guesswork before code exists; decisions are logged here. |
| D7 | 2026-10-26 | Owner Git workflow: commits authored by Yash-Maithani, no Claude attribution, Claude never opens or updates pull requests | Owner instruction for Milestone 0b; recorded in `CLAUDE.md`. |
| D8 | 2026-10-26 | TypeScript 5.9.3 and ESLint 10.13.0, not TypeScript 7.0.2 | Next.js requires TypeScript 5.1 or newer and `typescript-eslint` (used by `eslint-config-next`) supports TypeScript below 6.1, so version 7 is outside the supported range. Next.js docs list ESLint 9 and 10 as supported; the ESLint 9 release that `create-next-app` installs prints a "no longer supported" deprecation notice, so 10 was chosen. `npm ci` and lint run clean. If a future `eslint-config-next` breaks on ESLint 10, fall back to 9. The ESLint half of this decision was reversed by D30. |
| D9 | 2026-10-26 | Tailwind through `@tailwindcss/postcss`, not the `@tailwindcss/turbopack` loader that `create-next-app` 16.4.3 sets up | Tailwind's own Next.js guide documents PostCSS; it works with any bundler. Costs one extra package (`postcss`). |
| D10 | 2026-10-26 | `@playwright/test` pinned to exactly 1.63.0 | The pre-installed Chromium belongs to that version; a newer version would not find it. Raise the pin together with the environment. |
| D11 | 2026-10-26 | Cache Components and `AGENTS.md` from the `create-next-app` defaults were not adopted | Not needed yet (SPEC: static by default, no premature features); `AGENTS.md` would duplicate `CLAUDE.md`. |
| D12 | 2026-10-26 | Two token names differ from `DESIGN.md`: the 15px code size is `text-mono` (design name `code`), and the 68ch prose width is `max-w-measure` | `text-code` collides with the `code` surface color, and Tailwind's built-in `max-w-prose` (65ch) overrides a token of that name. Both were found by reading the generated CSS. `DESIGN.md` is unchanged and needs the owner's approval to mention them. |
| D13 | 2026-10-26 | Spacing keys are step counts (`p-4` is 16px); radii are named `control` 4px, `button` 6px, `panel` 8px, `round` (markers only) | Only `DESIGN.md` values exist; an unlisted class such as `p-5` generates nothing. `DESIGN.md` gave values, not names. |
| D14 | 2026-10-26 | `data-theme="light"` or `"dark"` on `<html>` forces a theme; otherwise the system preference applies | Lets tests force a theme explicitly. Not a visible toggle: that remains an open decision in `SPEC.md`. |
| D15 | 2026-10-26 | Example runner is plain Node with no dependency, config per language in one table, no command-line arguments | Adding a language is a new table entry plus a content folder. Limits and honest scope are written at the top of the runner file. |
| D16 | 2026-10-26 | SessionStart hook uses `npm ci`, from the repository root, skips when a stamp in `node_modules` matches the lockfile hash, fails loudly on error, cloud sessions only | Owner decision. The hook is synchronous, so a session starts only after dependencies are ready. |
| D17 | 2026-10-26 | Lucide license confirmed (ISC) but the package is not installed | The token page has no icons; install when the first icon is used. |
| D18 | 2026-10-26 | No menu button while the navigation has three links or fewer | Owner approved. Saves a client component; recorded in `DESIGN.md`. |
| D19 | 2026-10-26 | Margin-note hover highlighting is a pointer-only extra; notes are not focusable | Owner approved. Line numbers and the screen reader notes list work fully without it. |
| D20 | 2026-10-26 | Course pages without lessons list planned topics as plain text | Owner approved; `SPEC.md` FR-C2 reworded. |
| D21 | 2026-10-26 | Syntax highlighting with Shiki 4.5.0 (exact version), at build and server time only. Shiki reads the code; a small table in `src/lib/highlight.ts` maps its scope names to the four `DESIGN.md` roles, and `CodeBlock` turns each role into an existing token. No color value was added or changed | Owner approved. Correct for strings, comments and numbers in all four languages, which an in-house highlighter would have to rebuild per language. Costs one package (MIT, no account, no paid plan; 18 MB in `node_modules`, none sent to browsers). Shiki's own color themes are not used. |
| D22 | 2026-10-26 | `lucide-react` added | Owner approved. Used for two icons (note callout, copy failure). Tree-shaken per icon. |
| D23 | 2026-10-26 | Public pages live in the `(site)` route group with the header and footer; `/dev/tokens` sits outside it; the root `not-found.tsx` adds the header and footer itself | Keeps the token page bare, so `verify:browser` still checks the focus ring on its first Tab stop. |
| D24 | 2026-10-26 | Course data in `content/courses.ts`, imported as `@content/...` (new path alias in `tsconfig.json`) | One typed list drives cards, footer links and course pages; adding a language is one entry. |
| D25 | 2026-10-26 | The homepage example is read at build time from `content/examples/python/vote.py` and its `.expected.txt` | The code and output on the page are the files `check:examples` really runs. Notes are checked at build time against the line count. |
| D26 | 2026-10-26 | `CodeBlock` is a client component; code is split into lines on the server | Needed for Copy code, Hide notes and hover. A highlighter would run on the server and pass tokens in. |
| D27 | 2026-10-26 | Provisional favicon: `public/icon.svg` plus `public/icon-32.png` (rendered from the SVG with the pre-installed Chromium), linked from the root layout metadata | Owner approved. A green "C" on a `paper` tile with an `ink` border, using three `DESIGN.md` light-theme tokens (`paper`, `ink`, `accent`); no gradient, no emoji. The SVG cannot read CSS variables, so the three hex values are written in it with a comment naming the tokens. It stops the `/favicon.ico` error. The final favicon stays a launch item (brief Section 16). |
| D28 | 2026-10-26 | Unit tests run with Node's built-in test runner and TypeScript type stripping (`npm run test:unit`); `allowImportingTsExtensions` added to `tsconfig.json` | No test framework dependency. The setting only lets test files write `./highlight.ts`; `noEmit` is already on, so it changes nothing in the build. |
| D29 | 2026-10-26 | Line endings: `.gitattributes` (`* text=auto eol=lf`, binary files listed) plus one rule, `\r\n` and a lone `\r` become `\n`, applied wherever repository text is read: the example loader, the highlighter input, `check:examples`, the e2e tests and the `DESIGN.md` parser in `verify:browser` | Owner bug report on Windows (autocrlf). The attributes file fixes new checkouts; the normalizer makes the site safe regardless. Only line endings change: spaces, tabs, blank lines and a final newline are kept. `src/lib/line-endings.ts` and `scripts/lib/example-runner.mjs` each hold the one-line rule, because the script runs as plain Node and does not read TypeScript. The highlighter's exact-rebuild safety check stays. |
| D30 | 2026-10-26 | ESLint 9.39.5 instead of 10.13.0 (supersedes the ESLint part of D8) | Owner instruction, after verifying the facts: the latest `eslint-plugin-import`, `jsx-a11y` and `react` declare peer ESLint only up to ^9, so ESLint 10 produced peer warnings on every install. Costs: ESLint 9.39.5, the newest 9.x, is marked deprecated, so `npm ci` prints one "no longer supported" notice instead of three peer warnings. Benefit: ESLint 9 runs on Node 20.9 and newer, while ESLint 10 needs 20.19 or newer. Revisit when those three plugins publish ESLint 10 support. |
| D31 | 2026-10-26 | `engines` set to Node 22.18 or newer; `test:runner` runs an explicit file instead of a glob | The old floor (22.13) was chosen for ESLint 10 and was wrong once `test:unit` relied on built-in TypeScript support (22.18.0 and up, measured). The glob form works only on Node 21 and newer; the explicit path works on Node 20 and 22 and on Windows. A new file in `scripts/` must be added to the script. Node 20 stays unsupported (end of life since 2026-04-30). |
| D32 | 2026-10-27 | Lesson format: one typed `.ts` file per lesson (metadata, examples with notes, mistakes, practice, recap) plus a `.md` file with the prose in reading order, in a small Markdown subset read by our own parser. No MDX and no Markdown library | Owner approved. TypeScript checks every structured field; prose stays comfortable to write. The subset is the rule: code blocks, raw HTML, external links, other heading levels and dashes stop the build. Parser 137 lines of code; the owner asked to stop and propose a library if it grew well beyond the planned size. |
| D33 | 2026-10-27 | Milestone 2 lessons: three concepts on four pages. Variables in Python and C counts once | Owner approved; `SPEC.md` Milestone 2 reworded. C lesson 1 is needed because C Variables uses `#include`, `main` and `printf`. Topic changes in `content/courses.ts`: C "Your first program and what compiling means" is taught by "Your first C program"; Python "Decisions with if, elif and else" becomes "Making decisions with if and else" with a new planned topic "More decisions with elif". |
| D34 | 2026-10-27 | Examples meant to fail are tested, not labeled non-runnable: `.compile-error.txt` or `.run-error.txt`, matched exactly against gcc 13.3.0 and Python 3.13.17 under `C.UTF-8`, after normalizing line endings and removing the example's folder from paths | Owner approved, including keeping gcc's curly quotes. A changed message fails the check and is reviewed by a person; nothing re-captures automatically. `.editorconfig` protects trailing spaces. |
| D35 | 2026-10-27 | Publish gate: `check:examples` writes `content/verified-examples.json` (sorted, no dates) only when every example passes; the build recomputes the hashes for every example on a published page and on the homepage | Owner approved. A failed run never overwrites the record. |
| D36 | 2026-10-27 | `server-only` 0.0.1 added (exact) | Owner approved before the session. Imported by the highlighter, example loader, lesson loader and publish gate. |
| D37 | 2026-10-27 | Build-time file reads in `examples.ts` and `verified.ts` use `/*turbopackIgnore: true*/` | Without it Turbopack traced the whole project into the server output (7 build warnings). The reads happen only while static pages are prerendered. |
| D38 | 2026-10-27 | Practice in Milestone 2: up to two plain questions per lesson, solution behind a native `details` disclosure, from verified files | Owner approved. No grading, hints or progress; Milestone 3 extends the same `practice` field. |
| D39 | 2026-10-27 | Unit tests load `.tsx` through a Node module hook (`scripts/tsx-loader*.mjs`) that compiles JSX with the installed TypeScript, resolves `@/` and `@content/`, and maps `server-only` to its empty module | No new dependency. Playwright's runner could not render components (it compiles JSX for component testing), and Node cannot read JSX. |
| D40 | 2026-10-27 | Output and error panels are focusable named regions, like code regions | axe requires scrollable regions to be focusable, and whether a panel scrolls depends on screen width, which a static page cannot know. Cost: one tab stop per example. |
| D41 | 2026-10-27 | The shared idea links the same concept in other languages ("This part is the same in the C lesson."), computed from published lessons | Owner approved. |
| D42 | 2026-10-27 | Inline code in sentences may wrap; code blocks, output and error messages never wrap | WCAG 1.4.10 reflow at 320px; recorded in `DESIGN.md`. |
| D43 | 2026-10-27 | Course, homepage and card status text is generated from the lesson data | Prevents stale claims such as "no lessons yet". |
| D44 | 2026-10-27 | Teaching-quality wording from `design:design-critique`, applied as approved: (1) "output" is defined where it first appears, in the Python Variables `print` note and in the sentence before the first C example; (2) "memory" is defined in C Variables; (3) the C `main` note is reshaped: line 3 keeps `main`, function and `{`, the `return 0;` note now says it hands back a value as its result, and a new paragraph after the example explains `int` and `(void)`; (4) the shared idea defines "program" and "running" before using them | Owner approved. Proposal 3 is a reshape and not a literal split, because the build rejects two notes on one line; the note schema was not changed. The critique pointed at "C lesson 1 note 3" for the "output" definition, but that note says "prints", so the definition went where the word first appears. |
| D45 | 2026-10-27 | No history rewrite; the owner squash-merges the Milestone 2 branch | Owner decision. Commit `26bdb0b` keeps its wrong counts ("26 new example files", "nine are meant to fail"; the correct numbers are 25 and 7) because the squash commit message replaces it. |

| D46 | 2026-10-27 | Practice question kinds: predict-the-output as options, with the correct option read from the verified `.expected.txt` and typed wrong options that the build refuses if they equal the real output; and multiple choice with exactly one correct option | Owner approved. Options rather than typed answers, so a spacing slip is not marked as a misunderstanding. |
| D47 | 2026-10-27 | One client component (`practice-set.tsx`) for the interaction; code blocks and solutions stay server-rendered and are passed in. Buttons appear only once the page is interactive (`useSyncExternalStore`) | Client JavaScript only where interaction needs it (`CLAUDE.md`); no visible control that does nothing before hydration. |
| D48 | 2026-10-27 | No browser storage, accounts or server storage for practice; the count says "on this page" | Owner decision. `SPEC.md` open decision 3 stays open. |
| D49 | 2026-10-27 | Milestone 3 work on a new branch `claude/milestone-3` from `main` at `fe8edd2` | Owner instruction: no force-push of the merged Milestone 2 branch. |

## Environment (verified 2026-10-26, cloud session)

Node 22.22.0, npm 10.9.4, Python 3.13, gcc and g++ 13.3, OpenJDK and javac 21. Playwright 1.63.0 with Chromium is pre-installed. Tool usage rules are in `CLAUDE.md`.

## Git

- Working branch: `claude/milestone-3` (Milestone 3), created from `main` at `fe8edd2` (D49).
- `main` at `fe8edd2` (Milestone 2 merged by the owner); unchanged by Claude.
- For the latest commit on this branch, run `git log -1 origin/claude/milestone-3`.

## Next recommended task

Owner runs the screen reader checklist, reviews Milestone 3 and opens the pull request. After the merge: Milestone 4, educational visualizations, planned in a new session from its acceptance criteria in `SPEC.md` Section 9.

## Resuming work

```
# Needs Node 22.18 or newer. Windows: use WSL for check:examples (see Known limitations).
npm ci                      # install exactly what package-lock.json says
npm run dev                 # development server on http://localhost:3000
npm run lint
npm run typecheck
npm run build
npm run test:e2e            # builds, then runs all Playwright tests in tests/e2e/
npm run check:examples      # compiles and runs content/examples/ and compares output
npm run test:runner         # tests for that runner
npm run test:unit           # tests for the highlighter, lesson loader, publish gate and prose renderer
npm run verify:browser      # needs a build first; saves screenshots/ (not committed)
```

Cloud sessions run the install automatically through the SessionStart hook in `.claude/`.
