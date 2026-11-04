"use client";

// A soft marker band under a key term (DESIGN.md section 7, highlighter mark).
// It is in the page from the start, so without JavaScript, and for a term
// already on screen, it is simply there. A term further down is held back once
// and draws in when it first scrolls into view; it never animates again.
// Only transform changes; with reduced motion the duration is 0, so it appears at once.

import { useEffect, useRef, useState } from "react";

export function HighlighterMark({ children, state }: { children: React.ReactNode; /** gallery only */ state?: "pending" }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [pending, setPending] = useState(state === "pending");

  useEffect(() => {
    const element = ref.current;
    if (!element || state || !("IntersectionObserver" in window)) return;
    const box = element.getBoundingClientRect();
    if (box.top < window.innerHeight && box.bottom > 0) return;
    setPending(true);
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setPending(false);
        observer.disconnect();
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [state]);

  return (
    <span ref={ref} data-mark={pending ? "pending" : "drawn"} className="highlighter-mark">
      {children}
    </span>
  );
}
