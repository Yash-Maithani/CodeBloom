import type { NextConfig } from "next";

// Hosted on Vercel (PROGRESS.md D115), which applies these headers as written.
const nextConfig: NextConfig = {
  // No "X-Powered-By: Next.js" header: no framework branding (brief Section 16).
  poweredByHeader: false,
  async headers() {
    return [
      {
        // Every page: basic protections that need no script nonces, so pages stay static.
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
        ],
      },
      {
        // The Python worker runs learner code. Its own policy lets it load
        // scripts and connect only to this site (PROGRESS.md D58).
        source: "/python-worker.mjs",
        headers: [
          { key: "Content-Security-Policy", value: "default-src 'none'; script-src 'self' 'wasm-unsafe-eval'; connect-src 'self'" },
          { key: "Cache-Control", value: "no-cache" },
        ],
      },
      {
        // The path names the exact Pyodide version, so the files never change.
        source: "/pyodide/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
