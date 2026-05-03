import type { Address } from "viem";

/* === Live deployed contracts (live testnet stack) === */

export const WORKER_INFT_ADDRESS: Address =
  (process.env.NEXT_PUBLIC_WORKER_INFT_ADDRESS as Address | undefined) ??
  "0xd4d74E089DD9A09FF768be95d732081bd542E498";

export const LEDGER_ESCROW_ADDRESS: Address =
  (process.env.NEXT_PUBLIC_LEDGER_ESCROW_ADDRESS as Address | undefined) ??
  "0x83dF0Ed0b4f3D1D057cB56494b8c7eE417265489";

export const LEDGER_IDENTITY_REGISTRY_ADDRESS: Address =
  (process.env.NEXT_PUBLIC_LEDGER_IDENTITY_REGISTRY_ADDRESS as
    | Address
    | undefined) ?? "0x9581490E530Da772Af332EBCe3f35D27d5e8377F";

export const MOCK_TEE_ORACLE_ADDRESS: Address =
  (process.env.NEXT_PUBLIC_MOCK_TEE_ORACLE_ADDRESS as Address | undefined) ??
  "0x306919805Eed1aD4772d92e18d00A1c132b07C19";

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
// 0G Storage flow contract (every Submission event lands here)
export const ZEROG_STORAGE_FLOW_CONTRACT: Address =
  "0x22e03a6a89b950f1c82ec5e74f8eca321a105296";
// Sequential submission index emitted by the storage flow contract on
// upload — decoded from the Submission event in the demo's upload tx
// (0xc6cd5ca5…20eb5ca, log[0] data first uint256 = 0x1193b = 71995).
// This is what storagescan's /submission/<id> page renders.
export const DEMO_STORAGE_SUBMISSION_INDEX = 71995;
export const DEMO_ATTESTATION_DIGEST =
  "0x59c79e5a43357945f442a2417cd7aabf2c74b19708dc97e839ec08e1ae223950";
export const DEMO_TRANSFER_TX =
  "0xe4d697d7b8dd7c3cb01fa28544a03aecd4cd6f2f1c019c26d2219c828398e9fd";
export const DEMO_MINT_TX =
  "0x26b7de55c33f7f82730ea333b509706c1092797c65c5360d1ad5ae0027c17c96";
export const DEMO_ESCROW_DEPLOY_TX =
  "0x85140cba84b7c5bc152ded0ab046f805a82d1ffcd9b2fd2c7cbaa2ecc54db21";
export const DEMO_POST_TASK_TX =
  "0x4b36766cd44b05bbc95ebfaf188ec3cac57a8d81b3246f51526f487eb9d4007c";
export const DEMO_ACCEPT_TOKEN_BID_TX =
  "0x57f35f717ff8e73e2e309f9e9131f68399bad823cc773bf7e123cde8b0335c02";
export const DEMO_RELEASE_TX =
  "0x7f7ff8061ba4a68b6963d27abefa601fbde8d9474e8dadd8207d138fc6e1a3e2";
export const DEMO_RESULT_HASH =
  "0xf8d3ef6a9f1c1d8242101d18b891675e37eef6670eda143971bf69b4d4ce9fb4";
export const DEMO_RESERVE_TX =
  "0xa3fecd88a663cf8bb5e6dc0515e87c7ebe6e6b9c441ea93dd524824c5695237b";
export const DEMO_TASK_ID =
  "0x005ecb1bf6cd06a9d1c7240ab1365aebedbe8104d1b530a892fd0af228c1e604";

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
/**
 * Browseable explorer URL for an `0g://...` Memory CID.
 *
 * 0G Storage CIDs are Merkle roots, NOT tx hashes — chainscan/storagescan
 * `/tx/<root>` 404s, and the indexer's `/file?root=...` endpoint returns
 * the raw encrypted blob bytes (which a browser auto-downloads as
 * unrenderable binary — bad UX).
 *
 * The storage flow contract emits a sequential `submissionIndex` on every
 * upload, and storagescan-galileo's `/submission/<index>` page renders a
 * proper UI for that submission. So we map root → submissionIndex when
 * known, and fall back to the storage flow contract's address page for
 * unknown roots (browseable list of all submissions, still useful).
 *
 * Indexes are only known for the demo blob today; future iNFTs minted via
 * /register would need an indexer that records `submissionIndex` at upload
 * time. Adding that is a follow-up.
 */
export function ogStorageCid(cid: string) {
  const root = cid.replace(/^0g:\/\//, "");
  if (
    root.toLowerCase() === DEMO_MEMORY_CID.replace(/^0g:\/\//, "").toLowerCase()
  ) {
    return `https://storagescan-galileo.0g.ai/submission/${DEMO_STORAGE_SUBMISSION_INDEX}`;
  }
  return `https://storagescan-galileo.0g.ai/address/${ZEROG_STORAGE_FLOW_CONTRACT}`;
}

/**
 * Lower-level helper for callers who specifically want the raw encrypted
 * blob bytes (e.g. a verify-roundtrip script, or a "download" affordance).
 * Returns the indexer URL — clicking this in a browser will auto-download
 * the binary, so prefer ogStorageCid() for any user-facing link.
 */
export function ogStorageRawBlob(cid: string) {
  const root = cid.replace(/^0g:\/\//, "");
  return `https://indexer-storage-testnet-turbo.0g.ai/file?root=${root}`;
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
