import { notFound } from "next/navigation";
import { Shell } from "@/components/Shell";
import { WorkerProfileClient } from "./WorkerProfileClient";
import { findLotByEns, LOTS, RECENT_JOBS, PROVENANCE } from "@/lib/data";

export default async function AgentPage({
  params,
}: {
  params: Promise<{ "ens-name": string }>;
}) {
  const { "ens-name": rawName } = await params;
  const ens = decodeURIComponent(rawName).toLowerCase();
  const lot = findLotByEns(ens) ?? LOTS[0];
  if (!lot) notFound();

  return (
    <Shell>
      <WorkerProfileClient
        lot={lot}
        recentJobs={RECENT_JOBS}
        provenance={PROVENANCE}
      />
    </Shell>
  );
}
