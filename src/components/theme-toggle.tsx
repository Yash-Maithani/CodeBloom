"use client";

// Theme toggle (DESIGN.md section 7). Which icon shows comes from CSS, from the
// same rules that pick the colours, so it is right from the first paint. The
// accessible name says what pressing does and needs JavaScript, so the button
// stays invisible (its space kept) until the page is interactive.

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { THEME_KEY } from "@/lib/theme";

type Theme = "light" | "dark";

function store(theme: Theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Storage blocked: the choice still applies until the page is left.
  }
}

/**
 * Switches the theme (DESIGN.md section 6, theme switch exception). Where the
 * View Transitions API exists, the new theme is revealed by a circle that grows
 * from the toggle's centre to the farthest corner while the icon turns. Where it
 * does not, the colours cross-fade. With reduced motion the change is instant.
 * Focus never moves: the button keeps it throughout.
 */
/** A CSS time token in milliseconds; the build may write 560ms as .56s. */
function ms(value: string) {
  const v = value.trim();
  return v.endsWith("ms") ? parseFloat(v) : parseFloat(v) * 1000;
}

function switchTheme(theme: Theme, button: HTMLElement) {
  const root = document.documentElement;
  const apply = () => {
    root.setAttribute("data-theme", theme);
    store(theme);
  };
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    apply();
    return;
  }
  const tokens = getComputedStyle(root);
  const duration = ms(tokens.getPropertyValue("--duration-theme"));
  const easing = tokens.getPropertyValue("--ease-standard").trim();

  if (typeof document.startViewTransition !== "function") {
    // Fallback: every colour cross-fades (duration-slow), then the class goes.
    root.classList.add("theme-fade");
    apply();
    window.setTimeout(() => root.classList.remove("theme-fade"), ms(tokens.getPropertyValue("--duration-slow")));
    return;
  }

  const box = button.getBoundingClientRect();
  const x = box.left + box.width / 2;
  const y = box.top + box.height / 2;
  const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
  root.classList.add("theme-reveal");
  const transition = document.startViewTransition(apply);
  transition.ready
    .then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration, easing, pseudoElement: "::view-transition-new(root)" },
      );
    })
    .catch(() => {
      // The browser skipped the animation; the theme is already applied.
    });
  transition.finished.finally(() => root.classList.remove("theme-reveal"));
}

function current(): Theme {
  const forced = document.documentElement.getAttribute("data-theme");
  if (forced === "light" || forced === "dark") return forced;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  const query = window.matchMedia("(prefers-color-scheme: dark)");
  query.addEventListener("change", onChange);
  return () => {
    observer.disconnect();
    query.removeEventListener("change", onChange);
  };
}

/**
 * `preview` is for the component gallery only: it shows the button as it looks
 * in that theme, with a fixed label, without reading or changing the page.
 */
export function ThemeToggle({ preview, state }: { preview?: Theme; state?: "hover" | "focus" } = {}) {
  const live = useSyncExternalStore<Theme | null>(subscribe, current, () => null);
  const theme = preview ?? live;
  const next: Theme = theme === "dark" ? "light" : "dark";

  function toggle(event: React.MouseEvent<HTMLButtonElement>) {
    if (preview) return;
    switchTheme(next, event.currentTarget);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme ? `Switch to ${next} mode` : undefined}
      inert={theme === null}
      data-theme-toggle
      data-state={state}
      className={`relative inline-flex size-12 items-center justify-center rounded-control text-ink transition-colors duration-fast hover:bg-primary-tint data-[state=hover]:bg-primary-tint data-[state=focus]:outline-2 data-[state=focus]:outline-offset-2 data-[state=focus]:outline-ink ${theme === null ? "invisible" : ""}`}
    >
      {preview ? (
        preview === "dark" ? (
          <Sun aria-hidden="true" size={20} strokeWidth={1.75} />
        ) : (
          <Moon aria-hidden="true" size={20} strokeWidth={1.75} />
        )
      ) : (
        <>
          <Moon aria-hidden="true" size={20} strokeWidth={1.75} className="theme-icon-moon absolute" />
          <Sun aria-hidden="true" size={20} strokeWidth={1.75} className="theme-icon-sun absolute" />
        </>
      )}
    </button>
  );
}
