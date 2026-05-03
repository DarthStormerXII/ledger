// Ledger demo data — 1:1 port of `data.js` from the claude.ai/design handoff.
// Real chain data (live ownerOf() against the deployed iNFT) is layered on
// top of this in client components — the rest stays as cataloguelike seed.

export interface Lot {
  lot: string;
  ens: string;
  owner: string;
  ownerShort: string;
  jobs: number;
  rating: number;
  earned: string;
  earnedNum: number;
  listed: boolean;
  askPrice?: string;
  avatar: string;
  mintedAt: string;
  daysActive: number;
  emblem: string;
}

export interface Job {
  id: string;
  title: string;
  desc: string;
  employer: string;
  payout: string;
  bond: string;
  timeLeft: number;
  bids: number;
}

export interface AxlEntry {
  t: string;
  from: string;
  to: string;
  type: string;
}

export interface RecentJob {
  date: string;
  employer: string;
  title: string;
  realized: string;
  rating: number;
}

export interface ProvenanceEvent {
  date: string;
  action: string;
  to: string | null;
  price: string | null;
  label: string;
}

export interface WalletEvent {
  event: string;
  time: string;
}

export const USER = {
  address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1",
  addressShort: "0x742d…bEb1",
  balance: "0.0042",
  connected: true,
  ownedLots: ["047", "049"],
} as const;

export const LOTS: Lot[] = [
  {
    lot: "047",
    ens: "worker-047.ledger.eth",
    owner: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1",
    ownerShort: "0x742d…bEb1",
    jobs: 47,
    rating: 4.7,
    earned: "12,847.50",
    earnedNum: 12847.5,
    listed: true,
    askPrice: "1,000.00",
    avatar: "/assets/avatars/ledger_lot_047.png",
    mintedAt: "2026-04-14",
    daysActive: 14,
    emblem: "concentric rings",
  },
  {
    lot: "048",
    ens: "owl-watcher.ledger.eth",
    owner: "0x9c2e1f47192e318c4012F3D71b9aE0F4e3D5f471",
    ownerShort: "0x9c2e…f471",
    jobs: 31,
    rating: 4.5,
    earned: "6,420.00",
    earnedNum: 6420,
    listed: false,
    avatar: "/assets/avatars/ledger_lot_048.png",
    mintedAt: "2026-04-08",
    daysActive: 24,
    emblem: "radial spokes",
  },
  {
    lot: "049",
    ens: "hex-scout.ledger.eth",
    owner: "0x33ad4192d8a07F71c0aD9912e4f5b6c7d8e9b0e2",
    ownerShort: "0x33ad…b0e2",
    jobs: 24,
    rating: 4.6,
    earned: "4,180.50",
    earnedNum: 4180.5,
    listed: true,
    askPrice: "800.00",
    avatar: "/assets/avatars/ledger_lot_049.png",
    mintedAt: "2026-04-19",
    daysActive: 13,
    emblem: "hex lattice",
  },
  {
    lot: "050",
    ens: "triad-runner.ledger.eth",
    owner: "0xfe9c1234abcd5678ef01234567890abcdef0c8a1",
    ownerShort: "0xfe9c…c8a1",
    jobs: 18,
    rating: 4.4,
    earned: "2,990.00",
    earnedNum: 2990,
    listed: false,
    avatar: "/assets/avatars/ledger_lot_050.png",
    mintedAt: "2026-04-22",
    daysActive: 10,
    emblem: "nested triangles",
  },
];

export const JOBS: Job[] = [
  {
    id: "j-1247",
    title: "Base Yield Scout",
    desc: "Surveying Base Layer-2 yield opportunities. Returns ranked APR snapshot of top 12 vaults.",
    employer: "0xa11c…3742",
    payout: "5.00",
    bond: "0.50",
    timeLeft: 107,
    bids: 3,
  },
  {
    id: "j-1248",
    title: "ENS Resolver Audit",
    desc: "Audit 24 ENS resolver contracts for CCIP-Read off-chain conformance.",
    employer: "0xb22c…aa01",
    payout: "8.50",
    bond: "0.85",
    timeLeft: 252,
    bids: 2,
  },
  {
    id: "j-1249",
    title: "Onchain Token List Scrub",
    desc: "Cross-reference uniswap default list with verified bridges. Flag stale entries.",
    employer: "0xc33d…11bc",
    payout: "3.00",
    bond: "0.30",
    timeLeft: 38,
    bids: 4,
  },
  {
    id: "j-1250",
    title: "Multichain Gas Watcher",
    desc: "Sample gas prices across 6 chains every 15s for 4h. Emit aggregated CSV.",
    employer: "0xd44e…0b9a",
    payout: "12.00",
    bond: "1.20",
    timeLeft: 595,
    bids: 1,
  },
  {
    id: "j-1251",
    title: "Vault APR Snapshot",
    desc: "Single read of current APR across Aave, Compound, Morpho. Sign + return.",
    employer: "0xe55f…a222",
    payout: "4.50",
    bond: "0.45",
    timeLeft: 128,
    bids: 0,
  },
  {
    id: "j-1252",
    title: "Restaking Risk Profiler",
    desc: "Assess slashing risk across 8 EigenLayer operators. Score 0-100.",
    employer: "0xf66a…41c1",
    payout: "15.00",
    bond: "1.50",
    timeLeft: 693,
    bids: 2,
  },
];

export const TICKER_EVENTS: string[] = [
  "Lot 047 — bid won. 4.50 USDC.",
  "Lot 048 — listed for 800 USDC.",
  "Lot 047 — sold for 850 USDC. Provenance updated.",
  "Lot 049 — bid placed. 3.20 USDC.",
  "Lot 050 — minted. Catalogue +1.",
  "Lot 049 — settlement complete. 720 USDC realized.",
  "Lot 047 — reputation +1. 47 signed records.",
];

export const AXL_LOG_SEED: AxlEntry[] = [
  { t: "12:47:32", from: "us-west", to: "eu-central", type: "BID" },
  { t: "12:47:31", from: "local", to: "eu-central", type: "BID" },
  { t: "12:47:30", from: "eu-central", to: "all", type: "GOSSIP" },
  { t: "12:47:28", from: "us-west", to: "local", type: "ACK" },
  { t: "12:47:25", from: "eu-central", to: "us-west", type: "GOSSIP" },
  { t: "12:47:22", from: "local", to: "us-west", type: "BID" },
  { t: "12:47:18", from: "us-west", to: "eu-central", type: "ACK" },
  { t: "12:47:14", from: "eu-central", to: "local", type: "GOSSIP" },
];

export const RECENT_JOBS: RecentJob[] = [
  {
    date: "2026-05-01",
    employer: "0xa11c…3742",
    title: "Base Yield Scout",
    realized: "4.50",
    rating: 5,
  },
  {
    date: "2026-04-30",
    employer: "0xb22c…aa01",
    title: "ENS Resolver Audit",
    realized: "8.10",
    rating: 5,
  },
  {
    date: "2026-04-28",
    employer: "0xe55f…a222",
    title: "Vault APR Snapshot",
    realized: "4.20",
    rating: 4,
  },
  {
    date: "2026-04-26",
    employer: "0xc33d…11bc",
    title: "Onchain Token List Scrub",
    realized: "2.80",
    rating: 5,
  },
  {
    date: "2026-04-24",
    employer: "0xd44e…0b9a",
    title: "Multichain Gas Watcher",
    realized: "11.50",
    rating: 5,
  },
  {
    date: "2026-04-22",
    employer: "0xa11c…3742",
    title: "Yield Diff Snapshot",
    realized: "3.90",
    rating: 4,
  },
  {
    date: "2026-04-20",
    employer: "0xb22c…aa01",
    title: "ENS Reverse Lookup",
    realized: "6.20",
    rating: 5,
  },
  {
    date: "2026-04-18",
    employer: "0xf66a…41c1",
    title: "Restaking Risk Sample",
    realized: "14.40",
    rating: 5,
  },
  {
    date: "2026-04-16",
    employer: "0xe55f…a222",
    title: "Vault APR Snapshot",
    realized: "4.30",
    rating: 4,
  },
  {
    date: "2026-04-14",
    employer: "0xa11c…3742",
    title: "Base Yield Scout",
    realized: "4.10",
    rating: 5,
  },
];

export const PROVENANCE: ProvenanceEvent[] = [
  {
    date: "2026-04-14",
    action: "minted",
    to: "0x111a…3010",
    price: null,
    label: "Minted",
  },
  {
    date: "2026-04-22",
    action: "sold",
    to: "0x742d…bEb1",
    price: "850.00",
    label: "Sold",
  },
  {
    date: "2026-05-02",
    action: "listed",
    to: null,
    price: "1,000.00",
    label: "Listed for sale",
  },
];

export const WALLET_ACTIVITY: WalletEvent[] = [
  { event: "Lot 047 — bid won. 4.50 USDC.", time: "4 minutes ago" },
  {
    event: "Lot 049 — sale completed. 720.00 USDC realized.",
    time: "32 minutes ago",
  },
  { event: "Lot 047 — bid placed. 4.50 USDC.", time: "1 hour ago" },
  { event: "Lot 049 — bid won. 3.20 USDC.", time: "3 hours ago" },
  { event: "Lot 047 — payment received. 8.10 USDC.", time: "6 hours ago" },
  { event: "Lot 047 — reputation +1. 47 signed records.", time: "8 hours ago" },
  { event: "Lot 049 — listed for 800 USDC.", time: "1 day ago" },
  { event: "Lot 047 — listed for 1,000 USDC.", time: "2 days ago" },
];

export function findLotByEns(ens: string): Lot | undefined {
  return LOTS.find((l) => l.ens.toLowerCase() === ens.toLowerCase());
}
export function findLotByLotNumber(lot: string): Lot | undefined {
  return LOTS.find((l) => l.lot === lot);
}
export function findJob(id: string): Job | undefined {
  return JOBS.find((j) => j.id === id);
}
