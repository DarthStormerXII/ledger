import { NextResponse } from "next/server";
import { createHash, randomBytes } from "node:crypto";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { neon } from "@neondatabase/serverless";

/**
 * Job-brief storage layer.
 *
 *   Layer 1  — brief content lives in 0G Storage (real CID, judges can verify)
 *   Layer 2  — (taskId → CID + brief) lookup lives in Neon Postgres so it
 *              survives Vercel cold starts. A warm-instance Map fronts the
 *              DB to keep repeat reads cheap.
 *
 * Why Postgres for the lookup and not an on-chain registry: shipping a
 * `TaskBriefRegistry` Galileo contract costs a redeploy + ABI bump that
 * isn't reachable in the submission window. The brief content itself is
 * still pinned to 0G Storage, which is the substantive on-chain claim;
 * the route only mediates the (taskId → CID) lookup. The plan is to
 * promote that lookup to ENS (`brief.task-<id>.ledger.eth`) post-
 * submission, at which point this route becomes a thin proxy.
 *
 * If `PRIVATE_KEY` is missing or 0G upload fails, the route still
 * persists the brief and returns a `0g://pending-<sha256>` placeholder
 * CID so the demo flow keeps working — the auction room then surfaces
 * a "brief not yet pinned" disclosure pill.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export type Category =
  | "research"
  | "data"
  | "code"
  | "creative"
  | "ops"
  | "trading"
  | "other";

export const CATEGORIES: Category[] = [
  "research",
  "data",
  "code",
  "creative",
  "ops",
  "trading",
  "other",
];

type Brief = {
  title: string;
  description: string;
  category: Category;
  tags?: string[];
  minReputation?: string;
  minJobs?: string;
  payoutOg?: string;
  bondOg?: string;
  deadlineSec?: number;
  postedAtMs: number;
  postedBy?: string;
};

type Entry = {
  taskId: string;
  cid: string;
  brief: Brief;
  pinned: boolean; // true once it landed on 0G Storage
  pinnedAtMs?: number;
  size: number;
};

// Warm-instance cache fronting the Postgres lookup. The DB is the source of
// truth — this just shaves a roundtrip on repeated GETs from the same warm
// function. Cold starts will hit the DB once per taskId and re-warm.
const cache = new Map<string, Entry>();

const DEFAULT_INDEXER_RPC = "https://indexer-storage-testnet-turbo.0g.ai";
const DEFAULT_GALILEO_RPC = "https://evmrpc-testnet.0g.ai";

// Lazy Postgres handle. Falls back to memory-only when DATABASE_URL is unset
// (local dev without Neon). The route still works in that mode but loses the
// brief on cold start — same behaviour as the previous implementation.
let sqlInstance: ReturnType<typeof neon> | null | undefined;
let schemaReady: Promise<void> | null = null;

function getSql(): ReturnType<typeof neon> | null {
  if (sqlInstance !== undefined) return sqlInstance;
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.warn(
      "[brief-route] DATABASE_URL unset — briefs will only persist in warm-instance memory.",
    );
    sqlInstance = null;
    return null;
  }
  sqlInstance = neon(url);
  return sqlInstance;
}

async function ensureSchema(): Promise<void> {
  const sql = getSql();
  if (!sql) return;
  if (!schemaReady) {
    schemaReady = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS task_briefs (
          task_id      TEXT PRIMARY KEY,
          cid          TEXT NOT NULL,
          brief        JSONB NOT NULL,
          pinned       BOOLEAN NOT NULL DEFAULT FALSE,
          pinned_at_ms BIGINT,
          size_bytes   INTEGER NOT NULL,
          created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `;
    })().catch((err) => {
      console.error("[brief-route] schema init failed:", err);
      schemaReady = null;
      throw err;
    });
  }
  await schemaReady;
}

async function dbUpsert(entry: Entry): Promise<void> {
  const sql = getSql();
  if (!sql) return;
  try {
    await ensureSchema();
    await sql`
      INSERT INTO task_briefs (task_id, cid, brief, pinned, pinned_at_ms, size_bytes)
      VALUES (${entry.taskId}, ${entry.cid}, ${JSON.stringify(entry.brief)}::jsonb,
              ${entry.pinned}, ${entry.pinnedAtMs ?? null}, ${entry.size})
      ON CONFLICT (task_id) DO UPDATE SET
        cid          = EXCLUDED.cid,
        brief        = EXCLUDED.brief,
        pinned       = EXCLUDED.pinned,
        pinned_at_ms = EXCLUDED.pinned_at_ms,
        size_bytes   = EXCLUDED.size_bytes
    `;
  } catch (err) {
    console.error("[brief-route] dbUpsert failed:", err);
  }
}

async function dbGet(taskId: string): Promise<Entry | null> {
  const sql = getSql();
  if (!sql) return null;
  try {
    await ensureSchema();
    const rows = (await sql`
      SELECT task_id, cid, brief, pinned, pinned_at_ms, size_bytes
      FROM task_briefs
      WHERE task_id = ${taskId}
      LIMIT 1
    `) as Array<{
      task_id: string;
      cid: string;
      brief: Brief;
      pinned: boolean;
      pinned_at_ms: string | null;
      size_bytes: number;
    }>;
    if (rows.length === 0) return null;
    const r = rows[0];
    return {
      taskId: r.task_id,
      cid: r.cid,
      brief: r.brief,
      pinned: r.pinned,
      pinnedAtMs: r.pinned_at_ms ? Number(r.pinned_at_ms) : undefined,
      size: r.size_bytes,
    };
  } catch (err) {
    console.error("[brief-route] dbGet failed:", err);
    return null;
  }
}

async function dbList(limit = 100): Promise<Entry[]> {
  const sql = getSql();
  if (!sql) return [];
  try {
    await ensureSchema();
    const rows = (await sql`
      SELECT task_id, cid, brief, pinned, pinned_at_ms, size_bytes
      FROM task_briefs
      ORDER BY created_at DESC
      LIMIT ${limit}
    `) as Array<{
      task_id: string;
      cid: string;
      brief: Brief;
      pinned: boolean;
      pinned_at_ms: string | null;
      size_bytes: number;
    }>;
    return rows.map((r) => ({
      taskId: r.task_id,
      cid: r.cid,
      brief: r.brief,
      pinned: r.pinned,
      pinnedAtMs: r.pinned_at_ms ? Number(r.pinned_at_ms) : undefined,
      size: r.size_bytes,
    }));
  } catch (err) {
    console.error("[brief-route] dbList failed:", err);
    return [];
  }
}

function isHexTaskId(s: unknown): s is string {
  return typeof s === "string" && /^0x[0-9a-fA-F]{64}$/.test(s);
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function normalizeCategory(raw: unknown): Category {
  if (typeof raw === "string") {
    const lc = raw.toLowerCase().trim();
    if ((CATEGORIES as string[]).includes(lc)) return lc as Category;
  }
  return "other";
}

function normalizeBrief(raw: unknown): Brief | null {
  if (!isPlainObject(raw)) return null;
  const title = typeof raw.title === "string" ? raw.title.trim() : "";
  const description =
    typeof raw.description === "string" ? raw.description.trim() : "";
  if (!title || !description) return null;
  const tags = Array.isArray(raw.tags)
    ? raw.tags.filter((t): t is string => typeof t === "string")
    : undefined;
  return {
    title: title.slice(0, 200),
    description: description.slice(0, 4000),
    category: normalizeCategory(raw.category),
    tags: tags?.slice(0, 24),
    minReputation:
      typeof raw.minReputation === "string"
        ? raw.minReputation
        : typeof raw.minReputation === "number"
          ? String(raw.minReputation)
          : undefined,
    minJobs:
      typeof raw.minJobs === "string"
        ? raw.minJobs
        : typeof raw.minJobs === "number"
          ? String(raw.minJobs)
          : undefined,
    payoutOg: typeof raw.payoutOg === "string" ? raw.payoutOg : undefined,
    bondOg: typeof raw.bondOg === "string" ? raw.bondOg : undefined,
    deadlineSec:
      typeof raw.deadlineSec === "number" ? raw.deadlineSec : undefined,
    postedAtMs:
      typeof raw.postedAtMs === "number" ? raw.postedAtMs : Date.now(),
    postedBy: typeof raw.postedBy === "string" ? raw.postedBy : undefined,
  };
}

function contentHashCid(payload: Buffer): string {
  return `0g://pending-${createHash("sha256").update(payload).digest("hex")}`;
}

async function pinTo0g(payload: Buffer): Promise<string | null> {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) return null;
  let dir: string | null = null;
  try {
    const storageSdk =
      (await import("@0gfoundation/0g-storage-ts-sdk")) as Record<
        string,
        unknown
      >;
    const ethers = (await import("ethers")) as Record<string, unknown>;
    const Indexer = storageSdk.Indexer as
      | (new (rpc: string) => {
          upload?: (
            file: unknown,
            rpc: string,
            signer: unknown,
          ) => Promise<[unknown, Error | null]>;
          uploadFile?: (
            file: unknown,
            rpc: string,
            signer: unknown,
          ) => Promise<unknown>;
        })
      | undefined;
    const ZgFile = storageSdk.ZgFile as
      | {
          fromFilePath: (path: string) => Promise<{
            merkleTree: () => Promise<
              [{ rootHash: () => string }, Error | null]
            >;
            close?: () => Promise<void>;
          }>;
        }
      | undefined;
    const JsonRpcProvider = (
      ethers as { JsonRpcProvider?: new (url: string) => unknown }
    ).JsonRpcProvider;
    const Wallet = (
      ethers as { Wallet?: new (key: string, provider: unknown) => unknown }
    ).Wallet;
    if (!Indexer || !ZgFile || !JsonRpcProvider || !Wallet) return null;

    const indexerRpc =
      process.env.ZG_STORAGE_INDEXER_RPC ?? DEFAULT_INDEXER_RPC;
    const galileoRpc = process.env.GALILEO_RPC ?? DEFAULT_GALILEO_RPC;
    const indexer = new Indexer(indexerRpc);
    const provider = new JsonRpcProvider(galileoRpc);
    const signer = new Wallet(privateKey, provider);

    dir = await mkdtemp(join(tmpdir(), "ledger-brief-"));
    const path = join(dir, `brief-${randomBytes(4).toString("hex")}.json`);
    await writeFile(path, payload);

    const file = await ZgFile.fromFilePath(path);
    try {
      if (typeof indexer.uploadFile === "function") {
        const result = await indexer.uploadFile(file, galileoRpc, signer);
        const cid = normalizeCid(result);
        if (cid) return cid;
      }
      if (typeof indexer.upload === "function") {
        const [tx, err] = await indexer.upload(file, galileoRpc, signer);
        if (err) throw err;
        const [tree, treeErr] = await file.merkleTree();
        if (treeErr) throw treeErr;
        // `tx` is an object { txHash, rootHash, txSeq } on this SDK version,
        // not a string — extract the actual hash so the CID query string is
        // a real on-chain reference instead of "[object Object]".
        const txHash =
          tx && typeof tx === "object" && "txHash" in tx
            ? String((tx as { txHash: unknown }).txHash)
            : typeof tx === "string"
              ? tx
              : "";
        const root = tree.rootHash();
        return txHash ? `0g://${root}?tx=${txHash}` : `0g://${root}`;
      }
    } finally {
      await file.close?.();
    }
    return null;
  } catch (err) {
    console.warn(
      "[brief-route] 0G pin failed, falling back to pending CID",
      err instanceof Error ? err.message : err,
    );
    return null;
  } finally {
    if (dir) {
      await rm(dir, { recursive: true, force: true }).catch(() => {});
    }
  }
}

function normalizeCid(raw: unknown): string | null {
  if (!raw) return null;
  if (typeof raw === "string") {
    return raw.startsWith("0g://") ? raw : `0g://${raw.replace(/^0x/, "")}`;
  }
  if (typeof raw === "object" && raw !== null) {
    const obj = raw as Record<string, unknown>;
    const root =
      (typeof obj.rootHash === "string" && obj.rootHash) ||
      (typeof obj.root === "string" && obj.root) ||
      (typeof obj.cid === "string" && obj.cid);
    if (root) return root.startsWith("0g://") ? root : `0g://${root}`;
  }
  return null;
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  if (!isPlainObject(body)) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  const taskId = body.taskId;
  if (!isHexTaskId(taskId)) {
    return NextResponse.json(
      { error: "invalid_taskId", hint: "expected 0x-prefixed bytes32" },
      { status: 400 },
    );
  }
  const brief = normalizeBrief(body.brief);
  if (!brief) {
    return NextResponse.json(
      {
        error: "invalid_brief",
        hint: "title + description are required strings",
      },
      { status: 400 },
    );
  }

  const payload = Buffer.from(JSON.stringify(brief), "utf8");
  const pinned = await pinTo0g(payload);
  const cid = pinned ?? contentHashCid(payload);

  const entry: Entry = {
    taskId: taskId.toLowerCase(),
    cid,
    brief,
    pinned: pinned !== null,
    pinnedAtMs: pinned ? Date.now() : undefined,
    size: payload.byteLength,
  };
  cache.set(entry.taskId, entry);
  await dbUpsert(entry);

  return NextResponse.json({
    ok: true,
    taskId: entry.taskId,
    cid: entry.cid,
    pinned: entry.pinned,
    size: entry.size,
  });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const taskId = url.searchParams.get("taskId");

  // No taskId → list all briefs from Postgres (falls back to warm cache when
  // DATABASE_URL is unset). The /jobs page calls this once per render to map
  // taskId → brief without N round-trips.
  if (!taskId) {
    let entries = await dbList(200);
    if (entries.length === 0) {
      entries = Array.from(cache.values());
    } else {
      // Refresh warm cache from DB so subsequent reads hit memory.
      for (const e of entries) cache.set(e.taskId, e);
    }
    return NextResponse.json({
      ok: true,
      count: entries.length,
      briefs: entries.map((e) => ({
        taskId: e.taskId,
        cid: e.cid,
        pinned: e.pinned,
        pinnedAtMs: e.pinnedAtMs,
        size: e.size,
        brief: e.brief,
      })),
    });
  }

  if (!isHexTaskId(taskId)) {
    return NextResponse.json(
      { error: "invalid_taskId", hint: "expected 0x-prefixed bytes32" },
      { status: 400 },
    );
  }
  const taskIdLower = taskId.toLowerCase();
  let entry = cache.get(taskIdLower);
  if (!entry) {
    const fromDb = await dbGet(taskIdLower);
    if (fromDb) {
      cache.set(taskIdLower, fromDb);
      entry = fromDb;
    }
  }
  if (!entry) {
    return NextResponse.json(
      {
        error: "not_found",
        hint: "Brief not in registry. The task was posted before the brief route was deployed, or the POST never reached this route.",
      },
      { status: 404 },
    );
  }
  return NextResponse.json({
    ok: true,
    taskId: entry.taskId,
    cid: entry.cid,
    pinned: entry.pinned,
    pinnedAtMs: entry.pinnedAtMs,
    size: entry.size,
    brief: entry.brief,
  });
}
