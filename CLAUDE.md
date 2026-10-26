# CodeBloom: working instructions for Claude

CodeBloom is a coding education site for beginners learning C, C++, Java and Python. Guiding principle: every beginner deserves a patient explanation.

## Where things live

| Question | Read |
|---|---|
| What are the project's requirements and rules? | `CODEBLOOM_MASTER_BRIEF.md` (source of truth, never edit, rename or copy it; propose changes to the owner instead) |
| What should the product do? | `SPEC.md` |
| How should it look and behave visually? | `DESIGN.md` |
| What is done, what is next, what was decided? | `PROGRESS.md` |

This file holds working rules only. Do not restate requirements, tokens or status here; link to the file that owns them.

## Start of every session

1. Read `PROGRESS.md`, then the sections of `SPEC.md` and `DESIGN.md` the task touches.
2. Run `git status` and `git branch --show-current`. Never work on `main`.
3. Confirm the task scope with the owner if it is not already approved.

## Working with the owner

The owner is learning web development through this project. Act as a pair programmer and teacher.

- For significant changes follow the loop in brief Section 3: explain the problem, inspect, propose the smallest change, get approval, implement, run checks, summarize.
- End each task with a short "Concepts to learn" note: two to four ideas that help the owner maintain the code (for example server versus client components, design tokens). Skip trivial syntax.
- When a choice affects architecture, cost, security or maintenance, give the trade-offs and a recommendation, then wait.
- Routine, reversible details inside approved scope: decide and proceed.
- Prefer targeted edits over rewrites. Never replace working code wholesale without a reason the owner has accepted.

## Architecture and code conventions

Planned stack: Next.js (App Router), TypeScript, Tailwind CSS, npm. Check current versions and setup steps in official docs at scaffold time and record them in `PROGRESS.md`.

- Server components and static rendering by default. Add `"use client"` only to components that need interaction.
- Keep three things apart: lesson content (structured files in the repo), presentation components, and interactive logic.
- Lessons follow one schema. A new language is added through content and configuration, not new page code.
- Use design tokens by name. No raw hex values, font names or arbitrary spacing in components.
- TypeScript strict mode. No `any` without a comment explaining why.
- No database, auth or code-execution service until a milestone in `SPEC.md` calls for it.
- No premature abstraction: extract a shared component on the second real use, not the first.

### Adding a dependency

Before adding any package, answer in the proposal:

1. Can CSS, the browser platform, or existing code do this well enough?
2. What does it cost in bundle size, maintenance and security surface?
3. Is it actively maintained, and is the license compatible?
4. Does it overlap with something already installed (for example a second animation library)?
5. Does it bring a paid plan or account?

Add it only with a clear yes on need, and log the decision in `PROGRESS.md`.

## Design rules

- `DESIGN.md` is the single design reference. Brief Section 8 bans override any skill or library suggestion. If a skill conflicts with either, flag it; do not silently change the design.
- Never use em dashes in site copy or project documents. Use a comma, colon, hyphen or a new sentence.
- Never add fake testimonials, counts, metrics, logos or claims. Never ship a control that does nothing.
- Motion must explain a change or respond to the user, and must respect reduced motion.

## Lesson content rules

Lesson requirements and the lesson schema live in `SPEC.md`. When writing or editing lessons:

- Compile and run every runnable example and paste the real output. Never write output from memory.
- Label pseudocode as not runnable.
- Explain jargon the first time it appears. Say where an analogy stops being accurate.
- Separate the shared programming idea from language-specific syntax and behavior.
- Write a few excellent lessons before writing many.

## Accessibility

Target WCAG 2.1 AA. Product requirements are in `SPEC.md`; visual rules (contrast, focus, target size, motion) are in `DESIGN.md`. Every interactive feature must work with a keyboard alone and announce its result to screen readers.

## Quality gates

Run the checks that exist and read the actual output before reporting. Scripts: `npm run lint`, `npm run typecheck`, `npm run build`, `npm run test:e2e` (Playwright smoke test), `npm run check:examples` (runs the example files in `content/examples/` and compares output), `npm run test:runner` (tests that runner), `npm run verify:browser` (checks tokens, contrast and fonts in a real browser; run `npm run build` first). Cloud sessions install dependencies through the SessionStart hook in `.claude/`.

- Never skip, delete or weaken a test, warning or acceptance criterion to get a pass.
- If something cannot be tested, say so and record it in `PROGRESS.md`.
- Use these status words exactly: Planned, In progress, Implemented, Tested, Verified in browser, Deployed, Confirmed in production. A component existing is not "done".

## Design skills: which one, when

Use one skill per step. A skill's output is input to check in the browser, not a verdict. Record every review run in `PROGRESS.md`.

| Step | Skill |
|---|---|
| Choosing visual direction before a new screen | `frontend-design:frontend-design` |
| Writing or revising `DESIGN.md` | `website-design:web-design-system` |
| Building the homepage or other marketing pages | `website-design:landing-page` |
| After any page is built, before calling it done | `website-design:web-review` |
| Reviewing course, lesson and quiz screens as they are built | `design:design-critique` |
| Any interface text: buttons, errors, empty states, hints, quiz feedback | `design:ux-copy` |
| Before a milestone is marked verified | `design:accessibility-review` |
| Auditing components for hardcoded values (Milestone 2 onward) | `design:design-system` (not `website-design:design-system`, which writes a DESIGN.md) |

Do not use `design:design-handoff` or Figma skills unless the owner asks. UXKIN references are optional and need the owner to connect them; use them for structure ideas only, never to copy a site.

## Other tools

- Browser checks: the pre-installed Playwright and Chromium. Do not reinstall Playwright.
- Code review before a milestone PR: `/code-review`; for auth, input handling or execution work also `/security-review`.
- Library docs: fetch official documentation; do not rely on memory for APIs or versions.
- GitHub: use the GitHub MCP tools for reading. The `gh` CLI is not available.

## Git and branch safety

The owner's Git workflow below overrides brief Sections 4 and 15 wherever they conflict.

- `main` is stable. Never commit to, push to, or merge into it.
- Never create, update or merge pull requests. The owner opens and merges them. Use the GitHub tools to read only.
- Commit and push only to the branch the session provides. Before every commit, run `git branch --show-current` and stop if it prints `main`.
- Before any commit, set the repository's local identity and confirm it:
  `git config user.name "Yash-Maithani"`, `git config user.email "145788116+Yash-Maithani@users.noreply.github.com"`, then run `git config user.name` and `git config user.email`.
- Every commit is authored by Yash-Maithani. No `Co-Authored-By` trailers, "Generated with Claude Code" lines or any other Claude attribution in commits.
- No force-push, reset, rebase of shared branches, branch deletion, or discarding uncommitted work without explicit approval.
- Small, focused commits with clear messages.
- After every push: verify the remote with `git ls-remote origin <branch>`, show `git log -1 --format="%an <%ae>"` as proof of the author, and confirm `main` has not moved (`git ls-remote origin main`, compared with the value before the push).
- Report the branch, commit hash, changed files, verification results, and the exact steps for the owner to open the pull request.
- If a push or branch creation fails, report the exact error and stop.

## Security

- No secrets in the repository or in client code. Use environment variables and document required names, never values.
- Never execute user-submitted code on the application server. Any future execution service needs isolation, resource limits, timeouts and abuse controls, and owner approval.
- No paid service or account without explaining purpose, expected cost and alternatives first.
- Review third-party tools and setup scripts before running them.

## Keeping documents current

- Update `PROGRESS.md` when a milestone or meaningful task changes status, and log decisions that affect architecture, dependencies, security or deployment.
- Update `SPEC.md` or `DESIGN.md` only when the owner approves a change in requirements or design.
- Do not rewrite documents after small code edits. Do not let two files own the same fact.

## Credit use

Session credits are limited. Inspect before generating, patch rather than regenerate, use scripts for repeated checks, avoid speculative features and repeated design variations, and keep each session to one focused milestone task.
