"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Lot } from "@/lib/data";
import { InspectDrawer, InspectPill, type InspectGroup } from "./InspectDrawer";
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
} from "@/lib/contracts";

export function LotPlate({
  lot,
  showPrice = false,
  onClick,
}: {
  lot: Lot;
  showPrice?: boolean;
  onClick?: () => void;
}) {
  const router = useRouter();
  const [inspectOpen, setInspectOpen] = useState(false);
  const handleClick =
    onClick ?? (() => router.push(`/agent/${encodeURIComponent(lot.ens)}`));
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
          {lot.listed && (
            <span
              className="caps-sm"
              style={{ color: "var(--ledger-oxblood)" }}
            >
              LISTED
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
        {lot.jobs} JOBS · {lot.rating} ★ · {lot.earned} 0G EARNED
      </div>
      {showPrice && lot.listed && lot.askPrice && (
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
            {lot.askPrice} 0G
          </span>
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
    </div>
  );
}

function buildLotInspectGroups(lot: Lot): InspectGroup[] {
  const galileoTx = (h: string) => `https://chainscan-galileo.0g.ai/tx/${h}`;
  const galileoAddr = (a: string) =>
    `https://chainscan-galileo.0g.ai/address/${a}`;

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
                value: "Token ID could not be derived from the live lot number.",
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
        { label: "who", value: `who.${subname}`, mono: true },
        { label: "pay", value: `pay.${subname}`, mono: true },
        { label: "tx", value: `tx.${subname}`, mono: true },
        { label: "rep", value: `rep.${subname}`, mono: true },
        { label: "mem", value: `mem.${subname}`, mono: true },
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
                mono: true,
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
          href: `https://sepolia.basescan.org/address/${ERC8004_REPUTATION_REGISTRY}`,
          mono: true,
        },
        ...(hasTokenId
          ? [
              { label: "Job count", value: String(lot.jobs) },
              { label: "Average rating", value: `${lot.rating} / 5.00` },
              { label: "Total earned", value: `${lot.earned} 0G` },
              {
                label: "Disclosure",
                value:
                  "ERC-8004 values are read through the live registry path. Demo reputation records are seeded and disclosed on /proof.",
              },
            ]
          : [
              { label: "Job count", value: String(lot.jobs) },
              { label: "Average rating", value: `${lot.rating} / 5.00` },
              { label: "Total earned", value: `${lot.earned} 0G` },
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
