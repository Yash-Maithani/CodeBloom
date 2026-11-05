import { Container } from "@/components/container";

// The layout of the Privacy policy and Terms pages: a title, the date and a
// review note, then plain sections. Shared by the two pages.
export function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <Container className="py-12 lg:py-16">
      <article className="max-w-measure text-body">
        <h1 className="font-heading text-h1">{title}</h1>
        <p className="mt-4 text-ui text-ink-muted">Last updated {updated}.</p>
        <p data-review-note className="mt-4 rounded-card border border-l-4 border-rule border-l-warning bg-warning-tint px-4 py-3 text-ui">
          This page describes what CodeBloom actually does. It is waiting for review by the site&apos;s owner and is not legal advice.
        </p>
        <div>{children}</div>
      </article>
    </Container>
  );
}

export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-heading text-h2">{title}</h2>
      <div className="mt-4 flex flex-col gap-4">{children}</div>
    </section>
  );
}
