import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Contract, Interface, JsonRpcProvider, dnsEncode, namehash } from "ethers";
import { loadConfig } from "../src/config.js";
import { handleGatewayRequest } from "../src/ens.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "../..");

const WORKER_INFT_ABI = [
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function getMemoryPointer(uint256 tokenId) view returns (string)",
  "event Transfer(address indexed from,address indexed to,uint256 indexed tokenId)"
];

const resolverInterface = new Interface([
  "function addr(bytes32 node) view returns (address)",
  "function text(bytes32 node, string key) view returns (string)"
]);

const serviceInterface = new Interface([
  "function resolve(bytes name, bytes data) view returns (bytes result, uint64 expires, bytes sig)"
]);

const tokenId = BigInt(process.env.DEMO_TOKEN_ID ?? "1");
const workerLabel = process.env.DEMO_WORKER_LABEL ?? "worker-001";
const oldOwnerBlock = Number.parseInt(process.env.DEMO_OLD_OWNER_BLOCK ?? "31130502", 10);
const newOwnerBlock = Number.parseInt(process.env.DEMO_NEW_OWNER_BLOCK ?? "31130543", 10);
const sender = process.env.RESOLVER_CONTRACT_ADDRESS ?? "0x000000000000000000000000000000000000dEaD";

async function main(): Promise<void> {
  const config = loadConfig();
  if (!config.workerInftAddress) {
    throw new Error("WORKER_INFT_ADDRESS is required for live smoke");
  }
  if (!config.privateKey) {
    throw new Error("RESOLVER_PRIVATE_KEY is required for live smoke");
  }

  const provider = new JsonRpcProvider(config.ogRpcUrl, config.ogChainId);
  const contract = new Contract(config.workerInftAddress, WORKER_INFT_ABI, provider);
  const network = await provider.getNetwork();
  const latestBlock = await provider.getBlockNumber();
  const latestOwner = (await contract.ownerOf(tokenId)) as string;
  const historicalOwner = (await contract.ownerOf(tokenId, { blockTag: oldOwnerBlock })) as string;
  const postTransferOwner = (await contract.ownerOf(tokenId, { blockTag: newOwnerBlock })) as string;

  let liveMemoryPointer = "";
  let liveMemoryPointerError = "";
  try {
    liveMemoryPointer = (await contract.getMemoryPointer(tokenId)) as string;
  } catch (error) {
    liveMemoryPointerError = error instanceof Error ? error.message : String(error);
  }

  const transferLogs = await contract.queryFilter(
    contract.filters.Transfer(null, null, tokenId),
    oldOwnerBlock - 30,
    newOwnerBlock + 30
  );

  const names = {
    who: `who.${workerLabel}.${config.parentName}`,
    pay: `pay.${workerLabel}.${config.parentName}`,
    mem: `mem.${workerLabel}.${config.parentName}`,
    rep: `rep.${workerLabel}.${config.parentName}`
  };

  const whoGatewayOwner = await gatewayAddr(names.who, config);
  const pay1 = await gatewayAddr(names.pay, config);
  const pay2 = await gatewayAddr(names.pay, config);
  const memGatewayCid = await gatewayText(names.mem, "ai.mem.cid", config);
  const repRegistry = await gatewayText(names.rep, "ai.rep.registry", config);

  const result = {
    generatedAt: new Date().toISOString(),
    status: {
      pass:
        network.chainId === BigInt(config.ogChainId) &&
        whoGatewayOwner.toLowerCase() === latestOwner.toLowerCase() &&
        historicalOwner.toLowerCase() !== postTransferOwner.toLowerCase() &&
        latestOwner.toLowerCase() === postTransferOwner.toLowerCase() &&
        pay1 !== pay2
    },
    chain: {
      rpcUrl: config.ogRpcUrl,
      chainId: network.chainId.toString(),
      latestBlock
    },
    contracts: {
      workerInftAddress: config.workerInftAddress,
      reputationRegistryAddress: config.reputationRegistryAddress
    },
    token: {
      tokenId: tokenId.toString(),
      historicalOwnerBlock: oldOwnerBlock,
      historicalOwner,
      postTransferOwnerBlock: newOwnerBlock,
      postTransferOwner,
      latestOwner
    },
    transferLogs: transferLogs.map(log => {
      const parsed = contract.interface.parseLog(log);
      return {
        blockNumber: log.blockNumber,
        transactionHash: log.transactionHash,
        from: parsed?.args.from as string,
        to: parsed?.args.to as string,
        tokenId: parsed?.args.tokenId.toString() as string
      };
    }),
    gateway: {
      parentName: config.parentName,
      whoGatewayOwner,
      pay1,
      pay2,
      payChanged: pay1 !== pay2,
      memGatewayCid,
      repRegistry
    },
    memory: {
      liveMemoryPointer,
      liveMemoryPointerError
    }
  };

  await mkdir(resolve(repoRoot, "proofs/data"), { recursive: true });
  const outputPath = resolve(repoRoot, "proofs/data/ens-live-smoke.json");
  await writeFile(outputPath, `${JSON.stringify(result, null, 2)}\n`);
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);

  if (!result.status.pass) {
    process.exitCode = 1;
  }
}

async function gatewayAddr(name: string, config: ReturnType<typeof loadConfig>): Promise<string> {
  const result = await gatewayQuery(
    name,
    resolverInterface.encodeFunctionData("addr(bytes32)", [namehash(name)]),
    config
  );
  return resolverInterface.decodeFunctionResult("addr(bytes32)", result)[0] as string;
}

async function gatewayText(
  name: string,
  key: string,
  config: ReturnType<typeof loadConfig>
): Promise<string> {
  const result = await gatewayQuery(
    name,
    resolverInterface.encodeFunctionData("text", [namehash(name), key]),
    config
  );
  return resolverInterface.decodeFunctionResult("text", result)[0] as string;
}

async function gatewayQuery(
  name: string,
  innerData: string,
  config: ReturnType<typeof loadConfig>
): Promise<string> {
  const callData = serviceInterface.encodeFunctionData("resolve", [dnsEncode(name), innerData]);
  const response = await handleGatewayRequest({ sender, callData }, config);
  const [result, expires, sig] = serviceInterface.decodeFunctionResult("resolve", response.data) as [
    string,
    bigint,
    string
  ];
  if (expires <= BigInt(Math.floor(Date.now() / 1000))) {
    throw new Error(`Expired gateway response for ${name}`);
  }
  if (sig.length !== 130) {
    throw new Error(`Invalid compact signature for ${name}`);
  }
  return result;
}

await main();
