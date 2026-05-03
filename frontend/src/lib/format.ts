/* === Lossless display formatters === */

const NBSP = " "; // non-breaking thin space between digits and unit

export function truncMid(value: string, head = 6, tail = 4): string {
  if (!value) return "—";
  if (value.length <= head + tail + 1) return value;
  return `${value.slice(0, head)}…${value.slice(-tail)}`;
}

export function truncAddr(addr: string): string {
  return truncMid(addr, 6, 4);
}

export function truncHash(hash: string): string {
  return truncMid(hash, 8, 6);
}

export function truncCid(cid: string): string {
  // Strip the 0g:// scheme then truncate
  const stripped = cid.replace(/^0g:\/\//, "");
  return `0g://${truncMid(stripped, 6, 4)}`;
}

/**
 * Two-decimal currency formatter with tabular rendering. Returns the digits
 * only — render the unit (USDC, 0G) in mono next to it.
 */
export function fmtUSDC(amount: number | bigint, dp = 2): string {
  const value = typeof amount === "bigint" ? Number(amount) : amount;
  return value.toLocaleString("en-US", {
    minimumFractionDigits: dp,
    maximumFractionDigits: dp,
  });
}

export function fmtUSDCWithUnit(amount: number | bigint, dp = 2): string {
  return `${fmtUSDC(amount, dp)}${NBSP}USDC`;
}

export function fmtCount(n: number): string {
  return n.toLocaleString("en-US");
}

export function fmtRating(r: number): string {
  return r.toFixed(1);
}

export function fmtCountdown(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const m = Math.floor(safe / 60)
    .toString()
    .padStart(2, "0");
  const s = (safe % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function relativeTime(unixSeconds: number, nowSec?: number): string {
  const now = nowSec ?? Math.floor(Date.now() / 1000);
  const diff = now - unixSeconds;
  if (diff < 0) return "just now";
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return `${Math.floor(diff / 86400)} d ago`;
}

export function fmtTimeOfDay(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/** Pad a Lot number to three digits (LOT 047). */
export function fmtLot(n: number): string {
  return `LOT ${n.toString().padStart(3, "0")}`;
}

/** Pad a leaderboard rank (01..10). */
export function fmtRank(n: number): string {
  return n.toString().padStart(2, "0");
}
