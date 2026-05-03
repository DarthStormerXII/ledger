import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { JsonRpcProvider, Network } from "ethers";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "../..");

const parentName = process.env.PARENT_ENS_NAME ?? "ledger.eth";
const rpcUrl = process.env.SEPOLIA_RPC_URL ?? "https://ethereum-sepolia-rpc.publicnode.com";
const expectedOwner =
  process.env.EXPECTED_WORKER_OWNER ?? "0x6641221B1cb66Dc9f890350058A7341eF0eD600b";
const expectedMemoryCid =
  process.env.EXPECTED_MEMORY_CID ??
  "0g://0xd8fb3ad312ca5e9002f7bdd47d93839b9a6dcd83d396bb74a44a9f65344982c4";

const network = Network.from({
  chainId: 11155111,
  name: "sepolia",
  ensAddress: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e"
});

const provider = new JsonRpcProvider(rpcUrl, network, { staticNetwork: network });

async function main(): Promise<void> {
  const whoName = `who.worker-001.${parentName}`;
  const payName = `pay.worker-001.${parentName}`;
  const memName = `mem.worker-001.${parentName}`;
  const repName = `rep.worker-001.${parentName}`;

  const whoOwner = await provider.resolveName(whoName);
  const pay1 = await provider.resolveName(payName);
  const pay2 = await provider.resolveName(payName);
  const memResolver = await provider.getResolver(memName);
  const repResolver = await provider.getResolver(repName);
  const parentResolver = await provider.getResolver(parentName);
  const memoryCid = await memResolver?.getText("ai.mem.cid");
  const repRegistry = await repResolver?.getText("ai.rep.registry");
  const repCount = await repResolver?.getText("ai.rep.count");
  const agentRegistration = await parentResolver?.getText("agent-registration");

  const result = {
    generatedAt: new Date().toISOString(),
    status: {
      pass:
        whoOwner?.toLowerCase() === expectedOwner.toLowerCase() &&
        Boolean(pay1) &&
        Boolean(pay2) &&
        pay1 !== pay2 &&
        memoryCid === expectedMemoryCid &&
        repRegistry === "0x8004B663056A597Dffe9eCcC1965A193B7388713" &&
        repCount === "47" &&
        Boolean(agentRegistration)
    },
    parentName,
    rpcUrl,
    resolved: {
      whoName,
      whoOwner,
      payName,
      pay1,
      pay2,
      payChanged: pay1 !== pay2,
      memName,
      memoryCid,
      repName,
      repRegistry,
      repCount,
      agentRegistration
    }
  };

  await mkdir(resolve(repoRoot, "proofs/data"), { recursive: true });
  await writeFile(
    resolve(repoRoot, "proofs/data/ens-sepolia-resolve.json"),
    `${JSON.stringify(result, null, 2)}\n`
  );
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (!result.status.pass) process.exitCode = 1;
}

await main();
