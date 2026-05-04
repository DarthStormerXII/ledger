"use client";

import { useState, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import type { Lot } from "@/lib/data";
import type { LiveListing } from "@/lib/live";
import { InspectDrawer, InspectPill, type InspectGroup } from "./InspectDrawer";
import { MarketplaceActionSheet } from "./MarketplaceActionSheet";
import {
  WORKER_INFT_ADDRESS,
  LEDGER_ENS_PARENT,
  MOCK_TEE_ORACLE_ADDRESS,
  ERC8004_REPUTATION_REGISTRY,
  DEMO_TOKEN_ID,
  DEMO_MEMORY_CID,
  DEMO_ATTESTATION_DIGEST,
  DEMO_MINT_TX,
  DEMO_TRANSFER_TX,
  galileoAddr,
  galileoTx,
  baseSepoliaAddr,
  ensSepoliaName,
  ogStorageCid,
} from "@/lib/contracts";

export function LotPlate({
  lot,
  showPrice = false,
  onClick,
  liveListing = null,
  marketplace = false,
}: {
  lot: Lot;
  showPrice?: boolean;
  onClick?: () => void;
  /** On-chain listing if any. Drives "ON-CHAIN" badge + ready-to-buy state. */
  liveListing?: LiveListing | null;
  /** When true, renders inline Buy / Offer buttons + opens the action sheet
   * instead of routing to /agent on click. */
  marketplace?: boolean;
}) {
  const router = useRouter();
  const [inspectOpen, setInspectOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<"buy" | "offer" | "list" | null>(
    null,
  );
  const handleClick =
    onClick ?? (() => router.push(`/agent/${encodeURIComponent(lot.ens)}`));
  const stop = (e: MouseEvent) => e.stopPropagation();
  const onChainListed = !!liveListing?.active;
  const displayPrice = liveListing?.askPriceFormatted ?? lot.askPrice;

  return (
    <div className="lot-plate" onClick={handleClick}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
        }}
      >
        <span className="lot-num">LOT {lot.lot}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {onChainListed && (
            <span
              className="caps-sm"
              style={{ color: "var(--ledger-success)" }}
              title="Real on-chain listing in LedgerMarketplace"
            >
              ● ON-CHAIN
            </span>
          )}
          <InspectPill onClick={() => setInspectOpen(true)} />
        </div>
      </div>
      <div className="lot-emblem">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={lot.avatar} alt="" />
      </div>
      <div className="lot-name">{lot.ens}</div>
      <div className="lot-meta muted">
        {lot.jobs} JOBS · {lot.rating} ★ ·{" "}
        {lot.earnedNum > 0 ? <>{lot.earned} 0G EARNED</> : <>ERC-8004 SEEDED</>}
      </div>
      {showPrice && onChainListed && displayPrice && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            paddingTop: 8,
            borderTop: "1px solid rgba(245,241,232,0.16)",
          }}
        >
          <span className="caps-sm muted">ASKING</span>
          <span className="italic-num text-oxblood" style={{ fontSize: 22 }}>
            {displayPrice} 0G
          </span>
        </div>
      )}

      {/* Marketplace inline actions — only when there's a real on-chain listing */}
      {marketplace && onChainListed && (
        <div className="lot-marketplace-actions" onClick={stop}>
          <button
            className="lot-buy-btn"
            onClick={(e) => {
              e.stopPropagation();
              setSheetMode("buy");
            }}
          >
            Buy now →
          </button>
          <button
            className="lot-offer-btn"
            onClick={(e) => {
              e.stopPropagation();
              setSheetMode("offer");
            }}
          >
            Make offer
          </button>
        </div>
      )}

      <div className="lot-foot">
        <span className="view-link">View Lot →</span>
      </div>

      <InspectDrawer
        open={inspectOpen}
        onClose={() => setInspectOpen(false)}
        title={lot.ens}
        subtitle={`LOT ${lot.lot} · ERC-7857 iNFT on 0G Galileo (chainId 16602)`}
        groups={buildLotInspectGroups(lot)}
      />

      {sheetMode && (
        <MarketplaceActionSheet
          lot={lot}
          liveListing={liveListing}
          initialMode={sheetMode}
          open={true}
          onClose={() => setSheetMode(null)}
        />
      )}
    </div>
  );
}

function buildLotInspectGroups(lot: Lot): InspectGroup[] {
  const tokenId = Number.parseInt(lot.lot, 10);
  const hasTokenId = Number.isFinite(tokenId) && tokenId > 0;
  const isDemoToken = tokenId === Number(DEMO_TOKEN_ID);
  const subname = `${lot.ens.split(".")[0]}.${LEDGER_ENS_PARENT}`;

  const groups: InspectGroup[] = [
    {
      title: "ON-CHAIN IDENTITY (0G GALILEO)",
      rows: [
        {
          label: "WorkerINFT",
          value: WORKER_INFT_ADDRESS,
          href: galileoAddr(WORKER_INFT_ADDRESS),
          mono: true,
        },
        ...(hasTokenId
          ? [
              {
                label: "Token ID",
                value: String(tokenId),
                mono: true,
              },
              {
                label: "ownerOf(tokenId)",
                value: lot.owner,
                href: galileoAddr(lot.owner),
                mono: true,
              },
              ...(isDemoToken
                ? [
                    {
                      label: "Mint tx",
                      value: DEMO_MINT_TX,
                      href: galileoTx(DEMO_MINT_TX),
                      mono: true,
                    },
                    {
                      label: "Last transfer tx",
                      value: DEMO_TRANSFER_TX,
                      href: galileoTx(DEMO_TRANSFER_TX),
                      mono: true,
                    },
                  ]
                : []),
            ]
          : [
              {
                label: "Owner",
                value: lot.owner,
                mono: true,
              },
              {
                label: "Note",
                value:
                  "Token ID could not be derived from the live lot number.",
              },
            ]),
        {
          label: "TEE oracle",
          value: MOCK_TEE_ORACLE_ADDRESS,
          href: galileoAddr(MOCK_TEE_ORACLE_ADDRESS),
          mono: true,
        },
      ],
    },
    {
      title: "ENS — 5 CAPABILITY NAMESPACES",
      rows: [
        {
          label: "Parent",
          value: subname,
          href: ensSepoliaName(subname),
          mono: true,
        },
        {
          label: "who",
          value: `who.${subname}`,
          href: ensSepoliaName(`who.${subname}`),
          mono: true,
        },
        {
          label: "pay",
          value: `pay.${subname}`,
          href: ensSepoliaName(`pay.${subname}`),
          mono: true,
        },
        {
          label: "tx",
          value: `tx.${subname}`,
          href: ensSepoliaName(`tx.${subname}`),
          mono: true,
        },
        {
          label: "rep",
          value: `rep.${subname}`,
          href: ensSepoliaName(`rep.${subname}`),
          mono: true,
        },
        {
          label: "mem",
          value: `mem.${subname}`,
          href: ensSepoliaName(`mem.${subname}`),
          mono: true,
        },
        {
          label: "Resolution",
          value: "ENSIP-10 CCIP-Read · 30s TTL · cross-chain reads on Galileo",
        },
      ],
    },
    ...(isDemoToken
      ? [
          {
            title: "0G STORAGE & COMPUTE",
            rows: [
              {
                label: "Memory CID",
                value: DEMO_MEMORY_CID,
                href: ogStorageCid(DEMO_MEMORY_CID),
                mono: true,
                caption:
                  "Open the encrypted blob's tx on the 0G Storage explorer.",
              },
              {
                label: "Encryption",
                value:
                  "AES-256-CTR · client-side · re-keyed by TEE on transfer",
              },
              {
                label: "Last attestation digest",
                value: DEMO_ATTESTATION_DIGEST,
                mono: true,
              },
              {
                label: "Verify status",
                value: "broker.inference.verifyService → true",
                mono: true,
              },
            ],
          },
        ]
      : []),
    {
      title: "REPUTATION (ERC-8004 · BASE SEPOLIA)",
      rows: [
        {
          label: "Registry",
          value: ERC8004_REPUTATION_REGISTRY,
          href: baseSepoliaAddr(ERC8004_REPUTATION_REGISTRY),
          mono: true,
        },
        ...(hasTokenId
          ? [
              {
                label: "Feedback records",
                value: String(lot.jobs),
                caption:
                  lot.earnedNum > 0
                    ? "Live count from ERC-8004 getSummary."
                    : "Live count from ERC-8004 getSummary. Records were seeded for the demo (no escrow flow yet) — see /proof for the disclosure.",
              },
              { label: "Average rating", value: `${lot.rating} / 5.00` },
              {
                label: "Escrow earnings",
                value:
                  lot.earnedNum > 0
                    ? `${lot.earned} 0G`
                    : "0 0G — no escrow releases yet",
                caption:
                  "Sum of bidAmount over LedgerEscrow.PaymentReleased events where worker == ownerOf(tokenId). Independent of ERC-8004 feedback count.",
              },
            ]
          : [
              { label: "Feedback records", value: String(lot.jobs) },
              { label: "Average rating", value: `${lot.rating} / 5.00` },
              { label: "Escrow earnings", value: `${lot.earned} 0G` },
              {
                label: "Disclosure",
                value: "No live token ID could be derived for this lot.",
              },
            ]),
      ],
    },
  ];
  return groups;
}
