import { expect, test, type Page } from "@playwright/test";

// Copy code (DESIGN.md section 7): the button says "Copied" for two seconds
// after the LAST click, and every click is announced to screen readers, not
// just the first one inside a two-second window.
//
// Timing: the two-second label timer is driven by Playwright's fake clock, not
// by waiting. The clock is installed AFTER the page has loaded, so how long the
// page took to load cannot matter, and the clock stays paused until the test
// moves it. (A version that installed the clock before loading failed whenever
// the page took longer than one second: "Cannot fast-forward to the past".)
//
// A real screen reader is not used here. Screen readers announce what is ADDED
// to a live region, so these tests record what the browser adds to the status
// region. That checks the mechanism; it does not replace trying NVDA or VoiceOver.

const firstBlock = (page: Page) => page.locator("figure").first();
const copyButton = (page: Page) => firstBlock(page).locator("button", { hasText: /^(Copy code|Copied)$/ });

/** Starts recording every piece of text added to the code block's status region. */
async function recordAnnouncements(page: Page) {
  await page.evaluate(() => {
    const region = document.querySelector("figure [role=status]");
    if (!region) throw new Error("no status region in the first code block");
    const added: string[] = [];
    (window as unknown as { __announced: string[] }).__announced = added;
    new MutationObserver((records) => {
      for (const record of records) {
        record.addedNodes.forEach((node) => {
          const text = node.textContent?.trim();
          if (text) added.push(text);
        });
      }
    }).observe(region, { childList: true, subtree: true });
  });
}

const announced = (page: Page) => page.evaluate(() => (window as unknown as { __announced: string[] }).__announced);

/**
 * Opens the homepage, then freezes time. Installing the clock after loading
 * means no real time passes inside the test's own timeline, and pausing far
 * ahead of the install moment (60 s) cannot be overtaken by a slow machine.
 */
async function openWithFrozenClock(page: Page, slowAssetsMs = 0) {
  if (slowAssetsMs > 0) {
    await page.route("**/_next/static/**", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, slowAssetsMs));
      await route.continue();
    });
  }
  await page.goto("/", { waitUntil: "networkidle" });
  const start = new Date("2026-01-01T09:00:00");
  await page.clock.install({ time: start });
  await page.clock.pauseAt(new Date(start.getTime() + 60_000));
}

/**
 * Clicks Copy code once and waits until React has handled that click: the new
 * announcement is in the page and a browser task has run since, so effects
 * (including the timer) are registered. Without this, "Copied" from an earlier
 * click would satisfy a later assertion before the new click took effect.
 */
async function clickCopy(page: Page, expectedAnnouncements: number) {
  await copyButton(page).click();
  await expect.poll(() => announced(page)).toHaveLength(expectedAnnouncements);
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        const channel = new MessageChannel();
        channel.port1.onmessage = () => resolve();
        channel.port2.postMessage(null);
      }),
  );
}

test("a second Copy code click inside two seconds is announced again", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await openWithFrozenClock(page);
  await recordAnnouncements(page);

  await clickCopy(page, 1);
  await expect(copyButton(page)).toHaveText("Copied");
  expect(await announced(page)).toEqual(["Code copied"]);

  // Still inside the two-second window: no fake time has passed at all.
  await clickCopy(page, 2);
  expect(await announced(page)).toEqual(["Code copied", "Code copied"]);
  await clickCopy(page, 3);
  expect(await announced(page)).toEqual(["Code copied", "Code copied", "Code copied"]);
  await expect(copyButton(page)).toHaveText("Copied");
});

test("a Copy code click after the label has reset is announced too", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await openWithFrozenClock(page);
  await recordAnnouncements(page);

  await clickCopy(page, 1);
  await expect(copyButton(page)).toHaveText("Copied");
  await page.clock.runFor(2100);
  await expect(copyButton(page)).toHaveText("Copy code");
  await clickCopy(page, 2);
  expect(await announced(page)).toEqual(["Code copied", "Code copied"]);
  await expect(copyButton(page)).toHaveText("Copied");
});

// Run twice: once normally and once with the page's scripts delayed by 1.5 s,
// to show the result does not depend on how fast the page loads.
for (const [name, slowAssetsMs] of [
  ["", 0],
  [" (page loads slowly)", 1500],
] as const) {
  test(`the Copied label goes back to Copy code two seconds after the last click, not the first${name}`, async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await openWithFrozenClock(page, slowAssetsMs);
    await recordAnnouncements(page);

    await clickCopy(page, 1); // at 0 ms
    await expect(copyButton(page)).toHaveText("Copied");

    await page.clock.runFor(1500);
    await clickCopy(page, 2); // at 1500 ms: restarts the two seconds
    await expect(copyButton(page)).toHaveText("Copied");

    // 3000 ms: more than two seconds since the first click, only 1500 ms since the last.
    await page.clock.runFor(1500);
    await expect(copyButton(page)).toHaveText("Copied");

    // 3400 ms: 1900 ms since the last click, still inside the window.
    await page.clock.runFor(400);
    await expect(copyButton(page)).toHaveText("Copied");

    // 3600 ms: 2100 ms since the last click.
    await page.clock.runFor(200);
    await expect(copyButton(page)).toHaveText("Copy code");
  });
}

test("when copying fails, every attempt is announced with what to do", async ({ page }) => {
  // No clipboard permission is granted, so the browser refuses the write.
  await page.goto("/");
  await recordAnnouncements(page);
  const message = "Copy failed. Select the code and copy it manually.";

  await copyButton(page).click();
  await expect.poll(() => announced(page)).toEqual([message]);
  await copyButton(page).click();
  await expect.poll(() => announced(page)).toEqual([message, message]);
  await expect(copyButton(page)).toHaveText("Copy code");
});
