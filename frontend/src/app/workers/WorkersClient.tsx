"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Lot } from "@/lib/data";
import { LotPlate } from "@/components/LotPlate";

type Filter = "all" | "listed" | "top" | "recent";
type Sort = "realized" | "rating" | "recent";

const SORT_OPTIONS: { value: Sort; label: string }[] = [
  { value: "realized", label: "By realized earnings" },
  { value: "rating", label: "By rating" },
  { value: "recent", label: "By recency" },
];

function SortDropdown({
  value,
  onChange,
}: {
  value: Sort;
  onChange: (v: Sort) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  const current =
    SORT_OPTIONS.find((o) => o.value === value) ?? SORT_OPTIONS[0];
  return (
    <div className="sort-dropdown" ref={ref}>
      <button
        type="button"
        className={`sort-dropdown-trigger ${open ? "is-open" : ""}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="caps-sm sort-dropdown-label">SORT</span>
        <span className="sort-dropdown-value">{current.label}</span>
        <svg
          className="sort-dropdown-caret"
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden
        >
          <path d="M2 3.5 L5 6.5 L8 3.5" strokeLinecap="round" />
        </svg>
      </button>
      {open && (
        <ul className="sort-dropdown-menu" role="listbox">
          {SORT_OPTIONS.map((opt) => {
            const selected = opt.value === value;
            return (
              <li
                key={opt.value}
                role="option"
                aria-selected={selected}
                tabIndex={0}
                className={`sort-dropdown-item ${selected ? "is-selected" : ""}`}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    onChange(opt.value);
                    setOpen(false);
                  }
                }}
              >
                <span>{opt.label}</span>
                {selected && <span className="sort-dropdown-check">✓</span>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

type SerializedListing = {
  seller: string;
  askPriceWei: string;
  askPriceFormatted: string;
  listedAt: number;
  active: boolean;
};

export function WorkersClient({
  lots: all,
  marketplaceOnly = false,
  liveListings = {},
}: {
  lots: Lot[];
  marketplaceOnly?: boolean;
  /** Map of tokenId → on-chain listing. Only set on /marketplace. */
  liveListings?: Record<string, SerializedListing>;
}) {
  const [filter, setFilter] = useState<Filter>(
    marketplaceOnly ? "listed" : "all",
  );
  const [sort, setSort] = useState<Sort>("realized");

  const lots = useMemo(() => {
    let list = [...all];
    if (marketplaceOnly || filter === "listed")
      list = list.filter((l) => l.listed);
    else if (filter === "top") list.sort((a, b) => b.earnedNum - a.earnedNum);
    else if (filter === "recent")
      list.sort((a, b) => b.daysActive - a.daysActive);
    if (sort === "realized") list.sort((a, b) => b.earnedNum - a.earnedNum);
    if (sort === "rating") list.sort((a, b) => b.rating - a.rating);
    return list;
  }, [all, filter, sort, marketplaceOnly]);

  const title = marketplaceOnly ? "The marketplace." : "The catalogue.";
  const meta = marketplaceOnly
    ? `${lots.length} LISTED FOR SALE`
    : `${all.length} ACTIVE LOTS · LIVE ON 0G GALILEO`;

  return (
    <div className="page" style={{ padding: 40 }}>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          marginBottom: 24,
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
          {title}
        </h1>
        <span className="caps-md muted">{meta}</span>
      </div>

      {!marketplaceOnly && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "18px 0",
            borderBottom: "1px solid rgba(245,241,232,0.16)",
            marginBottom: 32,
          }}
        >
          <div style={{ display: "flex", gap: 24 }}>
            {(
              [
                ["all", "All"],
                ["listed", "Listed for sale"],
                ["top", "Top earners"],
                ["recent", "Recently minted"],
              ] as [Filter, string][]
            ).map(([k, l]) => (
              <a
                key={k}
                onClick={() => setFilter(k)}
                style={{
                  cursor: "pointer",
                  padding: "4px 0",
                  borderBottom:
                    filter === k
                      ? "1px solid var(--ledger-oxblood)"
                      : "1px solid transparent",
                  color:
                    filter === k
                      ? "var(--ledger-paper)"
                      : "rgba(245,241,232,0.6)",
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                {l}
              </a>
            ))}
          </div>
          <SortDropdown value={sort} onChange={setSort} />
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 24,
        }}
      >
        {lots.map((l) => {
          const raw = liveListings[l.lot];
          const liveListing = raw
            ? {
                tokenId: BigInt(l.lot),
                seller: raw.seller as `0x${string}`,
                askPriceWei: BigInt(raw.askPriceWei),
                askPriceFormatted: raw.askPriceFormatted,
                listedAt: raw.listedAt,
                active: raw.active,
              }
            : null;
          return (
            <div key={l.lot}>
              <LotPlate
                lot={l}
                showPrice={marketplaceOnly}
                liveListing={liveListing}
                marketplace={marketplaceOnly}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
