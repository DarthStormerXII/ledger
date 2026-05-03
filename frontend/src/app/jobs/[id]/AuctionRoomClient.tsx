"use client";

import { useEffect, useState } from "react";
import type { Job, Lot, AxlEntry } from "@/lib/data";
import { AXL_LOG_SEED } from "@/lib/data";
import { AxlTopology } from "@/components/AxlTopology";

type Bidder = Lot & { bid: number };

export function AuctionRoomClient({ job, lots }: { job: Job; lots: Lot[] }) {
  const [timeLeft, setTimeLeft] = useState(job.timeLeft);
  useEffect(() => {
    const id = window.setInterval(
      () => setTimeLeft((t) => Math.max(0, t - 1)),
      1000,
    );
    return () => window.clearInterval(id);
  }, []);
  const fmtTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const [bids, setBids] = useState<Bidder[]>([
    { ...lots[0]!, bid: 4.5 },
    { ...lots[1]!, bid: 4.8 },
    { ...lots[2]!, bid: 4.65 },
  ]);
  const [winner, setWinner] = useState(0);

  // Bid arrival every 4–6s
  useEffect(() => {
    let id: number;
    const tick = () => {
      const idx = Math.floor(Math.random() * 3);
      setBids((prev) => {
        const next = [...prev];
        const newBid = +(
          Math.min(...prev.map((p) => p.bid)) -
          0.05 -
          Math.random() * 0.1
        ).toFixed(2);
        next[idx] = { ...next[idx]!, bid: Math.max(0.5, newBid) };
        return next;
      });
      setWinner(idx);
      id = window.setTimeout(tick, 4000 + Math.random() * 2000);
    };
    id = window.setTimeout(tick, 3000);
    return () => window.clearTimeout(id);
  }, []);

  const [log, setLog] = useState<AxlEntry[]>(AXL_LOG_SEED);
  useEffect(() => {
    const id = window.setInterval(() => {
      const nodes = ["us-west", "eu-central", "local"];
      const types = ["BID", "GOSSIP", "ACK"];
      const now = new Date();
      const t = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
      const from = nodes[Math.floor(Math.random() * 3)]!;
      let to = nodes[Math.floor(Math.random() * 3)]!;
      while (to === from) to = nodes[Math.floor(Math.random() * 3)]!;
      const type = types[Math.floor(Math.random() * 3)]!;
      setLog((prev) => [{ t, from, to, type }, ...prev.slice(0, 7)]);
    }, 2200);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="page" style={{ padding: 40 }}>
      {/* TOP SECTION */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: 32,
          paddingBottom: 32,
          borderBottom: "1px solid rgba(245,241,232,0.16)",
        }}
      >
        <div>
          <div className="caps-md muted" style={{ marginBottom: 8 }}>
            {job.id.toUpperCase()} · LIVE AUCTION
          </div>
          <h1
            style={{
              fontFamily: "var(--ledger-font-display)",
              fontStyle: "italic",
              fontWeight: 900,
              fontSize: 40,
              letterSpacing: "-0.02em",
              margin: "0 0 12px",
              color: "var(--ledger-paper)",
            }}
          >
            {job.title}.
          </h1>
          <p
            style={{
              fontSize: 14,
              color: "rgba(245,241,232,0.6)",
              maxWidth: 640,
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            {job.desc}
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div
            className="mono"
            style={{
              fontSize: 32,
              fontWeight: 700,
              color:
                timeLeft < 30
                  ? "var(--ledger-gold-leaf)"
                  : "var(--ledger-oxblood)",
            }}
          >
            {fmtTime(timeLeft)}
          </div>
          <div
            style={{
              marginTop: 14,
              display: "flex",
              flexDirection: "column",
              gap: 6,
              alignItems: "flex-end",
            }}
          >
            <div>
              <span className="caps-sm muted">PAYOUT — </span>
              <span
                className="italic-num"
                style={{ fontSize: 18, color: "var(--ledger-paper)" }}
              >
                {job.payout} USDC
              </span>
            </div>
            <div>
              <span className="caps-sm muted">BOND — </span>
              <span
                className="italic-num"
                style={{ fontSize: 18, color: "var(--ledger-paper)" }}
              >
                {job.bond} USDC
              </span>
            </div>
          </div>
        </div>
      </div>

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 0 }}
      >
        {/* CENTER */}
        <div style={{ padding: "40px 24px 40px 0" }}>
          <div className="caps-md muted" style={{ marginBottom: 18 }}>
            {bids.length} WORKERS BIDDING
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 16,
            }}
          >
            {bids.map((b, i) => (
              <BidCard key={b.lot} lot={b} winning={winner === i} />
            ))}
          </div>

          {/* Bottom status bar */}
          <div
            style={{
              marginTop: 40,
              padding: "12px 0",
              borderTop: "1px solid rgba(245,241,232,0.16)",
              display: "flex",
              justifyContent: "space-around",
              alignItems: "center",
            }}
          >
            <StatusInd label="AXL — 3 nodes connected" />
            <StatusInd label="0G GALILEO — ready" />
            <StatusInd label="ENS RESOLVER — live" />
          </div>
        </div>

        {/* RIGHT RAIL */}
        <div
          style={{
            borderLeft: "1px solid rgba(245,241,232,0.16)",
            padding: "40px 0 40px 24px",
          }}
        >
          <div className="caps-md muted" style={{ marginBottom: 20 }}>
            AXL TOPOLOGY
          </div>
          <AxlTopology />

          <div style={{ marginTop: 32 }}>
            <div className="caps-md muted" style={{ marginBottom: 12 }}>
              MESH LOG
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {log.map((e, i) => (
                <div
                  key={`${e.t}-${i}`}
                  className="mono"
                  style={{ fontSize: 11, opacity: 1 - i * 0.08 }}
                >
                  <span className="muted">{e.t}</span>{" "}
                  <span style={{ color: "var(--ledger-paper)" }}>
                    {e.from} → {e.to}
                  </span>{" "}
                  :{" "}
                  <span className="text-oxblood" style={{ fontWeight: 600 }}>
                    {e.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BidCard({ lot, winning }: { lot: Bidder; winning: boolean }) {
  return (
    <div
      style={{
        border: "1px solid rgba(245,241,232,0.2)",
        padding: 24,
        opacity: winning ? 1 : 0.6,
        transform: winning ? "scale(1)" : "scale(0.97)",
        transition: "opacity 280ms ease-out, transform 280ms ease-out",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
      }}
    >
      <div style={{ alignSelf: "flex-start" }}>
        <span className="caps-md" style={{ color: "var(--ledger-paper)" }}>
          LOT {lot.lot}
        </span>
      </div>
      <div
        style={{
          width: 96,
          height: 96,
          background: "var(--ledger-paper)",
          border: "1px solid rgba(245,241,232,0.16)",
          padding: 8,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={lot.avatar}
          alt=""
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
        />
      </div>
      <div
        style={{
          fontFamily: "var(--ledger-font-display)",
          fontStyle: "italic",
          fontWeight: 800,
          fontSize: 22,
          letterSpacing: "-0.02em",
          textAlign: "center",
          color: "var(--ledger-paper)",
        }}
      >
        {lot.ens}
      </div>
      <div className="caps-sm muted">
        {lot.rating} ★ · {lot.jobs} JOBS
      </div>
      <div style={{ marginTop: 8 }} className="italic-num text-oxblood">
        <span style={{ fontSize: 36 }}>{lot.bid.toFixed(2)} USDC</span>
      </div>
      <div
        style={{
          width: "80%",
          height: 1,
          background: "var(--ledger-oxblood)",
          animation: winning ? "breathe 1.2s ease-in-out infinite" : "none",
          opacity: winning ? 1 : 0.4,
        }}
      ></div>
    </div>
  );
}

function StatusInd({ label }: { label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span className="live-dot success"></span>
      <span className="caps-sm" style={{ color: "var(--ledger-paper)" }}>
        {label}
      </span>
    </div>
  );
}
