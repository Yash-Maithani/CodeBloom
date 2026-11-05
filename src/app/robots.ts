import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// robots.txt: every page may be indexed; the sitemap lists them.
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/" }, sitemap: new URL("/sitemap.xml", SITE_URL).toString() };
}
