# CodeBloom progress

Current status and handoff. Requirements are in `SPEC.md`, design in `DESIGN.md`, working rules in `CLAUDE.md`. Status words are defined in `CLAUDE.md`.

Last updated: 2026-10-26

## Current milestone

**Milestone 0a: documentation.** Implemented, awaiting owner review in a draft pull request into `main`.

## Completed work

| Item | Status | Notes |
|---|---|---|
| Master brief added to `main` | Done (by owner) | Commit `04e1fdc` |
| Repository and environment inspection | Done | Findings below |
| `CLAUDE.md`, `SPEC.md`, `DESIGN.md`, `PROGRESS.md` | Implemented | Awaiting review |

## In progress

Nothing beyond the review of Milestone 0a.

## Outstanding tasks

1. Owner reviews and merges the Milestone 0a pull request.
2. Milestone 0b: project scaffold. Acceptance criteria in `SPEC.md` Section 9.
3. Owner answers the open decisions in `SPEC.md` Section 10 as each milestone needs them.

## Known limitations

- No application code exists yet. Nothing has been built, tested in a browser or deployed.
- The design direction was not compared with real reference sites, because UXKIN is not connected.
- Color contrast was computed from the formula, not measured in a browser.
- Font and icon licenses are not yet confirmed; this happens at scaffold time.
- Context7 is not available in this environment; official docs are fetched directly instead.

## Verification log

| Date | What | Result |
|---|---|---|
| 2026-10-26 | Repository inspection | Empty repository: one commit (`04e1fdc`) adding the master brief; no code, dependencies or configuration. |
| 2026-10-26 | Design direction with `frontend-design:frontend-design` | Direction A, Annotated Notebook, refined to avoid generic cream-and-serif defaults. |
| 2026-10-26 | `DESIGN.md` written with `website-design:web-design-system` | Written without UXKIN references. |
| 2026-10-26 | WCAG contrast calculation for all text and control color pairs | All pairs pass AA in light and dark (values in `DESIGN.md` Section 3). |
| 2026-10-26 | Font availability | Literata, Atkinson Hyperlegible Next and Atkinson Hyperlegible Mono are served by Google Fonts. |
| 2026-10-26 | Document review before commit | No em or en dashes in the four files. Master brief unchanged. Script check for 8-word phrases shared with the brief found only file-name lists and one short Git rule; one fact duplicated between files was removed. Assumptions labeled in `SPEC.md`. |

Not yet run (nothing built): `website-design:web-review`, `design:accessibility-review`, `design:design-critique`, `design:ux-copy`, `design:design-system`.

## Decisions

| ID | Date | Decision | Reason |
|---|---|---|---|
| D1 | 2026-10-26 | Work on the session branch `claude/determined-goodall-chim8e` | The session provided it; brief Section 15 says to use it. |
| D2 | 2026-10-26 | npm as package manager | Owner choice; simplest for learning. |
| D3 | 2026-10-26 | Design direction A, Annotated Notebook | Owner choice; the margin-note code block mirrors the core teaching method. |
| D4 | 2026-10-26 | Success feedback is blue, not green | Keeps the green accent distinct from "correct", and blue against red is easier to tell apart for common color blindness. |
| D5 | 2026-10-26 | Literata, Atkinson Hyperlegible Next and Mono | Legibility of easily confused characters for beginners reading code. |
| D6 | 2026-10-26 | No `ARCHITECTURE.md`, lesson guide or testing guide yet | Would be guesswork before code exists; decisions are logged here until then. |

## Environment (verified 2026-10-26, cloud session)

Node 22.22.0, npm 10.9.4, Python 3.13, gcc and g++ 13.3, OpenJDK and javac 21. Playwright with Chromium is pre-installed. Tool usage rules are in `CLAUDE.md`.

## Git

- Working branch: `claude/determined-goodall-chim8e`
- `main` at `04e1fdc` (unchanged by Claude)
- For the latest commit on this branch, run `git log -1 origin/claude/determined-goodall-chim8e`.

## Next recommended task

Milestone 0b, project scaffold, in a new session after the 0a pull request is merged: create the Next.js app with npm, add the quality scripts, one Playwright smoke test, the lesson example checker, the design tokens in code, and a session start hook. Acceptance criteria are in `SPEC.md` Section 9.

## Resuming work

No setup is needed yet. Clone the repository, check out the working branch, and read `CLAUDE.md`.
