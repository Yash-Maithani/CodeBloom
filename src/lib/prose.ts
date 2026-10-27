// Reads the small Markdown subset that lesson prose is written in (see
// docs/lesson-authoring.md) and turns it into plain data for the Prose
// component. It never produces HTML: React renders the data as text, so
// characters such as < > & and quotes always appear exactly as written.
//
// The subset on purpose: anything outside it stops the build with a message
// that says what to change, instead of being shown in some surprising way.
//   Blocks:  paragraphs (separated by a blank line), "## " headings, "- " lists,
//            and placeholder lines such as {{example change}}, {{visual change}} or {{analogy}}.
//   Inline:  `code`, **bold** and [text](/internal/link).
// There are no code blocks: every program on a page comes from a checked file.

export type Inline =
  | { type: "text"; text: string }
  | { type: "code"; text: string }
  | { type: "strong"; text: string }
  | { type: "link"; text: string; href: string };

export type ProseBlock =
  | { type: "paragraph"; content: Inline[] }
  | { type: "heading"; text: string }
  | { type: "list"; items: Inline[][] }
  | { type: "placeholder"; kind: "example" | "visual"; id: string }
  | { type: "placeholder"; kind: "analogy" };

export class ProseError extends Error {}

type InlineOptions = { links?: boolean };

const DASHES = /[\u2013\u2014]/; // en dash and em dash, banned in site copy (CLAUDE.md)
const RAW_HTML = /<[A-Za-z/!]/;

/** Parses one piece of inline text. `where` names the source in error messages. */
export function parseInline(text: string, where: string, options: InlineOptions = {}): Inline[] {
  const fail = (problem: string): never => {
    throw new ProseError(`${where}: ${problem}\n  in: ${JSON.stringify(text)}`);
  };
  if (DASHES.test(text)) fail("em and en dashes are not allowed; use a comma, colon, hyphen or a new sentence");

  const result: Inline[] = [];
  let plain = "";
  const flushPlain = () => {
    if (plain === "") return;
    if (RAW_HTML.test(plain)) fail("raw HTML is not allowed; put code in backticks");
    if (plain.includes("*")) fail("a single * is not supported; use **bold**, or backticks for code");
    result.push({ type: "text", text: plain });
    plain = "";
  };

  let i = 0;
  while (i < text.length) {
    if (text[i] === "`") {
      const end = text.indexOf("`", i + 1);
      if (end === -1) fail("a backtick is not closed");
      if (end === i + 1) fail("empty inline code (``)");
      flushPlain();
      result.push({ type: "code", text: text.slice(i + 1, end) });
      i = end + 1;
    } else if (text.startsWith("**", i)) {
      const end = text.indexOf("**", i + 2);
      if (end === -1) fail("** is not closed");
      const inner = text.slice(i + 2, end);
      if (inner.trim() === "" || /[`[*]/.test(inner)) fail("bold text must be plain words, with no code, links or stars inside");
      flushPlain();
      result.push({ type: "strong", text: inner });
      i = end + 2;
    } else if (text.startsWith("![", i)) {
      fail("images are not supported");
    } else if (text[i] === "[") {
      const match = /^\[([^\][]+)\]\(([^()\s]+)\)/.exec(text.slice(i));
      if (!match) fail("a link must look like [text](/path)");
      if (!options.links) fail("links are only allowed in lesson prose (.md files)");
      const href = match![2];
      if (!href.startsWith("/") || href.startsWith("//")) fail(`only internal links are allowed (starting with /), not ${href}`);
      flushPlain();
      result.push({ type: "link", text: match![1], href });
      i += match![0].length;
    } else {
      plain += text[i];
      i += 1;
    }
  }
  flushPlain();
  return result;
}

type BlockOptions = { headings: boolean; placeholders: boolean };

const UNSUPPORTED: Array<[RegExp, string]> = [
  [/^(```|~~~)/, "code blocks are not allowed; every program must come from a checked example file"],
  [/^\s+\S/, "lines must not start with spaces (nested lists and indented code are not supported)"],
  [/^>/, "block quotes are not supported"],
  [/^\|/, "tables are not supported"],
  [/^[*+] /, 'lists use "- " at the start of each item'],
  [/^\d+[.)] /, 'numbered lists are not supported; use "- " items'],
  [/^#(?!# )|^##[^ ]|^### /, 'only "## " headings are supported'],
];

/** Parses a whole prose file. `name` is the file name used in error messages. */
export function parseProse(source: string, name: string, options: BlockOptions): ProseBlock[] {
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  const blocks: ProseBlock[] = [];
  let start = 0;
  while (start < lines.length) {
    if (lines[start].trim() === "") {
      start += 1;
      continue;
    }
    let end = start;
    while (end < lines.length && lines[end].trim() !== "") end += 1;
    const group = lines.slice(start, end);
    const where = `${name}, line ${start + 1}`;
    const fail = (problem: string): never => {
      throw new ProseError(`${where}: ${problem}`);
    };

    for (const [index, line] of group.entries()) {
      for (const [pattern, problem] of UNSUPPORTED) {
        if (pattern.test(line)) throw new ProseError(`${name}, line ${start + index + 1}: ${problem}`);
      }
    }

    const placeholder = /^\{\{\s*([a-z]+)(?:\s+([a-z0-9-]+))?\s*\}\}$/.exec(group[0].trim());
    if (placeholder) {
      if (group.length > 1) fail("a placeholder must have a blank line before and after it");
      if (!options.placeholders) fail("placeholders are not allowed in this file");
      const [, kind, id] = placeholder;
      if ((kind === "example" || kind === "visual") && id) blocks.push({ type: "placeholder", kind, id });
      else if (kind === "analogy" && !id) blocks.push({ type: "placeholder", kind });
      else fail(`unknown placeholder {{${kind}${id ? ` ${id}` : ""}}}; use {{example <id>}}, {{visual <id>}} or {{analogy}}`);
    } else if (group.some((line) => line.includes("{{") || line.includes("}}"))) {
      fail("a placeholder must be on a line of its own");
    } else if (!group[0].startsWith("- ") && group.slice(1).some((line) => line.startsWith("- ") || line.startsWith("## "))) {
      fail("a list or heading needs a blank line before it");
    } else if (group[0].startsWith("## ")) {
      if (!options.headings) fail("headings are not allowed in this file");
      if (group.length > 1) fail("a heading must have a blank line after it");
      const text = group[0].slice(3).trim();
      parseInline(text, where).forEach((part) => part.type !== "text" && fail("headings must be plain text"));
      blocks.push({ type: "heading", text });
    } else if (group[0].startsWith("- ")) {
      if (!group.every((line) => line.startsWith("- "))) fail('every line of a list must start with "- "');
      blocks.push({ type: "list", items: group.map((line) => parseInline(line.slice(2).trim(), where, { links: true })) });
    } else {
      blocks.push({ type: "paragraph", content: parseInline(group.join(" ").trim(), where, { links: true }) });
    }
    start = end;
  }
  return blocks;
}

/** The words of a short text without its markup, for screen reader names and page descriptions. */
export function plainText(text: string): string {
  return parseInline(text, "plainText").map((part) => part.text).join("");
}

/** Every link in a list of blocks, for checking that each one leads to a real page. */
export function linksIn(blocks: ProseBlock[]): string[] {
  const inlines = blocks.flatMap((block) =>
    block.type === "paragraph" ? block.content : block.type === "list" ? block.items.flat() : [],
  );
  return inlines.flatMap((part) => (part.type === "link" ? [part.href] : []));
}
