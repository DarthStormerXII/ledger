// End-to-end smoke for /api/jobs/brief: POST a brief → expect pinned=true + 0G CID,
// then GET it back to confirm Postgres survives across "instances" (we simulate
// cold start by clearing the warm-cache via a fresh dev server run, or by
// hitting the same handler twice).
//
// Run: pnpm dev (in another terminal) then: node scripts/test-brief-flow.mjs
import { readFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";

try {
  const env = await readFile(new URL("../.env.local", import.meta.url), "utf8");
  for (const line of env.split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, "");
    }
  }
} catch {}

const BASE = process.env.BRIEF_TEST_BASE ?? "http://127.0.0.1:3000";
const taskId = "0x" + randomBytes(32).toString("hex");
console.log("→ taskId:", taskId);

const briefBody = {
  taskId,
  brief: {
    title: "Brief-flow smoke test",
    description: "Verifies the brief route really pins to 0G and persists to Neon.",
    category: "code",
    tags: ["smoke", "0g-storage", "neon"],
    minReputation: "0",
    minJobs: "0",
    payoutOg: "0.005",
    bondOg: "0.001",
    deadlineSec: Math.floor(Date.now() / 1000) + 600,
    postedAtMs: Date.now(),
    postedBy: "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
  },
};

const t0 = Date.now();
const post = await fetch(`${BASE}/api/jobs/brief`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(briefBody),
});
console.log(`POST ${post.status} (${Date.now() - t0}ms)`);
const postJson = await post.json();
console.log(JSON.stringify(postJson, null, 2));
if (!postJson.ok) {
  console.error("✗ POST failed");
  process.exit(1);
}
if (!postJson.pinned) {
  console.error(
    "✗ pinned=false — pin to 0G Storage didn't complete. Check PRIVATE_KEY and SDK errors in dev-server logs.",
  );
  process.exit(1);
}
if (!postJson.cid?.startsWith("0g://0x")) {
  console.error("✗ cid is a placeholder, not a real 0G CID:", postJson.cid);
  process.exit(1);
}
console.log("✓ pin succeeded — CID:", postJson.cid);

const t1 = Date.now();
const get = await fetch(`${BASE}/api/jobs/brief?taskId=${taskId}`);
const getJson = await get.json();
console.log(`GET ${get.status} (${Date.now() - t1}ms)`);
console.log(JSON.stringify(getJson, null, 2));
if (getJson.cid !== postJson.cid) {
  console.error("✗ GET returned a different CID than POST");
  process.exit(1);
}
if (getJson.brief?.title !== briefBody.brief.title) {
  console.error("✗ brief title mismatch on round-trip");
  process.exit(1);
}
console.log("✓ round-trip OK");

// Verify it's in Postgres directly (not just warm cache).
const { neon } = await import("@neondatabase/serverless");
const sql = neon(process.env.DATABASE_URL);
const rows = await sql`SELECT task_id, cid, pinned, size_bytes FROM task_briefs WHERE task_id = ${taskId}`;
console.log("DB row:", rows[0]);
if (rows.length === 0) {
  console.error("✗ Postgres has no row for this taskId — persistence failed");
  process.exit(1);
}
console.log("✓ Neon Postgres has the row — survives cold starts");
console.log("\nALL CHECKS PASSED — brief flow is real-pin + DB-backed.");
