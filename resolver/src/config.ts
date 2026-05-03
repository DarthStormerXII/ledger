import { getAddress } from "ethers";

export type ResolverConfig = {
  parentName: string;
  ogRpcUrl: string;
  ogChainId: number;
  workerInftAddress?: string;
  baseSepoliaRpcUrl: string;
  reputationRegistryAddress: string;
  payMasterMnemonic?: string;
  payMasterPath: string;
  privateKey?: string;
  mockOwnerAddress?: string;
  txReceipts: Record<string, TxReceiptRecord>;
  repSummaries: Record<string, ReputationSummary>;
  memoryPointers: Record<string, string>;
  agentRegistrationValue: string;
  ttlSeconds: number;
};

export type TxReceiptRecord = {
  cid?: string;
  intent?: string;
  outcome?: string;
  chain?: string;
  amount?: string;
  receipt?: unknown;
};

export type ReputationSummary = {
  count?: number;
  average?: number;
  tags?: Record<string, number>;
  registry?: string;
  agentId?: string;
  summary?: unknown;
};

export function loadConfig(env: NodeJS.ProcessEnv = process.env): ResolverConfig {
  const ttlSeconds = Number.parseInt(env.RESOLVER_TTL_SECONDS ?? "30", 10);
  const ogChainId = Number.parseInt(env.OG_CHAIN_ID ?? env.GALILEO_CHAIN_ID ?? "16602", 10);
  const workerInftAddressValue = env.WORKER_INFT_ADDRESS ?? env.WORKER_INFT_CONTRACT;
  const workerInftAddress = workerInftAddressValue
    ? getAddress(workerInftAddressValue)
    : undefined;
  const mockOwnerAddress = env.MOCK_OWNER_ADDRESS
    ? getAddress(env.MOCK_OWNER_ADDRESS)
    : undefined;

  return {
    parentName: (env.PARENT_ENS_NAME ?? "ledger-demo.eth").toLowerCase(),
    ogRpcUrl: env.OG_RPC_URL ?? env.GALILEO_RPC ?? "https://evmrpc-testnet.0g.ai",
    ogChainId: Number.isFinite(ogChainId) ? ogChainId : 16602,
    workerInftAddress,
    baseSepoliaRpcUrl: env.BASE_SEPOLIA_RPC_URL ?? env.BASE_RPC_URL ?? "https://sepolia.base.org",
    reputationRegistryAddress: getAddress(
      env.REPUTATION_REGISTRY_ADDRESS ??
        env.ERC8004_ADDRESS ??
        "0x8004B663056A597Dffe9eCcC1965A193B7388713"
    ),
    payMasterMnemonic: env.PAY_MASTER_MNEMONIC,
    payMasterPath: env.PAY_MASTER_PATH ?? "m/44'/60'/0'",
    privateKey: env.RESOLVER_PRIVATE_KEY,
    mockOwnerAddress,
    txReceipts: parseJsonMap<TxReceiptRecord>(env.TX_RECEIPTS_JSON, "TX_RECEIPTS_JSON"),
    repSummaries: parseJsonMap<ReputationSummary>(env.REP_SUMMARIES_JSON, "REP_SUMMARIES_JSON"),
    memoryPointers: parseJsonMap<string>(env.MEMORY_POINTERS_JSON, "MEMORY_POINTERS_JSON"),
    agentRegistrationValue:
      env.AGENT_REGISTRATION_VALUE ??
      `{"standard":"ENSIP-25","registry":"${env.REPUTATION_REGISTRY_ADDRESS ?? env.ERC8004_ADDRESS ?? "0x8004B663056A597Dffe9eCcC1965A193B7388713"}","chain":"base-sepolia","chainId":84532,"agentId":"1"}`,
    ttlSeconds: Number.isFinite(ttlSeconds) && ttlSeconds >= 0 ? ttlSeconds : 30
  };
}

function parseJsonMap<T>(value: string | undefined, name: string): Record<string, T> {
  if (!value) return {};
  const parsed = JSON.parse(value) as unknown;
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(`${name} must be a JSON object`);
  }
  return parsed as Record<string, T>;
}
