import WalletClient from "./WalletClient";
import { getAllLots, liveLotToLot } from "@/lib/live";

export const revalidate = 0;

export default async function WalletPage() {
  const liveLots = await getAllLots().catch(() => []);
  const allLots = liveLots.map(liveLotToLot);
  return <WalletClient allLots={allLots} />;
}
