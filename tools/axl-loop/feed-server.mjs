/**
 * Tiny HTTP server that exposes the local task + bid JSONL feeds over a fixed
 * URL so Vercel's /api/axl/recv route can drain them through the cloudflared
 * tunnel.
 *
 * Endpoints:
 *   GET /bids?since=<lineNumber>  → JSON: { lines: [...], total: <number> }
 *   GET /tasks?since=<lineNumber> → same shape but for TASK_POSTED
 *
 * Listens on 127.0.0.1:9003. Routed to https://axl.fierypools.fun/feed/* via
 * the M2 cloudflared ingress.
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const TASK_FEED = path.join(ROOT, "tasks-feed.jsonl");
const BIDS_FEED = path.join(ROOT, "bids-feed.jsonl");

function readSince(file, since) {
  let raw = "";
  try {
    raw = fs.readFileSync(file, "utf8");
  } catch {
    return { lines: [], total: 0 };
  }
  const all = raw.split("\n").filter(Boolean);
  const lines = all.slice(since).map((l) => {
    try {
      return JSON.parse(l);
    } catch {
      return null;
    }
  }).filter(Boolean);
  return { lines, total: all.length };
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, "http://localhost");
  res.setHeader("access-control-allow-origin", "*");
  res.setHeader("cache-control", "no-store");
  res.setHeader("content-type", "application/json");

  if (url.pathname === "/bids" || url.pathname === "/feed/bids") {
    const since = Number(url.searchParams.get("since") ?? 0);
    res.end(JSON.stringify(readSince(BIDS_FEED, since)));
    return;
  }
  if (url.pathname === "/tasks" || url.pathname === "/feed/tasks") {
    const since = Number(url.searchParams.get("since") ?? 0);
    res.end(JSON.stringify(readSince(TASK_FEED, since)));
    return;
  }
  if (url.pathname === "/feed" || url.pathname === "/feed/") {
    res.end(
      JSON.stringify({
        ok: true,
        endpoints: ["/feed/bids", "/feed/tasks"],
        feeds: {
          tasks: TASK_FEED,
          bids: BIDS_FEED,
        },
      }),
    );
    return;
  }
  res.statusCode = 404;
  res.end(JSON.stringify({ error: "not found", path: url.pathname }));
});

const port = Number(process.env.LEDGER_FEED_PORT ?? 9003);
server.listen(port, "127.0.0.1", () => {
  console.log(`[feed] listening on 127.0.0.1:${port}`);
  console.log(`[feed] tasks: ${TASK_FEED}`);
  console.log(`[feed] bids:  ${BIDS_FEED}`);
});
