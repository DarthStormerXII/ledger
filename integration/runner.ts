// Ledger integration test runner. Discovers every scenario file under scenarios/,
// executes them in series, writes per-scenario JSON proofs and a SUMMARY.json,
// and prints a colored summary to stdout.
import { readdir } from "node:fs/promises";
import { resolve, dirname, basename, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { writeFile, mkdir } from "node:fs/promises";
import {
  PROOFS_DIR,
  writeProof,
  type ScenarioResult,
} from "./scenarios/_lib.js";
import { JsonRpcProvider } from "ethers";

const HERE = dirname(fileURLToPath(import.meta.url));
const SCENARIOS_DIR = resolve(HERE, "scenarios");

const COLORS = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
};

function color(c: keyof typeof COLORS, s: string): string {
  return process.stdout.isTTY ? `${COLORS[c]}${s}${COLORS.reset}` : s;
}

interface Preflight {
  galileoLive: boolean;
  galileoChainId?: number;
  galileoRpc: string;
  resolverGatewayUrl?: string;
  axlBridgeUrl: string;
  axlReachable: boolean;
  notes: string[];
}

async function preflight(): Promise<Preflight> {
  const notes: string[] = [];
  const galileoRpc = process.env.GALILEO_RPC ?? "https://evmrpc-testnet.0g.ai";
  let galileoChainId: number | undefined;
  let galileoLive = false;
  try {
    const provider = new JsonRpcProvider(galileoRpc, undefined, {
      staticNetwork: false,
    });
    const id = await Promise.race([
      provider.getNetwork().then((n) => Number(n.chainId)),
      new Promise<number>((_r, rej) =>
        setTimeout(() => rej(new Error("rpc timeout")), 4_000),
      ),
    ]);
    galileoChainId = id;
    galileoLive = id === 16602;
    notes.push(`0G Galileo RPC ${galileoRpc} reachable, chainId=${id}`);
  } catch (err) {
    notes.push(
      `0G Galileo RPC ${galileoRpc} not reachable: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  const axlBridgeUrl = process.env.AXL_BRIDGE_URL ?? "http://127.0.0.1:9002";
  let axlReachable = false;
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 1_500);
    const resp = await fetch(`${axlBridgeUrl}/topology`, {
      signal: ctrl.signal,
    });
    clearTimeout(t);
    axlReachable = resp.ok;
    notes.push(
      `AXL bridge ${axlBridgeUrl} ${resp.ok ? "reachable" : `HTTP ${resp.status}`}`,
    );
  } catch (err) {
    notes.push(
      `AXL bridge ${axlBridgeUrl} not reachable: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  const resolverGatewayUrl = process.env.LEDGER_RESOLVER_URL;
  if (resolverGatewayUrl) notes.push(`Resolver gateway: ${resolverGatewayUrl}`);
  else notes.push("Resolver gateway: not configured (LEDGER_RESOLVER_URL)");

  return {
    galileoLive,
    galileoChainId,
    galileoRpc,
    resolverGatewayUrl,
    axlBridgeUrl,
    axlReachable,
    notes,
  };
}

async function discoverScenarios(): Promise<{ name: string; path: string }[]> {
  const entries = await readdir(SCENARIOS_DIR, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && e.name.match(/^\d{2}_.*\.ts$/))
    .map((e) => ({
      name: basename(e.name, extname(e.name)),
      path: resolve(SCENARIOS_DIR, e.name),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

async function runScenario(path: string): Promise<ScenarioResult> {
  const mod = await import(path);
  if (typeof mod.run !== "function")
    throw new Error(`scenario ${path} missing run()`);
  return mod.run();
}

async function main() {
  console.log(color("bold", "\n=== Ledger Integration Runner ===\n"));

  const flight = await preflight();
  for (const note of flight.notes) console.log(color("gray", "  - " + note));
  console.log("");

  const scenarios = await discoverScenarios();
  console.log(color("cyan", `Discovered ${scenarios.length} scenarios.\n`));

  const results: ScenarioResult[] = [];
  let totalDuration = 0;
  for (const s of scenarios) {
    process.stdout.write(`  → ${color("bold", s.name)} ... `);
    const r = await runScenario(s.path);
    await writeProof(s.name, r);
    results.push(r);
    totalDuration += r.durationMs;
    if (r.pass) {
      console.log(
        color("green", `PASS`) + color("gray", ` (${r.durationMs}ms)`),
      );
    } else {
      console.log(color("red", `FAIL`) + color("gray", ` (${r.durationMs}ms)`));
      for (const reason of r.reasons)
        console.log(color("red", `      ✗ ${reason}`));
    }
  }

  const passed = results.filter((r) => r.pass).length;
  const failed = results.length - passed;

  await mkdir(PROOFS_DIR, { recursive: true });
  await writeFile(
    resolve(PROOFS_DIR, "SUMMARY.json"),
    JSON.stringify(
      {
        runAt: new Date().toISOString(),
        preflight: flight,
        totalScenarios: results.length,
        passed,
        failed,
        totalDurationMs: totalDuration,
        scenarios: results.map((r) => ({
          name: r.scenario,
          pass: r.pass,
          durationMs: r.durationMs,
          reasons: r.reasons,
          eventCounts: (r.artifacts as Record<string, unknown>).eventCounts,
        })),
      },
      (_k, v) => (typeof v === "bigint" ? v.toString() : v),
      2,
    ),
    "utf8",
  );

  console.log("");
  console.log(
    color(
      "bold",
      `Summary: ${passed}/${results.length} passed, total ${totalDuration}ms`,
    ),
  );
  if (failed > 0) {
    console.log(color("red", `${failed} scenario(s) failed`));
    process.exit(1);
  } else {
    console.log(color("green", `All scenarios passed.`));
    console.log(color("gray", `Proofs written to ${PROOFS_DIR}`));
  }
}

main().catch((err) => {
  console.error(
    color(
      "red",
      `Runner crashed: ${err instanceof Error ? err.stack : String(err)}`,
    ),
  );
  process.exit(2);
});
