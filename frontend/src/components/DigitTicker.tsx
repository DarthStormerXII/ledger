"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Renders a value that animates with a digit-roll on change. Honors
 * `prefers-reduced-motion`. The component is purely visual — it does not
 * format. Pass already-formatted strings.
 */
export function DigitTicker({
  value,
  className,
  reducedMotion,
}: {
  value: string;
  className?: string;
  reducedMotion?: boolean;
}) {
  const [current, setCurrent] = useState(value);
  const [animKey, setAnimKey] = useState(0);
  const lastRef = useRef(value);

  useEffect(() => {
    if (lastRef.current === value) return;
    lastRef.current = value;
    setCurrent(value);
    setAnimKey((k) => k + 1);
  }, [value]);

  if (reducedMotion) {
    return <span className={className}>{current}</span>;
  }
  return (
    <span className={className}>
      {current.split("").map((ch, i) => (
        <span
          key={`${animKey}-${i}-${ch}`}
          className="ledger-digit-roll"
          style={{
            animationDelay: `${i * 18}ms`,
            display: "inline-block",
          }}
        >
          {ch}
        </span>
      ))}
    </span>
  );
}
