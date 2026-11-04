import { expect, test } from "@playwright/test";

// The theme toggle (DESIGN.md section 7). Canvas values from DESIGN.md section 2.
const CANVAS = { light: "rgb(247, 244, 238)", dark: "rgb(15, 29, 26)" };
const bodyColour = (page: import("@playwright/test").Page) => page.evaluate(() => getComputedStyle(document.body).backgroundColor);

test("by default it follows the system setting and says what pressing does", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.locator("html")).not.toHaveAttribute("data-theme");
  await expect(page.locator("[data-theme-toggle]")).toHaveAccessibleName("Switch to light mode");
});

test("pressing switches data-theme and the label, each time", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
  await page.goto("/", { waitUntil: "networkidle" });
  const toggle = page.getByRole("button", { name: "Switch to dark mode" });
  await toggle.click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("[data-theme-toggle]")).toHaveAccessibleName("Switch to light mode");
  expect(await bodyColour(page)).toBe(CANVAS.dark);
  await page.locator("[data-theme-toggle]").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.locator("[data-theme-toggle]")).toHaveAccessibleName("Switch to dark mode");
  expect(await bodyColour(page)).toBe(CANVAS.light);
});

test("the choice survives a reload and is applied before the first paint", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
  await page.goto("/", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  // Record the page colour at the first moment the document is parsed, before any React code runs.
  await page.addInitScript(() => {
    document.addEventListener("DOMContentLoaded", () => {
      (window as unknown as { firstColour: string }).firstColour = getComputedStyle(document.body).backgroundColor;
    });
  });
  await page.reload({ waitUntil: "networkidle" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  expect(await page.evaluate(() => (window as unknown as { firstColour: string }).firstColour)).toBe(CANVAS.dark);
  expect(await page.evaluate(() => localStorage.getItem("codebloom-theme"))).toBe("dark");
  // And on another page of the site.
  await page.goto("/courses/python", { waitUntil: "networkidle" });
  await expect(page.locator("[data-theme-toggle]")).toHaveAccessibleName("Switch to light mode");
});

test("with storage blocked the toggle still works and nothing breaks", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", { get() { throw new Error("blocked"); } });
  });
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  expect(errors).toEqual([]);
});

test("keyboard: Tab reaches the toggle, Enter and Space switch, focus stays", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/", { waitUntil: "networkidle" });
  const toggle = page.locator("[data-theme-toggle]");
  await page.getByRole("link", { name: "Playground" }).first().focus();
  await page.keyboard.press("Tab");
  await expect(toggle).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.keyboard.press("Space");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(toggle).toBeFocused();
});

test("icons turn with transform and opacity; with reduced motion the change is instant", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/", { waitUntil: "networkidle" });
  const sun = page.locator("[data-theme-toggle] .theme-icon-sun");
  expect(await sun.evaluate((el) => getComputedStyle(el).transitionProperty)).toBe("transform, opacity");
  expect(await sun.evaluate((el) => getComputedStyle(el).transitionDuration)).toBe("0.3s, 0.3s");
  await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
  expect(await sun.evaluate((el) => getComputedStyle(el).transitionDuration)).toBe("0s, 0s");
  await page.locator("[data-theme-toggle]").click();
  expect(await sun.evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
});
