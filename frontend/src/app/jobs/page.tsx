import { Shell } from "@/components/Shell";
import { JobsListClient } from "./JobsListClient";
import { getAllJobs, liveJobToJob } from "@/lib/live";

export const revalidate = 0;

export default async function JobsListPage() {
  const liveJobs = await getAllJobs().catch(() => []);
  const jobs = liveJobs.map(liveJobToJob);
  return (
    <Shell>
      <JobsListClient jobs={jobs} />
    </Shell>
  );
}
