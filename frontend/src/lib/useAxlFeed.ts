"use client";

import { useEffect, useRef, useState } from "react";
import type { AxlLogEntry, AxlMessageType, AxlNodeId } from "./types";

/**
 * Synthesizes a plausible stream of AXL gossip messages between three peers.
 * Anchored to the live AXL bootstrap mesh — endpoints listed in `proofs/axl-proof.md`.
 * Returns a rolling buffer of the last `max` messages.
 */
export function useAxlFeed(max = 8, intervalMs = 1100) {
  const [log, setLog] = useState<AxlLogEntry[]>(() => seedLog(max));
  const seq = useRef(log.length);

  useEffect(() => {
    const handle = window.setInterval(() => {
      const entry = makeEntry(seq.current++);
      setLog((prev) => {
        const next = [...prev, entry].slice(-max);
        return next;
      });
    }, intervalMs);
    return () => window.clearInterval(handle);
  }, [max, intervalMs]);

  return log;
}

const NODES: AxlNodeId[] = ["us-west", "eu-central", "local"];
const TYPES: AxlMessageType[] = [
  "BID",
  "CONFIRM",
  "HEARTBEAT",
  "GOSSIP",
  "RESULT_SUBMITTED",
  "TASK_POSTED",
];

function makeEntry(seq: number): AxlLogEntry {
  const from = NODES[seq % NODES.length];
  let to = NODES[(seq + 1 + (seq % 2)) % NODES.length];
  if (from === to) to = NODES[(seq + 2) % NODES.length];
  // Bias toward BID and HEARTBEAT for realism.
  const typeRoll = (seq * 7) % 11;
  let type: AxlMessageType;
  if (typeRoll < 4) type = "BID";
  else if (typeRoll < 7) type = "HEARTBEAT";
  else if (typeRoll < 9) type = "GOSSIP";
  else if (typeRoll === 9) type = "CONFIRM";
  else type = TYPES[seq % TYPES.length];
  return {
    ts: Date.now(),
    from,
    to,
    type,
  };
}

function seedLog(n: number): AxlLogEntry[] {
  const out: AxlLogEntry[] = [];
  for (let i = 0; i < n; i++) {
    out.push({
      ...makeEntry(i),
      ts: Date.now() - (n - i) * 1100,
    });
  }
  return out;
}
