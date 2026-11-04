import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/container";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { buttonStyles } from "@/components/styles";

// Shown for any address that has no page. It lives outside the (site) route
// group, so it adds the header and footer itself.
export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main" tabIndex={-1}>
        <Container className="py-16 lg:py-24">
          <div className="max-w-measure">
            <h1 className="font-heading text-h1">Page not found</h1>
            <p className="mt-4 text-lead">
              There is no page at this address. The link may be wrong or the page may have moved.
            </p>
            <ul className="mt-8 flex flex-wrap gap-4">
              <li>
                <Link href="/courses" className={buttonStyles.primary}>
                  Browse the courses
                </Link>
              </li>
              <li>
                <Link href="/" className={buttonStyles.secondary}>
                  Go to the homepage
                </Link>
              </li>
            </ul>
          </div>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
