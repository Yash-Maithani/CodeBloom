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
  "/playground/python/loop_while_count",
  "/playground/python/loop_ask_again",
  "/playground/python/loop_range",
  "/playground/python/loop_sum",
  "/playground/python/loop_off_by_one_fix",
  "/playground/python/loop_done_after",
  "/playground/python/func_greet",
  "/playground/python/func_param",
  "/playground/python/func_return",
  "/playground/python/func_no_return_fix",
  "/playground/python/func_scope_fix",
  "/playground/python/list_basics",
  "/playground/python/list_change",
  "/playground/python/list_loop",
  "/playground/python/list_index_error_fix",
  "/playground/python/list_alias_fix",
  "/playground/python/num_basics",
  "/playground/python/num_minutes",
  "/playground/python/num_negative",
  "/playground/python/num_order",
  "/playground/python/num_float",
  "/playground/python/num_convert",
  "/playground/python/num_update",
  "/playground/python/num_slash_fix",
  "/playground/python/cond_and",
  "/playground/python/cond_or",
  "/playground/python/cond_not",
  "/playground/python/cond_values",
  "/playground/python/cond_precedence",
  "/playground/python/cond_short",
  "/playground/python/cond_or_text_fix",
  "/playground/python/cond_and_or_fix",
  "/playground/python/str_basics",
  "/playground/python/str_join",
  "/playground/python/str_fstring",
  "/playground/python/str_escape",
  "/playground/python/str_strip",
  "/playground/python/str_methods",
  "/playground/python/str_in",
  "/playground/python/str_split",
  "/playground/python/str_immutable_fix",
  "/playground/python/str_no_store_fix",
  "/playground/python/dict_basics",
  "/playground/python/dict_change",
  "/playground/python/dict_in_get",
  "/playground/python/dict_loop",
  "/playground/python/dict_count",
  "/playground/python/dict_key_error_fix",
  "/playground/python/dict_duplicate_fix",
  "/playground/python/file_write_read",
  "/playground/python/file_lines",
  "/playground/python/file_numbers",
  "/playground/python/file_append",
  "/playground/python/file_overwrite_fix",
  "/playground/python/file_missing_fix",
  "/playground/python/file_newline_fix",
  "/courses",
  "/courses/c",
  "/courses/cpp",
  "/courses/java",
  "/courses/python",
  "/courses/c/first-program",
  "/courses/c/variables",
  "/courses/c/numbers",
  "/courses/c/printf-scanf",
  "/courses/c/decisions",
  "/courses/c/else-if",
  "/courses/c/conditions",
  "/courses/c/loops",
  "/courses/python/first-program",
  "/courses/python/variables",
  "/courses/python/input-output",
  "/courses/python/decisions",
  "/courses/python/elif",
  "/courses/python/loops",
  "/courses/python/functions",
  "/courses/python/lists",
  "/courses/python/strings",
  "/courses/python/dictionaries",
  "/courses/python/files",
  "/courses/python/numbers",
  "/courses/python/conditions",
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
  test.setTimeout(180_000); // opens every page of the site one after another; the site grows with every lesson
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
