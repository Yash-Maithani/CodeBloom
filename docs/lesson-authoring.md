# Writing a CodeBloom lesson

How to add or change a lesson, from first draft to published page. What a lesson must contain is set by `SPEC.md` section 6 and brief Section 6; this guide is how to meet it with the files in this repository. The working rules in `CLAUDE.md` (lesson content rules, Git rules) apply too.

## 1. The workflow at a glance

| Step | You do | The project checks |
|---|---|---|
| 1. Draft | Write the lesson files with `status: "draft"` and its example programs | The build checks the lesson's shape, prose, notes and links. Drafts get no page |
| 2. Verify | Capture each example's real output or error message, run `npm run check:examples`, read every changed result | Every example is compiled and run; output and error messages must match exactly. On success the verification record is rewritten |
| 3. Review | Read the lesson against the checklist in section 7, run the review skills, look at it in a browser | The review is yours; nothing automates teaching quality |
| 4. Publish | Set `status: "published"`, run all checks, commit | The build refuses a published lesson whose examples do not match the verification record |

If any step fails, fix the cause and repeat that step. Never edit the verification record or an expectation file by hand to make a check pass.

## 2. Where the files live

```
content/
  courses.ts                    each course's topics, in order; a topic names its lesson
  concepts/<concept>.md         the shared idea of a concept, used by every language
  lessons/<course>/<slug>.ts    the lesson's typed fields (section 3)
  lessons/<course>/<slug>.md    the lesson's prose in reading order (section 4)
  lessons/index.ts              the list of all lessons
  examples/<course>/<name>.<ext>        a program shown in a lesson
  examples/<course>/<name>.<kind>.txt   what it really printed (section 5)
  examples/python/<name>.trace.json     the line-by-line trace behind a step-through visual (section 3b)
  examples/python/<name>.input.txt      the lines a person types, for an example that calls input() (section 5)
  verified-examples.json        written by npm run check:examples; never edit it
```

The course slug is also the language folder: `c`, `cpp`, `java` or `python`. The page address is `/courses/<course>/<slug>`.

To add a lesson:

1. Write `<slug>.ts` and `<slug>.md` in `content/lessons/<course>/`.
2. Import it in `content/lessons/index.ts` and add it to `lessonSources`.
3. In `content/courses.ts`, give the course topic it teaches `lesson: "<slug>"`, or add a topic in the right place. Order on the site comes from this list.
4. If the concept is taught in several languages, write or reuse `content/concepts/<concept>.md` and set `concept` in the lesson.

## 3. The lesson file (`<slug>.ts`)

The type is `LessonSource` in `src/lib/lesson-types.ts`. Text fields may use `` `code` `` and `**bold**`; links are only allowed in the `.md` prose.

| Field | Required | What it is |
|---|---|---|
| `course`, `slug` | yes | Course slug and lowercase hyphenated name, for example `"python"` and `"variables"` |
| `title` | yes | Plain text, for example "Variables and data types" |
| `status` | yes | `"draft"` or `"published"` |
| `objective` | yes | What the learner will be able to do, from their point of view. Shown as "Goal:" |
| `concept` | no | Name of a shared concept file. The page shows it as "The idea" and links the same lesson in other languages |
| `analogy` | no | `title`, `text` and `limit`. `limit` (where the comparison stops being accurate) is required. Place it in the prose with `{{analogy}}` |
| `examples` | at least one | Runnable examples by id: `file` (`"python/variables_change"`), optional `caption`, and `notes`. Each is placed in the prose with `{{example <id>}}` |
| `mistakes` | no | Each: `title`, `example` (may fail, or run with surprising output), `whatHappens`, optional `howToRead` and `whyEasyToMiss`, `fix`, optional `fixExample` |
| `practice` | no | Interactive questions, two kinds; see section 3a |
| `visuals` | no | Step-through visuals by id, Python lessons only; see section 3b. Each is placed in the prose with `{{visual <id>}}` |
| `recap` | at least 2 | Short points |

Fields shown after a label ("Where the comparison stops:", "What happens:", "Fix:") start in lowercase unless the first word is a name.

### 3a. Practice questions

Each question has `question`, `hints` (one to three, revealed one at a time) and `explanation` (shown in the solution, which the learner can open at any time). Two kinds:

| Kind | Fields | What the build checks |
|---|---|---|
| `"predict-output"` | `example` (a runnable example whose output is hidden), `wrongOutputs` (two or three `{ text, why }`), `correctPosition` (1 to the number of options) | The example is verified. The correct option is its `.expected.txt`, read at build time: you never type it. No wrong output may equal the real output (line endings, trailing spaces and trailing blank lines ignored), and no two may be the same. `text: ""` means "Nothing is printed" |
| `"choice"` | `options` (three or four `{ text, why, correct? }`) | Exactly one option is `correct`; no two options are the same |

Writing good questions:

- Ask something the learner must work out by following the code, not something they can repeat from the lesson's wording.
- Every wrong option stands for one real misconception, and its `why` corrects that misconception specifically, not "this is wrong".
- Give every option the same shape and length, so the right one does not stand out.
- A wrong output option is written exactly as the learner would expect to see it, line by line. The page shows it as real lines in monospace.
- Hints are steps toward the answer, not the answer.
- A choice question must not claim what a program prints unless the claim is shown by a verified example in the lesson. A fact about the language that is not output (for example "C does not allow declaring the same name twice in one block") must be tested before you write it; record how in `PROGRESS.md`.

On the page, a question counts as answered when the learner checks the correct option; opening the solution does not count. Nothing is stored: the count is for the current page visit only.

**Margin notes** (`notes`): `{ startLine, endLine, text }`, counting from line 1, in order, not overlapping. Explain the lines that matter, not every line. A note must not restate the output; the output panel shows it. The page adds "Line 4:" for screen readers, so do not start a note with the line number.

### 3b. Step-through visuals

A visual lets the learner move through one example a line at a time and see the line that ran, every variable after it, and the output so far. It is built from a trace: a file recorded by really running the example, never typed. Only the title and the step notes are written by hand.

Each entry in `visuals` has:

| Field | Required | What it is |
|---|---|---|
| `example` | yes | A Python example of this lesson's course with an `.expected.txt` and a `.trace.json`, for example `"python/vote"` |
| `title` | yes | Shown as the visual's heading, for example "Step through it: watch which lines run" |
| `notes` | no | Step number to note text. Step 1 is the first line that ran; the start state has no note |
| `branches` | no | Step number to `true` or `false`: whether the condition checked on that step was true. Only for a step that runs an `if` or `elif` line |

How to make one:

1. Pick an example that shows something a static block cannot: a value changing over time, or lines that are skipped. Keep it short; every step is one click.
2. Capture its trace (section 5) and read it. Check each step's line, values and output against what you expect. If something surprises you, the trace is right and your expectation is not; that surprise may be worth a note.
3. Write a note only where the step needs an explanation. A note must not restate what the panel already shows (the line, the values, the output).
4. If a note talks about a condition being true or false, declare it in `branches`. The build checks the declaration against the trace: a true condition means the next line that ran is the first indented line under the `if`. A note on a condition step without a declaration stops the build.
5. Place it in the prose with `{{visual <id>}}` after the paragraph that explains the example, so the learner reads the explanation first.

On the page, the learner starts at "Start. Nothing has run yet.", and moves with Back, Next step and Start again; nothing plays by itself. Each step is announced to screen readers, and "All steps as a table" gives the same information as text. Without JavaScript the table is shown open instead.

### 3c. Playground links

Every runnable Python example and fix in a published lesson gets "Try it in the playground" automatically, and its own page at `/playground/python/<name>` that starts from the verified file. Nothing to write. Practice questions never get a link, because their output is the answer. For an example with an input file, the Input box starts filled with that file's lines, and "Reset code" restores both the code and the input. In the prose, say what is in the Input box, and that the typed line appears after the prompt in the output. C, C++ and Java examples get no link until the playground supports them.

## 4. The prose (`<slug>.md` and concept files)

A small subset of Markdown. Anything else stops the build with a message saying what to change.

- Paragraphs, separated by a blank line.
- `## Heading` (lesson files only; concept files have no headings), with a blank line before and after.
- Lists: every line starts with `- `, with a blank line before the list. No nested or numbered lists.
- Inline: `` `code` ``, `**bold**`, `[text](/courses/c/first-program)`. Links must be internal and lead to a real page; a published lesson may not link to a draft.
- Placeholders, each alone on its line: `{{example <id>}}`, `{{visual <id>}}` and `{{analogy}}`.

Not allowed: code blocks (every program on a page comes from a checked file), raw HTML, images, tables, block quotes, other heading levels, a single `*`, and em or en dashes. Write `<`, `>`, `&` and quotes as they are: the page shows them exactly, and never changes straight quotes into curly ones.

When one concept is taught in several languages, the concept file holds only what is true in every language. Syntax and behavior that differ go in each lesson's own prose.

## 5. Examples and their real results

Each example program has exactly one expectation file:

| File | Meaning |
|---|---|
| `name.expected.txt` | Every step succeeds; this is the exact standard output |
| `name.compile-error.txt` | The compiler fails (C, C++ and Java only); this is its exact error message |
| `name.run-error.txt` | The program starts and exits with an error, printing nothing to standard output first; this is the exact error message. A Python `SyntaxError` is a run error, because Python has no separate compile step here |

A Python example that calls `input()` also has `name.input.txt`: the lines a person types, one line per `input()` call. Only an example that succeeds (`.expected.txt`) may have one, and it cannot have a trace. An error example must print nothing before it fails, and a prompt would be printed first, so error examples do not call `input()`.

File names start with a letter and use letters, digits and underscores. Java file names match the class name.

**Capturing a result.** Never type output or an error message. Run the program the way `check:examples` runs it, from inside the example's folder, and save what it prints (Linux or WSL; see `PROGRESS.md` Known limitations for Windows):

```
cd content/examples/python
LANG=C.UTF-8 python3 -I -B name.py > name.expected.txt                                       # output
LANG=C.UTF-8 python3 -I -B name.py 2>&1 >/dev/null | sed "s#$PWD/##g" > name.run-error.txt   # error message

cd content/examples/c
LANG=C.UTF-8 gcc -std=c17 -Wall -Wextra -Werror name.c -o /tmp/name 2> name.compile-error.txt
LANG=C.UTF-8 gcc -std=c17 -Wall -Wextra -Werror name.c -o /tmp/name && /tmp/name > name.expected.txt
```

**Capturing an example that reads input.** Run it through the input script, which feeds the input file and writes the output a learner sees:

```
cd content/examples/python
LANG=C.UTF-8 python3 -I -B ../../../scripts/lib/python-input.py name.py name.input.txt > name.expected.txt
```

The echo is simulated. Python does not echo piped input: when a program reads from a pipe, the typed text is never shown, because nobody typed it. A person at a terminal sees the typed line right after the prompt only because the terminal draws it, and the playground shows it the same way. `python-input.py` therefore writes each prompt, then the next line of the input file and a line break, so the saved output reads like a terminal session (`What is your name? Ada`). `check:examples` runs every example that has an input file this way, and a file with too few lines fails with Python's own `EOFError`. The hash of the input file is part of the verification record, so editing an input file stops the build until the example is verified again.

**Capturing a trace** (Python examples with an `.expected.txt` only), from the same folder:

```
cd content/examples/python
LANG=C.UTF-8 python3 -I -B ../../../scripts/lib/python-trace.py name.py > name.trace.json
```

The tracer (`scripts/lib/python-trace.py`) runs the program line by line and records, for each line that runs, the line number, every variable the program defines (value as Python shows it with `repr`, and type) after that line, and the output so far. Python's own names (such as `__name__`, modules and built-in functions) never appear. `check:examples` reruns it with the same limits as every example and fails if the trace differs in any way, or if its final output differs from `.expected.txt`. This command reproduces the two Milestone 4 traces byte for byte.

`check:examples` compares error messages with the example's folder removed from paths, so `/home/you/CodeBloom/content/examples/python/name.py` becomes `name.py`. gcc already prints the name as you typed it; Python prints the full path, which the `sed` part removes. These commands were checked against the Milestone 2 files and reproduce them byte for byte. Open the file and read it before you continue.

**Toolchain.** Error messages are matched exactly against the recorded cloud toolchain: gcc 13.3.0 and Python 3.13.17 with the `C.UTF-8` locale (`PROGRESS.md`, decision D34). Under that locale gcc prints curly quotes around names, such as `‘main’`; that is what learners see in a UTF-8 terminal, so it is kept. If a newer compiler words a message differently, `check:examples` fails. A person then reads the new message, decides whether the lesson text still explains it, and only then saves the new file. Nothing re-captures messages automatically.

**Trailing spaces.** gcc sometimes ends a line with spaces, and they are part of the exact match. `.editorconfig` tells editors not to trim spaces or add a final newline in expectation files. If your editor ignores it, the check fails loudly; it never passes wrongly.

**Strict C flags.** Examples are compiled with `-Wall -Wextra -Werror`, so warnings are errors. For a mistake example, check that the message a learner would see with plain `gcc` is the same; if the strict flags add extra errors, change the example (Milestone 2 did this for `undeclared.c`).

## 6. Verify

```
npm run check:examples
```

It compiles and runs every example, compares the results (and traces, for Python examples that have one), and lists any problem. When everything passes it rewrites `content/verified-examples.json`, which stores a hash of each example, its expectation file and its trace. A failed run never changes it. Commit the record together with the examples.

If a result differs, read the difference first. A changed message may mean the lesson text needs to change too.

## 7. Review

Teaching quality is separate from passing checks. Before publishing, read the whole lesson in the browser as a first-time learner and check:

- The objective says what the learner will be able to do.
- Every technical term is explained the first time it appears, in this lesson or in an earlier lesson of the same course.
- The lesson explains why the code works, not only what it does.
- Every analogy says where it stops being accurate.
- Shared ideas are in the concept file; language-specific syntax and behavior are in the lesson.
- No simplification is misleading (for example: Python has types; reading an uninitialized C variable is undefined behavior).
- Prose and notes never state output that is not shown in a verified panel.
- Each mistake shows the wrong code, what happens, and the fix.
- Each practice solution, wrong option and hint is checked against its question, and each wrong option's explanation addresses its own misconception.
- Each visual: step through it once with the mouse and once with the keyboard only, and open the table. Every note matches the step it is on.

Then run the skills `CLAUDE.md` names for lesson screens: `design:design-critique` (teaching quality), `design:ux-copy` for any new interface text, and `design:accessibility-review` before a milestone is verified. Record the results in `PROGRESS.md`. A lesson meets `SPEC.md`'s "verified" definition only when all of this is done.

## 8. Publish

Set `status: "published"`, then run every check in `CLAUDE.md` (Quality gates), including `npm run build` and `npm run test:e2e`. The build stops if any example shown on a published page is missing from the verification record or changed since it was verified.

## 9. Build errors you may see

| Message contains | Meaning and fix |
|---|---|
| `has never been verified` / `has changed since it was last verified` | Run `npm run check:examples`, review the results, commit the updated record |
| `has no matching entry in examples` / `examples never placed` | A placeholder and the `examples` field do not match |
| `must place it once with {{analogy}}` | The lesson has an analogy but the prose does not place it |
| `must appear exactly once in the topics` | Add `lesson: "<slug>"` to one topic in `content/courses.ts` |
| `does not lead to a page` / `points to a draft lesson` | Fix the link, or publish the target first |
| `code blocks are not allowed` and other `line N:` messages | The prose uses Markdown outside the subset (section 4) |
| `lines X to Y are outside` | A note points at a line the example does not have |
| `wrong output N is the real output` | A wrong option equals what the program really prints; change it to a real misconception |
| `exactly one option must be correct` / `needs one to three hints` / `two or three wrong outputs` | A practice question is outside its limits (section 3a) |
| `error message differs` (from `check:examples`) | The compiler or interpreter printed something else; see section 5, Toolchain |
| `trace differs from` (from `check:examples`) | The program or the tracer changed. Recapture the trace (section 5), read the new steps, and check the notes still fit |
| `input files are only supported for Python examples` / `can have an input file` / `cannot have a trace` (from `check:examples`) | An `.input.txt` sits next to a C, C++ or Java example, an error example, or an example with a trace |
| `The input of example ... has changed` | An input file was edited, added or removed after verification. Run `npm run check:examples` and commit the updated record |
| `EOFError: EOF when reading a line` (from `check:examples`) | The program calls `input()` more times than its input file has lines, or the example has no input file |
| `traces are only supported for Python examples` / `only an example with ... can have a trace` / `no example file named` (from `check:examples`) | A `.trace.json` sits next to the wrong kind of example, or its program is missing |
| `The trace of ... has never been verified` / `has changed since it was last verified` | Run `npm run check:examples` and commit the updated record |
| `has no trace file` / `a visual needs an output example` / `must be "python/<name>"` | The visual's `example` is not a traced Python output example |
| `step N does not exist` | A note or branch key is past the last step of the trace |
| `must declare whether the condition was true` | A note sits on an `if` or `elif` step; add it to `branches` |
| `declares the condition was ..., but the trace shows` | The declaration is wrong; the trace shows which way the program went |
| `cannot declare a branch` | `branches` names a step whose line is not an `if` or `elif` |
| `{{visual ...}} has no matching entry` / `visuals never placed` | A placeholder and the `visuals` field do not match |
