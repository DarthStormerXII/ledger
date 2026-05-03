import { Shell } from "@/components/Shell";
import { JobsListClient } from "./JobsListClient";
import { JOBS } from "@/lib/data";

export default function JobsListPage() {
  return (
    <Shell>
      <JobsListClient jobs={JOBS} />
    </Shell>
  );
}
