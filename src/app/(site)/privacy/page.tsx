import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/legal-page";
import { textLinkStyles } from "@/components/styles";
import { THEME_KEY } from "@/lib/theme";
import { CONTACT_URL, pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  path: "/privacy",
  title: "Privacy policy",
  description: "What CodeBloom stores and sends: no accounts, no cookies, no analytics, and a playground that runs on your device.",
});

// Every statement here must stay true of the code (brief Section 16). If a
// feature changes what is stored or sent, update this page in the same change.
export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy policy" updated="5 November 2026">
      <LegalSection title="In short">
        <p>
          CodeBloom has no accounts, no sign-up forms, no cookies, no analytics and no advertising. It loads no scripts or fonts from other companies. The
          only thing it stores is your light or dark theme choice, and that stays in your browser.
        </p>
      </LegalSection>

      <LegalSection title="Who runs CodeBloom">
        <p>CodeBloom is a free, non-commercial learning site run by its owner, Yash Maithani (GitHub: Yash-Maithani).</p>
      </LegalSection>

      <LegalSection title="Your theme choice">
        <p>
          If you press the theme button in the header, your browser saves one word, <code className="font-mono">light</code> or{" "}
          <code className="font-mono">dark</code>, in its local storage under the name <code className="font-mono">{THEME_KEY}</code>. It is used only to show
          the theme you chose the next time you visit. It is never sent to CodeBloom or anyone else. If you never press the button, nothing is saved and the
          site follows your device&apos;s setting. You can remove it at any time by clearing this site&apos;s data in your browser settings.
        </p>
      </LegalSection>

      <LegalSection title="The Python playground">
        <p>
          The playground downloads a copy of Python (Pyodide) from this site the first time you press Run, and your browser may keep it in its cache. Your
          code, the input you type and the output all stay on your device: they are never sent to CodeBloom or anyone else. Programs you run in the playground
          cannot connect to other websites.
        </p>
      </LegalSection>

      <LegalSection title="Hosting and server logs">
        <p>
          CodeBloom is hosted by Vercel. As with any website, when your browser asks for a page, Vercel receives the usual details of that request, such as
          your IP address, your browser type, the page address and the time, and may keep them in its logs to deliver the site and protect it from abuse.
          CodeBloom does not use these logs to track or profile visitors. Vercel handles this information under its own{" "}
          <a href="https://vercel.com/legal/privacy-policy" className={textLinkStyles}>
            privacy policy
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="Contacting CodeBloom">
        <p>
          Questions and reports go through the{" "}
          <a href={CONTACT_URL} className={textLinkStyles}>
            CodeBloom issues page on GitHub
          </a>
          . Anything posted there is public and is handled by GitHub under its own privacy policy, so please do not include personal details you want to keep
          private.
        </p>
      </LegalSection>

      <LegalSection title="Changes to this policy">
        <p>If CodeBloom ever starts storing or sending anything else, this page will say so first, with a new date at the top.</p>
      </LegalSection>
    </LegalPage>
  );
}
