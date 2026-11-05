import { ViewTransition } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

// Layout for every public page. "(site)" is a route group: the brackets keep it
// out of the address, so this folder groups pages without adding /site to URLs.
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      {/* tabIndex -1 lets the skip link move keyboard focus here. */}
      <main id="main" tabIndex={-1}>
        {/* Page transitions (DESIGN.md section 6): on navigation the page content
            cross-fades over duration-base, using React's built-in ViewTransition
            and the browser's View Transitions API; no library. The header and
            footer stay still. Without browser support, or with reduced motion,
            the page changes at once. */}
        <ViewTransition default="page-change">{children}</ViewTransition>
      </main>
      <SiteFooter />
    </>
  );
}
