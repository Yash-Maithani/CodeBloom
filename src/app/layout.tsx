import type { Metadata } from "next";
import {
  Atkinson_Hyperlegible_Mono,
  Atkinson_Hyperlegible_Next,
  Literata,
} from "next/font/google";
import "./globals.css";

// next/font downloads these font files at build time and serves them from our
// own domain, so visitors' browsers never contact Google. All three are
// licensed under the SIL Open Font License 1.1. Roles are in DESIGN.md section 4.
const literata = Literata({
  subsets: ["latin"],
  weight: "600",
  display: "swap",
  variable: "--font-literata",
});

const atkinson = Atkinson_Hyperlegible_Next({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-atkinson",
});

// Italic is loaded because code comments are italic (DESIGN.md section 7).
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
    <html
      lang="en"
      className={`${literata.variable} ${atkinson.variable} ${atkinsonMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
