import type { Metadata } from "next";
import {
  Atkinson_Hyperlegible_Mono,
  Atkinson_Hyperlegible_Next,
  Bricolage_Grotesque,
} from "next/font/google";
import { THEME_BOOT_SCRIPT } from "@/lib/theme";
import "./globals.css";

// next/font downloads these font files at build time and serves them from our
// own domain, so visitors' browsers never contact Google. All three are
// licensed under the SIL Open Font License 1.1. Roles are in DESIGN.md section 3.
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["700", "800"],
  display: "swap",
  variable: "--font-bricolage",
});

const atkinson = Atkinson_Hyperlegible_Next({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-atkinson",
});

// Italic is loaded because code comments are italic (DESIGN.md section 3).
const atkinsonMono = Atkinson_Hyperlegible_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-atkinson-mono",
});

// Pages set their own title; the template adds "| CodeBloom" to it.
export const metadata: Metadata = {
  // Provisional icon: an SVG for modern browsers and a 32px PNG as fallback,
  // both in public/. The final favicon is a launch item (brief Section 16).
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-32.png", type: "image/png", sizes: "32x32" },
    ],
  },
  title: {
    default: "CodeBloom: programming explained line by line",
    template: "%s | CodeBloom",
  },
  description:
    "Beginner programming lessons in C, C++, Java and Python, with plain-English notes beside the code and the output it really prints.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // The boot script may set data-theme before React runs, so the attribute
    // can differ from the server HTML on purpose.
    <html
      lang="en"
      className={`${bricolage.variable} ${atkinson.variable} ${atkinsonMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Applies a stored light or dark choice before the first paint (no flash). */}
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
