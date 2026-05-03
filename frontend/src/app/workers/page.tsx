import { Shell } from "@/components/Shell";
import { WorkersClient } from "./WorkersClient";
import { getAllLots, liveLotToLot } from "@/lib/live";

export const revalidate = 0;

export default async function WorkersPage() {
  const liveLots = await getAllLots().catch(() => []);
  const lots = liveLots.map(liveLotToLot);
  return (
    <Shell>
      <WorkersClient lots={lots} />
    </Shell>
  );
}
