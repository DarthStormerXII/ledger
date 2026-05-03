import { Contract, HDNodeWallet, JsonRpcProvider, getAddress } from "ethers";
import { parseLedgerName, type ParsedName } from "./dns.js";
import type { ReputationSummary, ResolverConfig, TxReceiptRecord } from "./config.js";

const WORKER_INFT_ABI = [
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function getMemoryPointer(uint256 tokenId) view returns (string)"
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
  textKey?: string
): Promise<string> {
  if (name.toLowerCase() === config.parentName && kind === "text") {
    return resolveParentText(textKey, config);
  }

  const parsed = parseLedgerName(name, config.parentName);

  if (kind === "addr") {
    if (parsed.namespace === "who") {
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

function resolveParentText(key: string | undefined, config: ResolverConfig): string {
  if (!key) return "";
  if (key === "agent-registration" || key.startsWith("agent-registration[")) {
    return config.agentRegistrationValue;
  }
  if (key === "ai.ledger.registry") {
    return config.reputationRegistryAddress;
  }
  return "";
}

export async function resolveWho(tokenId: bigint, config: ResolverConfig): Promise<string> {
  if (config.mockOwnerAddress) {
    return config.mockOwnerAddress;
  }
  if (!config.workerInftAddress) {
    throw new Error("WORKER_INFT_ADDRESS is required for live who.* resolution");
  }

  const provider = new JsonRpcProvider(config.ogRpcUrl, config.ogChainId);
  const contract = new Contract(config.workerInftAddress, WORKER_INFT_ABI, provider);
  const owner = (await contract.ownerOf(tokenId)) as string;
  return getAddress(owner);
}

export function resolvePay(
  workerLabel: string,
  tokenId: bigint,
  config: ResolverConfig
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
    masterPubkey: account.neuter().extendedKey
  };
  lastPayResolutions.set(workerLabel, resolution);
  return resolution;
}

export async function resolveMemoryPointer(
  workerLabel: string,
  tokenId: bigint,
  config: ResolverConfig
): Promise<string> {
  const configured = config.memoryPointers[workerLabel] ?? config.memoryPointers[tokenId.toString()];
  if (configured) {
    return configured;
  }
  if (!config.workerInftAddress) {
    return "";
  }

  const provider = new JsonRpcProvider(config.ogRpcUrl, config.ogChainId);
  const contract = new Contract(config.workerInftAddress, WORKER_INFT_ABI, provider);
  return (await contract.getMemoryPointer(tokenId)) as string;
}

async function resolveText(
  parsed: ParsedName,
  key: string | undefined,
  config: ResolverConfig
): Promise<string> {
  if (!key) return "";

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
    return resolveRepText(key, resolveRepSummary(parsed.workerLabel, parsed.tokenId, config));
  }

  if (parsed.namespace === "mem") {
    return resolveMemText(
      key,
      await resolveMemoryPointer(parsed.workerLabel, parsed.tokenId, config)
    );
  }

  return "";
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
  config: ResolverConfig
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

function resolveTxReceipt(txId: string, config: ResolverConfig): TxReceiptRecord {
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
  config: ResolverConfig
): ReputationSummary {
  return (
    config.repSummaries[workerLabel] ??
    config.repSummaries[tokenId.toString()] ?? {
      registry: config.reputationRegistryAddress,
      agentId: tokenId.toString(),
      summary: "pending live ERC-8004 getSummary/readFeedback data"
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
