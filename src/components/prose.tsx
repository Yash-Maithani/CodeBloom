// Renders lesson prose parsed by src/lib/prose.ts. Everything is React text,
// so characters such as < > & and quotes appear exactly as written; nothing is
// inserted as HTML and no quotes are changed into curly ones.

import Link from "next/link";
import { Fragment } from "react";
import { HighlighterMark } from "@/components/highlighter-mark";
import { textLinkStyles } from "@/components/styles";
import { TermLink } from "@/components/term-link";
import { parseInline, type Inline, type ProseBlock } from "@/lib/prose";

/**
 * Optional extras for lesson prose (DESIGN.md section 7):
 * - terms: identifiers in the example just above, linked to the lines that use
 *   them. Each term is linked once; `linked` remembers which already are.
 * - marks: the defined terms that get a highlighter mark, the first time each appears.
 */
export type ProseExtras = {
  terms?: Map<string, { anchors: string[]; lines: number[] }>;
  linked?: Set<string>;
  marks?: Set<string>;
};

function InlineNodes({ parts, extras }: { parts: Inline[]; extras?: ProseExtras }) {
  return parts.map((part, index) => {
    switch (part.type) {
      case "code": {
        const term = extras?.terms?.get(part.text);
        if (term && extras?.linked && !extras.linked.has(part.text)) {
          extras.linked.add(part.text);
          return <TermLink key={index} term={part.text} anchors={term.anchors} lines={term.lines} />;
        }
        return (
          // Inline code may wrap where it would overflow a narrow screen (WCAG 1.4.10).
          // Code blocks never wrap (DESIGN.md section 4).
          <code key={index} className="font-mono wrap-anywhere">
            {part.text}
          </code>
        );
      }
      case "strong":
        if (extras?.marks?.has(part.text)) {
          extras.marks.delete(part.text);
          return (
            <HighlighterMark key={index}>
              <strong>{part.text}</strong>
            </HighlighterMark>
          );
        }
        return <strong key={index}>{part.text}</strong>;
      case "link":
        return (
          <Link key={index} href={part.href} className={textLinkStyles}>
            {part.text}
          </Link>
        );
      default:
        return <Fragment key={index}>{part.text}</Fragment>;
    }
  });
}

/** A short text field from a lesson or a margin note: `code` and **bold**, no links.
 *  The text was already checked at build time, so parsing here cannot fail. */
export function InlineText({ text }: { text: string }) {
  return (
    <span>
      <InlineNodes parts={parseInline(text, "InlineText")} />
    </span>
  );
}

/** Headings, paragraphs and lists. Placeholders are handled by the lesson page. */
export function ProseBlocks({ blocks, extras }: { blocks: ProseBlock[]; extras?: ProseExtras }) {
  return blocks.map((block, index) => {
    switch (block.type) {
      case "heading":
        return (
          <h2 key={index} className="mt-12 font-heading text-h2 md:mt-16">
            {block.text}
          </h2>
        );
      case "paragraph":
        return (
          <p key={index} className="mt-4">
            <InlineNodes parts={block.content} extras={extras} />
          </p>
        );
      case "list":
        return (
          <ul key={index} className="mt-4 flex list-disc flex-col gap-2 pl-8">
            {block.items.map((item, itemIndex) => (
              <li key={itemIndex}>
                <InlineNodes parts={item} extras={extras} />
              </li>
            ))}
          </ul>
        );
      default:
        return null;
    }
  });
}
