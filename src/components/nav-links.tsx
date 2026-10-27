"use client";

// A client component only because it reads the current address to mark the
// current section. Everything else in the header is rendered on the server.

import Link from "next/link";
import { usePathname } from "next/navigation";

// Decision D18: while there are three links or fewer they stay visible at every
// width, with no menu button.
const links = [
  { href: "/courses", label: "Courses" },
  { href: "/playground", label: "Playground" },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <ul className="flex gap-6">
      {links.map((link) => {
        const isCurrent = pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <li key={link.href}>
            <Link
              href={link.href}
              aria-current={isCurrent ? "page" : undefined}
              className={`inline-flex border-b-2 py-3 text-sm font-bold transition-colors hover:text-accent ${
                isCurrent ? "border-accent text-ink" : "border-transparent text-ink"
              }`}
            >
              {link.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
