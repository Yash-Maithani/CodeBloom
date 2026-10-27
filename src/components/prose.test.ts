// Rendering tests for lesson prose (src/components/prose.tsx). Run with
// `npm run test:unit`; scripts/tsx-loader.mjs lets Node load the .tsx file.

import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { parseProse } from "../lib/prose.ts";
import { InlineText, ProseBlocks } from "./prose.tsx";

test("< > & and quotes inside inline code and plain text are rendered as text, never as HTML", () => {
  const html = renderToStaticMarkup(createElement(InlineText, { text: "Use `#include <stdio.h>` and `a && b < c > d`, or 'x' & \"y\"." }));
  assert.equal(
    html,
    '<span>Use <code class="font-mono wrap-anywhere">#include &lt;stdio.h&gt;</code> and <code class="font-mono wrap-anywhere">a &amp;&amp; b &lt; c &gt; d</code>, or &#x27;x&#x27; &amp; &quot;y&quot;.</span>',
  );
});

test("straight quotes are never turned into curly quotes", () => {
  const html = renderToStaticMarkup(createElement(InlineText, { text: "It's \"quoted\" and `print('x', \"y\")`." }));
  assert.doesNotMatch(html, /[\u2018\u2019\u201C\u201D]/);
  // A browser shows &#x27; as ' and &quot; as ": the same straight characters.
  assert.match(html, /It&#x27;s &quot;quoted&quot;/);
  assert.match(html, /print\(&#x27;x&#x27;, &quot;y&quot;\)/);
});

test("a whole prose file renders headings, paragraphs, lists and links with escaped text", () => {
  const blocks = parseProse("## A < B\n\nText with `<b>` & [a link](/courses).\n\n- one\n", "t.md", { headings: true, placeholders: true });
  const html = renderToStaticMarkup(createElement(ProseBlocks, { blocks }));
  assert.match(html, /<h2[^>]*>A &lt; B<\/h2>/);
  assert.match(html, /<code class="font-mono wrap-anywhere">&lt;b&gt;<\/code> &amp; /);
  assert.match(html, /<a[^>]*href="\/courses"[^>]*>a link<\/a>/);
  assert.match(html, /<ul[^>]*><li>one<\/li><\/ul>/);
  assert.doesNotMatch(html, /<b>/);
});
