"use client";

import { type ReactNode, useState } from "react";
import { useRouter } from "next/navigation";

export function PostTaskClient() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "Base Yield Scout",
    desc: "Surveying Base Layer-2 yield opportunities. Returns ranked APR snapshot of top 12 vaults.",
    payout: "5.00",
    bond: "0.50",
    timeLimit: "02:00",
    minRep: "4.0",
    minJobs: "10",
    tags: "yield, base, defi",
  });
  const [toast, setToast] = useState<string | null>(null);

  const set = <K extends keyof typeof form>(k: K, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = () => {
    setToast("Lot listed. Bidding open.");
    window.setTimeout(() => router.push("/jobs/j-1247"), 200);
    window.setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="page" style={{ padding: 40, maxWidth: 1100 }}>
      {toast && <div className="toast">{toast}</div>}

      <h1
        style={{
          fontFamily: "var(--ledger-font-display)",
          fontStyle: "italic",
          fontWeight: 900,
          fontSize: 64,
          letterSpacing: "-0.03em",
          margin: "0 0 32px",
          color: "var(--ledger-paper)",
        }}
      >
        Post a task.
      </h1>

      <Section label="TASK BRIEF">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 32,
          }}
        >
          <Field label="TITLE">
            <input
              className="input italic"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
            />
          </Field>
          <Field label="DESCRIPTION">
            <textarea
              className="input"
              rows={2}
              style={{ resize: "vertical" }}
              value={form.desc}
              onChange={(e) => set("desc", e.target.value)}
            />
          </Field>
        </div>
      </Section>

      <Section label="PAYOUT TERMS">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 32,
          }}
        >
          <Field label="PAYOUT — USDC">
            <input
              className="input italic"
              value={form.payout}
              onChange={(e) => set("payout", e.target.value)}
            />
          </Field>
          <Field label="BOND — USDC">
            <input
              className="input italic"
              value={form.bond}
              onChange={(e) => set("bond", e.target.value)}
            />
          </Field>
          <Field label="TIME LIMIT — MM:SS">
            <input
              className="input mono"
              value={form.timeLimit}
              onChange={(e) => set("timeLimit", e.target.value)}
            />
          </Field>
        </div>
      </Section>

      <Section label="REQUIREMENTS">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 32,
          }}
        >
          <Field label="MIN REPUTATION">
            <input
              className="input italic"
              value={form.minRep}
              onChange={(e) => set("minRep", e.target.value)}
            />
          </Field>
          <Field label="MIN JOBS DONE">
            <input
              className="input italic"
              value={form.minJobs}
              onChange={(e) => set("minJobs", e.target.value)}
            />
          </Field>
          <Field label="CAPABILITY TAGS">
            <input
              className="input"
              value={form.tags}
              onChange={(e) => set("tags", e.target.value)}
            />
          </Field>
        </div>
      </Section>

      <Section label="REVIEW">
        <div style={{ padding: "16px 0" }}>
          <div
            style={{
              fontFamily: "var(--ledger-font-display)",
              fontStyle: "italic",
              fontWeight: 800,
              fontSize: 32,
              color: "var(--ledger-paper)",
              marginBottom: 12,
            }}
          >
            {form.title}.
          </div>
          <div
            style={{
              color: "rgba(245,241,232,0.6)",
              marginBottom: 18,
              maxWidth: 720,
            }}
          >
            {form.desc}
          </div>
          <div style={{ display: "flex", gap: 48 }}>
            <ReviewItem label="PAYOUT" value={`${form.payout} USDC`} />
            <ReviewItem label="BOND" value={`${form.bond} USDC`} />
            <ReviewItem label="TIME LIMIT" value={form.timeLimit} mono />
            <ReviewItem label="MIN REPUTATION" value={form.minRep} />
          </div>
        </div>
        <button
          onClick={submit}
          className="btn btn-italic"
          style={{ width: "100%", height: 56, fontSize: 20, marginTop: 16 }}
        >
          Post task
        </button>
      </Section>
    </div>
  );
}

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div
      style={{
        padding: "32px 0",
        borderBottom: "1px solid rgba(245,241,232,0.16)",
      }}
    >
      <div className="caps-md muted" style={{ marginBottom: 24 }}>
        {label}
      </div>
      {children}
    </div>
  );
}
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className="caps-sm muted" style={{ marginBottom: 6 }}>
        {label}
      </div>
      {children}
    </div>
  );
}
function ReviewItem({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <div className="caps-sm muted" style={{ marginBottom: 4 }}>
        {label}
      </div>
      <div
        className={mono ? "mono" : "italic-num"}
        style={{ fontSize: 22, color: "var(--ledger-paper)" }}
      >
        {value}
      </div>
    </div>
  );
}
