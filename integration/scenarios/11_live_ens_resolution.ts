// Scenario 11 — Live verification against the deployed ENS resolver gateway.
// Skipped (with `pass: true`) when the gateway URL is not reachable, so CI doesn't fail
// when running offline. Set LEDGER_LIVE_ENS=1 to make it strict.
import { LedgerCapabilityClient } from "../../resolver/src/client.js";
import { runScenarioSafely, writeProof } from "./_lib.js";

export const NAME = "11_live_ens_resolution";

const PARENT_NAME = process.env.PARENT_ENS_NAME ?? "ledger.eth";
const GATEWAY_URL =
  process.env.LEDGER_RESOLVER_URL ??
  "https://resolver.fierypools.fun/{sender}/{data}";
const RESOLVER_ADDRESS =
  process.env.LEDGER_RESOLVER_ADDRESS ??
  "0xd94cC429058E5495a57953c7896661542648E1B3";
const WORKER_INFT_ADDRESS =
  process.env.WORKER_INFT_ADDR ?? "0x48B051F3e565E394ED8522ac453d87b3Fa40ad62";
const STRICT = process.env.LEDGER_LIVE_ENS === "1";
const EXPECTED_OWNER = "0x6641221B1cb66Dc9f890350058A7341eF0eD600b";

export async function run() {
  return runScenarioSafely(NAME, async () => {
    // The gateway URL template ends in /{sender}/{data}; the LedgerCapabilityClient appends
    // those segments itself, so strip the template tail before passing in.
    const gatewayBase = GATEWAY_URL.replace(/\/\{sender\}\/\{data\}\/?$/u, "");

    const client = new LedgerCapabilityClient({
      parentName: PARENT_NAME,
      gatewayUrl: gatewayBase,
      resolverAddress: RESOLVER_ADDRESS,
      workerInftAddress: WORKER_INFT_ADDRESS,
    });

    const reasons: string[] = [];
    const artifacts: Record<string, unknown> = {
      parentName: PARENT_NAME,
      gatewayUrl: gatewayBase,
      resolverAddress: RESOLVER_ADDRESS,
      strictMode: STRICT,
    };

    // Live owner via direct on-chain ownerOf cross-chain — does not need the gateway.
    try {
      const owner = await client.ownerOf(1n);
      artifacts.directOwnerOf = owner;
      if (owner.toLowerCase() !== EXPECTED_OWNER.toLowerCase()) {
        reasons.push(
          `direct ownerOf returned ${owner}, expected ${EXPECTED_OWNER}`,
        );
      }
    } catch (err) {
      const msg = `direct ownerOf failed: ${err instanceof Error ? err.message : String(err)}`;
      if (STRICT) reasons.push(msg);
      else artifacts.directOwnerOfNote = msg;
    }

    // Live who.* through the CCIP gateway.
    try {
      const whoAddr = await client.gatewayAddr(`who.worker-001.${PARENT_NAME}`);
      artifacts.whoAddr = whoAddr;
      if (whoAddr.toLowerCase() !== EXPECTED_OWNER.toLowerCase()) {
        reasons.push(
          `gateway who.* returned ${whoAddr}, expected ${EXPECTED_OWNER}`,
        );
      }
    } catch (err) {
      const msg = `gateway who.* failed: ${err instanceof Error ? err.message : String(err)}`;
      if (STRICT) reasons.push(msg);
      else artifacts.whoAddrNote = msg;
    }

    // Live mem.* ai.mem.cid through the CCIP gateway.
    try {
      const memCid = await client.gatewayText(
        `mem.worker-001.${PARENT_NAME}`,
        "ai.mem.cid",
      );
      artifacts.memCid = memCid;
      if (!memCid.startsWith("0g://"))
        reasons.push(`mem.* cid not 0g://: ${memCid}`);
    } catch (err) {
      const msg = `gateway mem.* failed: ${err instanceof Error ? err.message : String(err)}`;
      if (STRICT) reasons.push(msg);
      else artifacts.memCidNote = msg;
    }

    return {
      pass: reasons.length === 0,
      reasons,
      artifacts,
      events: [],
    };
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const r = await run();
  await writeProof(NAME, r);
  console.log(
    JSON.stringify(r, (_k, v) => (typeof v === "bigint" ? v.toString() : v), 2),
  );
  process.exit(r.pass ? 0 : 1);
}
