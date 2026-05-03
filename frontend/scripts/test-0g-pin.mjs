// Smoke test: pin a tiny JSON to 0G Storage Galileo and print the CID.
// Run from frontend/: node scripts/test-0g-pin.mjs
import { mkdtemp, writeFile, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

// Load .env.local manually (no dotenv dep needed for a smoke script).
try {
  const env = await readFile(new URL("../.env.local", import.meta.url), "utf8");
  for (const line of env.split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, "");
    }
  }
} catch {}

const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!PRIVATE_KEY) {
  console.error("PRIVATE_KEY missing in env");
  process.exit(1);
}

const INDEXER = "https://indexer-storage-testnet-turbo.0g.ai";
const RPC = "https://evmrpc-testnet.0g.ai";

const sdk = await import("@0gfoundation/0g-storage-ts-sdk");
const ethers = await import("ethers");

const provider = new ethers.JsonRpcProvider(RPC);
const signer = new ethers.Wallet(PRIVATE_KEY, provider);
console.log("signer:", await signer.getAddress());
const indexer = new sdk.Indexer(INDEXER);

const dir = await mkdtemp(join(tmpdir(), "ledger-pin-test-"));
const path = join(dir, "brief-test.json");
const payload = JSON.stringify({
  test: "ledger-brief-pin-smoke",
  ts: new Date().toISOString(),
});
await writeFile(path, payload);
console.log("payload:", payload);

const file = await sdk.ZgFile.fromFilePath(path);
console.log("methods on indexer:", Object.keys(indexer));

const t0 = Date.now();
try {
  if (typeof indexer.uploadFile === "function") {
    console.log("calling indexer.uploadFile…");
    const result = await indexer.uploadFile(file, RPC, signer);
    console.log("uploadFile result:", JSON.stringify(result, null, 2));
  } else if (typeof indexer.upload === "function") {
    console.log("calling indexer.upload…");
    const [tx, err] = await indexer.upload(file, RPC, signer);
    if (err) throw err;
    const [tree, treeErr] = await file.merkleTree();
    if (treeErr) throw treeErr;
    console.log("rootHash:", tree.rootHash());
    console.log("tx:", tx);
  } else {
    console.error(
      "no upload method found:",
      Object.getOwnPropertyNames(Object.getPrototypeOf(indexer)),
    );
  }
} catch (err) {
  console.error("upload failed:", err);
} finally {
  await file.close?.();
  await rm(dir, { recursive: true, force: true });
}
console.log("elapsed:", Date.now() - t0, "ms");
