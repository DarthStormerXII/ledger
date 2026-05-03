#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const liveBase = "https://ledger-open-agents.vercel.app";
const publicRepos = [
  "https://github.com/DarthStormerXII/ledger.git",
  "https://github.com/DarthStormerXII/ledger-v1.git",
];
const livePaths = ["/", "/proof", "/jobs", "/register", "/pitch", "/api/jobs/brief"];
const staleNeedles = [
  "0x48B051F3e565E394ED8522ac453d87b3Fa40ad62",
  "0x12D2162F47AAAe1B0591e898648605daA186D644",
  "0xCAe1c804932AB07d3428774058eC14Fb4dfb2baB",
  "0xa6a621e9C92fb8DFC963d2C20e8C5CB4C5178cBb",
  "0x229869949693f1467b8b43d2907bDAE3C58E3047",
  "0xc41cebd48d86382bba75d08fa514da2e151924c3f03dd7d2652992c693bd001f",
  "0x3e6b0e4f27ee0796460407d084d9bc99f94a033f5b18073291af5899a8053a79",
];

function run(bin, args, opts = {}) {
  return execFileSync(bin, args, {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    timeout: opts.timeout ?? 15000,
  }).trim();
}

function maybeRun(bin, args, opts = {}) {
  try {
    return run(bin, args, opts);
  } catch (error) {
    return opts.fallback ?? "";
  }
}

function git(args, opts) {
  return run("git", args, opts);
}

function readRel(path) {
  return readFileSync(join(root, path), "utf8");
}

function lineOf(path, needle) {
  const lines = readRel(path).split(/\r?\n/);
  const idx = lines.findIndex((line) => line.includes(needle));
  return idx === -1 ? null : idx + 1;
}

async function httpStatus(path) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch(`${liveBase}${path}`, {
      redirect: "follow",
      signal: controller.signal,
    });
    return response.status;
  } catch (error) {
    return `ERR:${error instanceof Error ? error.message : String(error)}`;
  } finally {
    clearTimeout(timer);
  }
}

function publicRef(repo) {
  const out = maybeRun("git", ["ls-remote", repo, "refs/heads/main"], {
    timeout: 20000,
  });
  return out ? out.split(/\s+/)[0] : null;
}

function staleHits() {
  const pattern = staleNeedles.map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  const out = maybeRun(
    "rg",
    [
      "-n",
      "--hidden",
      pattern,
      ".",
      "--glob",
      "!node_modules",
      "--glob",
      "!frontend/.next",
      "--glob",
      "!contracts/cache",
      "--glob",
      "!contracts/out",
      "--glob",
      "!tools/submission/sync-state.mjs",
    ],
    { fallback: "" },
  );
  return out
    ? out
        .split(/\r?\n/)
        .filter(Boolean)
        .filter((line) => !line.startsWith("tools/submission/sync-state.mjs:"))
        .filter((line) => !line.includes("Stale address guard: do not use old escrow"))
    : [];
}

function manifest() {
  const path = "proofs/data/contract-verification.json";
  if (!existsSync(join(root, path))) return null;
  return JSON.parse(readRel(path));
}

function statusEntries() {
  const out = maybeRun("git", ["status", "--short"]);
  return out ? out.split(/\r?\n/).filter(Boolean) : [];
}

function anchor(path, symbol) {
  const line = lineOf(path, symbol);
  const head = git(["rev-parse", "HEAD"]);
  return line
    ? `https://github.com/DarthStormerXII/ledger/blob/${head}/${path}#L${line}`
    : null;
}

const head = git(["rev-parse", "HEAD"]);
const state = {
  capturedAt: new Date().toISOString(),
  head,
  headSubject: git(["log", "-1", "--pretty=%s"]),
  originMain: maybeRun("git", ["rev-parse", "origin/main"], { fallback: null }),
  dirty: statusEntries(),
  publicRefs: Object.fromEntries(publicRepos.map((repo) => [repo, publicRef(repo)])),
  live: Object.fromEntries(await Promise.all(livePaths.map(async (path) => [path, await httpStatus(path)]))),
  contractManifest: manifest(),
  submissionHasHead: readRel("docs/SUBMISSION.md").includes(head),
  codeAnchors: {
    zeroG: anchor("agents/ledger-agent-kit/src/runtime.ts", "export class LedgerAgentRuntime"),
    gensyn: anchor("agents/axl-client/src/index.ts", "async send("),
    ens: anchor("resolver/src/resolver.ts", "export async function resolveName"),
  },
  staleHits: staleHits(),
};

const material = [];
if (state.originMain !== head) material.push("origin/main is not equal to HEAD");
for (const [repo, ref] of Object.entries(state.publicRefs)) {
  if (ref !== head) material.push(`${repo} main is not equal to HEAD`);
}
for (const [path, status] of Object.entries(state.live)) {
  if (status !== 200) material.push(`${liveBase}${path} returned ${status}`);
}
if (!state.contractManifest) material.push("proofs/data/contract-verification.json is missing");
if (!state.submissionHasHead) material.push("docs/SUBMISSION.md does not contain current HEAD");
if (state.staleHits.length) material.push("stale redeploy addresses or tx hashes found");
if (state.dirty.some((entry) => entry.includes("proofs/data/contract-verification.json"))) {
  material.push("contract verification manifest is not committed yet");
}

state.materialUpdateNeeded = material.length > 0;
state.materialReasons = material;

if (process.argv.includes("--json")) {
  process.stdout.write(`${JSON.stringify(state, null, 2)}\n`);
} else {
  process.stdout.write(`# Ledger Submission Sync State\n\n`);
  process.stdout.write(`Captured: ${state.capturedAt}\n`);
  process.stdout.write(`HEAD: ${state.head}\n`);
  process.stdout.write(`Subject: ${state.headSubject}\n`);
  process.stdout.write(`origin/main: ${state.originMain}\n`);
  process.stdout.write(`Dirty entries: ${state.dirty.length}\n`);
  process.stdout.write(`Material update needed: ${state.materialUpdateNeeded ? "yes" : "no"}\n`);
  if (material.length) {
    process.stdout.write(`Reasons:\n${material.map((r) => `- ${r}`).join("\n")}\n`);
  }
  process.stdout.write(`\nLive routes:\n`);
  for (const [path, status] of Object.entries(state.live)) {
    process.stdout.write(`- ${path}: ${status}\n`);
  }
  process.stdout.write(`\nCode anchors:\n`);
  for (const [name, url] of Object.entries(state.codeAnchors)) {
    process.stdout.write(`- ${name}: ${url ?? "missing"}\n`);
  }
}
