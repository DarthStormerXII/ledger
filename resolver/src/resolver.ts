import {
  Contract,
  HDNodeWallet,
  JsonRpcProvider,
  ZeroAddress,
  getAddress,
} from "ethers";
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
  // Path is tokenId-namespaced so each worker has its own address sequence.
  // Without this, every worker's nonce-0 address would be identical
  // (`m/44'/60'/0'/0/0` = the well-known Hardhat first account).
  const path = `${tokenId.toString()}/${nonce.toString()}`;
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
  // Each namespace inlines its own meaningful value (memory CID, owner
  // address, rep count, etc) into description / notice so the explorer
  // surfaces the unique data, not boilerplate.
  if (
    parsed.namespace === "who" ||
    parsed.namespace === "pay" ||
    parsed.namespace === "rep" ||
    parsed.namespace === "mem"
  ) {
    const standard = await standardTextForNamespace(
      parsed.namespace,
      parsed.workerLabel,
      parsed.tokenId,
      parsed.parentName,
      key,
      config,
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

async function standardTextForNamespace(
  namespace: "who" | "pay" | "rep" | "mem",
  workerLabel: string,
  tokenId: bigint,
  parentName: string,
  key: string,
  config: ResolverConfig,
): Promise<string | null> {
  const fullName = `${namespace}.${workerLabel}.${parentName}`;
  // Common standard keys that don't depend on namespace data
  if (key === "url") {
    return `https://ledger-open-agents.vercel.app/agent/${workerLabel}.${parentName}`;
  }
  if (key === "avatar") {
    return `https://api.dicebear.com/9.x/shapes/svg?seed=${workerLabel}-${namespace}`;
  }
  if (key === "name") return fullName;

  // Per-namespace description + notice with the actual unique value embedded
  if (namespace === "who") {
    if (key === "description" || key === "notice") {
      try {
        const owner = await resolveWho(tokenId, config);
        return key === "description"
          ? `Current owner: ${owner}. Live cross-chain ownerOf(${tokenId.toString()}) on 0G Galileo (chainId ${config.ogChainId}) via ENSIP-10 + CCIP-Read. Address follows the iNFT on every transfer with no Sepolia tx.`
          : `Owner ${owner} — live cross-chain read. Updates within ${config.ttlSeconds}s of any Galileo transfer.`;
      } catch {
        return key === "description"
          ? `Live ownerOf(${tokenId.toString()}) on 0G Galileo (chainId ${config.ogChainId}). Cross-chain read via CCIP-Read.`
          : `who.* namespace — live cross-chain ownerOf read.`;
      }
    }
    return null;
  }

  if (namespace === "pay") {
    // IMPORTANT: do NOT call resolvePay() here — it bumps the rotation
    // nonce, which would corrupt the per-worker counter every time the ENS
    // app probes a text record. Use the cached "last derived" address from
    // an earlier addr query, plus the master xpub which is stateless.
    const last = lastPayResolutions.get(workerLabel);
    const masterXpub = getPayAccount(config).neuter().extendedKey;
    if (key === "description") {
      const lastBlurb = last
        ? `Latest derived: ${last.address} (path ${last.path}, nonce ${last.nonce.toString()}). `
        : "";
      return `${lastBlurb}HD-derived from a parent xpub — every addr query bumps a per-worker nonce so payments never reuse a destination. Master xpub: ${masterXpub.slice(0, 28)}…`;
    }
    if (key === "notice") {
      return last
        ? `Rotating pay address. Last derived: ${last.address} at nonce ${last.nonce.toString()}.`
        : `Rotating pay address. Query addr to derive the next one.`;
    }
    return null;
  }

  if (namespace === "rep") {
    const summary = resolveRepSummary(workerLabel, tokenId, config);
    let count: number | undefined =
      typeof summary.count === "number" ? summary.count : undefined;
    let average: number | undefined =
      typeof summary.average === "number" ? summary.average : undefined;
    const reg = summary.registry ?? config.reputationRegistryAddress;
    const agentIdStr = summary.agentId ?? tokenId.toString();

    // No seeded data → fall back to a LIVE ERC-8004 read on Base Sepolia
    // so brand-new workers (and ones without REP_SUMMARIES_JSON entries)
    // still get real reputation values in the description.
    if (count === undefined || average === undefined) {
      const live = await fetchLiveErc8004Summary(BigInt(agentIdStr), config);
      if (live) {
        count = live.count;
        average = live.average;
      }
    }

    const hasData = count !== undefined && average !== undefined;
    if (key === "description") {
      if (hasData) {
        return `${count!.toString()} jobs · ${average!.toFixed(2)} ★ avg · ERC-8004 agentId ${agentIdStr}. Audited registry on Base Sepolia: ${reg}. Cross-chain read.`;
      }
      return `No reputation history yet for ${workerLabel} (ERC-8004 agentId ${agentIdStr}). Settlements write feedback() to the audited registry on Base Sepolia: ${reg}.`;
    }
    if (key === "notice") {
      return `ERC-8004 ReputationRegistry ${reg} on Base Sepolia. ${hasData ? `Live cross-chain read: ${count} feedback entries.` : "No feedback() entries yet for this agent."}`;
    }
    return null;
  }

  if (namespace === "mem") {
    try {
      const cid = await resolveMemoryPointer(workerLabel, tokenId, config);
      const isSentinel = isSentinelCid(cid);
      const cidValid = !!cid && !isSentinel;
      if (key === "description") {
        if (cidValid) {
          return `0G Storage memory CID: ${cid}. AES-256-CTR encrypted client-side, re-keyed by the TEE on every iNFT transfer so the new owner can decrypt and the old owner can't.`;
        }
        return `Encrypted memory pointer for ${workerLabel}. No memory has been pinned to 0G Storage for tokenId ${tokenId.toString()} yet — getMetadata() returns the empty sentinel.`;
      }
      if (key === "notice") {
        return cidValid
          ? `Memory CID ${cid} — pulled live from WorkerINFT.getMetadata(${tokenId.toString()}).memoryCID on Galileo.`
          : `mem.* namespace — live cross-chain read of WorkerINFT.getMetadata().memoryCID. No CID set for this iNFT yet.`;
      }
    } catch {
      if (key === "description") {
        return `Encrypted memory pointer for ${workerLabel}. Live cross-chain read of WorkerINFT.getMetadata().memoryCID on Galileo.`;
      }
    }
    return null;
  }

  return null;
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

// WorkerINFT.getMetadata returns 0xffffffff…ffff for tokens that haven't
// pinned a memory blob yet. Treat that as "no CID" for description copy.
function isSentinelCid(cid: string): boolean {
  if (!cid) return true;
  const hex = cid
    .replace(/^0g:\/\//, "")
    .split("?")[0]
    .toLowerCase();
  if (!/^0x/.test(hex)) return false;
  const body = hex.slice(2);
  // Pure all-f / all-0 sentinels.
  if (/^f+$/u.test(body) || /^0+$/u.test(body)) return true;
  // Mass-mint placeholders that share a long run of one character then a
  // small tokenId terminator (e.g. 0xff…ff1, 0xff…ff2). Real SHA-256-style
  // CIDs are never near-uniform — entropy is too high.
  if (body.length >= 32) {
    const first = body[0];
    let runLen = 0;
    while (runLen < body.length && body[runLen] === first) runLen++;
    if (runLen >= body.length - 4) return true;
  }
  return false;
}

// Live ERC-8004 read on Base Sepolia. Used as a fallback when no seeded
// REP_SUMMARIES_JSON entry exists for a worker — so brand-new agents get
// real reputation values without per-agent config edits.
const ERC8004_GETSUMMARY_ABI = [
  "function getSummary(uint256 agentId, address[] feedbackAuthIds, string clientUrl, string requestId) view returns (uint64 count, int128 sumValue, uint8 decimals)",
];
const liveRepCache = new Map<
  string,
  { value: { count: number; average: number } | null; ts: number }
>();
const REP_CACHE_TTL_MS = 30_000;

async function fetchLiveErc8004Summary(
  agentId: bigint,
  config: ResolverConfig,
): Promise<{ count: number; average: number } | null> {
  const cacheKey = `${config.reputationRegistryAddress}:${agentId.toString()}`;
  const cached = liveRepCache.get(cacheKey);
  if (cached && Date.now() - cached.ts < REP_CACHE_TTL_MS) {
    return cached.value;
  }
  let value: { count: number; average: number } | null = null;
  try {
    if (config.reputationRegistryAddress === ZeroAddress) return null;
    const provider = new JsonRpcProvider(config.baseSepoliaRpcUrl, 84532);
    const contract = new Contract(
      config.reputationRegistryAddress,
      ERC8004_GETSUMMARY_ABI,
      provider,
    );
    const result = (await contract.getSummary(agentId, [], "", "")) as [
      bigint,
      bigint,
      bigint,
    ];
    const count = Number(result[0]);
    if (count === 0) {
      value = null;
    } else {
      const sumValue = result[1];
      const decimals = Number(result[2]);
      const denom = 10 ** decimals;
      const average = Number(sumValue) / denom / count;
      value = { count, average };
    }
  } catch {
    value = null;
  }
  liveRepCache.set(cacheKey, { value, ts: Date.now() });
  return value;
}
