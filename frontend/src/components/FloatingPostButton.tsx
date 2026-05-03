"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const HIDDEN = new Set<string>(["/connect", "/post"]);

export function FloatingPostButton() {
  const path = usePathname();
  if (HIDDEN.has(path)) return null;
  return (
    <Link
      href="/post"
      className="btn"
      style={{
        position: "fixed",
        right: 32,
        bottom: 72,
        zIndex: 30,
        padding: "14px 22px",
        fontFamily: "var(--ledger-font-display)",
        fontStyle: "italic",
        fontWeight: 700,
      }}
    >
      Post a task →
    </Link>
  );
}
