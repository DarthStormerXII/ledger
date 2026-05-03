import {
  LedgerAgentRuntime,
  createDeterministicReasoner,
  createEnsIdentityAdapter,
  createZeroGMemoryAdapter,
  createZeroGOwnershipAdapter,
  type AgentKitTask,
} from "../src/index.js";

const allowLocalDryRun = process.env.LEDGER_AGENT_KIT_ALLOW_LOCAL_DRY_RUN === "1";
const gatewayUrl = process.env.LEDGER_ENS_GATEWAY_URL;

if (!gatewayUrl && !allowLocalDryRun) {
  throw new Error(
    "LEDGER_ENS_GATEWAY_URL is required for the proof example. Set LEDGER_AGENT_KIT_ALLOW_LOCAL_DRY_RUN=1 only for an explicitly unverified local dry run.",
  );
}

const demoTask: AgentKitTask = {
  type: "TASK_POSTED",
  version: "1.0",
  taskId: "demo-risk-research-001",
  buyer: "buyer.ledger.eth",
  task: {
    title: "Research 0G vault risk",
    description:
      "Compare three DeFi vaults and return a risk-ranked JSON table.",
    outputSchema: "json:risk_table",
    deadlineSeconds: 3600,
  },
  payment: {
    amount: "1.0000",
    token: "0G",
    chain: "0g-galileo",
  },
  minReputation: allowLocalDryRun ? undefined : 40,
  postedAt: Date.now(),
};

const runtime = new LedgerAgentRuntime({
  worker: {
    tokenId: 1n,
    label: "worker-001",
    agentName: "Ledger Research Worker 001",
    ensParent: "ledger.eth",
  },
  adapters: {
    memory: createZeroGMemoryAdapter(),
    inference: createDeterministicReasoner({
      output: allowLocalDryRun
        ? "Local dry-run generated a structurally valid bid without ENS reputation proof."
        : "Dry-run reasoner selected the task after live ENS owner, memory, and reputation proof checks.",
      attestationDigest: `0x${"0".repeat(64)}`,
    }),
    ownership: createZeroGOwnershipAdapter({ demoOnly: true }),
    identity: createEnsIdentityAdapter({
      parentName: "ledger.eth",
      gatewayUrl,
      resolverAddress:
        process.env.LEDGER_ENS_RESOLVER_CONTRACT ??
        "0xd94cC429058E5495a57953c7896661542648E1B3",
      workerInftAddress:
        process.env.WORKER_INFT_ADDR ??
        "0x48B051F3e565E394ED8522ac453d87b3Fa40ad62",
    }),
  },
  integrity: {
    requireCapabilityOwner: !allowLocalDryRun,
    requireCapabilityMemory: !allowLocalDryRun,
    requireReputationProof: !allowLocalDryRun,
  },
});

const decision = await runtime.createBidForTask(demoTask);

process.stdout.write(`${JSON.stringify(decision, stringifyBigInt, 2)}\n`);

function stringifyBigInt(_key: string, value: unknown) {
  return typeof value === "bigint" ? value.toString() : value;
}
