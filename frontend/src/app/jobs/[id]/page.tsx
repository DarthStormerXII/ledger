import { notFound } from "next/navigation";
import { formatEther } from "viem";
import { Shell } from "@/components/Shell";
import { AuctionRoomClient, type LiveJobReceipt } from "./AuctionRoomClient";
import { getAllJobs, liveJobToJob, getAllLots, liveLotToLot } from "@/lib/live";

export const revalidate = 0;

export default async function JobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const decoded = decodeURIComponent(id).toLowerCase();
  const [liveJobs, liveLots] = await Promise.all([
    getAllJobs().catch(() => []),
    getAllLots().catch(() => []),
  ]);
  const liveJob = liveJobs.find((j) => j.taskId.toLowerCase() === decoded);
  if (!liveJob) notFound();
  const job = liveJobToJob(liveJob);
  const lots = liveLots.map(liveLotToLot);

  // Pre-shape the rich on-chain receipt so the client doesn't have to
  // re-fetch from RPC. Lets the auction room render full bid-accepted /
  // settled detail without going to the chain again from the browser.
  const winnerLot = liveJob.worker
    ? lots.find((l) => l.owner.toLowerCase() === liveJob.worker!.toLowerCase())
    : undefined;
  const receipt: LiveJobReceipt = {
    taskId: liveJob.taskId,
    buyer: liveJob.buyer,
    worker: liveJob.worker,
    workerEnsName: winnerLot?.ens,
    workerJobs: winnerLot?.jobs ?? null,
    workerRating: winnerLot?.rating ?? null,
    workerEarned: winnerLot?.earned ?? null,
    payment: liveJob.payment.toString(),
    paymentEth: formatEther(liveJob.payment),
    bidAmount: liveJob.bidAmount.toString(),
    bidAmountEth:
      liveJob.bidAmount > 0n ? formatEther(liveJob.bidAmount) : null,
    deadline: Number(liveJob.deadline),
    minReputation: liveJob.minReputation.toString(),
    status: liveJob.status,
    postedTx: liveJob.postedTx,
    postedBlock: Number(liveJob.postedBlock),
  };

  return (
    <Shell>
      <AuctionRoomClient job={job} lots={lots} receipt={receipt} />
    </Shell>
  );
}
