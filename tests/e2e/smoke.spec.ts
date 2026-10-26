import { expect, test } from "@playwright/test";

test("home route opens, shows its heading and loads the three fonts", async ({
  page,
}) => {
  const problems: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") problems.push(`console: ${message.text()}`);
  });
  page.on("pageerror", (error) => problems.push(`page error: ${error.message}`));

  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle(/CodeBloom/);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Learn to program with patient, line-by-line explanations",
    }),
  ).toBeVisible();

  const loadedFamilies = await page.evaluate(async () => {
    await document.fonts.ready;
    return [...document.fonts]
      .filter((font) => font.status === "loaded")
      .map((font) => font.family);
  });
  for (const family of [
    "Literata",
    "Atkinson Hyperlegible Next",
    "Atkinson Hyperlegible Mono",
  ]) {
    expect(
      loadedFamilies.some((loaded) => loaded.includes(family)),
      `${family} should be loaded, loaded: ${loadedFamilies.join(", ")}`,
    ).toBe(true);
  }

  expect(problems).toEqual([]);
});

test("the token check page still opens and asks not to be indexed", async ({ page }) => {
  const response = await page.goto("/dev/tokens");
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1, name: "Design tokens check" })).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex, nofollow");
});
