import { AbiCoder, Interface, dnsEncode, isAddress, namehash } from "ethers";
import { describe, expect, it } from "vitest";
import { handleGatewayRequest, query } from "../src/ens.js";
import { verifyDerivation } from "../src/verify.js";
import type { ResolverConfig } from "../src/config.js";

const config: ResolverConfig = {
  parentName: "ledger-demo.eth",
  ogRpcUrl: "http://127.0.0.1:8545",
  ogChainId: 16602,
  baseSepoliaRpcUrl: "https://sepolia.base.org",
  reputationRegistryAddress: "0x8004B663056A597Dffe9eCcC1965A193B7388713",
  payMasterPath: "m/44'/60'/0'",
  mockOwnerAddress: "0x0000000000000000000000000000000000000001",
  privateKey: "0x59c6995e998f97a5a0044966f094538d4f78304485ea2b58e07890d97097369b",
  txReceipts: {
    "task-001": {
      cid: "0g://receipt-cid",
      intent: "Base Yield Scout",
      outcome: "complete",
      chain: "base-sepolia",
      amount: "5 USDC"
    }
  },
  repSummaries: {
    "worker-001": {
      count: 47,
      average: 4.7,
      tags: { "ledger-job": 47 },
      registry: "0x8004B663056A597Dffe9eCcC1965A193B7388713",
      agentId: "1"
    }
  },
  memoryPointers: {
    "worker-001": "0g://memory-cid"
  },
  agentRegistrationValue:
    '{"standard":"ENSIP-25","registry":"0x8004B663056A597Dffe9eCcC1965A193B7388713","chain":"base-sepolia","chainId":84532,"agentId":"1"}',
  ttlSeconds: 30
};

const resolverInterface = new Interface([
  "function addr(bytes32 node) view returns (address)",
  "function addr(bytes32 node, uint256 coinType) view returns (bytes)",
  "function text(bytes32 node, string key) view returns (string)"
]);

const serviceInterface = new Interface([
  "function resolve(bytes name, bytes data) view returns (bytes result, uint64 expires, bytes sig)"
]);

describe("ENS gateway", () => {
  it("encodes who.* addr responses", async () => {
    const name = "who.worker-001.ledger-demo.eth";
    const data = resolverInterface.encodeFunctionData("addr(bytes32)", [namehash(name)]);
    const result = await query(dnsEncode(name), data, config);

    expect(resolverInterface.decodeFunctionResult("addr(bytes32)", result)[0]).toBe(
      config.mockOwnerAddress
    );
  });

  it("encodes who.* coinType 60 addr responses", async () => {
    const name = "who.worker-001.ledger-demo.eth";
    const data = resolverInterface.encodeFunctionData("addr(bytes32,uint256)", [
      namehash(name),
      60n
    ]);
    const result = await query(dnsEncode(name), data, config);
    const encodedAddress = resolverInterface.decodeFunctionResult("addr(bytes32,uint256)", result)[0];

    expect(AbiCoder.defaultAbiCoder().decode(["address"], encodedAddress)[0]).toBe(
      config.mockOwnerAddress
    );
  });

  it("signs IResolverService responses for the OffchainResolver callback", async () => {
    const name = "who.worker-001.ledger-demo.eth";
    const innerData = resolverInterface.encodeFunctionData("addr(bytes32)", [namehash(name)]);
    const callData = serviceInterface.encodeFunctionData("resolve", [dnsEncode(name), innerData]);
    const response = await handleGatewayRequest(
      { sender: "0x000000000000000000000000000000000000dEaD", callData },
      config
    );
    const [result, expires, sig] = serviceInterface.decodeFunctionResult("resolve", response.data);

    expect(result).toMatch(/^0x/u);
    expect(expires).toBeGreaterThan(0n);
    expect(sig).toHaveLength(130);
    expect(isAddress(sig)).toBe(false);
  });

  it("returns rotating pay.* addresses", async () => {
    const name = "pay.worker-001.ledger-demo.eth";
    const data = resolverInterface.encodeFunctionData("addr(bytes32)", [namehash(name)]);

    const first = resolverInterface.decodeFunctionResult(
      "addr(bytes32)",
      await query(dnsEncode(name), data, config)
    )[0] as string;
    const second = resolverInterface.decodeFunctionResult(
      "addr(bytes32)",
      await query(dnsEncode(name), data, config)
    )[0] as string;

    expect(isAddress(first)).toBe(true);
    expect(isAddress(second)).toBe(true);
    expect(first).not.toBe(second);
  });

  it("returns tx, rep, and mem text records", async () => {
    await expectText("tx.task-001.worker-001.ledger-demo.eth", "ai.tx.intent", "Base Yield Scout");
    await expectText("rep.worker-001.ledger-demo.eth", "ai.rep.count", "47");
    await expectText("mem.worker-001.ledger-demo.eth", "ai.mem.cid", "0g://memory-cid");
  });

  it("returns the parent ENSIP-25 agent-registration record", async () => {
    expect(await text("ledger-demo.eth", "agent-registration")).toContain("ENSIP-25");
  });

  it("verifies HD derivation chains from an account xpub", async () => {
    const master = await text("pay.worker-099.ledger-demo.eth", "ai.pay.master");
    const child1 = await text("pay.worker-099.ledger-demo.eth", "ai.pay.address");
    const nonce1 = BigInt(await text("pay.worker-099.ledger-demo.eth", "ai.pay.nonce"));
    const child2 = await text("pay.worker-099.ledger-demo.eth", "ai.pay.address");
    const nonce2 = BigInt(await text("pay.worker-099.ledger-demo.eth", "ai.pay.nonce"));

    expect(verifyDerivation(master, child1, child2, nonce1, nonce2)).toBe(true);
  });
});

async function expectText(name: string, key: string, expected: string): Promise<void> {
  expect(await text(name, key)).toBe(expected);
}

async function text(name: string, key: string): Promise<string> {
  const data = resolverInterface.encodeFunctionData("text", [namehash(name), key]);
  const result = await query(dnsEncode(name), data, config);
  return resolverInterface.decodeFunctionResult("text", result)[0] as string;
}
