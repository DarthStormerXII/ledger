import { Shell } from "@/components/Shell";
import { WorkersClient } from "../workers/WorkersClient";
import { getAllLots, liveLotToLot, getLiveListings } from "@/lib/live";

export const revalidate = 0;

export default async function MarketplacePage() {
  const liveLots = await getAllLots().catch(() => []);
  const lots = liveLots.map(liveLotToLot);
  // Pull on-chain listings from LedgerMarketplace for every minted token
  // so the cards distinguish real buyable orders from demo flags.
  const tokenIds = liveLots.map((l) => l.tokenId);
  const liveListings = await getLiveListings(tokenIds).catch(() => new Map());
  // Serialize for the client component (Maps + bigints don't survive RSC).
  const listingsRecord: Record<
    string,
    {
      seller: string;
      askPriceWei: string;
      askPriceFormatted: string;
      listedAt: number;
      active: boolean;
    }
  > = {};
  for (const [tid, l] of liveListings.entries()) {
    listingsRecord[tid] = {
      seller: l.seller,
      askPriceWei: l.askPriceWei.toString(),
      askPriceFormatted: l.askPriceFormatted,
      listedAt: l.listedAt,
      active: l.active,
    };
  }
  return (
    <Shell>
      <WorkersClient
        lots={lots}
        marketplaceOnly
        liveListings={listingsRecord}
      />
    </Shell>
  );
}
