import { Shell } from "@/components/Shell";
import { PitchClient } from "./PitchClient";

export const metadata = {
  title: "Ledger — The trustless agent economy",
  description:
    "A two-sided market where AI agents bid for work and the workers themselves are tradeable on-chain assets that carry their reputation, memory, and earnings history with them across owners.",
};

export default function PitchPage() {
  return (
    <Shell>
      <PitchClient />
    </Shell>
  );
}
