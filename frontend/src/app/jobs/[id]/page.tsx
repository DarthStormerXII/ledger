import { notFound } from "next/navigation";
import { Shell } from "@/components/Shell";
import { AuctionRoomClient } from "./AuctionRoomClient";
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
  return (
    <Shell>
      <AuctionRoomClient job={job} lots={lots} />
    </Shell>
  );
}
