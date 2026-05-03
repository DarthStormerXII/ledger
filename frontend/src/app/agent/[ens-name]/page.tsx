import { notFound } from "next/navigation";
import { Shell } from "@/components/Shell";
import { WorkerProfileClient } from "./WorkerProfileClient";
import { getAllLots, liveLotToLot, getAllJobs, WORKERS } from "@/lib/live";
import type { RecentJob, ProvenanceEvent } from "@/lib/data";
import { ERC8004_REPUTATION_REGISTRY } from "@/lib/contracts";
import { formatEther } from "viem";

export const revalidate = 0;

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
  try {
    const allJobs = await getAllJobs();
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
    recentJobs = workerJobs.slice(0, 6).map((j) => ({
      date: "—",
      employer: `${j.buyer.slice(0, 6)}…${j.buyer.slice(-4)}`,
      title: "",
      realized: `${formatEther(j.bidAmount)} 0G`,
      rating: liveLot.rating || 5,
    }));
  } catch {
    /* empty */
  }

  provenance = [
    {
      date: "—",
      action: "Minted on Galileo",
      to: liveLot.ownerShort,
      price: null,
      label: liveLot.agentName,
    },
  ];

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
      />
    </Shell>
  );
}

// Tell next.js which paths to pre-render — let it be dynamic for any minted
// worker by ensuring all known WORKERS map to a static path.
export async function generateStaticParams() {
  return WORKERS.map((w) => ({ "ens-name": w.ensName }));
}
