#!/usr/bin/env node
/**
 * Ledger judging-window watchdog.
 *
 * Probes every 2 minutes:
 *   - launchd state of the AXL bridge + 3 worker agents on M2
 *   - cloudflared tunnel (axl.fierypools.fun/topology) returns 200 with peers
 *   - Vercel deployed app root
 *   - Vercel → AXL plumbing (api/axl/topology proxied through to the bridge)
 *   - 0G Galileo RPC reachable
 *
 * Alerts:
 *   - On 2 consecutive failures of the same probe → send WhatsApp via Marty's
 *     CLI (one alert per outage, dedup'd via state file).
 *   - On recovery → send a "✓ recovered" message.
 *
 * Self-disables after JUDGING_END (default 2026-05-06 21:30 IST).
 *
 * Run:
 *   node tools/watchdog/watchdog.mjs            # one tick (for launchd)
 *   node tools/watchdog/watchdog.mjs --loop     # keep running locally for dev
 *
 * Env:
 *   LEDGER_AXL_BRIDGE          public bridge URL (default https://axl.fierypools.fun)
 *   LEDGER_APP_URL             Vercel app URL (default https://ledger-open-agents.vercel.app)
 *   LEDGER_GALILEO_RPC         0G RPC (default https://evmrpc-testnet.0g.ai)
 *   LEDGER_LAUNCHD_PREFIX      launchd label prefix to scan (default "ledger.axl")
 *   LEDGER_WHATSAPP_TO         JID to alert (default 919884009228@c.us — Gabriel personal)
 *   LEDGER_WHATSAPP_CLI_DIR    path to larinova whatsapp ops CLI (default ~/Documents/products/larinova/ops/whatsapp)
 *   LEDGER_WATCHDOG_STATE      state file path (default ~/.cache/ledger-watchdog.json)
 *   LEDGER_JUDGING_END         unix-seconds when watchdog auto-disables (default 2026-05-06 21:30 IST)
 */

import { spawnSync, execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { homedir } from "node:os";

// ---- Config ----------------------------------------------------------------
const BRIDGE_URL = process.env.LEDGER_AXL_BRIDGE ?? "https://axl.fierypools.fun";
const APP_URL = process.env.LEDGER_APP_URL ?? "https://ledger-open-agents.vercel.app";
const GALILEO_RPC = process.env.LEDGER_GALILEO_RPC ?? "https://evmrpc-testnet.0g.ai";
const LAUNCHD_PREFIX = process.env.LEDGER_LAUNCHD_PREFIX ?? "ledger.axl";
const WHATSAPP_TO = process.env.LEDGER_WHATSAPP_TO ?? "919884009228@c.us";
const WHATSAPP_CLI_DIR =
  process.env.LEDGER_WHATSAPP_CLI_DIR ??
  resolve(homedir(), "Documents/products/larinova/ops/whatsapp");
const STATE_FILE =
  process.env.LEDGER_WATCHDOG_STATE ??
  resolve(homedir(), ".cache/ledger-watchdog.json");
// Default: 2026-05-06 21:30 IST (UTC+5:30) = 2026-05-06 16:00 UTC = 1778478600
const JUDGING_END_SEC = Number(
  process.env.LEDGER_JUDGING_END ?? 1778478600,
);

const FAIL_THRESHOLD = 2; // need this many consecutive failures to alert
const PROBE_TIMEOUT_MS = 5000;

// ---- State -----------------------------------------------------------------
// State shape (JSDoc since this is a .mjs):
//   { lastRunSec: number, probes: { [name]: { consecutiveFailures, alerted, lastError?, lastTick } } }

function loadState() {
  try {
    if (!existsSync(STATE_FILE)) return { probes: {}, lastRunSec: 0 };
    return JSON.parse(readFileSync(STATE_FILE, "utf8"));
  } catch {
    return { probes: {}, lastRunSec: 0 };
  }
}
function saveState(state) {
  mkdirSync(dirname(STATE_FILE), { recursive: true });
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

// ---- Probes ----------------------------------------------------------------
async function fetchWithTimeout(url, ms = PROBE_TIMEOUT_MS) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const r = await fetch(url, { signal: ctrl.signal });
    return { ok: r.ok, status: r.status, body: r.ok ? await r.text() : "" };
  } finally {
    clearTimeout(t);
  }
}

async function probeBridge() {
  try {
    const r = await fetchWithTimeout(`${BRIDGE_URL}/topology`);
    if (!r.ok) return { ok: false, error: `HTTP ${r.status}` };
    let body;
    try {
      body = JSON.parse(r.body);
    } catch {
      return { ok: false, error: "non-JSON response" };
    }
    const peerCount = Array.isArray(body?.peers) ? body.peers.length : 0;
    if (peerCount === 0) return { ok: false, error: "0 peers connected" };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

async function probeApp() {
  try {
    const r = await fetchWithTimeout(`${APP_URL}/`);
    if (!r.ok) return { ok: false, error: `HTTP ${r.status}` };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

async function probeAppToBridge() {
  try {
    const r = await fetchWithTimeout(`${APP_URL}/api/axl/topology`);
    if (r.status === 503) return { ok: false, error: "Vercel says bridge unreachable (503)" };
    if (!r.ok) return { ok: false, error: `HTTP ${r.status}` };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

async function probeGalileo() {
  try {
    const r = await fetch(GALILEO_RPC, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "eth_blockNumber",
        params: [],
      }),
      signal: AbortSignal.timeout(PROBE_TIMEOUT_MS),
    });
    if (!r.ok) return { ok: false, error: `HTTP ${r.status}` };
    const body = await r.json();
    if (!body?.result) return { ok: false, error: "no result in RPC response" };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

function probeLaunchd() {
  try {
    // The AXL daemons live on M2. Run launchctl on M2 over SSH (we're
    // executing this watchdog on M4 where Marty's WhatsApp auth lives).
    // SSH alias `m2worker` is already configured in ~/.ssh/config.
    const sshHost = process.env.LEDGER_SSH_HOST ?? "m2worker";
    const cmd = sshHost
      ? `ssh -o StrictHostKeyChecking=accept-new -o ConnectTimeout=5 ${sshHost} 'launchctl list'`
      : "launchctl list";
    const out = execSync(cmd, { timeout: 8000 }).toString();
    const lines = out
      .split("\n")
      .filter((l) => l.includes(LAUNCHD_PREFIX));
    if (lines.length === 0) {
      return {
        ok: false,
        error: `no launchd jobs on ${sshHost} match prefix "${LAUNCHD_PREFIX}"`,
      };
    }
    const dead = [];
    for (const line of lines) {
      const cols = line.trim().split(/\s+/);
      // Format: PID Status Label
      const [pid, , label] = cols;
      if (!pid || pid === "-") {
        dead.push(label ?? line.trim());
      }
    }
    if (dead.length) {
      return {
        ok: false,
        error: `dead launchd jobs: ${dead.join(", ")}`,
      };
    }
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: `launchctl failed: ${e instanceof Error ? e.message : String(e)}`,
    };
  }
}

// ---- Alerting --------------------------------------------------------------
function sendWhatsApp(text) {
  // Cold-boot Marty CLI. Takes ~60s but is fire-and-forget from the watchdog's
  // perspective. We use spawnSync so a failed send doesn't crash the tick.
  const result = spawnSync(
    "npm",
    ["run", "--silent", "send", "--", `--to=${WHATSAPP_TO}`, `--text=${text}`],
    {
      cwd: WHATSAPP_CLI_DIR,
      timeout: 120_000,
      stdio: "pipe",
      env: { ...process.env, PATH: `${process.env.PATH}:/usr/local/bin:/opt/homebrew/bin` },
    },
  );
  const ok = result.status === 0;
  console.log(
    `[watchdog] whatsapp send ${ok ? "OK" : "FAILED"}: ${text.slice(0, 80)}…`,
  );
  if (!ok) {
    console.error("stdout:", result.stdout?.toString()?.slice(-500));
    console.error("stderr:", result.stderr?.toString()?.slice(-500));
  }
  return ok;
}

// ---- Tick ------------------------------------------------------------------
async function tick() {
  const nowSec = Math.floor(Date.now() / 1000);
  if (nowSec > JUDGING_END_SEC) {
    console.log("[watchdog] judging window ended; exiting cleanly");
    return false;
  }

  const probes = {
    bridge: await probeBridge(),
    app: await probeApp(),
    "app→bridge": await probeAppToBridge(),
    galileo: await probeGalileo(),
    launchd: probeLaunchd(),
  };

  const state = loadState();
  state.lastRunSec = nowSec;

  for (const [name, result] of Object.entries(probes)) {
    const ps = state.probes[name] ?? {
      consecutiveFailures: 0,
      alerted: false,
      lastTick: nowSec,
    };
    if (result.ok) {
      if (ps.alerted && ps.consecutiveFailures >= FAIL_THRESHOLD) {
        sendWhatsApp(`✓ Ledger ${name} recovered. Probe: green again.`);
      }
      ps.consecutiveFailures = 0;
      ps.alerted = false;
      ps.lastError = undefined;
    } else {
      ps.consecutiveFailures += 1;
      ps.lastError = result.error;
      if (ps.consecutiveFailures >= FAIL_THRESHOLD && !ps.alerted) {
        sendWhatsApp(
          `🚨 Ledger ${name} DOWN — ${result.error}. ${name === "launchd" ? "ssh m2worker; launchctl list | grep ledger" : `URL: ${name === "bridge" ? BRIDGE_URL : name === "app" ? APP_URL : name === "app→bridge" ? `${APP_URL}/api/axl/topology` : GALILEO_RPC}`}`,
        );
        ps.alerted = true;
      }
    }
    ps.lastTick = nowSec;
    state.probes[name] = ps;
    console.log(
      `[watchdog] ${name}: ${result.ok ? "OK" : `FAIL (${result.error})`} — fails=${ps.consecutiveFailures} alerted=${ps.alerted}`,
    );
  }

  saveState(state);
  return true;
}

// ---- Entry -----------------------------------------------------------------
const loop = process.argv.includes("--loop");
if (loop) {
  console.log("[watchdog] loop mode — every 120s");
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const cont = await tick();
    if (!cont) break;
    await new Promise((r) => setTimeout(r, 120_000));
  }
} else {
  await tick();
}
