import Link from "next/link";
import { courses } from "@content/courses";
import { Container } from "@/components/container";
import { textLinkStyles } from "@/components/styles";

// Only links to pages that exist. Privacy and terms links are added when those
// pages are written (Milestone 7).
export function SiteFooter() {
  const links = [
    { href: "/courses", label: "Courses" },
    ...courses.map((course) => ({ href: `/courses/${course.slug}`, label: course.name })),
  ];

  return (
    <footer className="border-t border-rule">
      <Container className="grid gap-6 py-12 md:grid-cols-2">
        <div>
          <p className="font-heading text-xl font-semibold">CodeBloom</p>
          <p className="mt-2 text-ink-muted">Learn. Grow. Build.</p>
        </div>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-4">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  // At least 48px wide and tall, even for a one-letter name like "C" (SPEC.md AR-7).
                  className={`inline-flex min-w-12 justify-center py-3 ${textLinkStyles}`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
    </footer>
  );
}
