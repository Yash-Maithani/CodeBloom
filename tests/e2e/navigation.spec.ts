import { expect, test, type Page } from "@playwright/test";

// Every public page that should exist: Milestone 1 pages, the published lessons and the playground.
const EXPECTED_PAGES = [
  "/",
  "/playground",
  "/playground/python/variables_change",
  "/playground/python/variables_types",
  "/playground/python/type_error_fixed",
  "/playground/python/compare",
  "/playground/python/vote",
  "/playground/python/delivery_fee",
  "/playground/python/first_hello",
  "/playground/python/first_order",
  "/playground/python/io_greet",
  "/playground/python/io_type",
  "/playground/python/io_age",
  "/playground/python/io_sum",
  "/playground/python/elif_ticket",
  "/playground/python/elif_grade",
  "/playground/python/elif_separate",
  "/playground/python/elif_right_order",
  "/courses",
  "/courses/c",
  "/courses/cpp",
  "/courses/java",
  "/courses/python",
  "/courses/c/first-program",
  "/courses/c/variables",
  "/courses/python/first-program",
  "/courses/python/variables",
  "/courses/python/input-output",
  "/courses/python/decisions",
  "/courses/python/elif",
];

async function internalLinks(page: Page): Promise<string[]> {
  const hrefs = await page.locator("a[href]").evaluateAll((links) =>
    links.map((link) => (link as HTMLAnchorElement).href),
  );
  const origin = new URL(page.url()).origin;
  return hrefs
    .map((href) => new URL(href))
    .filter((url) => url.origin === origin)
    .map((url) => url.pathname);
}

test("crawling every link from the homepage finds only working pages", async ({ page }) => {
  const toVisit = ["/"];
  const visited = new Set<string>();

  while (toVisit.length > 0) {
    const path = toVisit.shift()!;
    if (visited.has(path)) continue;
    visited.add(path);

    const response = await page.goto(path);
    expect(response?.status(), `${path} should open`).toBe(200);
    await expect(page.locator("h1"), `${path} should have exactly one h1`).toHaveCount(1);
    await expect(page.getByRole("banner"), `${path} should have one header`).toHaveCount(1);
    await expect(page.getByRole("contentinfo"), `${path} should have one footer`).toHaveCount(1);

    for (const link of await internalLinks(page)) {
      if (!visited.has(link)) toVisit.push(link);
    }
  }

  expect([...visited].sort()).toEqual([...EXPECTED_PAGES].sort());
});

test("every header link, course card and footer link opens its page", async ({ page }) => {
  await page.goto("/");
  const groups = {
    header: page.getByRole("navigation", { name: "Main" }).getByRole("link"),
    cards: page.locator("article").getByRole("link"),
    footer: page.getByRole("navigation", { name: "Footer" }).getByRole("link"),
  };

  for (const [group, links] of Object.entries(groups)) {
    // Count on the homepage, not on the page the previous group's last link opened.
    await page.goto("/");
    const count = await links.count();
    expect(count, `${group} should have links`).toBeGreaterThan(0);
    for (let index = 0; index < count; index++) {
      await page.goto("/");
      const link = groups[group as keyof typeof groups].nth(index);
      const name = (await link.textContent())?.trim();
      const href = await link.getAttribute("href");
      await link.click();
      await expect(page, `${group} link "${name}"`).toHaveURL(new RegExp(`${href}$`));
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.getByRole("heading", { name: "Page not found" })).toHaveCount(0);
    }
  }
});

test("the wordmark goes home and the current section is marked in the header", async ({ page }) => {
  await page.goto("/courses/java");
  const coursesLink = page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Courses" });
  await expect(coursesLink).toHaveAttribute("aria-current", "page");
  await page.getByRole("banner").getByRole("link", { name: "CodeBloom" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(coursesLink).not.toHaveAttribute("aria-current", "page");
});

for (const path of ["/courses/rust", "/no-such-page"]) {
  test(`unknown address ${path} returns the 404 page`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1, name: "Page not found" })).toBeVisible();
    await expect(page.getByRole("banner")).toHaveCount(1);
    await page.getByRole("main").getByRole("link", { name: "Browse the courses" }).click();
    await expect(page).toHaveURL(/\/courses$/);
  });
}

test("no public page links to the development token page", async ({ page }) => {
  for (const path of EXPECTED_PAGES) {
    await page.goto(path);
    expect(await internalLinks(page), path).not.toContain("/dev/tokens");
  }
});
