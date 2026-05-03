// Smoke: fetch real ERC-8004 NewFeedback events from Base Sepolia for a
// known agentId and print the parsed (timestamp, rating) points.
import { createPublicClient, http, parseAbiItem, decodeEventLog } from "viem";

const baseSepoliaClient = createPublicClient({
  chain: { id: 84532, name: "base-sepolia", nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 }, rpcUrls: { default: { http: ["https://sepolia.base.org"] } } },
  transport: http("https://sepolia.base.org"),
});

const REGISTRY = "0x8004B663056A597Dffe9eCcC1965A193B7388713";
const AGENT_ID = BigInt(process.argv[2] ?? "5444");
const event = parseAbiItem(
  "event NewFeedback(uint256 indexed agentId, address indexed client, uint64 feedbackIndex, int128 value, uint8 valueDecimals, string tag1, string tag2, string endpoint, string feedbackURI, string responseURI, bytes32 feedbackHash)",
);

const tip = await baseSepoliaClient.getBlockNumber();
console.log("agentId:", AGENT_ID.toString(), " tip block:", tip.toString());
const CHUNK = 9_000n;
let total = 0;
const allRaw = [];
for (let from = 30_000_000n; from <= tip; from += CHUNK + 1n) {
  const to = from + CHUNK > tip ? tip : from + CHUNK;
  try {
    const chunk = await baseSepoliaClient.getLogs({
      address: REGISTRY,
      event,
      args: { agentId: AGENT_ID },
      fromBlock: from,
      toBlock: to,
    });
    if (chunk.length) {
      total += chunk.length;
      console.log(`  blocks ${from}..${to}: ${chunk.length} logs`);
      // Dump first log to inspect structure
      if (allRaw.length === 0) {
        console.log("  first log:", JSON.stringify(chunk[0], (_, v) => typeof v === "bigint" ? v.toString() : v, 2).slice(0, 800));
      }
      for (const l of chunk) {
        const hex = l.data.slice(2);
        const value = BigInt("0x" + hex.slice(64, 128));
        const decimals = Number(BigInt("0x" + hex.slice(128, 192)));
        const v = Number(value) / 10 ** decimals;
        allRaw.push({ block: l.blockNumber, rating: v });
      }
    }
  } catch (e) {
    console.warn(`  blocks ${from}..${to} failed: ${e.message}`);
  }
}
console.log("total events:", total);
if (total === 0) {
  console.log("→ no feedback events for this agentId. Chart will show empty state.");
  process.exit(0);
}
// Resolve a few block timestamps to sanity-check the chronology.
const sample = allRaw.slice(0, 3).concat(allRaw.slice(-3));
for (const r of sample) {
  const block = await baseSepoliaClient.getBlock({ blockNumber: r.block });
  const ts = new Date(Number(block.timestamp) * 1000).toISOString();
  console.log(`  ${ts}  ${r.rating.toFixed(3)} ★`);
}
