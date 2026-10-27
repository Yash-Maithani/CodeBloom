// Splits code into lines of tokens for the CodeBlock component, using Shiki.
//
// Server only. Pages call this while they render on the server (at build time
// for our static pages), and only the finished tokens travel to the browser.
// Never import this file from a component marked "use client": that would send
// Shiki and its grammar files to every visitor. CodeBlock imports only the
// types below. The `server-only` import makes a client import a build error,
// and `npm run test:e2e` also checks that no Shiki code is downloaded.
//
// How it works: Shiki reads the code with a real grammar for the language and
// names every piece with TextMate scope names such as "keyword.control" or
// "string.quoted.double". We ignore Shiki's own colors. The table further down
// maps those scope names onto the only four roles DESIGN.md allows (section 7,
// "Syntax colors"): keyword, literal, comment and plain. CodeBlock turns each
// role into an existing design token, so no color value is defined here.

import "server-only";
import { createHighlighter, type ThemeRegistrationRaw } from "shiki";
import type { CodeLanguage } from "@/lib/examples";
import { normalizeLineEndings } from "./line-endings.ts";

/** The only syntax roles DESIGN.md uses (section 7, "Syntax colors"). */
export type TokenKind = "plain" | "keyword" | "literal" | "comment";

export type CodeToken = { text: string; kind: TokenKind };

// ---------- scope names to roles ----------

const startsWithScope = (scope: string, prefix: string) => scope === prefix || scope.startsWith(`${prefix}.`);
const matchesAny = (scopes: string[], prefixes: readonly string[]) =>
  scopes.some((scope) => prefixes.some((prefix) => startsWithScope(scope, prefix)));

// Strings, numbers and the pieces inside them (escape sequences such as \n,
// placeholders such as %d, a number's suffix such as the f in 1.5f).
const LITERAL_SCOPES = ["string", "constant.numeric", "constant.character", "keyword.other.unit"] as const;

// Words the language reserves. The list is deliberately explicit: a keyword
// that is missed simply stays plain (harmless), but a type name such as Java's
// String must never look like a keyword (misleading). Primitive types such as
// int are keywords in all four languages.
const KEYWORD_SCOPES = [
  "keyword",
  "constant.language", // true, false, null, None
  "storage.modifier", // public, static, const, final
  "storage.type.primitive", // int, double, void, boolean
  "storage.type.built-in",
  "storage.type.modifier", // unsigned, public: in C++
  "storage.type.function", // def, lambda
  "storage.type.class", // class
  "storage.type.struct",
  "storage.type.enum",
  "storage.type.union",
  "storage.type.namespace",
  "storage.type.template",
  "storage.type.local", // var in Java
] as const;

// Symbols that happen to be scoped as keywords. They stay plain.
const SYMBOL_ONLY_SCOPES = ["keyword.operator", "storage.type.function.arrow"] as const;

// Names that a grammar files under "storage.modifier": the imported or declared
// package in Java (java.util.List). They are names, not keywords.
const NAME_SCOPES = ["storage.modifier.import", "storage.modifier.package"] as const;

/**
 * Decides the role of one piece of code from the scope names around it.
 * Checked in this order, first match wins:
 *   1. Anything inside a comment is a comment, even if the grammar also marks
 *      words in it (for example a Javadoc @param tag).
 *   2. Strings and numbers are literals, including prefixes such as the f of an
 *      f-string or the 0x of a hexadecimal number.
 *   3. Reserved words are keywords. Operators count only when they are words
 *      (new, and, not, instanceof), not symbols (+, =, &&). Package names are not.
 *   4. Everything else is plain.
 */
export function roleOf(scopes: string[], text: string): TokenKind {
  if (matchesAny(scopes, ["comment"])) return "comment";
  if (matchesAny(scopes, LITERAL_SCOPES)) return "literal";
  if (matchesAny(scopes, SYMBOL_ONLY_SCOPES)) {
    return /^[A-Za-z_]+$/.test(text.trim()) ? "keyword" : "plain";
  }
  if (matchesAny(scopes, NAME_SCOPES)) return "plain";
  if (matchesAny(scopes, KEYWORD_SCOPES)) return "keyword";
  return "plain";
}

// ---------- Shiki ----------

// Shiki needs a theme to run. This one has no colors on purpose: it is only
// there so Shiki can report scope names.
const NO_COLORS_THEME: ThemeRegistrationRaw = { name: "codebloom-roles", type: "light", settings: [] };
const LANGUAGE_IDS: readonly CodeLanguage[] = ["c", "cpp", "java", "python"];

type Highlighter = Awaited<ReturnType<typeof createHighlighter>>;
let highlighterPromise: Promise<Highlighter> | undefined;

function getHighlighter(): Promise<Highlighter> {
  highlighterPromise ??= createHighlighter({
    themes: [NO_COLORS_THEME],
    langs: [...LANGUAGE_IDS],
  });
  return highlighterPromise;
}

// Grammars sometimes count the spaces beside a comment or string as part of it.
// Spaces look the same in every style, so they are moved out to keep spans tight.
function moveEdgeSpacesOut(tokens: CodeToken[]): CodeToken[] {
  const result: CodeToken[] = [];
  const add = (text: string, kind: TokenKind) => {
    if (text === "") return;
    const last = result[result.length - 1];
    if (last && last.kind === kind) last.text += text;
    else result.push({ text, kind });
  };
  for (const token of tokens) {
    const body = token.text.trim();
    if (token.kind === "plain" || body === "") {
      add(token.text, "plain");
      continue;
    }
    const start = token.text.indexOf(body);
    add(token.text.slice(0, start), "plain");
    add(body, token.kind);
    add(token.text.slice(start + body.length), "plain");
  }
  return result;
}

/**
 * Turns source code into lines of tokens. Line endings are normalized to \n
 * first (Shiki does the same), so code that arrives with Windows line endings
 * gives the same tokens as code with \n. After that, the tokens of each line,
 * joined together, are exactly that line of the normalized source, and every
 * line has at least one token. A mismatch stops the build instead of showing
 * the wrong code.
 */
export async function highlight(code: string, language: CodeLanguage): Promise<CodeToken[][]> {
  const source = normalizeLineEndings(code);
  const highlighter = await getHighlighter();
  const { tokens } = highlighter.codeToTokens(source, {
    lang: language,
    theme: "codebloom-roles",
    includeExplanation: "scopeName",
  });

  const sourceLines = source.split("\n");
  if (tokens.length !== sourceLines.length) {
    throw new Error(`highlight(${language}): expected ${sourceLines.length} lines, Shiki returned ${tokens.length}`);
  }

  return tokens.map((line, index) => {
    const merged: CodeToken[] = [];
    for (const token of line) {
      for (const part of token.explanation ?? []) {
        const kind = roleOf(
          part.scopes.map((scope) => scope.scopeName),
          part.content,
        );
        const last = merged[merged.length - 1];
        if (last && last.kind === kind) last.text += part.content;
        else merged.push({ text: part.content, kind });
      }
    }
    const tidy = moveEdgeSpacesOut(merged);
    const rebuilt = tidy.map((token) => token.text).join("");
    if (rebuilt !== sourceLines[index]) {
      throw new Error(
        `highlight(${language}): line ${index + 1} changed while splitting.\n  source:  ${JSON.stringify(sourceLines[index])}\n  rebuilt: ${JSON.stringify(rebuilt)}`,
      );
    }
    return tidy.length > 0 ? tidy : [{ text: "", kind: "plain" }];
  });
}
