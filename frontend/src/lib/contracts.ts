import type { Address } from "viem";

/* === Live deployed contracts (live testnet stack) === */

export const WORKER_INFT_ADDRESS: Address =
  (process.env.NEXT_PUBLIC_WORKER_INFT_ADDRESS as Address | undefined) ??
  "0x48B051F3e565E394ED8522ac453d87b3Fa40ad62";

export const LEDGER_ESCROW_ADDRESS: Address =
  (process.env.NEXT_PUBLIC_LEDGER_ESCROW_ADDRESS as Address | undefined) ??
  "0x12D2162F47AAAe1B0591e898648605daA186D644";

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
    | undefined) ?? "0xcfF2f12F0600CDcf1cebed43efF0A2F9a98ef531";

export const LEDGER_ENS_PARENT =
  process.env.NEXT_PUBLIC_LEDGER_ENS_PARENT ?? "ledger.eth";

export const LEDGER_ENS_GATEWAY_URL =
  process.env.NEXT_PUBLIC_LEDGER_ENS_GATEWAY_URL ??
  "https://9e04-124-123-105-119.ngrok-free.app/{sender}/{data}";

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
export const DEMO_RELEASE_TX =
  "0x03a76e46f84701ca745bdbbe6f7b590a48ee31d99ba0404d71ee1be19d43d68c";
export const DEMO_RESERVE_TX =
  "0xa3fecd88a663cf8bb5e6dc0515e87c7ebe6e6b9c441ea93dd524824c5695237b";
export const DEMO_TASK_ID =
  "0xffa92cfef48d8c4ec2432e2aa82a02b67a1a05a1a2a9f3977377faf2d1b8bb81";

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
  return `https://storagescan-galileo.0g.ai/file/${root}`;
}
