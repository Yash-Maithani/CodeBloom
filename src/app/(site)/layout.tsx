import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

// Layout for every public page. "(site)" is a route group: the brackets keep it
// out of the address, so this folder groups pages without adding /site to URLs.
// The development page in app/dev/ sits outside this group and gets no header.
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      {/* tabIndex -1 lets the skip link move keyboard focus here. */}
      <main id="main" tabIndex={-1}>
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
