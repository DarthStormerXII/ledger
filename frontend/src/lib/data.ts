// Shared UI data shapes. Runtime app data comes from lib/live.ts only.

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
  // On-chain LedgerEscrow status — pure chain derivation, not brief content.
  // Title/description/category live in the pinned brief; status is what the
  // contract reports right now.
  status?: "Posted" | "Accepted" | "Released" | "Cancelled" | "Slashed";
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
