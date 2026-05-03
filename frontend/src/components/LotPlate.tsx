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
  DEMO_OWNER_B,
  DEMO_MEMORY_CID,
  DEMO_ATTESTATION_DIGEST,
  DEMO_MINT_TX,
  DEMO_TRANSFER_TX,
  DEMO_RELEASE_TX,
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
        {lot.jobs} JOBS · {lot.rating} ★ · {lot.earned} USDC EARNED
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
            {lot.askPrice} USDC
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

  // Lot 047 is the demo's hero worker. We map its on-chain receipts to the
  // live token #1 artefacts. Other lots show identity-only data and link to
  // /proof for the system-wide receipts.
  const isHero = lot.lot === "047";
  const tokenId = isHero ? Number(DEMO_TOKEN_ID) : null;
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
        ...(tokenId !== null
          ? [
              {
                label: "Token ID",
                value: String(tokenId),
                mono: true,
              },
              {
                label: "ownerOf(tokenId)",
                value: DEMO_OWNER_B,
                href: galileoAddr(DEMO_OWNER_B),
                mono: true,
              },
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
              {
                label: "Last release tx",
                value: DEMO_RELEASE_TX,
                href: galileoTx(DEMO_RELEASE_TX),
                mono: true,
              },
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
                  "This lot uses catalogue seed data. Full live token #1 receipts on /proof.",
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
    ...(isHero
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
        ...(isHero
          ? [
              { label: "agentId", value: "5444", mono: true },
              { label: "Job count", value: String(lot.jobs) },
              { label: "Average rating", value: `${lot.rating} / 5.00` },
              { label: "Total earned", value: `${lot.earned} USDC` },
              {
                label: "Disclosure",
                value:
                  "These ERC-8004 records were seeded for the demo. The registry read path is real — full disclosure on /proof.",
              },
            ]
          : [
              { label: "Job count", value: String(lot.jobs) },
              { label: "Average rating", value: `${lot.rating} / 5.00` },
              { label: "Total earned", value: `${lot.earned} USDC` },
              {
                label: "Disclosure",
                value:
                  "Catalogue seed data — not on-chain. Hero lot 047 has live receipts on /proof.",
              },
            ]),
      ],
    },
  ];
  return groups;
}
