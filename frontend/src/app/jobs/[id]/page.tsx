import { notFound } from "next/navigation";
import { Shell } from "@/components/Shell";
import { AuctionRoomClient } from "./AuctionRoomClient";
import { findJob, JOBS, LOTS } from "@/lib/data";

export default async function JobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = findJob(id) ?? JOBS[0];
  if (!job) notFound();
  return (
    <Shell>
      <AuctionRoomClient job={job} lots={LOTS} />
    </Shell>
  );
}
