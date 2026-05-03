"use client";

import { useEffect, useState } from "react";

/** Returns the remaining seconds, ticking once per second. */
export function useCountdown(targetUnixSec: number): number {
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, targetUnixSec - Math.floor(Date.now() / 1000)),
  );
  useEffect(() => {
    const handle = window.setInterval(() => {
      setRemaining(Math.max(0, targetUnixSec - Math.floor(Date.now() / 1000)));
    }, 1000);
    return () => window.clearInterval(handle);
  }, [targetUnixSec]);
  return remaining;
}
