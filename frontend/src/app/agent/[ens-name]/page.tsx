import { notFound } from "next/navigation";
import { Shell } from "@/components/Shell";
import { WorkerProfileClient } from "./WorkerProfileClient";
import {
  getAllLots,
  liveLotToLot,
  getAllJobs,
  getRepHistory,
  WORKERS,
} from "@/lib/live";
import { galileoClient } from "@/lib/clients";
import type { RecentJob, ProvenanceEvent } from "@/lib/data";
import {
  ERC8004_REPUTATION_REGISTRY,
  WORKER_INFT_ADDRESS,
} from "@/lib/contracts";
import { formatEther, parseAbiItem, type Hex } from "viem";

// Format an absolute unix-second timestamp to "May 03, 14:23 UTC".
function fmtUtc(unixSec: number): string {
  const d = new Date(unixSec * 1000);
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const m = months[d.getUTCMonth()];
  const day = String(d.getUTCDate()).padStart(2, "0");
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${m} ${day}, ${hh}:${mm} UTC`;
}

// Fetch block timestamps in parallel; cache same-block lookups so we don't
// pay for duplicate getBlock calls when several events landed in one block.
async function fetchBlockTimes(blocks: bigint[]): Promise<Map<bigint, number>> {
  const unique = Array.from(new Set(blocks.filter((b) => b > 0n)));
  const out = new Map<bigint, number>();
  if (unique.length === 0) return out;
  const results = await Promise.all(
    unique.map(async (b) => {
      try {
        const block = await galileoClient.getBlock({ blockNumber: b });
        return [b, Number(block.timestamp)] as const;
      } catch {
        return [b, 0] as const;
      }
    }),
  );
  for (const [b, t] of results) out.set(b, t);
  return out;
}

// Cache the SSR result for 60s. Without this every visitor re-runs the
// multi-chain log scans below (Transfer events on Galileo, NewFeedback on
// Base Sepolia, escrow task reads), and a cold render on the public RPC
// can blow past 60s — the browser gives up on a blank page.
export const revalidate = 60;

export default async function AgentPage({
  params,
}: {
  params: Promise<{ "ens-name": string }>;
}) {
  const { "ens-name": rawName } = await params;
  const ens = decodeURIComponent(rawName).toLowerCase();

  const liveLots = await getAllLots().catch(() => []);
  const liveLot =
    liveLots.find((l) => l.ensName.toLowerCase() === ens) ?? liveLots[0];
  if (!liveLot) notFound();
  const lot = liveLotToLot(liveLot);

  // Build recent-jobs from on-chain escrow events where this worker won
  let recentJobs: RecentJob[] = [];
  let provenance: ProvenanceEvent[] = [];
  let settlementProof:
    | {
        releaseTx?: string;
        reputationRegistry: string;
        memoryCID: string;
      }
    | undefined;
  // Single getAllJobs() call shared between recent-jobs and provenance blocks
  // — used to be called twice, doubling the chain reads on every render.
  const allJobs = await getAllJobs().catch(() => []);
  try {
    const ownerLower = liveLot.owner.toLowerCase();
    const workerJobs = allJobs.filter(
      (j) =>
        j.worker?.toLowerCase() === ownerLower &&
        (j.status === "Released" || j.status === "Accepted"),
    );
    const releasedJob = workerJobs.find((j) => j.status === "Released");
    if (releasedJob) {
      settlementProof = {
        releaseTx: releasedJob.releaseTx,
        reputationRegistry: ERC8004_REPUTATION_REGISTRY,
        memoryCID: liveLot.memoryCID,
      };
    }
    const recentSlice = workerJobs.slice(0, 6);
    // Get block timestamps for each row's most-recent state-change tx so
    // the table can show real "when did this happen" — used to be hardcoded "—".
    const blockNumbers = recentSlice.map(
      (j) => j.releaseBlock ?? j.postedBlock,
    );
    const blockTimes = await fetchBlockTimes(blockNumbers);
    recentJobs = recentSlice.map((j) => {
      const block = j.releaseBlock ?? j.postedBlock;
      const ts = blockTimes.get(block) ?? 0;
      return {
        date: ts > 0 ? fmtUtc(ts) : "—",
        employer: `${j.buyer.slice(0, 6)}…${j.buyer.slice(-4)}`,
        title: "",
        realized: `${formatEther(j.bidAmount)} 0G`,
        rating: liveLot.rating || 5,
        taskId: j.taskId,
        txHash: j.releaseTx ?? j.postedTx,
        status: j.status,
      };
    });
  } catch {
    /* empty */
  }

  // Real provenance from WorkerINFT Transfer events for this lot's tokenId.
  // Mint = Transfer(0x0, owner, tokenId); subsequent rows are owner→owner.
  // We cap the lookback at ~10 days of Galileo (block time ~3s ⇒ 288k blocks).
  // Scanning from block 0 made the public RPC time out; this window still
  // covers any iNFT minted during the demo cycle.
  try {
    const tokenId = BigInt(liveLot.tokenId);
    const tip = await galileoClient.getBlockNumber().catch(() => 0n);
    const fromBlock = tip > 288_000n ? tip - 288_000n : 0n;
    const transferLogs = await galileoClient.getLogs({
      address: WORKER_INFT_ADDRESS,
      event: parseAbiItem(
        "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
      ),
      args: { tokenId },
      fromBlock,
    });
    const provBlocks = transferLogs.map((l) => l.blockNumber ?? 0n);
    const provTimes = await fetchBlockTimes(provBlocks);
    const events: ProvenanceEvent[] = transferLogs.map((l) => {
      const ts = provTimes.get(l.blockNumber ?? 0n) ?? 0;
      const from = (l.args.from ?? "0x0") as Hex;
      const to = (l.args.to ?? "0x0") as Hex;
      const isMint = from === "0x0000000000000000000000000000000000000000";
      const shortAddr = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;
      return {
        date: ts > 0 ? fmtUtc(ts) : "—",
        action: isMint ? "Minted on Galileo" : "Transferred",
        to: shortAddr(to),
        price: null,
        label: isMint ? liveLot.agentName : `from ${shortAddr(from)}`,
        txHash: (l.transactionHash ?? undefined) as string | undefined,
      };
    });
    // Append release events (settlements) for jobs this worker won.
    // Reuses the hoisted allJobs — no second getAllJobs() roundtrip.
    const releasedJobs = allJobs.filter(
      (j) =>
        j.worker?.toLowerCase() === liveLot.owner.toLowerCase() &&
        j.status === "Released" &&
        j.releaseTx,
    );
    if (releasedJobs.length) {
      const releaseTimes = await fetchBlockTimes(
        releasedJobs.map((j) => j.releaseBlock ?? 0n),
      );
      for (const j of releasedJobs) {
        const ts = releaseTimes.get(j.releaseBlock ?? 0n) ?? 0;
        events.push({
          date: ts > 0 ? fmtUtc(ts) : "—",
          action: "Job settled",
          to: `${j.buyer.slice(0, 6)}…${j.buyer.slice(-4)}`,
          price: formatEther(j.bidAmount),
          label: `task ${j.taskId.slice(0, 10)}…`,
          txHash: j.releaseTx,
        });
      }
    }
    provenance = events;
  } catch {
    // Fall back to the minimal mint stub if log fetch fails.
    provenance = [
      {
        date: "—",
        action: "Minted on Galileo",
        to: liveLot.ownerShort,
        price: null,
        label: liveLot.agentName,
      },
    ];
  }

  // Real ERC-8004 reputation history for this agent on Base Sepolia.
  // Empty array → ReputationChart renders an explicit "no feedback yet"
  // empty state rather than fabricated points.
  const repHistory = await getRepHistory(BigInt(liveLot.agentId)).catch(
    () => [],
  );

  return (
    <Shell>
      <WorkerProfileClient
        lot={lot}
        liveProof={{
          tokenId: Number(liveLot.tokenId),
          memoryCID: liveLot.memoryCID,
          agentId: liveLot.agentId.toString(),
          owner: liveLot.owner,
        }}
        recentJobs={recentJobs}
        provenance={provenance}
        settlementProof={settlementProof}
        repHistory={repHistory}
      />
    </Shell>
  );
}

// Tell next.js which paths to pre-render — let it be dynamic for any minted
// worker by ensuring all known WORKERS map to a static path.
export async function generateStaticParams() {
  return WORKERS.map((w) => ({ "ens-name": w.ensName }));
}
