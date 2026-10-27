// Tests for the lesson prose parser (src/lib/prose.ts) and its rendering.
// Run with `npm run test:unit`.

import assert from "node:assert/strict";
import { test } from "node:test";
import { linksIn, parseInline, parseProse, plainText, ProseError } from "./prose.ts";

const LESSON = { headings: true, placeholders: true };
const CONCEPT = { headings: false, placeholders: false };
const fails = (fn: () => unknown, message: RegExp) => assert.throws(fn, (error: unknown) => error instanceof ProseError && message.test(error.message));

// ---------- what is supported ----------

test("paragraphs, headings, lists and placeholders", () => {
  const blocks = parseProse("## Title\n\nOne line\nsame paragraph.\n\n- a\n- `b`\n\n{{example change}}\n\n{{analogy}}\n", "t.md", LESSON);
  assert.deepEqual(blocks, [
    { type: "heading", text: "Title" },
    { type: "paragraph", content: [{ type: "text", text: "One line same paragraph." }] },
    { type: "list", items: [[{ type: "text", text: "a" }], [{ type: "code", text: "b" }]] },
    { type: "placeholder", kind: "example", id: "change" },
    { type: "placeholder", kind: "analogy" },
  ]);
});

test("inline code, bold and internal links", () => {
  assert.deepEqual(parseInline("A **variable** is `x = 1`, see [lesson 1](/courses/c/first-program).", "t", { links: true }), [
    { type: "text", text: "A " },
    { type: "strong", text: "variable" },
    { type: "text", text: " is " },
    { type: "code", text: "x = 1" },
    { type: "text", text: ", see " },
    { type: "link", text: "lesson 1", href: "/courses/c/first-program" },
    { type: "text", text: "." },
  ]);
});

test("Windows line endings give the same result", () => {
  assert.deepEqual(parseProse("## A\r\n\r\nb\r\nc\r\n", "t.md", LESSON), parseProse("## A\n\nb\nc\n", "t.md", LESSON));
});

test("linksIn finds links in paragraphs and lists", () => {
  const blocks = parseProse("See [a](/a).\n\n- [b](/b)\n", "t.md", LESSON);
  assert.deepEqual(linksIn(blocks), ["/a", "/b"]);
});

// ---------- exact characters ----------
// Rendering (HTML escaping of < > & and quotes) is tested in
// tests/e2e/prose-render.spec.ts, because Node cannot run JSX directly.

test("straight quotes and < > & come out of the parser unchanged", () => {
  const text = "It's \"quoted\" & `print('x', \"y\") if a < b > c`.";
  const parsed = parseInline(text, "t");
  assert.equal(parsed.map((part) => part.text).join(""), "It's \"quoted\" & print('x', \"y\") if a < b > c.");
  assert.doesNotMatch(JSON.stringify(parsed), /[\u2018\u2019\u201C\u201D]/);
});

// ---------- malformed syntax ----------

test("malformed inline syntax stops with a clear message", () => {
  fails(() => parseInline("an `unclosed backtick", "t"), /backtick is not closed/);
  fails(() => parseInline("empty `` code", "t"), /empty inline code/);
  fails(() => parseInline("**not closed", "t"), /\*\* is not closed/);
  fails(() => parseInline("****", "t"), /bold text must be plain words/);
  fails(() => parseInline("**bold `code`**", "t"), /bold text must be plain words/);
  fails(() => parseInline("a single * star", "t"), /single \* is not supported/);
  fails(() => parseInline("[text](/path", "t", { links: true }), /must look like \[text\]\(\/path\)/);
  fails(() => parseInline("[](/path)", "t", { links: true }), /must look like/);
  fails(() => parseInline("[text]", "t", { links: true }), /must look like/);
});

test("a placeholder inside a paragraph or next to other lines is refused", () => {
  fails(() => parseProse("Text {{example a}} more.\n", "t.md", LESSON), /must be on a line of its own/);
  fails(() => parseProse("{{example a}}\nmore text\n", "t.md", LESSON), /blank line before and after/);
  fails(() => parseProse("## Heading\ntext\n", "t.md", LESSON), /blank line after/);
});

test("a list or heading right after a paragraph line is refused, not joined into the paragraph", () => {
  fails(() => parseProse("Here are the rules:\n- one\n- two\n", "t.md", LESSON), /needs a blank line before it/);
  fails(() => parseProse("Some text\n## Heading\n", "t.md", LESSON), /needs a blank line before it/);
});

test("plainText keeps the words and drops the markup", () => {
  assert.equal(plainText("A **second** `int` value"), "A second int value");
});

test("error messages name the file and line", () => {
  fails(() => parseProse("ok\n\n```\ncode\n```\n", "lesson.md", LESSON), /^lesson\.md, line 3: code blocks are not allowed/);
});

// ---------- invalid placeholders ----------

test("unknown or incomplete placeholders are refused", () => {
  fails(() => parseProse("{{video intro}}\n", "t.md", LESSON), /unknown placeholder/);
  fails(() => parseProse("{{example}}\n", "t.md", LESSON), /unknown placeholder/);
  fails(() => parseProse("{{analogy extra}}\n", "t.md", LESSON), /unknown placeholder/);
  fails(() => parseProse("{{example Bad_Id}}\n", "t.md", LESSON), /on a line of its own/);
  fails(() => parseProse("{{example a}}\n", "concept.md", CONCEPT), /placeholders are not allowed/);
});

// ---------- links ----------

test("only internal links, and only in lesson prose", () => {
  fails(() => parseInline("[site](https://example.com)", "t", { links: true }), /only internal links/);
  fails(() => parseInline("[site](//example.com)", "t", { links: true }), /only internal links/);
  fails(() => parseInline("[a](/a)", "t"), /links are only allowed in lesson prose/);
  fails(() => parseInline("![picture](/a.png)", "t", { links: true }), /images are not supported/);
});

// ---------- unsupported Markdown ----------

test("unsupported Markdown is refused, with a message saying what to do", () => {
  const cases: Array<[string, RegExp]> = [
    ["```python\nprint(1)\n```\n", /code blocks are not allowed/],
    ["~~~\nx\n~~~\n", /code blocks are not allowed/],
    ["    indented code\n", /must not start with spaces/],
    ["- a\n  - nested\n", /must not start with spaces/],
    ["# Title\n", /only "## " headings/],
    ["### Small\n", /only "## " headings/],
    ["##NoSpace\n", /only "## " headings/],
    ["> quote\n", /block quotes/],
    ["| a | b |\n", /tables/],
    ["* item\n", /lists use "- "/],
    ["+ item\n", /lists use "- "/],
    ["1. first\n", /numbered lists/],
    ["- a\nnot an item\n", /every line of a list/],
    ["Some <b>bold</b> HTML\n", /raw HTML/],
    ["A comment <!-- x -->\n", /raw HTML/],
    ["Wait \u2014 an em dash\n", /em and en dashes/],
    ["pages 1\u20132\n", /em and en dashes/],
  ];
  for (const [source, message] of cases) fails(() => parseProse(source, "t.md", LESSON), message);
});

test("concept files allow no headings", () => {
  fails(() => parseProse("## Heading\n", "concept.md", CONCEPT), /headings are not allowed/);
});

test("headings must be plain text", () => {
  fails(() => parseProse("## A `code` heading\n", "t.md", LESSON), /headings must be plain text/);
});
