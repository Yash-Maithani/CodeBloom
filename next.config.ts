import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
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
