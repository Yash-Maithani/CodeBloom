import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/legal-page";
import { textLinkStyles } from "@/components/styles";
import { CONTACT_URL, pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  path: "/terms",
  title: "Terms of use",
  description: "The terms for using CodeBloom: free lessons for your own learning, a playground that runs on your device, and no warranty.",
});

export default function TermsPage() {
  return (
    <LegalPage title="Terms of use" updated="5 November 2026">
      <LegalSection title="Using CodeBloom">
        <p>
          CodeBloom is a free, non-commercial site for learning to program. You can use it without an account. By using it, you agree to these terms.
        </p>
      </LegalSection>

      <LegalSection title="The lessons and examples">
        <p>
          The lessons, examples, diagrams and site design are © 2026 Yash Maithani. All rights reserved. You may read the lessons and copy the code examples to
          run and change them for your own learning. Please do not republish the lessons or examples elsewhere without permission.
        </p>
      </LegalSection>

      <LegalSection title="The Python playground">
        <p>
          The playground runs Python on your own device. You are responsible for the code you run in it. Do not use it, or any part of CodeBloom, to harm
          other people, other websites or this site.
        </p>
      </LegalSection>

      <LegalSection title="No warranty">
        <p>
          Every runnable example on CodeBloom is checked by really running it, and the output shown is the output it printed. Even so, mistakes are possible,
          and the site is provided as it is, without any warranty. To the extent the law allows, CodeBloom and its owner are not liable for any loss caused by
          using the site.
        </p>
      </LegalSection>

      <LegalSection title="Changes and contact">
        <p>
          These terms may change; the date at the top says when they last did. To report a mistake or ask a question, use the{" "}
          <a href={CONTACT_URL} className={textLinkStyles}>
            CodeBloom issues page on GitHub
          </a>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
