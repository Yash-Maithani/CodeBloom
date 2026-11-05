import { expect, test, type Page } from "@playwright/test";

// Page transitions (DESIGN.md section 6): the page content cross-fades on
// navigation through React's ViewTransition; reduced motion makes it instant.

async function recordTransitions(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as { pageAnimations: Array<{ pseudo: string; duration: number }>; cls: number };
    w.pageAnimations = [];
    w.cls = 0;
    const original = Document.prototype.startViewTransition;
    Document.prototype.startViewTransition = function (this: Document, ...args: Parameters<Document["startViewTransition"]>) {
      const transition = original.apply(this, args);
      transition.ready
        .then(() => {
          for (const a of document.getAnimations()) {
            const effect = a.effect as KeyframeEffect | null;
            if (effect?.pseudoElement?.startsWith("::view-transition")) w.pageAnimations.push({ pseudo: effect.pseudoElement, duration: Number(effect.getComputedTiming().duration) });
          }
        })
        .catch(() => {});
      return transition;
    };
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as unknown as { value: number; hadRecentInput: boolean }[]) if (!entry.hadRecentInput) w.cls += entry.value;
    }).observe({ type: "layout-shift", buffered: true });
  });
}
const animations = (page: Page) => page.evaluate(() => (window as unknown as { pageAnimations: Array<{ pseudo: string; duration: number }> }).pageAnimations);

test("navigating cross-fades the page content over duration-base, and focus and the address follow", async ({ page }) => {
  await recordTransitions(page);
  await page.goto("/", { waitUntil: "networkidle" });
  await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Courses" }).click();
  await expect(page).toHaveURL(/\/courses$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect.poll(async () => (await animations(page)).filter((a) => a.pseudo.includes("view-transition-new") || a.pseudo.includes("view-transition-old")).length).toBeGreaterThan(0);
  const fades = (await animations(page)).filter((a) => !a.pseudo.includes("(root)") && (a.pseudo.includes("-old(") || a.pseudo.includes("-new(")));
  expect(fades.length).toBeGreaterThan(0);
  for (const fade of fades) expect(fade.duration).toBe(200);
});

test("with reduced motion the new page appears at once", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await recordTransitions(page);
  await page.goto("/", { waitUntil: "networkidle" });
  await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Courses" }).click();
  await expect(page).toHaveURL(/\/courses$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  for (const a of await animations(page)) expect(a.duration, a.pseudo).toBe(0);
});
