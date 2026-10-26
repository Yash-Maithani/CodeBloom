// Splits code into lines of tokens for the CodeBlock component.
//
// Syntax colors are not added yet: the choice between a small in-house
// highlighter and Shiki is waiting for the owner's decision. Until then every
// token is "plain", which DESIGN.md allows ("code must remain readable with
// no color at all"). When a highlighter is chosen, only this file changes.

/** The only syntax roles DESIGN.md uses (section 7, "Syntax colors"). */
export type TokenKind = "plain" | "keyword" | "literal" | "comment";

export type CodeToken = { text: string; kind: TokenKind };

// A language parameter is added together with the highlighter.
export function highlight(code: string): CodeToken[][] {
  return code.split("\n").map((line) => [{ text: line, kind: "plain" }]);
}
