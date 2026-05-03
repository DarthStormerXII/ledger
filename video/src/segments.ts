export type DemoSegment = {
  id: string;
  title: string;
  start: number;
  end: number;
  visual: string;
};

export const segments: DemoSegment[] = [
  {
    id: 'cinematic-open',
    title: 'Cinematic Open',
    start: 0,
    end: 9,
    visual: 'Higgsfield network / earth / data-trails opening',
  },
  {
    id: 'thesis-one',
    title: 'Thesis: Market Gap',
    start: 10,
    end: 22,
    visual: 'Stat cards: 21K+ agents, 100M+ payments',
  },
  {
    id: 'thesis-two',
    title: 'Thesis: Ledger',
    start: 22,
    end: 28,
    visual: 'Ledger title card',
  },
  {
    id: 'worker-one',
    title: 'Worker: Not A Profile',
    start: 29,
    end: 41,
    visual: 'Buyer posts work, then worker profile appears',
  },
  {
    id: 'worker-two',
    title: 'Worker: ERC-7857 iNFT',
    start: 41,
    end: 64,
    visual: '0G iNFT, token id, memory CID, attestation proof',
  },
  {
    id: 'worker-three',
    title: 'Worker: ERC-8004 Reputation',
    start: 64,
    end: 85,
    visual: 'Worker reputation card: 47 jobs, 4.7 rating',
  },
  {
    id: 'ens-one',
    title: 'ENS Capability Identity',
    start: 86,
    end: 105,
    visual: 'worker-001.ledger.eth capability tree',
  },
  {
    id: 'ens-two',
    title: 'ENS State Change',
    start: 105,
    end: 117.19,
    visual: 'Capability tree holds while values refresh, then labor market transition',
  },
  {
    id: 'market-pause',
    title: 'Market Beat',
    start: 117.19,
    end: 118.19,
    visual: 'One-second silent beat before the market mechanics begin',
  },
  {
    id: 'market-one',
    title: 'Market Mechanics',
    start: 118.19,
    end: 136,
    visual: 'Auction room: task broadcast, worker bids, winner chosen',
  },
  {
    id: 'market-two',
    title: 'Gensyn AXL Proof',
    start: 136,
    end: 136.01,
    visual: 'AXL topology / message log proof',
  },
  {
    id: 'inheritance-one',
    title: 'Inheritance Setup',
    start: 136,
    end: 142,
    visual: 'Worker transfer flow begins',
  },
  {
    id: 'inheritance-two',
    title: 'Inheritance Main Line',
    start: 142,
    end: 146,
    visual: 'Same worker profile before / after owner',
  },
  {
    id: 'inheritance-three',
    title: 'ENS Owner Flip',
    start: 147,
    end: 166,
    visual: 'who.worker-001.ledger.eth resolves before and after transfer',
  },
  {
    id: 'inheritance-four',
    title: 'Earnings Become Ownable',
    start: 166,
    end: 175,
    visual: 'Escrow payment routes to the new owner',
  },
  {
    id: 'sponsor-proofs',
    title: 'Sponsor Proof Callouts',
    start: 176,
    end: 201,
    visual: '0G, ERC-8004, ENS, and Gensyn AXL proof cards',
  },
  {
    id: 'closing',
    title: 'Closing',
    start: 201,
    end: 211,
    visual: 'Higgsfield handoff shot, then Ledger end card',
  },
];
