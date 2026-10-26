import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/container";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { textLinkStyles } from "@/components/styles";

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
        <Container className="py-12 md:py-16">
          <div className="max-w-measure">
            <h1 className="font-heading text-3xl font-semibold">Page not found</h1>
            <p className="mt-4 text-lg">
              There is no page at this address. The link may be wrong or the page may have moved.
            </p>
            <ul className="mt-6 flex flex-wrap gap-x-6">
              <li>
                <Link href="/" className={`inline-flex py-3 ${textLinkStyles}`}>
                  Go to the homepage
                </Link>
              </li>
              <li>
                <Link href="/courses" className={`inline-flex py-3 ${textLinkStyles}`}>
                  Browse the courses
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
