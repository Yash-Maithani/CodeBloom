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

// The theme switch reveal (DESIGN.md section 6, theme switch exception).
async function spyOnViewTransitions(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    const w = window as unknown as { transitions: number; cls: number };
    w.transitions = 0;
    w.cls = 0;
    const original = Document.prototype.startViewTransition;
    if (original) {
      Document.prototype.startViewTransition = function (this: Document, ...args: Parameters<Document["startViewTransition"]>) {
        w.transitions += 1;
        return original.apply(this, args);
      };
    }
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as unknown as { value: number }[]) w.cls += entry.value;
    }).observe({ type: "layout-shift", buffered: true });
  });
}
const counters = (page: import("@playwright/test").Page) => page.evaluate(() => ({ transitions: (window as unknown as { transitions: number }).transitions, cls: (window as unknown as { cls: number }).cls }));

test("pressing reveals the new theme as a circle from the toggle, both ways, and focus stays", async ({ page }) => {
  await spyOnViewTransitions(page);
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/", { waitUntil: "networkidle" });
  const toggle = page.locator("[data-theme-toggle]");
  // Only shifts caused by the switch count here, not those during page load.
  await page.evaluate(() => ((window as unknown as { cls: number }).cls = 0));
  for (const [theme, label] of [["dark", "Switch to light mode"], ["light", "Switch to dark mode"]] as const) {
    await toggle.focus();
    await page.keyboard.press("Enter");
    // The circle animation runs on the new view for duration-theme with ease-standard.
    const reveal = await page.waitForFunction(() => {
      const a = document.getAnimations().find((x) => (x.effect as KeyframeEffect | null)?.pseudoElement === "::view-transition-new(root)");
      if (!a) return null;
      const timing = a.effect!.getTiming();
      const frames = (a.effect as KeyframeEffect).getKeyframes();
      return { duration: timing.duration, easing: timing.easing, from: frames[0].clipPath, to: frames.at(-1)!.clipPath };
    });
    const value = (await reveal.jsonValue())!;
    expect(value.duration).toBe(560);
    expect(value.easing).toBe("cubic-bezier(0.2, 0, 0, 1)");
    // It starts at the button's centre with no size and ends past the farthest corner.
    const box = (await toggle.boundingBox())!;
    const [x, y] = [box.x + box.width / 2, box.y + box.height / 2];
    expect(String(value.from)).toBe(`circle(0px at ${x}px ${y}px)`);
    const radius = Number(String(value.to).match(/circle\(([\d.]+)px/)![1]);
    expect(radius).toBeGreaterThanOrEqual(Math.hypot(x, 720 - y) - 1);
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    await expect(toggle).toHaveAccessibleName(label);
    await expect(page.locator("html")).not.toHaveClass(/theme-reveal/);
    await expect(toggle).toBeFocused();
  }
  expect(await counters(page)).toEqual({ transitions: 2, cls: 0 });
});

test("with reduced motion the switch is instant: no view transition, no fade", async ({ page }) => {
  await spyOnViewTransitions(page);
  await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
  await page.goto("/", { waitUntil: "networkidle" });
  await page.locator("[data-theme-toggle]").click();
  expect(await bodyColour(page)).toBe(CANVAS.dark);
  expect(await page.locator("html").getAttribute("class")).not.toMatch(/theme-(reveal|fade)/);
  expect((await counters(page)).transitions).toBe(0);
});

test("without the View Transitions API the colours cross-fade over 300ms, never snap", async ({ page }) => {
  await page.addInitScript(() => {
    // @ts-expect-error removing the API to test the fallback path
    delete Document.prototype.startViewTransition;
  });
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/", { waitUntil: "networkidle" });
  expect(await page.evaluate(() => "startViewTransition" in document)).toBe(false);
  // Record the timing at the moment the fade class is set, before any frame is drawn.
  await page.evaluate(() => {
    const w = window as unknown as { during: unknown };
    new MutationObserver(() => {
      if (w.during || !document.documentElement.classList.contains("theme-fade")) return;
      w.during = {
        fading: true,
        body: getComputedStyle(document.body).transitionDuration,
        heading: getComputedStyle(document.querySelector("h1")!).transitionDuration,
      };
    }).observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  });
  const toggle = page.locator("[data-theme-toggle]");
  await toggle.click();
  const during = await page.evaluate(() => (window as unknown as { during: unknown }).during);
  expect(during).toEqual({ fading: true, body: "0.3s", heading: expect.stringMatching(/^0\.3s/) });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(toggle).toHaveAccessibleName("Switch to light mode");
  await expect(page.locator("html")).not.toHaveClass(/theme-fade/);
  await expect.poll(() => bodyColour(page)).toBe(CANVAS.dark);
  await toggle.click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(toggle).toBeFocused();
});
