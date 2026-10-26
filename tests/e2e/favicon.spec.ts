import { expect, test } from "@playwright/test";

// The provisional favicon: an SVG plus a 32px PNG, linked from every page,
// including the 404 page. Without these links the browser asks for
// /favicon.ico, gets a 404 and logs an error.

for (const route of ["/", "/courses", "/courses/python", "/no-such-page"]) {
  test(`${route} links an SVG icon and a 32px PNG icon, and both files are served`, async ({ page, request }) => {
    await page.goto(route);
    const icons = await page.locator("link[rel~=icon]").evaluateAll((links) =>
      links.map((link) => ({ href: link.getAttribute("href"), type: link.getAttribute("type"), sizes: link.getAttribute("sizes") })),
    );
    expect(icons).toEqual([
      { href: "/icon.svg", type: "image/svg+xml", sizes: null },
      { href: "/icon-32.png", type: "image/png", sizes: "32x32" },
    ]);

    const svg = await request.get("/icon.svg");
    expect(svg.status()).toBe(200);
    expect(svg.headers()["content-type"]).toContain("image/svg+xml");
    expect(await svg.text()).toContain("<svg");

    const png = await request.get("/icon-32.png");
    expect(png.status()).toBe(200);
    expect(png.headers()["content-type"]).toContain("image/png");
    const bytes = await png.body();
    expect(bytes.subarray(1, 4).toString("ascii")).toBe("PNG");
    // The width and height are stored right after the 8-byte signature and the "IHDR" tag.
    expect([bytes.readUInt32BE(16), bytes.readUInt32BE(20)]).toEqual([32, 32]);
  });
}
