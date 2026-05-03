import { describe, expect, it } from "vitest";
import { decodeDnsName, parseLedgerName } from "../src/dns.js";

describe("dns helpers", () => {
  it("decodes DNS wire-format names", () => {
    expect(decodeDnsName("0x0377686f0a776f726b65722d3030310b6c65646765722d64656d6f0365746800")).toBe(
      "who.worker-001.ledger-demo.eth"
    );
  });

  it("parses who namespace worker token IDs", () => {
    expect(parseLedgerName("who.worker-001.ledger-demo.eth", "ledger-demo.eth")).toEqual({
      namespace: "who",
      workerLabel: "worker-001",
      tokenId: 1n,
      parentName: "ledger-demo.eth"
    });
  });

  it("rejects names outside the configured parent", () => {
    expect(() => parseLedgerName("who.worker-001.other.eth", "ledger-demo.eth")).toThrow(
      /outside parent/
    );
  });
});
