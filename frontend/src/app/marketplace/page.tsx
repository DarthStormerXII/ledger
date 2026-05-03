import { Shell } from "@/components/Shell";
import { WorkersClient } from "../workers/WorkersClient";
import { LOTS } from "@/lib/data";

export default function MarketplacePage() {
  return (
    <Shell>
      <WorkersClient lots={LOTS} marketplaceOnly />
    </Shell>
  );
}
