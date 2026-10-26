// Real-browser check of the design tokens and fonts (`npm run verify:browser`).
// Run `npm run build` first. This script starts the production server itself.
//
// What it does, for light and dark themes at 360px and 1440px wide:
//   - forces the theme explicitly (data-theme on <html>) while the browser's own
//     color-scheme preference is set to the OPPOSITE, so the forced theme must win
//   - compares every color token the browser computes with DESIGN.md
//   - recomputes the WCAG contrast ratio in the browser and compares it with
//     the ratio documented in DESIGN.md
//   - checks that the three fonts really loaded and are used, and that no font
//     request went to Google
//   - checks for horizontal overflow, console errors and failed requests
//   - saves screenshots to screenshots/ (ignored by Git)
//
// Expected values are READ FROM DESIGN.md, never typed in here, so a failing
// check means the code and the design document disagree. Fix the code, or get the
// owner's approval to change DESIGN.md. Do not edit expectations to get a pass.

import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const ROOT = fileURLToPath(new URL("../", import.meta.url));
const PORT = 3101;
const BASE = `http://127.0.0.1:${PORT}/`;
const SCREENSHOTS = `${ROOT}screenshots/`;
const WIDTHS = [360, 1440];
const THEMES = ["light", "dark"];

// ---------- read expectations from DESIGN.md ----------

function section(text, start, end) {
  const from = text.indexOf(start);
  const to = text.indexOf(end, from + start.length);
  if (from === -1 || to === -1) throw new Error(`DESIGN.md: could not find section "${start}"`);
  return text.slice(from, to);
}

function parseDesign(text) {
  const colors = { light: {}, dark: {} };
  for (const [theme, start, end] of [
    ["light", "### Light theme", "### Dark theme"],
    ["dark", "### Dark theme", "Roles are the same"],
  ]) {
    for (const line of section(text, start, end).split("\n")) {
      const m = line.match(/^\| `([a-z-]+)` \| `(#[0-9A-Fa-f]{6})`/);
      if (m) colors[theme][m[1]] = m[2].toLowerCase();
    }
  }

  const contrast = [];
  for (const line of section(text, "### Contrast check", "Rules that keep this true").split("\n")) {
    if (!/^\| `/.test(line) || !/ (on|against) /.test(line)) continue;
    const cells = line.split("|").map((c) => c.trim());
    const nonText = cells[1].includes("(non-text)");
    const [fg, rest] = cells[1].replace(/`/g, "").replace(" (non-text)", "").split(/ (?:on|against) /);
    const backgrounds = rest.split(" / ");
    const light = cells[2].split(" / ").map(Number);
    const dark = cells[3].split(" / ").map(Number);
    if (light.length !== backgrounds.length || dark.length !== backgrounds.length) {
      throw new Error(`DESIGN.md contrast row has mismatched counts: ${line}`);
    }
    backgrounds.forEach((bg, i) => contrast.push({ fg, bg, nonText, light: light[i], dark: dark[i] }));
  }

  const type = {};
  for (const line of section(text, "### Scale", "Rules:").split("\n")) {
    const m = line.match(/^\| `([a-z0-9-]+)` \| ([0-9.]+) \((\d+)px\) \| ([0-9.]+) \|/);
    if (m) type[m[1]] = { rem: Number(m[2]), px: Number(m[3]), lineHeight: Number(m[4]) };
  }

  const fast = text.match(/\| `duration-fast` \| (\d+)ms \|/);
  const spacing = text.match(/\*\*Scale \(4px base\):\*\* ([0-9, ]+)\./)?.[1].split(",").map((n) => Number(n.trim()));
  const radius = text.match(/(\d+)px for inputs[^;]*; (\d+)px for buttons; (\d+)px for panels/);
  return {
    colors,
    contrast,
    type,
    spacing,
    motion: { fast: fast ? Number(fast[1]) : NaN },
    radius: radius && { control: Number(radius[1]), button: Number(radius[2]), panel: Number(radius[3]) },
  };
}

// ---------- tiny check recorder ----------

const results = [];
function check(group, name, ok, detail = "") {
  results.push({ group, name, ok, detail });
}

const hexToRgb = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
};

// ---------- server ----------

async function startServer() {
  if (!existsSync(`${ROOT}.next/BUILD_ID`)) {
    console.error("No production build found. Run `npm run build` first.");
    process.exit(1);
  }
  const server = spawn(process.execPath, [`${ROOT}node_modules/next/dist/bin/next`, "start", "-p", String(PORT), "-H", "127.0.0.1"], {
    cwd: ROOT,
    stdio: ["ignore", "ignore", "pipe"],
  });
  let stderr = "";
  server.stderr.on("data", (d) => (stderr += d));
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(BASE)).ok) return server;
    } catch {
      /* not up yet */
    }
    if (server.exitCode !== null) break;
    await new Promise((r) => setTimeout(r, 500));
  }
  server.kill();
  console.error(`Server did not start on port ${PORT}.\n${stderr}`);
  process.exit(1);
}

// ---------- in-browser measurement (runs inside the page) ----------

// WCAG 2.1 relative luminance and contrast ratio, calculated by the browser
// from the colors it actually rendered.
function measureInPage({ probes, tokenNames, cssVars }) {
  const parse = (rgb) => rgb.match(/[\d.]+/g).slice(0, 3).map(Number);
  const lum = ([r, g, b]) => {
    const f = (c) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const ratio = (a, b) => {
    const [hi, lo] = [lum(parse(a)), lum(parse(b))].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
  };

  const holder = document.createElement("div");
  document.body.append(holder);
  const tokenColors = {};
  for (const name of tokenNames) {
    const el = document.createElement("div");
    el.style.color = `var(--color-${name})`;
    holder.append(el);
    tokenColors[name] = getComputedStyle(el).color;
  }
  const pairs = probes.map(({ fg, bg }) => {
    const el = document.createElement("div");
    el.style.color = `var(--color-${fg})`;
    el.style.backgroundColor = `var(--color-${bg})`;
    holder.append(el);
    const s = getComputedStyle(el);
    return { fg, bg, fgRgb: s.color, bgRgb: s.backgroundColor, ratio: ratio(s.color, s.backgroundColor) };
  });
  holder.remove();

  const root = getComputedStyle(document.documentElement);
  const vars = Object.fromEntries(cssVars.map((v) => [v, root.getPropertyValue(v).trim()]));

  const swatches = [...document.querySelectorAll("[data-token]")].map((el) => ({
    token: el.getAttribute("data-token"),
    background: getComputedStyle(el).backgroundColor,
  }));
  const onPage = [...document.querySelectorAll("[data-fg][data-bg]")].map((el) => {
    const s = getComputedStyle(el);
    return {
      fg: el.getAttribute("data-fg"),
      bg: el.getAttribute("data-bg"),
      color: s.color,
      background: s.backgroundColor,
      ratio: ratio(s.color, s.backgroundColor),
    };
  });
  return { tokenColors, pairs, vars, swatches, onPage };
}

async function measureFonts(page) {
  return page.evaluate(async () => {
    await document.fonts.ready;
    const loaded = [...document.fonts]
      .filter((f) => f.status === "loaded")
      .map((f) => `${f.family}|${f.weight}|${f.style}`);
    const style = (selector) => {
      const el = document.querySelector(selector);
      if (!el) return null;
      const s = getComputedStyle(el);
      return { family: s.fontFamily, weight: s.fontWeight, style: s.fontStyle };
    };
    return {
      loaded,
      heading: style("[data-role=heading]"),
      body: style("[data-role=body-specimen]"),
      code: style("[data-role=code-specimen]"),
      bold: style("[data-role=code-specimen] .font-bold"),
      italic: style("[data-role=code-specimen] .italic"),
    };
  });
}

async function measureLayout(page) {
  return page.evaluate(() => {
    const width = window.innerWidth;
    const offenders = [...document.querySelectorAll("body *")]
      .filter((el) => !el.closest("pre") && el.getBoundingClientRect().right > width + 0.5)
      .slice(0, 5)
      .map((el) => `${el.tagName.toLowerCase()}.${el.className}`.slice(0, 80));
    return {
      innerWidth: width,
      htmlScrollWidth: document.documentElement.scrollWidth,
      bodyScrollWidth: document.body.scrollWidth,
      offenders,
    };
  });
}

// ---------- one scenario ----------

async function runScenario(browser, design, { label, theme, systemScheme, width, reducedMotion = "no-preference", forceAttribute = true }) {
  const context = await browser.newContext({
    viewport: { width, height: 900 },
    colorScheme: systemScheme,
    reducedMotion,
  });
  const page = await context.newPage();
  const consoleProblems = [];
  const fontRequests = [];
  page.on("console", (m) => {
    if (m.type() === "error" || m.type() === "warning") consoleProblems.push(`console ${m.type()}: ${m.text()}`);
  });
  page.on("pageerror", (e) => consoleProblems.push(`page error: ${e.message}`));
  page.on("requestfailed", (r) => consoleProblems.push(`request failed: ${r.url()}`));
  page.on("response", (r) => {
    if (r.status() >= 400) consoleProblems.push(`HTTP ${r.status()}: ${r.url()}`);
  });
  page.on("request", (r) => {
    if (/\.(woff2?|ttf|otf)(\?|$)/.test(r.url()) || /fonts\.(googleapis|gstatic)\.com/.test(r.url())) fontRequests.push(r.url());
  });

  await page.goto(BASE, { waitUntil: "networkidle" });
  if (forceAttribute) await page.evaluate((t) => document.documentElement.setAttribute("data-theme", t), theme);
  await page.evaluate(() => document.fonts.ready);

  const group = label;
  const colors = design.colors[theme];
  const probes = design.contrast.map(({ fg, bg }) => ({ fg, bg }));
  const cssVars = [
    ...Object.keys(design.type).flatMap((t) => {
      const name = t === "code" ? "mono" : t.replace("text-", "");
      return [`--text-${name}`, `--text-${name}--line-height`];
    }),
    ...design.spacing.map((px) => `--spacing-${px / 4}`),
    "--radius-control",
    "--radius-button",
    "--radius-panel",
    "--duration-fast",
  ];
  const m = await page.evaluate(measureInPage, { probes, tokenNames: Object.keys(colors), cssVars });

  // 1. Theme really applied, and the browser's own preference did not win.
  check(group, `theme is ${theme} (browser preference was ${systemScheme})`, m.tokenColors.paper === hexToRgb(colors.paper), `paper computed ${m.tokenColors.paper}, expected ${hexToRgb(colors.paper)}`);

  // 2. Every color token matches DESIGN.md.
  const wrong = Object.entries(colors).filter(([name, hex]) => m.tokenColors[name] !== hexToRgb(hex));
  check(group, `all ${Object.keys(colors).length} color tokens match DESIGN.md`, wrong.length === 0, wrong.map(([n, h]) => `${n}: computed ${m.tokenColors[n]}, DESIGN.md ${h}`).join("; "));

  // 3. Tailwind color classes work: each swatch on the page uses its token.
  const swatchNames = new Set(m.swatches.map((s) => s.token));
  const missing = Object.keys(colors).filter((n) => !swatchNames.has(n));
  const badSwatch = m.swatches.filter((s) => s.background !== hexToRgb(colors[s.token] ?? "#000000"));
  check(group, "every DESIGN.md color has a swatch and the swatch renders it", missing.length === 0 && badSwatch.length === 0, `missing swatches: [${missing}]; wrong: ${badSwatch.map((s) => `${s.token}=${s.background}`)}`);

  // 4. Contrast: browser-calculated ratio equals the documented ratio, and meets WCAG AA.
  const contrastFailures = [];
  design.contrast.forEach((row, i) => {
    const documented = row[theme];
    const got = m.pairs[i].ratio;
    const needed = row.nonText ? 3 : 4.5;
    if (Math.abs(got - documented) > 0.005 + 1e-9) contrastFailures.push(`${row.fg} on ${row.bg}: browser ${got.toFixed(3)}, DESIGN.md ${documented}`);
    if (got < needed) contrastFailures.push(`${row.fg} on ${row.bg}: ${got.toFixed(2)} is below the ${needed}:1 minimum`);
  });
  check(group, `all ${design.contrast.length} contrast pairs match DESIGN.md and meet AA`, contrastFailures.length === 0, contrastFailures.join("; "));

  // 5. Pairs actually rendered on the page use the right tokens and reach AA.
  const pageFailures = m.onPage.flatMap((p) => {
    const issues = [];
    if (p.color !== hexToRgb(colors[p.fg]) || p.background !== hexToRgb(colors[p.bg])) issues.push(`${p.fg} on ${p.bg}: rendered ${p.color} on ${p.background}`);
    const row = design.contrast.find((r) => r.fg === p.fg && r.bg === p.bg);
    if (!row) issues.push(`${p.fg} on ${p.bg}: pair is not in the DESIGN.md contrast table`);
    else if (Math.abs(p.ratio - row[theme]) > 0.005 + 1e-9) issues.push(`${p.fg} on ${p.bg}: rendered ratio ${p.ratio.toFixed(3)}, DESIGN.md ${row[theme]}`);
    return issues;
  });
  check(group, `${m.onPage.length} text samples on the page render with documented contrast`, m.onPage.length > 0 && pageFailures.length === 0, pageFailures.join("; ") || "no samples found");

  // 6. Type scale, spacing, radius and motion tokens.
  const num = (v) => parseFloat(v);
  const sizeFailures = [];
  for (const [token, spec] of Object.entries(design.type)) {
    const name = token === "code" ? "mono" : token.replace("text-", "");
    if (Math.abs(num(m.vars[`--text-${name}`]) - spec.rem) > 1e-6) sizeFailures.push(`${token}: ${m.vars[`--text-${name}`]} vs ${spec.rem}rem`);
    if (Math.abs(num(m.vars[`--text-${name}--line-height`]) - spec.lineHeight) > 1e-6) sizeFailures.push(`${token} line height: ${m.vars[`--text-${name}--line-height`]} vs ${spec.lineHeight}`);
  }
  check(group, `${Object.keys(design.type).length} type sizes match DESIGN.md (code size is named "mono")`, sizeFailures.length === 0, sizeFailures.join("; "));
  const spaceFailures = design.spacing.filter((px) => Math.abs(num(m.vars[`--spacing-${px / 4}`]) * 16 - px) > 1e-6);
  check(group, `${design.spacing.length} spacing steps match DESIGN.md`, spaceFailures.length === 0, `wrong: ${spaceFailures}`);
  const radiusFailures = Object.entries(design.radius).filter(([name, px]) => num(m.vars[`--radius-${name}`]) !== px);
  check(group, "radius tokens match DESIGN.md", radiusFailures.length === 0, radiusFailures.map(([n, px]) => `${n}: ${m.vars[`--radius-${n}`]} vs ${px}px`).join("; "));
  // The CSS minifier may write 120ms as .12s, so convert units before comparing.
  const toMs = (v) => (v.endsWith("ms") ? parseFloat(v) : parseFloat(v) * 1000);
  const expectedFast = reducedMotion === "reduce" ? 0 : design.motion.fast;
  check(group, `duration-fast is ${expectedFast}ms (reduced motion: ${reducedMotion})`, Math.abs(toMs(m.vars["--duration-fast"]) - expectedFast) < 1e-6, `got ${m.vars["--duration-fast"]}`);

  // 7. Fonts.
  const f = await measureFonts(page);
  const wanted = ["Literata|600|normal", "Atkinson Hyperlegible Next|400|normal", "Atkinson Hyperlegible Next|700|normal", "Atkinson Hyperlegible Mono|400|normal", "Atkinson Hyperlegible Mono|700|normal", "Atkinson Hyperlegible Mono|400|italic"];
  const notLoaded = wanted.filter((w) => !f.loaded.includes(w));
  check(group, "all font files used on the page are loaded", notLoaded.length === 0, `not loaded: ${notLoaded}`);
  const firstFamily = (s) => s?.family.split(",")[0].replace(/"/g, "").trim();
  check(group, "heading uses Literata 600, body uses Atkinson Next, code uses Atkinson Mono", firstFamily(f.heading) === "Literata" && f.heading.weight === "600" && firstFamily(f.body) === "Atkinson Hyperlegible Next" && firstFamily(f.code) === "Atkinson Hyperlegible Mono", JSON.stringify({ heading: f.heading, body: f.body, code: f.code }));
  check(group, "code keyword is bold 700 and comment is italic", f.bold?.weight === "700" && f.italic?.style === "italic", JSON.stringify({ bold: f.bold, italic: f.italic }));
  const external = fontRequests.filter((u) => !u.startsWith(BASE));
  check(group, `${fontRequests.length} font files served from our own origin, none from Google`, fontRequests.length >= 3 && external.length === 0, `external: ${external}; total: ${fontRequests.length}`);

  // 8. Layout.
  const layout = await measureLayout(page);
  const overflow = Math.max(layout.htmlScrollWidth, layout.bodyScrollWidth) > layout.innerWidth;
  check(group, `no horizontal overflow at ${width}px`, !overflow, `viewport ${layout.innerWidth}, html scrollWidth ${layout.htmlScrollWidth}, body ${layout.bodyScrollWidth}, wide elements: ${layout.offenders.join(" | ")}`);

  // 9. Focus ring (DESIGN.md: 2px solid ink, 2px offset).
  await page.keyboard.press("Tab");
  const focus = await page.evaluate(() => {
    const s = getComputedStyle(document.activeElement);
    return { tag: document.activeElement.tagName, width: s.outlineWidth, style: s.outlineStyle, color: s.outlineColor, offset: s.outlineOffset };
  });
  check(group, "keyboard focus ring is 2px solid ink with 2px offset", focus.tag === "PRE" && focus.width === "2px" && focus.style === "solid" && focus.color === hexToRgb(colors.ink) && focus.offset === "2px", JSON.stringify(focus));

  // 10. Console, network, screenshot.
  check(group, "no console errors, warnings, failed requests or HTTP errors", consoleProblems.length === 0, consoleProblems.join(" | "));
  if (forceAttribute && reducedMotion === "no-preference") {
    await page.screenshot({ path: `${SCREENSHOTS}${theme}-${width}.png`, fullPage: true });
  }
  await context.close();
}

// ---------- main ----------

const design = parseDesign(await readFile(`${ROOT}DESIGN.md`, "utf8"));
check("DESIGN.md", "parsed 18 light colors, 18 dark colors", Object.keys(design.colors.light).length === 18 && Object.keys(design.colors.dark).length === 18, `${Object.keys(design.colors.light).length} / ${Object.keys(design.colors.dark).length}`);
check("DESIGN.md", "parsed contrast pairs, type scale, spacing and radius", design.contrast.length > 0 && Object.keys(design.type).length === 9 && design.spacing?.length === 9 && !!design.radius && design.motion.fast === 120, `pairs ${design.contrast.length}, type ${Object.keys(design.type).length}, spacing ${design.spacing?.length}, radius ${JSON.stringify(design.radius)}`);

await mkdir(SCREENSHOTS, { recursive: true });
const server = await startServer();
const browser = await chromium.launch();
try {
  for (const theme of THEMES) {
    for (const width of WIDTHS) {
      const systemScheme = theme === "light" ? "dark" : "light";
      await runScenario(browser, design, { label: `${theme} theme forced, ${width}px, browser prefers ${systemScheme}`, theme, systemScheme, width });
    }
  }
  // Without a forced theme the page must follow the system preference (DESIGN.md section 3).
  for (const theme of THEMES) {
    await runScenario(browser, design, { label: `no forced theme, browser prefers ${theme}, 1440px`, theme, systemScheme: theme, width: 1440, forceAttribute: false });
  }
  // Reduced motion makes the motion tokens instant (DESIGN.md section 8).
  await runScenario(browser, design, { label: "reduced motion, light, 1440px", theme: "light", systemScheme: "light", width: 1440, reducedMotion: "reduce" });
} finally {
  await browser.close();
  server.kill();
}

let failed = 0;
let lastGroup = "";
for (const r of results) {
  if (r.group !== lastGroup) console.log(`\n${r.group}`);
  lastGroup = r.group;
  console.log(`  ${r.ok ? "PASS" : "FAIL"}  ${r.name}${r.ok ? "" : `\n        ${r.detail}`}`);
  if (!r.ok) failed++;
}
console.log(`\n${results.length - failed} of ${results.length} checks passed, ${failed} failed.`);
console.log(`Screenshots: ${SCREENSHOTS}`);
process.exit(failed === 0 ? 0 : 1);
