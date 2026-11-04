# CodeBloom design system: Trailhead

Approved by the owner on 2026-11-03 (direction C, Trailhead, with the B, Bench, figure system inside lessons). It replaces the Annotated Notebook design. The rules in brief Section 8 apply and override anything here. `npm run verify:browser` reads the tables in sections 2 to 6 and compares them with the code, so keep their format.

## 1. Direction

CodeBloom is a guided path for people who have never programmed. Each course is a trail of numbered stops; each lesson is a short series of steps shown in a step rail. The learner is asked to think before they see a result ("predict, then run"), and every result shown comes from a verified run. Inside lessons, examples are figures: code on the left, and on the right the path the program took, the output of the real run and the note that explains it.

Friendly, not childish: one teal for structure and links, one marigold for the learner's own actions, generous space, large legible type. One memorable element per page: the predict-then-run figure. Everything else stays calm.

Not based on compared real sites (UXKIN not connected); based on the owner's references (press.stripe.com, ciechanow.ski, distill.pub, redblobgames.com) and the three mockups the owner reviewed.

## 2. Colour

Every colour has one role. Components use token names only, never values. Light is the default; dark applies with `prefers-color-scheme: dark` or `data-theme="dark"` on `<html>`.

### Light theme

| Token | Value | Role |
|---|---|---|
| `canvas` | `#F7F4EE` | Page background |
| `surface` | `#FFFDF9` | Cards, figures, header |
| `sunken` | `#F2EEE7` | Code, inputs, output |
| `ink` | `#16302B` | Text, icons, focus ring |
| `ink-muted` | `#584F45` | Secondary text, line numbers |
| `rule` | `#DDD5C9` | Decorative dividers only |
| `edge` | `#7F7466` | Borders of controls a user must find |
| `primary` | `#00695C` | Links, current step, trail, structure |
| `primary-hover` | `#004D44` | Pressed or hovered `primary` |
| `on-primary` | `#FFFFFF` | Text on `primary` |
| `primary-tint` | `#DDEFEA` | Current line, selected option, chips |
| `action` | `#F4C542` | The learner's own action: primary buttons, "your turn" |
| `action-hover` | `#E3B22C` | Hovered `action` |
| `on-action` | `#16302B` | Text on `action` |
| `action-edge` | `#16302B` | 2px border and pressed edge of `action` buttons |
| `mark` | `#FBE7A6` | Highlighter marks (text on it is `ink`) |
| `literal` | `#8A4B00` | Strings and numbers in code |
| `success` | `#1D5FA8` | Correct answers (blue, so it is never confused with teal structure) |
| `success-tint` | `#E6EEF8` | Correct-answer panel |
| `error` | `#B3261E` | Errors, wrong answers |
| `error-tint` | `#FBE9E7` | Error panel |
| `warning` | `#7F5300` | Mistakes, time limits, cut-off output |
| `warning-tint` | `#FFF3D6` | Mistake and warning panel |

### Dark theme

| Token | Value |
|---|---|
| `canvas` | `#0F1D1A` |
| `surface` | `#172925` |
| `sunken` | `#1D322D` |
| `ink` | `#E4EFEB` |
| `ink-muted` | `#A9BEB8` |
| `rule` | `#2E4741` |
| `edge` | `#7F9C95` |
| `primary` | `#5CC8B4` |
| `primary-hover` | `#8AD9CB` |
| `on-primary` | `#0F1D1A` |
| `primary-tint` | `#1E3D36` |
| `action` | `#F4C542` |
| `action-hover` | `#E3B22C` |
| `on-action` | `#16302B` |
| `action-edge` | `#9C7A16` |
| `mark` | `#5A4A12` |
| `literal` | `#E9B46B` |
| `success` | `#8DB8EC` |
| `success-tint` | `#1A2B3F` |
| `error` | `#F2A7A0` |
| `error-tint` | `#3A1F1C` |
| `warning` | `#E3B661` |
| `warning-tint` | `#3A2E12` |

Roles are the same in both themes.

### Contrast check

WCAG 2.1 ratios, computed 2026-11-03 (light neutrals updated 2026-11-04 to the owner's warmer option 1) and recomputed in the browser by `verify:browser`. Text needs 4.5:1; edges a user must see need 3:1.

| Pair | Light | Dark |
|---|---|---|
| `ink` on `canvas` / `surface` / `sunken` | 12.82 / 13.86 / 12.17 | 14.74 / 12.93 / 11.54 |
| `ink` on `primary-tint` / `mark` | 11.80 / 11.45 | 10.05 / 7.36 |
| `ink-muted` on `canvas` / `surface` / `sunken` | 7.30 / 7.89 / 6.93 | 8.87 / 7.78 / 6.95 |
| `primary` on `canvas` / `surface` / `primary-tint` | 6.02 / 6.51 / 5.55 | 8.57 / 7.52 / 5.84 |
| `primary-hover` on `canvas` / `surface` | 8.92 / 9.64 | 10.63 / 9.32 |
| `on-primary` on `primary` | 6.61 | 8.57 |
| `on-action` on `action` / `action-hover` | 8.66 / 7.15 | 8.66 / 7.15 |
| `literal` on `sunken` / `surface` | 5.88 / 6.70 | 7.25 / 8.12 |
| `success` on `surface` / `success-tint` | 6.35 / 5.52 | 7.39 / 6.98 |
| `error` on `surface` / `error-tint` | 6.43 / 5.58 | 7.83 / 7.76 |
| `warning` on `surface` / `warning-tint` | 6.58 / 6.07 | 8.06 / 7.05 |
| `ink` on `success-tint` / `error-tint` / `warning-tint` | 12.03 / 12.01 / 12.77 | 12.21 / 12.81 / 11.30 |
| `edge` against `canvas` / `surface` / `sunken` (non-text) | 4.17 / 4.50 / 3.95 | 5.86 / 5.14 / 4.59 |
| `action-edge` against `canvas` (non-text) | 12.82 | 4.30 |

Rules that keep this true:

- The light `action` fill is only 1.48:1 against `canvas`, so every `action` button has a 2px `action-edge` border, which carries its boundary (12.82:1). In dark mode the fill itself is 10.66:1 against `canvas`.
- Text on a tint is `ink` or the matching state colour. `rule` is never the only edge of a control.
- Colour is never the only signal: states also change an icon, a word or a border.
- Adding or changing a token means rerunning the check and updating this table.

## 3. Typography

Free licences only (SIL Open Font License 1.1), self-hosted with `next/font`, so no request goes to Google at run time.

- **Bricolage Grotesque** (700, 800): headings and stop numbers.
- **Atkinson Hyperlegible Next** (400, 700): all other text, buttons, labels. Chosen because it keeps easily confused letters distinct.
- **Atkinson Hyperlegible Mono** (400, 700, 400 italic): code, output, values. No ligatures: `>=` is shown as typed. Italic is for code comments.

### Scale

Size and line height below 768px, then from 768px. The weight is part of the token.

| Token | Below 768px | Line height | From 768px | Line height | Weight | Use |
|---|---|---|---|---|---|---|
| `display` | 2.5 (40px) | 1.05 | 4.25 (68px) | 1 | 800 | Homepage h1 only |
| `h1` | 2.375 (38px) | 1.1 | 3.5 (56px) | 1.05 | 800 | Page titles |
| `h2` | 1.75 (28px) | 1.2 | 2.125 (34px) | 1.15 | 700 | Sections, lesson steps |
| `h3` | 1.3125 (21px) | 1.3 | 1.5 (24px) | 1.25 | 700 | Figure titles, card titles |
| `lead` | 1.1875 (19px) | 1.55 | 1.3125 (21px) | 1.55 | 400 | Goals, intros |
| `body` | 1.125 (18px) | 1.6 | 1.125 (18px) | 1.6 | 400 | Prose, at most 68ch |
| `ui` | 1 (16px) | 1.5 | 1 (16px) | 1.5 | 400 | Buttons, labels, rail (buttons set bold) |
| `small` | 0.875 (14px) | 1.45 | 0.875 (14px) | 1.45 | 400 | Captions, chips, hints |
| `code` | 0.9375 (15px) | 1.7 | 1 (16px) | 1.75 | 400 | Code, output |

Rules:

- Display, h1 and h2 are tracked tighter: -0.03em, -0.025em and -0.02em.
- No all-caps labels, no eyebrow labels above headings, no monospace for non-code labels.

## 4. Spacing, grid and breakpoints

- **Scale (4px base):** 0, 4, 8, 12, 16, 24, 32, 40, 48, 64, 96. Class names count 4px steps (`p-4` is 16px); nothing else exists.
- **Section spacing:** 96 from 1024px, 64 below.
- **Widths:** `page` 1240px; `measure` 68ch for prose; `lesson-main` 880px; `rail` 260px.
- **Grid:** 12 columns, 24px gutters; page margins 40px from 1024px, 24px from 768px, 16px below.
- **Breakpoints:** base 360, `md` 768, `lg` 1024, `xl` 1440. Every template is checked at 360, 768, 1024 and 1440. No horizontal page scroll at 320.

## 5. Shape and depth

### Radius

| Token | Value | Use |
|---|---|---|
| `chip` | 6px | Value chips, tags |
| `control` | 8px | Buttons, inputs, options |
| `panel` | 10px | Code blocks, figures, callouts |
| `card` | 12px | Course cards, step cards |
| `round` | 9999px | Number markers and trail stops only |

Buttons are never pill-shaped.

### Shadows

Three, nothing else: `press` 0 4px 0 `action-edge` (primary buttons only; pressing moves the button down the same 4px); `lift` 0 14px 28px -14px (ink at 45% in light, black at 60% in dark), hovered course cards only; `float` 0 8px 24px ink at 18% (none in dark, which uses an `edge` border), menus and popovers.

## 6. Motion

Motion shows what changed or answers an action. Nothing moves on its own; nothing loops.

| Token | Value | Use |
|---|---|---|
| `duration-fast` | 120ms | Colour, background, press |
| `duration-base` | 200ms | Hints, feedback, step highlight, values, card lift |
| `duration-slow` | 300ms | Ink connector, highlighter mark, bloom (the maximum) |
| `ease-standard` | `cubic-bezier(0.2, 0, 0, 1)` | Everything except the bloom |
| `ease-bloom` | `cubic-bezier(0.3, 0, 0, 1.3)` | The bloom only (a small overshoot) |
| `tilt-card` | `-0.5deg` | How far a course card turns when it lifts |

- Only `transform` and `opacity` animate, plus colour transitions. Nothing changes layout; CLS stays 0.
- With `prefers-reduced-motion: reduce`: every duration token is 0ms, every transform and animation is off, and all information stays.
- The only motion not caused by a click, key or hover is the highlighter mark, which draws once when a marked term first enters the viewport and never again.

## 7. Components

Every interactive component defines: default, hover, focus-visible, pressed, disabled (prefer an enabled control that explains what is missing), loading and error where they apply, and the reduced-motion version. Focus-visible everywhere: 2px solid `ink` outline, 2px offset. Targets at least 44 by 44px.

- **Button, primary:** `action` fill, `on-action` text, 2px `action-edge` border, `press` shadow; hover darkens the fill one step; pressed moves down 4px and drops the shadow; reduced motion: pressed keeps its place and uses the hover fill; disabled `sunken` fill with `ink-muted` text and `edge` border; loading keeps the label and adds "…" in words, for example "Running…".
- **Button, secondary:** `surface` fill, `ink` text, 2px `edge` border; hover `primary-tint`.
- **Link:** `primary`, always underlined; hover thickens the underline.
- **Course card:** `surface`, `card` radius, 8px top band (`primary` published, `rule` planned), name in `h3`, one-line description, a chip "13 lessons" or "Planned". Hover and focus-within: lifts 4px and turns by `tilt-card` with the `lift` shadow (`duration-base`, `ease-standard`); reduced motion: the shadow appears, nothing moves.
- **Step rail:** sticky from 1024px; numbered steps (round markers); current step `surface` row with a 4px `primary` bar and `aria-current="location"`; links jump to sections; below 1024px it becomes a "Steps in this lesson" disclosure at the top.
- **Code block:** `sunken`, `panel` radius, 1px `rule` border, line numbers `ink-muted` unselectable; current or hovered line `primary-tint` with a 4px `primary` bar; Copy code button (secondary, small).
- **Figure (two-pane):** title in `h3`, code pane left, explanation pane right: "Path taken", "Output of the real run", the note for the active line. Stacks below 1024px with the explanation under the code.
- **Value chip:** `small` mono on `primary-tint`, `chip` radius, shown only on lines a note or an explorer is about.
- **Path taken:** a row of steps ("line 2: False", "line 3 skipped", "line 5 runs"): runs in `primary-tint` with a `primary` border, skipped with a dashed `edge` border and the word "skipped".
- **Callout:** analogy (`primary-tint`, lightbulb icon), mistake (`warning-tint`, triangle icon), each with a 4px left bar.
- **Practice question:** fieldset of options (radio rows, 2px `edge`, selected `primary-tint` with `primary` border); "Check answer" primary; feedback panel in `success-tint` or `error-tint` with icon and word; hints one at a time.
- **Explorer:** a figure with a labelled native control (slider or select) above the code; results only from verified variants; announced in words.
- **Typed input panel:** `sunken`, heading "Typed input", the typed lines in mono.
- **Ink connector:** 1.6px `primary` curve with a 3px dot at the code end, from a note or prose term to its line; from 1024px only; grows from the note in `slow`; reduced motion: appears at once; `aria-hidden`.
- **Highlighter mark:** `mark` band under up to three defined terms per lesson; draws once (`slow`); reduced motion: shown at once.
- **Bloom:** Lucide `flower-2` in `primary` beside "Correct", grows from 60% to 100% and turns 15 degrees with `ease-bloom` over `slow`, once per correct check; reduced motion: shown at once; `aria-hidden`.
- **Header:** `surface`, wordmark left, Courses and Playground right; current page marked with a 3px `primary` underline and `aria-current`; the theme toggle at the end.
- **Theme toggle:** a 48px square button with a Lucide moon (in light mode, it switches to dark) or sun (in dark mode). Its accessible name says what pressing does, "Switch to dark mode" or "Switch to light mode", and changes on each press. Default: `ink` icon on transparent; hover and pressed: `primary-tint` background; focus: the standard ring; it has no disabled, loading or error state. Without a stored choice the site follows `prefers-color-scheme`; pressing stores "light" or "dark" in localStorage (if storage is blocked, the choice still applies until the page is left), and a tiny script in `<head>` applies a stored choice before the first paint, so the wrong theme never flashes. Pressing: the shown icon turns 90 degrees and shrinks out while the other turns and grows in (`duration-slow`, `ease-standard`, transform and opacity only), and colours change with the `duration-fast` colour transition; reduced motion: both are instant. Before the page is interactive the button is invisible and out of the tab order, with its space kept.

## 8. Patterns

- **Lesson step:** one section of a lesson as a step card on `surface` with the step number and `h2`; every step is always on the page (no paging).
- **Predict then run:** before an example's output, the figure shows "Think about what line N prints, then press Show." and a secondary Show button; Show reveals the verified output and its note. No new lesson text.
- **Path taken:** described above; built from the recorded trace or variant.
- **Mistake block:** warning callout with the wrong code, the real error message, how to read it and the fix.
- **Practice block:** numbered questions as above, the count "on this page", the bloom on a correct answer.
- **Recap:** a short list on `surface` with a `primary` check icon per point, then the next-lesson link.

## 9. Templates

- **Homepage:** hero 6:5 (display heading, lead, status sentence from data, "Start Python lesson 1" primary, "Browse the courses" secondary) beside a "Your turn" vote figure; the Python trail; course cards.
- **Courses:** course cards in a 2 by 2 grid.
- **Course page:** from 1024px the course introduction (title, description, count, "Start the first lesson", who it is for) on the left and the trail on the right; below that, stacked. The trail runs down the page at every width, because each stop carries its title and goal and 13 or more goals do not fit across (checked at 360px); planned topics follow as a separate muted trail with "Planned", continuing the numbers. The homepage uses the compact trail, which runs across from 1024px without goals.
- **Lesson:** step rail plus main column; title and goal; steps; mistakes; practice; recap; previous and next.
- **Playground:** editor and Your run side by side from 1024px; designed empty state for Your run.
- **404:** short message and two links.

## 10. Icons and imagery

Lucide outline icons, 20px (16px inline), 1.75 stroke, always with a text label or an accessible name. No emoji, photos or stock illustration. Concept diagrams are inline SVG in a hand-drawn ink style using tokens, each with a caption that carries the same information.

## 11. Prohibited

Everything in brief Section 8, plus: gradients as decoration, glass panels, scroll-triggered reveals other than the one-time highlighter mark, animated typing, more than one marigold action per figure, value chips on every line.
