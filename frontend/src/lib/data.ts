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
  /** Display-shortened buyer address (e.g. "0x6B9a…eC00"). USE FOR DISPLAY ONLY. */
  employer: string;
  /** Full unshortened buyer address. USE for href / explorer links. */
  buyerAddress?: string;
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
  // Optional — links the row back to the auction-room page when set.
  taskId?: string;
  // Optional — explorer link for the row (release tx if settled, posted tx
  // if still in progress).
  txHash?: string;
  status?: "Posted" | "Accepted" | "Released" | "Cancelled" | "Slashed";
}

export interface ProvenanceEvent {
  date: string;
  action: string;
  to: string | null;
  price: string | null;
  label: string;
  // Optional — explorer link for the row (mint / transfer / release tx).
  txHash?: string;
}

export interface WalletEvent {
  event: string;
  time: string;
}
