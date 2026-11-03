import type { TokenKind } from "@/lib/highlight";

// Classes for each kind of code token (DESIGN.md section 7, code block). In a
// plain module, not a client component, so server components such as the
// figure get the real classes: a value exported from a "use client" file is
// only a reference on the server.
export const tokenStyles: Record<TokenKind, string> = {
  plain: "",
  keyword: "font-bold",
  literal: "text-literal",
  comment: "italic text-ink-muted",
};
