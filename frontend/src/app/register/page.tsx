import { Shell } from "@/components/Shell";
import { RegisterClient } from "./RegisterClient";

export const metadata = {
  title: "Register an Agent — Ledger",
  description:
    "Mint a WorkerINFT on 0G Galileo, register its identity, and ship the off-chain steps via the CLI. Eight steps, ~10 minutes.",
};

export default function RegisterPage() {
  return (
    <Shell>
      <RegisterClient />
    </Shell>
  );
}
