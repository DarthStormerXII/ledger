import { ensNormalize } from "ethers";

// "root" means the worker label itself with no capability prefix
// (e.g. `worker-001.ledger.eth`). It resolves to the live owner address
// — same value as `who.*` — so the ENS app surfaces a real Address record
// for the worker root, matching how chase.uni.eth / jesse.base.eth behave.
export type Namespace = "root" | "who" | "pay" | "tx" | "rep" | "mem";

export type ParsedName =
  | {
      namespace: "root" | "who" | "pay" | "rep" | "mem";
      workerLabel: string;
      tokenId: bigint;
      parentName: string;
    }
  | {
      namespace: "tx";
      txId: string;
      workerLabel: string;
      tokenId: bigint;
      parentName: string;
    };

const WORKER_RE = /^worker-(\d+)$/u;

export function decodeDnsName(encodedName: string): string {
  const bytes = Buffer.from(strip0x(encodedName), "hex");
  const labels: string[] = [];
  let cursor = 0;

  while (cursor < bytes.length) {
    const len = bytes.readUInt8(cursor);
    if (len === 0) break;
    const start = cursor + 1;
    const end = start + len;
    labels.push(bytes.subarray(start, end).toString("utf8"));
    cursor = end;
  }

  return labels.join(".");
}

export function parseLedgerName(
  name: string,
  configuredParent: string,
): ParsedName {
  const normalized = ensNormalize(name).toLowerCase();
  const parentName = ensNormalize(configuredParent).toLowerCase();
  const parentLabels = parentName.split(".");
  const labels = normalized.split(".");

  if (!normalized.endsWith(`.${parentName}`)) {
    throw new Error(`Name ${name} is outside parent ${parentName}`);
  }

  const relative = labels.slice(0, labels.length - parentLabels.length);
  if (relative.length === 0) {
    throw new Error(`Name ${name} is the parent itself`);
  }

  // 1 label: worker root — `worker-NNN.<parent>`. Resolves like `who.*` so the
  // ENS app shows an Address record for the worker name itself (matching
  // chase.uni.eth / jesse.base.eth which resolve at the worker root too).
  if (relative.length === 1) {
    const [workerLabel] = relative;
    return {
      namespace: "root",
      workerLabel,
      tokenId: tokenIdFromWorker(workerLabel),
      parentName,
    };
  }

  const [namespace] = relative;
  if (!isNamespace(namespace)) {
    throw new Error(`Unsupported namespace ${namespace}`);
  }

  if (namespace === "tx") {
    if (relative.length !== 3) {
      throw new Error("tx namespace requires tx.<txid>.<worker>");
    }
    return {
      namespace,
      txId: relative[1],
      workerLabel: relative[2],
      tokenId: tokenIdFromWorker(relative[2]),
      parentName,
    };
  }

  if (relative.length !== 2) {
    throw new Error(`${namespace} namespace requires ${namespace}.<worker>`);
  }

  return {
    namespace,
    workerLabel: relative[1],
    tokenId: tokenIdFromWorker(relative[1]),
    parentName,
  };
}

function isNamespace(value: string): value is Namespace {
  return ["who", "pay", "tx", "rep", "mem"].includes(value);
}

function tokenIdFromWorker(workerLabel: string): bigint {
  const match = WORKER_RE.exec(workerLabel);
  if (!match) {
    throw new Error(`Worker label must match worker-NNN: ${workerLabel}`);
  }
  return BigInt(match[1]);
}

function strip0x(value: string): string {
  return value.startsWith("0x") ? value.slice(2) : value;
}
