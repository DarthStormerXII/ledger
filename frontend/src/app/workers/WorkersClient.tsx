"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Lot } from "@/lib/data";
import { LotPlate } from "@/components/LotPlate";

type Filter = "all" | "listed" | "top" | "recent";
type Sort = "realized" | "rating" | "recent";

export function WorkersClient({
  lots: all,
  marketplaceOnly = false,
}: {
  lots: Lot[];
  marketplaceOnly?: boolean;
}) {
  const router = useRouter();
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
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            style={{
              background: "transparent",
              color: "var(--ledger-paper)",
              border: "1px solid rgba(245,241,232,0.16)",
              padding: "6px 10px",
              fontSize: 13,
            }}
          >
            <option value="realized">Sort: by realized</option>
            <option value="rating">Sort: by rating</option>
            <option value="recent">Sort: by recency</option>
          </select>
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 24,
        }}
      >
        {lots.map((l) => (
          <div key={l.lot}>
            <LotPlate lot={l} showPrice={marketplaceOnly} />
            {marketplaceOnly && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 8,
                  marginTop: 8,
                }}
              >
                <button
                  className="btn btn-italic"
                  onClick={() =>
                    router.push(`/agent/${encodeURIComponent(l.ens)}`)
                  }
                >
                  Buy now
                </button>
                <button
                  className="btn-text"
                  style={{
                    border: "1px solid var(--ledger-oxblood)",
                    padding: "12px 22px",
                  }}
                >
                  Make offer
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
