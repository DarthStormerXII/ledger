import { describe, expect, it } from "vitest";
import { LedgerCapabilityClient } from "../src/client.js";

describe("LedgerCapabilityClient", () => {
  it("builds the capability namespace tree", () => {
    const client = new LedgerCapabilityClient({ parentName: "ledger-demo.eth" });

    expect(client.names("worker-001", "task-001")).toEqual({
      who: "who.worker-001.ledger-demo.eth",
      pay: "pay.worker-001.ledger-demo.eth",
      tx: "tx.task-001.worker-001.ledger-demo.eth",
      rep: "rep.worker-001.ledger-demo.eth",
      mem: "mem.worker-001.ledger-demo.eth"
    });
  });
});
