import Link from "next/link";
import { Container } from "@/components/container";
import { NavLinks } from "@/components/nav-links";

// The skip link is the first focusable element on every page. It stays off
// screen until it receives keyboard focus (DESIGN.md section 7, navigation).
function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only rounded-control bg-sheet px-4 py-3 font-bold text-ink focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-10"
    >
      Skip to content
    </a>
  );
}

export function SiteHeader() {
  return (
    <>
      <SkipLink />
      <header className="border-b border-rule bg-paper">
        <Container className="flex flex-wrap items-center justify-between gap-x-6">
          <Link
            href="/"
            className="py-3 font-heading text-xl font-semibold text-ink transition-colors hover:text-accent"
          >
            CodeBloom
          </Link>
          <nav aria-label="Main">
            <NavLinks />
          </nav>
        </Container>
      </header>
    </>
  );
}
