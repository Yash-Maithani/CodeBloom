// The site's public address. It feeds the canonical URL of every page, the
// Open Graph URLs, sitemap.xml and robots.txt. To move to a custom domain,
// change this one line (PROGRESS.md, "Moving to a custom domain").
export const SITE_URL = "https://codebloom.vercel.app";

export const SITE_NAME = "CodeBloom";

/** Where visitors ask questions and report mistakes (no email address is published). */
export const CONTACT_URL = "https://github.com/Yash-Maithani/CodeBloom/issues";

export const DEFAULT_TITLE = "CodeBloom: programming explained line by line";
export const DEFAULT_DESCRIPTION =
  "Programming lessons for beginners learning C and Python, with C++ and Java planned: plain-English notes beside the code and the output it really prints.";

/**
 * Metadata for one page: its title, description and canonical path, repeated
 * for social sharing. `path` starts with "/" and is resolved against SITE_URL.
 */
export function pageMetadata({ path, title, description }: { path: string; title?: string; description: string }) {
  return {
    ...(title ? { title } : {}),
    description,
    alternates: { canonical: path },
    openGraph: { type: "website" as const, siteName: SITE_NAME, url: path, ...(title ? { title } : {}), description },
    twitter: { card: "summary_large_image" as const, ...(title ? { title } : {}), description },
  };
}
