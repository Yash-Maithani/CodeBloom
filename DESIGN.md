# CodeBloom design system: Annotated Notebook

This file defines how CodeBloom looks and behaves. It follows the design bans in `CODEBLOOM_MASTER_BRIEF.md` Section 8, which override anything here. Product requirements are in `SPEC.md`.

How this was made: direction set with `frontend-design:frontend-design`, written with `website-design:web-design-system`, on 2026-10-26. UXKIN was not connected, so this direction is not based on a comparison with real reference sites. Tokens are defined here only; they become CSS variables and a Tailwind theme in Milestone 0b.

## 1. Brand

- **Name and tagline:** CodeBloom. Learn. Grow. Build.
- **Wordmark:** "CodeBloom" set in the heading face at weight 600, ink color. No logo mark or final favicon yet; both are launch items.
- **Personality:** a patient tutor who writes notes in the margin of your exercise book. Calm, clear, encouraging, never cute.
- **Voice:** second person, plain verbs, sentence case, short sentences. Explain, do not sell. Errors say what happened and what to do next.

## 2. Direction

The page is a clean sheet of notebook paper. Code sits on it like a worked example, and the explanation is written beside it as margin notes tied to specific lines. That annotated code block is the one memorable element. Everything else stays quiet: left-aligned text, generous space, thin borders, almost no shadow, one green accent.

Choices made to avoid generic defaults:

- The paper is a near-neutral off-white, lighter and less yellow than the common cream template background.
- The accent is a deep pine green, not terracotta, purple or neon.
- Borders and modest radius, not a newspaper layout of hairlines and sharp corners, and not a kit of identical rounded cards.
- No all-caps eyebrow labels, no middle-dot metadata strings, no arrows appended to button text, no monospace for non-code labels.

## 3. Color

### Light theme

| Token | Hex | Role |
|---|---|---|
| `paper` | `#F8F7F2` | Page background |
| `sheet` | `#FFFFFF` | Raised surfaces: lesson column, cards, inputs, menus |
| `code` | `#F1F2EC` | Code and output panel background |
| `ink` | `#1E2320` | Body text, headings, icons, focus ring |
| `ink-muted` | `#4F5752` | Secondary text, line numbers, captions, code comments |
| `rule` | `#D5D7CF` | Decorative dividers only, never the only edge of a control |
| `rule-strong` | `#767D78` | Input and secondary button borders, control edges |
| `accent` | `#1B5E45` | Links, primary buttons, current navigation item, margin-note markers, active code line bar |
| `accent-hover` | `#134634` | Hover and pressed state of accent elements |
| `accent-tint` | `#E3EFE8` | Highlighted code line, selected option background |
| `on-accent` | `#FFFFFF` | Text and icons on `accent` |
| `success` | `#1A5A9E` | Correct answers and passed checks |
| `success-tint` | `#E6EEF8` | Correct feedback panel background |
| `error` | `#A8261B` | Wrong answers, form errors, compiler error display |
| `error-tint` | `#FBEAE7` | Error feedback panel background |
| `warning` | `#7F5300` | Common-mistake callouts, cautions |
| `warning-tint` | `#FAF0DA` | Common-mistake callout background |
| `syntax-literal` | `#7F4A10` | Strings and numbers in code |

### Dark theme

| Token | Hex |
|---|---|
| `paper` | `#161A18` |
| `sheet` | `#1E2321` |
| `code` | `#121614` |
| `ink` | `#E7EAE5` |
| `ink-muted` | `#A9B1AB` |
| `rule` | `#343B37` |
| `rule-strong` | `#7D867F` |
| `accent` | `#7CC4A2` |
| `accent-hover` | `#9AD4B8` |
| `accent-tint` | `#1F3A2F` |
| `on-accent` | `#0F1F18` |
| `success` | `#8DB8EC` |
| `success-tint` | `#1A2B3F` |
| `error` | `#F29A8E` |
| `error-tint` | `#3D1F1B` |
| `warning` | `#E3B661` |
| `warning-tint` | `#3A2E15` |
| `syntax-literal` | `#E2B27A` |

Roles are the same in both themes. Dark mode follows the system preference first; a manual toggle is an open decision in `SPEC.md`.

### Why success is blue

Green is the brand and the color of every link and primary button. If "correct" were also green, ordinary controls would look like right answers. Success therefore uses blue, error uses red, and the accent stays the only green. Blue against red is also easier to tell apart than green against red for people with the most common forms of color blindness. Color is never the only signal: feedback always pairs color with an icon and a word.

### Contrast check

Computed with the WCAG 2.1 relative luminance formula on 2026-10-26. All text pairs need 4.5:1; control edges, focus rings and state colors used as non-text need 3:1. Every pair below passes in both themes. Recheck in the browser with `design:accessibility-review` once tokens are in code.

| Pair | Light | Dark |
|---|---|---|
| `ink` on `paper` / `sheet` / `code` | 14.87 / 15.95 / 14.17 | 14.47 / 13.13 / 15.03 |
| `ink` on `accent-tint` / `success-tint` / `error-tint` / `warning-tint` | 13.50 / 13.63 / 13.69 / 14.08 | 10.15 / 11.84 / 12.27 / 10.94 |
| `ink-muted` on `paper` / `sheet` / `code` / `accent-tint` | 6.95 / 7.45 / 6.62 / 6.31 | 8.00 / 7.26 / 8.31 / 5.61 |
| `accent` on `paper` / `sheet` / `code` / `accent-tint` | 7.16 / 7.68 / 6.82 / 6.50 | 8.60 / 7.80 / 8.93 / 6.03 |
| `on-accent` on `accent` / `accent-hover` / `ink-muted` | 7.68 / 10.75 / 7.45 | 8.36 / 10.15 / 7.78 |
| `success` on `paper` / `sheet` / `success-tint` | 6.53 / 7.00 / 5.98 | 8.54 / 7.74 / 6.98 |
| `error` on `paper` / `sheet` / `error-tint` | 6.62 / 7.10 / 6.09 | 8.19 / 7.43 / 6.94 |
| `warning` on `paper` / `sheet` / `warning-tint` | 6.24 / 6.69 / 5.91 | 9.31 / 8.45 / 7.04 |
| `syntax-literal` on `code` / `sheet` / `accent-tint` | 6.46 / 7.27 / 6.15 | 9.46 / 8.26 / 6.38 |
| `rule-strong` against `paper` / `sheet` / `code` (non-text) | 3.94 / 4.22 / 3.75 | 4.68 / 4.24 / 4.86 |

Rules that keep this true:

- Text on a tint uses `ink`, or the matching state color (for example `error` on `error-tint`). No other combinations without a new check.
- `rule` is decorative. Any edge a user must see to find a control uses `rule-strong`.
- Adding or changing a token means rerunning the check and updating this table.

## 4. Typography

| Role | Typeface | Weights |
|---|---|---|
| Headings, wordmark | Literata | 600 |
| Body, interface, margin notes | Atkinson Hyperlegible Next | 400, 700 |
| Code, output, values in diagrams | Atkinson Hyperlegible Mono | 400, 700 |

Why: Atkinson Hyperlegible was designed by the Braille Institute for readers with low vision, with letterforms meant to keep easily confused characters apart, such as `l`, `1` and `I`, or `O` and `0`. That matters to a beginner reading code. Check these characters in the browser at scaffold time. The mono version keeps the same letterforms in code. Literata is a reading serif with enough warmth for headings without feeling decorative.

All three are served by Google Fonts (checked 2026-10-26). Load them through `next/font` at scaffold time and confirm the license files then. Fallbacks: `Georgia, serif` for headings, `system-ui, sans-serif` for body, `ui-monospace, monospace` for code.

### Scale

Root size 16px. Sizes in rem.

| Token | Size | Line height | Use |
|---|---|---|---|
| `text-xs` | 0.875 (14px) | 1.45 | Line numbers, captions, metadata. Smallest size allowed. |
| `text-sm` | 1 (16px) | 1.5 | Interface text, buttons, margin notes |
| `text-base` | 1.125 (18px) | 1.7 | Lesson prose |
| `text-lg` | 1.3125 (21px) | 1.45 | Lead paragraph, h4 |
| `text-xl` | 1.5 (24px) | 1.35 | h3 |
| `text-2xl` | 1.875 (30px) | 1.25 | h2 |
| `text-3xl` | 2.375 (38px) | 1.15 | h1 on course and lesson pages |
| `text-4xl` | 3 (48px) | 1.1 | Homepage headline only; 2.375rem below 768px |
| `text-mono` | 0.9375 (15px) | 1.6 | Code and output. Not named `text-code`, which would clash with the `code` color token |

Rules:

- Prose line length 60 to 72 characters: token `max-w-measure` (68ch). Not `max-w-prose`, which is Tailwind's built-in 65ch.
- Headings and body are left-aligned. Center only short, single-line elements inside a component.
- Sentence case everywhere. No all-caps labels. Emphasize with weight 700 sparingly, never by coloring one word of a headline.
- Code never wraps by default, because wrapping can disguise Python indentation. Long lines scroll horizontally inside the code block.
- Inline code inside a sentence may wrap where it would otherwise overflow a narrow screen (`overflow-wrap: anywhere`), so pages reflow at 320px (WCAG 1.4.10). Code blocks, output and error messages never wrap.

## 5. Spacing and layout

- **Scale (4px base):** 4, 8, 12, 16, 24, 32, 48, 64, 96. Use only these.
- **Component padding:** 12 to 16 inside controls, 24 inside panels.
- **Section spacing:** 64 on desktop, 48 below 768px.
- **Page gutter:** 16 below 640px, 24 up to 1024px, 32 above.
- **Containers:** prose column `max-w-measure` (68ch); lesson layout (code plus notes) up to 1200px; site container up to 1280px.

### Breakpoints

| Name | Min width | Notes |
|---|---|---|
| base | 0 | Single column, notes stacked under lines |
| `sm` | 640px | Wider gutters |
| `md` | 768px | Two-column course lists |
| `lg` | 1024px | Margin notes move beside the code |
| `xl` | 1280px | Maximum content width reached |

### Lesson layout

```
lg and wider
+----------------------------------------------+----------------------+
| 1  age = 17                                  | (1) A variable is a  |
| 2  if age >= 18:                             |     labeled box...   |
| 3      print("You can vote")                 | (2) The condition is |
| 4  else:                                     |     checked once...  |
| 5      print("Not yet")                      |                      |
+----------------------------------------------+----------------------+
| Expected output                                                     |
| Not yet                                                             |
+---------------------------------------------------------------------+

below lg
+-----------------------------------+
| 1  age = 17                       |
|  | (1) A variable is a labeled... |
| 2  if age >= 18:                  |
|  | (2) The condition is checked...|
| 3      print("You can vote")      |
+-----------------------------------+
| [Hide notes]              [Copy]  |
```

## 6. Shape and depth

- **Radius:** 4px for inputs, tags and small controls; 6px for buttons; 8px for panels, code blocks and cards. Nothing larger. Fully round only for the small margin-note number markers.
- **Pill-shaped buttons are banned** (brief Section 8).
- **Borders over shadows.** Panels use a 1px border. One shadow exists, for floating layers only (menus, popovers): `0 4px 16px rgb(30 35 32 / 0.12)`. Dark theme uses a `rule-strong` border instead of a shadow.

## 7. Components

Every interactive component defines these states: default, hover, focus-visible, active (pressed), disabled where it applies, and loading or error where it applies.

### Shared interaction states

- **Focus-visible:** 2px solid `ink` outline with 2px offset, on every focusable element. Never removed. Shown for keyboard focus, not for mouse clicks.
- **Hover:** a color or background change only. No movement, scaling or glow.
- **Active:** the hover color, one step darker where possible.
- **Disabled:** `ink-muted` text on `code` background, `not-allowed` cursor. Avoid disabled buttons where possible; prefer an enabled button that explains what is missing.
- **Transitions:** color and background only, 120ms.

### Buttons

Minimum height and width 44px. Text label always present; an icon is optional and sits before the label.

| Variant | Default | Hover |
|---|---|---|
| Primary | `accent` background, `on-accent` text | `accent-hover` background |
| Secondary | `sheet` background, `ink` text, 1px `rule-strong` border | `accent-tint` background |
| Quiet | No background, `accent` text | Underline appears |

One primary button per view region. Labels say exactly what happens ("Check answer", "Next lesson"), never "Submit" or "Learn more".

### Links

- In prose: `accent` color, always underlined (1px, offset 3px); underline thickens to 2px on hover.
- In navigation: `ink` text, no underline; the current page shows a 2px `accent` bar and `aria-current="page"`.

### Inputs

`sheet` background, 1px `rule-strong` border, 4px radius, 44px minimum height, label always visible above (never placeholder-only). Error state: `error` border plus a message with an icon below, linked with `aria-describedby`.

### Code block (signature component)

- **Header row:** language name in plain text ("Python"), a label saying "Runnable example", "Example with a mistake" (a real program that fails or misbehaves on purpose, shown in a Common mistake callout) or "Pseudocode, not runnable", a notes toggle where notes exist, and a Copy button. The Copy button confirms with "Copied" for two seconds.
- **Body:** `code` background, 8px radius, 1px `rule` border, line numbers in `ink-muted` that are not selectable or copied.
- **Syntax colors (deliberately minimal):** keywords in `ink` at weight 700, strings and numbers in `syntax-literal`, comments in `ink-muted` italic, everything else `ink`. Code must remain readable with no color at all.
- **Pseudocode:** same panel with a dashed `rule-strong` border and the "not runnable" label. Never styled like runnable code.
- **Output panel:** directly below the code, headed "Expected output", `code` background with a 3px `ink-muted` left bar. An error message uses an `error` left bar and an x-circle icon, headed "Compiler error message" when the compiler failed or "Error message" when the program failed. The text is always the recorded result of a real run. Like the code, the panel is a focusable region with its own name ("Error message for Python code with a mistake: ..."), so a long message can be scrolled from the keyboard.

### Margin notes

Each note explains one line or a short range of lines and carries a small round number marker (`accent` background, `on-accent` numeral). The same number appears in the code gutter beside the line it explains. Numbering is used because notes follow the code's order.

**Wide screens (1024px and up):** notes sit in a column to the right of the code, each aligned with the top of its line. If two notes would overlap, the later one moves down; the shared number keeps the link clear. Hovering a note with a pointer highlights its line with `accent-tint` and a 3px `accent` bar at the left of the line, and the reverse works from the gutter marker. This is an extra for pointer users only: notes are not focusable (they are static text, and extra tab stops slow keyboard users down), and the shared number plus the line number in the screen reader list carry the same link without it (decision D19).

**Narrow screens (below 1024px):** each note is shown directly under the line it explains, inside the code block, as an annotation row: sans-serif text on `sheet`, a 3px `accent` left bar and the number marker. A "Hide notes" button in the header collapses all notes to read the clean program; its label then changes to "Show notes". Because the label carries the state, the button does not also use `aria-pressed`. Notes are shown by default. The choice may be remembered for the visit.

**For everyone:**

- Copy always gives the code alone.
- Screen readers get the program uninterrupted, then an ordered list titled "Notes on this code", each item starting with its line number ("Line 2: ..."). Visual placement must not cause notes to be read twice or mid-line. The exact markup is chosen in Milestone 2 and checked with `design:accessibility-review`.
- Notes are text, not tooltips, so they work on touch screens and with zoom.

### Callouts

Three kinds only, each with an icon and a visible title:

| Kind | Style | Use |
|---|---|---|
| Analogy | `accent-tint` background, `accent` left bar | Real-life comparison, followed by where it stops being accurate |
| Common mistake | `warning-tint` background, `warning` left bar, triangle-alert icon | An h3 title, then the code block labeled "Example with a mistake" with its real error message or output, then bold-labeled paragraphs "What happens:", optionally "How to read it:" or "Why it is easy to miss:", and "Fix:", optionally followed by a runnable fixed version. Spans the lesson width because it holds code |
| Note | `sheet` background, `rule-strong` left bar | Side information |

### Lesson page

Left-aligned, in this order: a back link to the course ("Python course"), the h1, the objective as a lead paragraph starting with a bold "Goal:", then "The idea" (the shared explanation of the concept), the lesson's own sections, "Common mistakes", "Practice", "Recap", and the lesson navigation. Prose stays in the 68ch column; code blocks and mistake callouts use the lesson width. Section headings sit 48px apart, 64px from 768px. No label above the h1.

- **Shared idea:** under the "The idea" heading, a small `ink-muted` line "This part is the same in the C lesson." links the same concept in the other languages that have a published lesson. It is left out when there is none.
- **Analogy callout:** titled "Analogy: <title>", with a bold "Where the comparison stops:" paragraph.

### Practice questions

Numbered, because the text can refer to "the first practice question". Each question is a `fieldset` whose legend is a bold "Question 1." plus the question, then (for predict-the-output) the code block without its output, then the options as described in "Quiz and feedback" below.

- **Output options:** program output is shown as real separate lines in `text-mono`, never described in words ("10 then 15"). Screen readers hear "Line 1:", "Line 2:" before each line. An option for no output reads "Nothing is printed" in italic sans. Output never wraps; on a narrow screen a long line scrolls inside its option, which then becomes focusable.
- **Controls:** "Check answer" (primary) and "Show hint 1 of 3" (secondary) in one row. They appear only once the page is interactive; their space is reserved so nothing moves.
- **Status:** after a correct check, "Answered correctly" with a check-circle icon in `success`, beside the buttons. Under the Practice heading, a small `ink-muted` line "1 of 3 questions answered correctly on this page". Nothing is stored, so the line says "on this page".
- **Solution:** the native "Show solution" disclosure (secondary button style, "Hide solution" when open, instant, no JavaScript) stays available at any time. Inside: the verified output panel, or "Answer:" with the correct option for a multiple-choice question, then the explanation.
- Hints appear below the feedback as `sheet` rows with a `rule-strong` left bar and a bold "Hint 1:".

### Lesson navigation

After the recap, above a `rule` divider: up to two bordered links (`sheet` background, `rule-strong` border, `accent-tint` on hover), "Previous lesson" on the left and "Next lesson" on the right, each a small `ink-muted` label above the lesson title. They follow published lessons in course order. The first lesson has no previous link and the last has no next link (absent, not disabled). The last lesson says "This is the last published lesson in the <course> course." with a link back to the course. No arrows are added to the text.

### Quiz and feedback

- Answer options are full-width rows (minimum 44px) with a visible radio or checkbox; selected option uses `accent-tint` and a 2px `accent` border.
- Correct: `success-tint` panel, `success` check-circle icon, the word "Correct", then the explanation.
- Incorrect: `error-tint` panel, `error` x-circle icon, the words "Not quite", then why, and the offer of a hint. Never mocking or celebratory.
- Feedback appears in place below the question and is announced through a polite live region.
- Hints are revealed one at a time with "Show hint 1 of 3"; revealed hints stay visible.

### Step-through visuals

A panel below an example's explanation that lets the learner run the program one line at a time. Every line, value and output in it comes from a recorded trace of a real run; only the title and step notes are written by hand.

- **Heading:** an h3 title ("Step through it: watch the value of `apples`"), then a small `ink-muted` line "Move one line at a time. Every value shown comes from really running this program."
- **Panel:** `sheet` background, 1px `rule` border, 8px radius, 16px padding (24px from 768px).
- **Code:** a compact copy of the example on `code`, line numbers in `ink-muted`. The line that just ran gets a 3px `accent` left bar, `accent-tint` background and a 16px Lucide `arrow-right` in `accent` beside its number, so it is not shown by colour alone. Lines that never run are never marked. Code never wraps; it scrolls inside the panel.
- **Step text:** bold "Step 3 of 4. Line 3 ran: `apples = apples + 2`", then what changed in words, generated from the trace ("apples changed from 3 to 5.", "No variable changed.", "Python went from line 2 to line 5."), then the step's note if it has one. The start state reads "Start. Nothing has run yet."
- **Variables:** the labeled boxes from Educational diagrams, as HTML: the name above in sans, the value inside in `text-mono` on `sheet` with a 1px `rule-strong` border, the type below in `text-xs` `ink-muted`. A variable that changed on this step gets a 2px `accent` border, `accent-tint` fill and the words "changed (was 3)", or "new" when it first appears. Before anything runs: "No variables yet" in italic.
- **Output so far:** the output panel style (`code`, 3px `ink-muted` left bar), with output as real separate lines in `text-mono`, read as "Line 1:", "Line 2:". Before anything is printed: "nothing yet" in italic.
- **Controls:** "Back" (secondary), "Next step" (primary), "Start again" (secondary), in one row that wraps on a phone. At the ends, Back or Next step stays focusable with `aria-disabled`: text turns `ink-muted` (the primary button's fill turns `ink-muted` with `on-accent` text), and pressing it announces "This is the start. Nothing has run yet." or "This is the last step." without moving. The controls appear only once the page is interactive; their space is reserved.
- **Announcement:** every step's full sentence (step, line, changes, note, output so far line by line) goes to a polite live region.
- **Text equivalent:** an "All steps as a table" disclosure (secondary button style) below the panel, holding a table with a Start row and one row per step: line that ran, variables after it, output so far. It is a focusable region, because it scrolls sideways on a phone. Without JavaScript the panel is hidden and the table is shown open.
- **Motion:** only the current line's existing 120ms colour change; values do not move. Instant with reduced motion. Nothing plays by itself.

### Progress

- Lesson section steps may be numbered because they are a real sequence.
- Progress bars and checkmarks show only real state. No streaks, points or invented counters.

### Cards

Used for course and language entries only. `sheet` background, 1px `rule` border, 8px radius, no shadow. Each card's content differs in substance (language, what you will learn, lesson count when real). Do not use rows of interchangeable feature cards.

### Navigation and footer

- Top bar: wordmark left, language courses and key links right, `paper` background with a `rule` bottom border.
- While the navigation has three links or fewer and they fit at 360px, they stay visible at every width with no menu button (decision D18). When the navigation grows past that: below 768px a "Menu" button (icon plus label) opens a disclosure panel; focus moves into it and Escape closes it.
- Skip link "Skip to content" as the first focusable element.
- Footer: plain links (courses, about, privacy, terms once they exist). No social proof, no newsletter box unless one really exists.

## 8. Motion

Motion explains a change or answers an action. Nothing moves on its own.

| Token | Value | Use |
|---|---|---|
| `duration-fast` | 120ms | Hover, press, color changes |
| `duration-base` | 200ms | Expand and collapse, hint reveal, feedback appearing |
| `duration-slow` | 300ms | Visualization step transitions; the maximum allowed |
| `ease-standard` | `cubic-bezier(0.2, 0, 0, 1)` | All of the above |

- Use CSS transitions first. Motion for React only where CSS cannot do the job (for example exit or layout animations), recorded as a dependency decision.
- No scroll-triggered reveals, parallax, auto-playing animation, looping decoration or custom cursors.
- Visualization steps advance only when the learner asks.
- Animate only `opacity` and `transform`, except color transitions. Never shift layout.
- With `prefers-reduced-motion: reduce`, all transitions become instant except opacity fades of 120ms or less. All information stays available.

## 9. Icons and imagery

- **Icons:** one outline set, Lucide proposed (confirm license and package at scaffold). 20px default, 16px inline, stroke 1.75. Every icon has a visible text label next to it or an accessible name. No emoji as icons.
- **Photography:** none by default. No stock or AI-generated imagery.
- **Illustration:** simple line drawings only when an analogy truly benefits, using token colors.

### Educational diagrams

Built as inline SVG with token colors so they work in both themes.

- **Variables:** a labeled box; the name above in sans-serif, the value inside in mono. Built in HTML in the step-through visuals (Components).
- **Arrays:** a row of equal cells with the index below each cell, starting at 0.
- **Pointers and references:** an arrow from the pointer's box to the target's box, with the address shown in mono when it matters.
- **Call stack:** stacked frames with the newest on top, each showing its function name and local variables.
- **Loop trace:** a table with one row per iteration and one column per variable, current row highlighted.
- **Color:** lines in `ink` at 1.5px, the active element in `accent` with `accent-tint` fill, everything else neutral. `success` and `error` only when showing a real result.
- **Labels** at `text-sm` minimum. Every diagram has a caption and a text description that conveys the same information.

## 10. Prohibited patterns

All bans in brief Section 8 apply. Specific ways they could creep into this design:

- A green-to-teal gradient hero, or any gradient used as identity or decoration.
- Rounding buttons to a pill "because it looks friendly".
- "Join thousands of learners", star ratings, invented quotes, or a counter of lessons completed.
- A "Coming soon" button that looks clickable.
- Notebook-paper texture, ruled-line backgrounds, doodles or tape graphics as decoration.
- Margin notes as hover-only tooltips.
- Section-by-section fade-up on scroll, or animated code typing on the homepage.
- A glass navigation bar or blurred panels.
- Uppercase tracked labels above headings, or monospace used for non-code labels.
