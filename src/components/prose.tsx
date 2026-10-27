// Renders lesson prose parsed by src/lib/prose.ts. Everything is React text,
// so characters such as < > & and quotes appear exactly as written; nothing is
// inserted as HTML and no quotes are changed into curly ones.

import Link from "next/link";
import { Fragment } from "react";
import { textLinkStyles } from "@/components/styles";
import { parseInline, type Inline, type ProseBlock } from "@/lib/prose";

function InlineNodes({ parts }: { parts: Inline[] }) {
  return parts.map((part, index) => {
    switch (part.type) {
      case "code":
        return (
          // Inline code may wrap where it would overflow a narrow screen (WCAG 1.4.10).
          // Code blocks never wrap (DESIGN.md section 4).
          <code key={index} className="font-mono wrap-anywhere">
            {part.text}
          </code>
        );
      case "strong":
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
export function ProseBlocks({ blocks }: { blocks: ProseBlock[] }) {
  return blocks.map((block, index) => {
    switch (block.type) {
      case "heading":
        return (
          <h2 key={index} className="mt-12 font-heading text-2xl font-semibold md:mt-16">
            {block.text}
          </h2>
        );
      case "paragraph":
        return (
          <p key={index} className="mt-4">
            <InlineNodes parts={block.content} />
          </p>
        );
      case "list":
        return (
          <ul key={index} className="mt-4 flex list-disc flex-col gap-2 pl-8">
            {block.items.map((item, itemIndex) => (
              <li key={itemIndex}>
                <InlineNodes parts={item} />
              </li>
            ))}
          </ul>
        );
      default:
        return null;
    }
  });
}
