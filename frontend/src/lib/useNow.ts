"use client";

import { useEffect, useState } from "react";

/** Returns the current unix-seconds, refreshed every `intervalMs`. */
export function useNow(intervalMs = 1000): number {
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));
  useEffect(() => {
    const handle = window.setInterval(() => {
      setNow(Math.floor(Date.now() / 1000));
    }, intervalMs);
    return () => window.clearInterval(handle);
  }, [intervalMs]);
  return now;
}
