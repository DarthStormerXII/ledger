import { Contract, HDNodeWallet, JsonRpcProvider, getAddress } from "ethers";
import { parseLedgerName, type ParsedName } from "./dns.js";
import type {
  ReputationSummary,
  ResolverConfig,
  TxReceiptRecord,
} from "./config.js";

const WORKER_INFT_ABI = [
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function getMemoryPointer(uint256 tokenId) view returns (string)",
  "function getMetadata(uint256 tokenId) view returns ((string agentName, bytes sealedKey, string memoryCID, string initialReputationRef, uint64 updatedAt))",
];

const payCounters = new Map<string, bigint>();
const lastPayResolutions = new Map<string, PayResolution>();

export type ResolutionKind = "addr" | "text";
type PayResolution = {
  address: string;
  nonce: bigint;
  path: string;
  masterPubkey: string;
};

export async function resolveName(
  name: string,
  kind: ResolutionKind,
  config: ResolverConfig,
  textKey?: string,
): Promise<string> {
  if (name.toLowerCase() === config.parentName && kind === "text") {
    return resolveParentText(textKey, config);
  }

  const parsed = parseLedgerName(name, config.parentName);

  if (kind === "addr") {
    // Worker root (`worker-NNN.<parent>`) and `who.*` both resolve to the
    // current iNFT owner. This makes the ENS app surface a real Address
    // record for the worker root, matching chase.uni.eth's UX.
    if (parsed.namespace === "root" || parsed.namespace === "who") {
      return resolveWho(parsed.tokenId, config);
    }
    if (parsed.namespace === "pay") {
      return resolvePay(parsed.workerLabel, parsed.tokenId, config).address;
    }
    throw new Error(`${parsed.namespace} addr resolution is not supported`);
  }

  if (kind === "text") {
    return resolveText(parsed, textKey, config);
  }

  throw new Error(`Unsupported resolution kind ${kind}`);
}

function resolveParentText(
  key: string | undefined,
  config: ResolverConfig,
): string {
  if (!key) return "";
  if (key === "agent-registration" || key.startsWith("agent-registration[")) {
    return config.agentRegistrationValue;
  }
  if (key === "ai.ledger.registry") {
    return config.reputationRegistryAddress;
  }
  return "";
}

export async function resolveWho(
  tokenId: bigint,
  config: ResolverConfig,
): Promise<string> {
  if (config.mockOwnerAddress) {
    return config.mockOwnerAddress;
  }
  if (!config.workerInftAddress) {
    throw new Error(
      "WORKER_INFT_ADDRESS is required for live who.* resolution",
    );
  }

  const provider = new JsonRpcProvider(config.ogRpcUrl, config.ogChainId);
  const contract = new Contract(
    config.workerInftAddress,
    WORKER_INFT_ABI,
    provider,
  );
  const owner = (await contract.ownerOf(tokenId)) as string;
  return getAddress(owner);
}

export function resolvePay(
  workerLabel: string,
  tokenId: bigint,
  config: ResolverConfig,
): PayResolution {
  const account = getPayAccount(config);
  const nonce = nextPayNonce(workerLabel);
  void tokenId;
  const path = `0/${nonce.toString()}`;
  const child = account.derivePath(path);

  const resolution = {
    address: child.address,
    nonce,
    path,
    masterPubkey: account.neuter().extendedKey,
  };
  lastPayResolutions.set(workerLabel, resolution);
  return resolution;
}

export async function resolveMemoryPointer(
  workerLabel: string,
  tokenId: bigint,
  config: ResolverConfig,
): Promise<string> {
  const configured =
    config.memoryPointers[workerLabel] ??
    config.memoryPointers[tokenId.toString()];
  if (configured) {
    return configured;
  }
  if (!config.workerInftAddress) {
    return "";
  }

  const provider = new JsonRpcProvider(config.ogRpcUrl, config.ogChainId);
  const contract = new Contract(
    config.workerInftAddress,
    WORKER_INFT_ABI,
    provider,
  );
  try {
    const metadata = (await contract.getMetadata(tokenId)) as {
      memoryCID?: string;
    };
    if (metadata.memoryCID) return metadata.memoryCID;
  } catch {
    // Older WorkerINFT variants exposed getMemoryPointer directly.
  }
  return (await contract.getMemoryPointer(tokenId)) as string;
}

async function resolveText(
  parsed: ParsedName,
  key: string | undefined,
  config: ResolverConfig,
): Promise<string> {
  if (!key) return "";

  if (parsed.namespace === "root") {
    // Standard ENS keys the ENS app probes — return values so the Profile
    // tab is populated for the worker root in the explorer.
    if (key === "description") {
      return `Ledger worker iNFT (tokenId ${parsed.tokenId.toString()}). Capabilities at who/pay/tx/rep/mem.${parsed.workerLabel}.${parsed.parentName}.`;
    }
    if (key === "url") {
      return `https://ledger-open-agents.vercel.app/agent/${parsed.workerLabel}.${parsed.parentName}`;
    }
    if (key === "name") {
      return `${parsed.workerLabel}.${parsed.parentName}`;
    }
    if (key === "notice") {
      return "ENSIP-10 wildcard + CCIP-Read. Live ownerOf() on 0G Galileo. See ai.ledger.* keys for capability resolvers.";
    }
    if (key === "ai.ledger.namespace") {
      return `root: live 0G Galileo WorkerINFT.ownerOf(${parsed.tokenId.toString()}), chainId=${config.ogChainId}`;
    }
    if (key === "ai.ledger.tokenId") {
      return parsed.tokenId.toString();
    }
    if (key === "ai.ledger.capabilities") {
      const base = `${parsed.workerLabel}.${parsed.parentName}`;
      return `who.${base},pay.${base},tx.<txid>.${base},rep.${base},mem.${base}`;
    }
    if (key === "ai.ledger.registry") {
      return config.reputationRegistryAddress;
    }
    return "";
  }

  // Standard ENS keys that the ENS app's Profile tab probes for every name.
  // Returning values here makes who.* / pay.* / rep.* / mem.* render with
  // real content in the explorer, not "0 records".
  if (
    parsed.namespace === "who" ||
    parsed.namespace === "pay" ||
    parsed.namespace === "rep" ||
    parsed.namespace === "mem"
  ) {
    const standard = standardTextForNamespace(
      parsed.namespace,
      parsed.workerLabel,
      parsed.tokenId,
      parsed.parentName,
      key,
    );
    if (standard !== null) return standard;
  }

  if (parsed.namespace === "who") {
    if (key === "ai.ledger.namespace") {
      return `who: live 0G Galileo WorkerINFT.ownerOf(tokenId), chainId=${config.ogChainId}`;
    }
    return "";
  }

  if (parsed.namespace === "pay") {
    return resolvePayText(key, parsed.workerLabel, parsed.tokenId, config);
  }

  if (parsed.namespace === "tx") {
    return resolveTxText(key, resolveTxReceipt(parsed.txId, config));
  }

  if (parsed.namespace === "rep") {
    return resolveRepText(
      key,
      resolveRepSummary(parsed.workerLabel, parsed.tokenId, config),
    );
  }

  if (parsed.namespace === "mem") {
    return resolveMemText(
      key,
      await resolveMemoryPointer(parsed.workerLabel, parsed.tokenId, config),
    );
  }

  return "";
}

function standardTextForNamespace(
  namespace: "who" | "pay" | "rep" | "mem",
  workerLabel: string,
  tokenId: bigint,
  parentName: string,
  key: string,
): string | null {
  const fullName = `${namespace}.${workerLabel}.${parentName}`;
  const summaries: Record<typeof namespace, string> = {
    who: `Live ownerOf(${tokenId.toString()}) on 0G Galileo. Address rotates with every iNFT transfer — the resolver follows it cross-chain via CCIP-Read.`,
    pay: `Fresh HD-derived payment address per resolution for ${workerLabel}. Each query bumps a nonce; the master is a parent xpub. See ai.pay.master.`,
    rep: `Reputation summary for ${workerLabel} (ERC-8004 agentId ${tokenId.toString()}) on Base Sepolia. See ai.rep.* records for count, average, and registry address.`,
    mem: `Encrypted memory pointer for ${workerLabel}. Returns the 0G Storage CID stored on the iNFT. AES-256-CTR encrypted client-side; re-keyed by the TEE on transfer.`,
  };
  switch (key) {
    case "name":
      return fullName;
    case "description":
      return summaries[namespace];
    case "url":
      return `https://ledger-open-agents.vercel.app/agent/${workerLabel}.${parentName}`;
    case "notice":
      return `ENSIP-10 wildcard + CCIP-Read. ${namespace}.* namespace for ${workerLabel}. Custom keys: ai.${namespace}.*`;
    case "avatar":
      return `https://api.dicebear.com/9.x/shapes/svg?seed=${workerLabel}-${namespace}`;
    default:
      return null;
  }
}

function nextPayNonce(workerLabel: string): bigint {
  const current = payCounters.get(workerLabel) ?? 0n;
  payCounters.set(workerLabel, current + 1n);
  return current;
}

function resolvePayText(
  key: string,
  workerLabel: string,
  tokenId: bigint,
  config: ResolverConfig,
): string {
  if (key === "ai.pay.address") {
    return resolvePay(workerLabel, tokenId, config).address;
  }

  const last = lastPayResolutions.get(workerLabel);
  switch (key) {
    case "ai.pay.nonce":
      return last?.nonce.toString() ?? "";
    case "ai.pay.path":
      return last?.path ?? "";
    case "ai.pay.master":
      return getPayAccount(config).neuter().extendedKey;
    case "ai.pay.scheme":
      return "HDNodeWallet account-xpub non-hardened child derivation";
    default:
      return "";
  }
}

function getPayAccount(config: ResolverConfig): HDNodeWallet {
  const mnemonic =
    config.payMasterMnemonic ??
    "test test test test test test test test test test test junk";
  return HDNodeWallet.fromPhrase(mnemonic, undefined, config.payMasterPath);
}

function resolveTxReceipt(
  txId: string,
  config: ResolverConfig,
): TxReceiptRecord {
  return config.txReceipts[txId] ?? {};
}

function resolveTxText(key: string, receipt: TxReceiptRecord): string {
  switch (key) {
    case "ai.tx.cid":
      return receipt.cid ?? "";
    case "ai.tx.intent":
      return receipt.intent ?? "";
    case "ai.tx.outcome":
      return receipt.outcome ?? "";
    case "ai.tx.chain":
      return receipt.chain ?? "";
    case "ai.tx.amount":
      return receipt.amount ?? "";
    case "ai.tx.receipt":
      return JSON.stringify(receipt.receipt ?? receipt);
    default:
      return "";
  }
}

function resolveRepSummary(
  workerLabel: string,
  tokenId: bigint,
  config: ResolverConfig,
): ReputationSummary {
  return (
    config.repSummaries[workerLabel] ??
    config.repSummaries[tokenId.toString()] ?? {
      registry: config.reputationRegistryAddress,
      agentId: tokenId.toString(),
      summary: "pending live ERC-8004 getSummary/readFeedback data",
    }
  );
}

function resolveRepText(key: string, summary: ReputationSummary): string {
  switch (key) {
    case "ai.rep.count":
      return summary.count?.toString() ?? "";
    case "ai.rep.average":
      return summary.average?.toString() ?? "";
    case "ai.rep.tags":
      return JSON.stringify(summary.tags ?? {});
    case "ai.rep.registry":
      return summary.registry ?? "";
    case "ai.rep.agent":
      return summary.agentId ?? "";
    case "ai.rep.summary":
      return JSON.stringify(summary.summary ?? summary);
    default:
      return "";
  }
}

function resolveMemText(key: string, cid: string): string {
  switch (key) {
    case "ai.mem.cid":
    case "ai.mem.pointer":
      return cid;
    default:
      return "";
  }
}
