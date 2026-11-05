import { expect, test } from "@playwright/test";

// Search and sharing metadata (brief Section 16). Every URL comes from SITE_URL in src/lib/site.ts.
const SITE = "https://codebloom.vercel.app";
const pngSize = (bytes: Buffer) => [bytes.readUInt32BE(16), bytes.readUInt32BE(20)];

for (const [path, title] of [
  ["/", "CodeBloom: programming explained line by line"],
  ["/courses/python/decisions", "Making decisions with if and else in Python | CodeBloom"],
  ["/playground", "Python playground | CodeBloom"],
  ["/privacy", "Privacy policy | CodeBloom"],
]) {
  test(`${path} has its title, canonical URL and sharing preview, and may be indexed`, async ({ page }) => {
    await page.goto(path);
    await expect(page).toHaveTitle(title);
    const meta = (selector: string) => page.locator(selector).getAttribute("content");
    expect(await page.locator('link[rel="canonical"]').getAttribute("href")).toBe(`${SITE}${path === "/" ? "" : path}`.replace(/\/$/, "") || SITE);
    expect(await meta('meta[property="og:url"]')).toBe(`${SITE}${path === "/" ? "" : path}` || SITE);
    expect(await meta('meta[property="og:image"]')).toBe(`${SITE}/og.png`);
    expect(await meta('meta[property="og:image:width"]')).toBe("1200");
    expect(await meta('meta[name="twitter:card"]')).toBe("summary_large_image");
    expect(await meta('meta[name="description"]')).toBeTruthy();
    await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
  });
}

test("the sharing image, Apple icon, robots.txt and sitemap.xml are served", async ({ request }) => {
  const og = await request.get("/og.png");
  expect(og.headers()["content-type"]).toContain("image/png");
  expect(pngSize(await og.body())).toEqual([1200, 630]);
  const apple = await request.get("/apple-touch-icon.png");
  expect(pngSize(await apple.body())).toEqual([180, 180]);

  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain("Allow: /");
  expect(robots).not.toContain("Disallow");
  expect(robots).toContain(`Sitemap: ${SITE}/sitemap.xml`);

  const sitemap = await (await request.get("/sitemap.xml")).text();
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  // Homepage, courses, 4 course pages, 27 lessons, the playground, privacy and terms.
  expect(urls).toHaveLength(36);
  for (const url of [`${SITE}/`, `${SITE}/courses/c/pointers`, `${SITE}/playground`, `${SITE}/privacy`, `${SITE}/terms`]) expect(urls).toContain(url);
  expect(urls.every((url) => url.startsWith(SITE))).toBe(true);
});

test("no framework or host badge: no X-Powered-By header, and the security headers are set", async ({ request }) => {
  const response = await request.get("/");
  const headers = response.headers();
  expect(headers["x-powered-by"]).toBeUndefined();
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(headers["content-security-policy"]).toBe("frame-ancestors 'none'");
  // The Python worker keeps its own policy.
  const worker = await request.get("/python-worker.mjs");
  expect(worker.headers()["content-security-policy"]).toBe("default-src 'none'; script-src 'self' 'wasm-unsafe-eval'; connect-src 'self'");
});
