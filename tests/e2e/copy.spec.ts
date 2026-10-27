import { expect, test, type Page } from "@playwright/test";

// Copy code (DESIGN.md section 7): the button says "Copied" for two seconds
// after the LAST click, and every click is announced to screen readers, not
// just the first one inside a two-second window.
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

test("a second Copy code click inside two seconds is announced again", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/");
  await recordAnnouncements(page);

  await copyButton(page).click();
  await expect(copyButton(page)).toHaveText("Copied");
  expect(await announced(page)).toEqual(["Code copied"]);

  // Still inside the two-second window.
  await copyButton(page).click();
  await expect.poll(() => announced(page)).toEqual(["Code copied", "Code copied"]);
  await copyButton(page).click();
  await expect.poll(() => announced(page)).toEqual(["Code copied", "Code copied", "Code copied"]);
  await expect(copyButton(page)).toHaveText("Copied");
});

test("a Copy code click after the label has reset is announced too", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/");
  await recordAnnouncements(page);

  await copyButton(page).click();
  await expect(copyButton(page)).toHaveText("Copy code", { timeout: 4000 });
  await copyButton(page).click();
  await expect.poll(() => announced(page)).toEqual(["Code copied", "Code copied"]);
});

test("the Copied label goes back to Copy code two seconds after the last click, not the first", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const start = new Date("2026-01-01T09:00:00");
  await page.clock.install({ time: start });
  await page.goto("/");
  await page.clock.pauseAt(new Date(start.getTime() + 1000));

  await copyButton(page).click(); // at 0 ms
  await expect(copyButton(page)).toHaveText("Copied");

  await page.clock.runFor(1500);
  await copyButton(page).click(); // at 1500 ms: restarts the two seconds
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
