import { createHash } from "node:crypto";
import type { Hex } from "./types.js";

// In-memory mirror of agents/0g-compute. Returns deterministic output + a fake
// attestation digest. verifyAttestation can be configured to fail per-test.
// Live mode: import runReasoning / verifyAttestation from @ledger/0g-compute.

export class MockCompute {
  private rejectNext = false;

  rejectNextAttestation(): void {
    this.rejectNext = true;
  }

  async runReasoning(
    prompt: string,
  ): Promise<{ output: string; attestationDigest: Hex }> {
    const output = `[ledger-mock-compute] reasoning result for: ${prompt.slice(0, 64)}`;
    const attestationDigest =
      `0x${createHash("sha256").update(prompt).digest("hex")}` as Hex;
    return { output, attestationDigest };
  }

  async verifyAttestation(_digest: Hex): Promise<boolean> {
    if (this.rejectNext) {
      this.rejectNext = false;
      return false;
    }
    return true;
  }
}
