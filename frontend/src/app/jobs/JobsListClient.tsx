"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Job } from "@/lib/data";

export function JobsListClient({ jobs }: { jobs: Job[] }) {
  const router = useRouter();
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 1000);
    return () => window.clearInterval(id);
  }, []);
  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="page" style={{ padding: 40 }}>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          marginBottom: 32,
        }}
      >
        <h1
          style={{
            fontFamily: "var(--ledger-font-display)",
            fontStyle: "italic",
            fontWeight: 900,
            fontSize: 64,
            letterSpacing: "-0.03em",
            margin: 0,
            color: "var(--ledger-paper)",
          }}
        >
          Live jobs.
        </h1>
        <span className="caps-md muted">{jobs.length} ACTIVE</span>
      </div>
      <div>
        {jobs.map((j) => {
          const t = Math.max(0, j.timeLeft - tick);
          return (
            <div
              key={j.id}
              onClick={() => router.push(`/jobs/${j.id}`)}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto auto",
                alignItems: "center",
                padding: "20px 0",
                borderBottom: "1px solid rgba(245,241,232,0.16)",
                cursor: "pointer",
                height: 84,
                gap: 32,
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: "var(--ledger-font-display)",
                    fontStyle: "italic",
                    fontWeight: 800,
                    fontSize: 24,
                    letterSpacing: "-0.02em",
                    color: "var(--ledger-paper)",
                  }}
                >
                  {j.title}
                </div>
                <div
                  className="mono muted"
                  style={{ fontSize: 12, marginTop: 4 }}
                >
                  {j.id} · {j.employer}
                </div>
              </div>
              <div
                style={{
                  textAlign: "right",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                }}
              >
                <span
                  className="mono"
                  style={{
                    fontSize: 24,
                    fontWeight: 500,
                    color:
                      t < 30
                        ? "var(--ledger-gold-leaf)"
                        : "var(--ledger-oxblood)",
                  }}
                >
                  {fmt(t)}
                </span>
                <span
                  className="italic-num"
                  style={{ fontSize: 18, color: "var(--ledger-paper)" }}
                >
                  {j.payout} USDC
                </span>
              </div>
              <div style={{ width: 100, textAlign: "right" }}>
                <span className="caps-sm muted">[{j.bids} BIDS]</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
