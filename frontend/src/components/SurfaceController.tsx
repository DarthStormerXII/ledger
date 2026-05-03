"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const PAPER_ROUTES = new Set<string>(["/", "/about", "/connect"]);

/**
 * Mounts on every page and toggles `body.surface-paper` / `body.surface-ink`
 * based on the current route. Mirrors the handoff App.jsx behaviour.
 */
export function SurfaceController() {
  const path = usePathname();
  useEffect(() => {
    const isPaper = PAPER_ROUTES.has(path);
    document.body.classList.toggle("surface-paper", isPaper);
    document.body.classList.toggle("surface-ink", !isPaper);
  }, [path]);
  return null;
}
