import { expect, test } from "@playwright/test";

// Privacy policy and Terms (brief Section 16). Their statements are checked
// against what the site really does where a test can see it.

test("the footer links to the privacy policy and terms on every page", async ({ page }) => {
  for (const path of ["/", "/courses/python/decisions", "/playground"]) {
    await page.goto(path);
    const footer = page.getByRole("navigation", { name: "Footer" });
    await expect(footer.getByRole("link", { name: "Privacy" }), path).toHaveAttribute("href", "/privacy");
    await expect(footer.getByRole("link", { name: "Terms" }), path).toHaveAttribute("href", "/terms");
  }
});

test("the privacy policy names the one stored value, and the site sets no cookie and calls no other host", async ({ page, context }) => {
  const hosts = new Set<string>();
  page.on("request", (request) => hosts.add(new URL(request.url()).host));
  await page.goto("/privacy", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Privacy policy");
  await expect(page.locator("main")).toContainText("codebloom-theme");
  await expect(page.locator("[data-review-note]")).toContainText("not legal advice");
  await page.getByRole("button", { name: /Switch to (dark|light) mode/ }).click();
  // The choice is saved inside the theme switch, a frame after the click.
  await expect.poll(() => page.evaluate(() => Object.keys(localStorage))).toEqual(["codebloom-theme"]);
  expect(await context.cookies()).toEqual([]);
  expect([...hosts]).toEqual([new URL(page.url()).host]);
});

test("the terms state the content licence and the contact page", async ({ page }) => {
  await page.goto("/terms");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Terms of use");
  await expect(page.locator("main")).toContainText("All rights reserved.");
  await expect(page.getByRole("link", { name: "CodeBloom issues page on GitHub" })).toHaveAttribute("href", "https://github.com/Yash-Maithani/CodeBloom/issues");
});
