"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";

type Tag = "div" | "li" | "section" | "span";

/**
 * Lightweight scroll-reveal: when the wrapper enters the viewport, fades + lifts
 * its children. Honours `prefers-reduced-motion` (becomes a no-op).
 */
export function Reveal({
  children,
  delay = 0,
  className,
  as = "div",
  threshold = 0.18,
  once = true,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: Tag;
  threshold?: number;
  once?: boolean;
}) {
  const ref = useRef<HTMLElement | null>(null);
  // Lazy initialiser: respects reduced motion synchronously without a setState.
  const [shown, setShown] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const node = ref.current;
    if (!node) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            if (once) obs.disconnect();
          } else if (!once) {
            setShown(false);
          }
        }
      },
      { threshold, rootMargin: "0px 0px -10% 0px" },
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [once, threshold]);

  const style: React.CSSProperties = {
    opacity: shown ? 1 : 0,
    transform: shown ? "translateY(0)" : "translateY(24px)",
    transition: `opacity 700ms cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform 700ms cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
  };

  if (as === "li") {
    return (
      <li
        ref={ref as React.Ref<HTMLLIElement>}
        className={className}
        style={style}
      >
        {children}
      </li>
    );
  }
  if (as === "section") {
    return (
      <section
        ref={ref as React.Ref<HTMLElement>}
        className={className}
        style={style}
      >
        {children}
      </section>
    );
  }
  if (as === "span") {
    return (
      <span
        ref={ref as React.Ref<HTMLSpanElement>}
        className={className}
        style={style}
      >
        {children}
      </span>
    );
  }
  return (
    <div
      ref={ref as React.Ref<HTMLDivElement>}
      className={className}
      style={style}
    >
      {children}
    </div>
  );
}
