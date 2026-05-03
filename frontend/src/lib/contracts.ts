import type { Address } from "viem";

/* === Live deployed contracts (live testnet stack) === */

export const WORKER_INFT_ADDRESS: Address =
  (process.env.NEXT_PUBLIC_WORKER_INFT_ADDRESS as Address | undefined) ??
  "0x48B051F3e565E394ED8522ac453d87b3Fa40ad62";

export const LEDGER_ESCROW_ADDRESS: Address =
  (process.env.NEXT_PUBLIC_LEDGER_ESCROW_ADDRESS as Address | undefined) ??
  "0xCAe1c804932AB07d3428774058eC14Fb4dfb2baB";

export const LEDGER_IDENTITY_REGISTRY_ADDRESS: Address =
  (process.env.NEXT_PUBLIC_LEDGER_IDENTITY_REGISTRY_ADDRESS as
    | Address
    | undefined) ?? "0xa6a621e9C92fb8DFC963d2C20e8C5CB4C5178cBb";

export const MOCK_TEE_ORACLE_ADDRESS: Address =
  (process.env.NEXT_PUBLIC_MOCK_TEE_ORACLE_ADDRESS as Address | undefined) ??
  "0x229869949693f1467b8b43d2907bDAE3C58E3047";

export const ERC8004_REPUTATION_REGISTRY: Address =
  (process.env.NEXT_PUBLIC_ERC8004_REPUTATION_REGISTRY as
    | Address
    | undefined) ?? "0x8004B663056A597Dffe9eCcC1965A193B7388713";

export const LEDGER_ENS_RESOLVER_CONTRACT: Address =
  (process.env.NEXT_PUBLIC_LEDGER_ENS_RESOLVER_CONTRACT as
    | Address
    | undefined) ?? "0xd94cC429058E5495a57953c7896661542648E1B3";

export const LEDGER_ENS_PARENT =
  process.env.NEXT_PUBLIC_LEDGER_ENS_PARENT ?? "ledger.eth";

export const LEDGER_ENS_GATEWAY_URL =
  process.env.NEXT_PUBLIC_LEDGER_ENS_GATEWAY_URL ??
  "https://resolver.fierypools.fun/{sender}/{data}";

/* === Demo state pinned to live transfer artefacts (0g-proof.md) === */

export const DEMO_TOKEN_ID = 1n;
export const DEMO_OWNER_A: Address =
  "0x6B9ad963c764a06A7ef8ff96D38D0cB86575eC00";
export const DEMO_OWNER_B: Address =
  "0x6641221B1cb66Dc9f890350058A7341eF0eD600b";
export const DEMO_MEMORY_CID =
  "0g://0xd8fb3ad312ca5e9002f7bdd47d93839b9a6dcd83d396bb74a44a9f65344982c4";
export const DEMO_ATTESTATION_DIGEST =
  "0x59c79e5a43357945f442a2417cd7aabf2c74b19708dc97e839ec08e1ae223950";
export const DEMO_TRANSFER_TX =
  "0x3e6b0e4f27ee0796460407d084d9bc99f94a033f5b18073291af5899a8053a79";
export const DEMO_MINT_TX =
  "0xc41cebd48d86382bba75d08fa514da2e151924c3f03dd7d2652992c693bd001f";
export const DEMO_ESCROW_DEPLOY_TX =
  "0x8189e5a075ce73092abc1c654f95572d39928ea8c358f8a1ce983b39f597fb99";
export const DEMO_POST_TASK_TX =
  "0x01111fa6852b084f96e514475ee99950be7f909e58174308e3c366229dc49cfe";
export const DEMO_ACCEPT_TOKEN_BID_TX =
  "0x327e0bffc45ee801a6676b69e85e5fd1cf83e9cc9e2ec9fc75e3d35f15f570cb";
export const DEMO_RELEASE_TX =
  "0xe91e0b52dd0ba6095794f33cb77a9027c3cc97d78170f940d47b348fc1f8a95d";
export const DEMO_RESULT_HASH =
  "0xf8d3ef6a9f1c1d8242101d18b891675e37eef6670eda143971bf69b4d4ce9fb4";
export const DEMO_RESERVE_TX =
  "0xa3fecd88a663cf8bb5e6dc0515e87c7ebe6e6b9c441ea93dd524824c5695237b";
export const DEMO_TASK_ID =
  "0x44ed5f980b1b92cde2970f38708dd17f0aaf31f814f3b2328badd2dc8dc2c7ae";

export const DEMO_PAY_NONCE_0: Address =
  "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC";
export const DEMO_PAY_NONCE_1: Address =
  "0x90F79bf6EB2c4f870365E785982E1f101E93b906";

/* === Minimal ABIs (only the read methods the UI uses) === */

export const WORKER_INFT_ABI = [
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "ownerOf",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "nextTokenId",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "getMetadata",
    outputs: [
      {
        components: [
          { internalType: "string", name: "agentName", type: "string" },
          { internalType: "bytes", name: "sealedKey", type: "bytes" },
          { internalType: "string", name: "memoryCID", type: "string" },
          {
            internalType: "string",
            name: "initialReputationRef",
            type: "string",
          },
          { internalType: "uint64", name: "updatedAt", type: "uint64" },
        ],
        internalType: "struct WorkerINFT.AgentMetadata",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

export const LEDGER_ESCROW_ABI = [
  {
    inputs: [{ internalType: "bytes32", name: "taskId", type: "bytes32" }],
    name: "tasks",
    outputs: [
      { internalType: "address", name: "buyer", type: "address" },
      { internalType: "address", name: "worker", type: "address" },
      { internalType: "uint256", name: "payment", type: "uint256" },
      { internalType: "uint256", name: "deadline", type: "uint256" },
      { internalType: "uint256", name: "minReputation", type: "uint256" },
      { internalType: "uint256", name: "bidAmount", type: "uint256" },
      { internalType: "uint256", name: "bondAmount", type: "uint256" },
      { internalType: "bytes32", name: "resultHash", type: "bytes32" },
      { internalType: "uint8", name: "status", type: "uint8" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes32", name: "taskId", type: "bytes32" },
      { internalType: "uint256", name: "payment", type: "uint256" },
      { internalType: "uint256", name: "deadline", type: "uint256" },
      { internalType: "uint256", name: "minReputation", type: "uint256" },
    ],
    name: "postTask",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes32", name: "taskId", type: "bytes32" },
      { internalType: "uint256", name: "workerTokenId", type: "uint256" },
      { internalType: "uint256", name: "bidAmount", type: "uint256" },
      { internalType: "uint256", name: "bondAmount", type: "uint256" },
    ],
    name: "acceptTokenBid",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes32", name: "taskId", type: "bytes32" }],
    name: "payoutRecipient",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    name: "taskWorkerTokenIds",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "taskId",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "buyer",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "payment",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "deadline",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "minReputation",
        type: "uint256",
      },
    ],
    name: "TaskPosted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "taskId",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "WorkerTokenAttached",
    type: "event",
  },
] as const;

/* === Block explorers === */

export function galileoTx(tx: string) {
  return `https://chainscan-galileo.0g.ai/tx/${tx}`;
}
export function galileoAddr(addr: string) {
  return `https://chainscan-galileo.0g.ai/address/${addr}`;
}
export function baseSepoliaTx(tx: string) {
  return `https://sepolia.basescan.org/tx/${tx}`;
}
export function baseSepoliaAddr(addr: string) {
  return `https://sepolia.basescan.org/address/${addr}`;
}
export function sepoliaTx(tx: string) {
  return `https://sepolia.etherscan.io/tx/${tx}`;
}
export function sepoliaAddr(addr: string) {
  return `https://sepolia.etherscan.io/address/${addr}`;
}
export function ogStorageCid(cid: string) {
  const root = cid.replace(/^0g:\/\//, "");
  // The official 0G storage explorer addresses the upload by its tx hash on
  // the storage flow contract. The "root" portion of an `0g://...` URI is
  // the storage transaction hash, so /tx/<root> is the canonical view.
  return `https://storagescan-galileo.0g.ai/tx/${root}`;
}

/* === ENS app explorer (Sepolia testnet) === */
// Name → human-readable record viewer on the official ENS app.
// Example: ensSepoliaName("worker-001.ledger.eth")
export function ensSepoliaName(name: string) {
  return `https://sepolia.app.ens.domains/${encodeURIComponent(name)}`;
}
// Address-based view for parents owners or registrants.
export function ensSepoliaAddress(address: string) {
  return `https://sepolia.app.ens.domains/address/${address}`;
}

/* === Gensyn AXL verification surfaces === */
// Source repo for the Go node that runs on every AXL peer.
export const GENSYN_AXL_REPO = "https://github.com/gensyn-ai/axl";
// Live cloudflared tunnel that exposes our M2 node's HTTP bridge — judges can
// curl /topology to read the live mesh state.
export const LEDGER_AXL_BRIDGE = "https://axl.fierypools.fun";
export function ledgerAxlTopology() {
  return `${LEDGER_AXL_BRIDGE}/topology`;
}
// Hosted bootstrap + worker nodes on Fly.io (the proof file references these).
export const FLY_BOOTSTRAP_APP = "https://fly.io/apps/ledger-axl-usw-180526";
export const FLY_WORKER_APP = "https://fly.io/apps/ledger-axl-euc-180526";

/* === 0G ecosystem references === */
// ERC-7857 iNFT draft spec — the standard our WorkerINFT implements.
export const ERC7857_DRAFT = "https://github.com/0glabs/0g-agent-nft";
// Galileo testnet docs / chain reference.
export const GALILEO_TESTNET_DOCS =
  "https://docs.0g.ai/developer-hub/testnet/testnet-overview";

/* === ERC-8004 reference === */
export const ERC8004_SPEC = "https://eips.ethereum.org/EIPS/eip-8004";
