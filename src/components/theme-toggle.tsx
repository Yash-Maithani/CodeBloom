"use client";

// Theme toggle (DESIGN.md section 7). Which icon shows comes from CSS, from the
// same rules that pick the colours, so it is right from the first paint. The
// accessible name says what pressing does and needs JavaScript, so the button
// stays invisible (its space kept) until the page is interactive.

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { THEME_KEY } from "@/lib/theme";

type Theme = "light" | "dark";

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

  function toggle() {
    if (preview) return;
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // Storage blocked: the choice still applies until the page is left.
    }
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
