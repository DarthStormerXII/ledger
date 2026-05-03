import {
  Contract,
  Interface,
  JsonRpcProvider,
  dnsEncode,
  getAddress,
  namehash,
} from "ethers";

export type LedgerCapabilityClientOptions = {
  parentName: string;
  gatewayUrl?: string;
  resolverAddress?: string;
  galileoRpcUrl?: string;
  galileoChainId?: number;
  workerInftAddress?: string;
};

export type CapabilitySnapshot = {
  names: {
    who: string;
    pay: string;
    tx?: string;
    rep: string;
    mem: string;
  };
  whoOwner?: string;
  payAddresses?: [string, string];
  txIntent?: string;
  repCount?: string;
  repAverage?: string;
  memoryCid?: string;
  resolutionMode?: "names-only" | "direct-ownerOf" | "gateway";
};

const WORKER_INFT_ABI = [
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function getMemoryPointer(uint256 tokenId) view returns (string)",
];

const resolverInterface = new Interface([
  "function addr(bytes32 node) view returns (address)",
  "function text(bytes32 node, string key) view returns (string)",
]);

const serviceInterface = new Interface([
  "function resolve(bytes name, bytes data) view returns (bytes result, uint64 expires, bytes sig)",
]);

export class LedgerCapabilityClient {
  private readonly parentName: string;
  private readonly gatewayUrl?: string;
  private readonly resolverAddress: string;
  private readonly galileoRpcUrl: string;
  private readonly galileoChainId: number;
  private readonly workerInftAddress?: string;

  constructor(options: LedgerCapabilityClientOptions) {
    this.parentName = options.parentName.toLowerCase();
    this.gatewayUrl = options.gatewayUrl?.replace(/\/$/u, "");
    this.resolverAddress =
      options.resolverAddress ?? "0x000000000000000000000000000000000000dEaD";
    this.galileoRpcUrl =
      options.galileoRpcUrl ?? "https://evmrpc-testnet.0g.ai";
    this.galileoChainId = options.galileoChainId ?? 16602;
    this.workerInftAddress = options.workerInftAddress
      ? getAddress(options.workerInftAddress)
      : undefined;
  }

  names(workerLabel: string, txId?: string): CapabilitySnapshot["names"] {
    return {
      who: `who.${workerLabel}.${this.parentName}`,
      pay: `pay.${workerLabel}.${this.parentName}`,
      tx: txId ? `tx.${txId}.${workerLabel}.${this.parentName}` : undefined,
      rep: `rep.${workerLabel}.${this.parentName}`,
      mem: `mem.${workerLabel}.${this.parentName}`,
    };
  }

  async ownerOf(tokenId: bigint): Promise<string> {
    if (!this.workerInftAddress) {
      throw new Error("workerInftAddress is required for ownerOf");
    }
    const provider = new JsonRpcProvider(
      this.galileoRpcUrl,
      this.galileoChainId,
    );
    const contract = new Contract(
      this.workerInftAddress,
      WORKER_INFT_ABI,
      provider,
    );
    return getAddress((await contract.ownerOf(tokenId)) as string);
  }

  async gatewayAddr(name: string): Promise<string> {
    const result = await this.gatewayQuery(
      name,
      resolverInterface.encodeFunctionData("addr(bytes32)", [namehash(name)]),
    );
    return resolverInterface.decodeFunctionResult(
      "addr(bytes32)",
      result,
    )[0] as string;
  }

  async gatewayText(name: string, key: string): Promise<string> {
    const result = await this.gatewayQuery(
      name,
      resolverInterface.encodeFunctionData("text", [namehash(name), key]),
    );
    return resolverInterface.decodeFunctionResult("text", result)[0] as string;
  }

  async snapshot(
    workerLabel: string,
    tokenId: bigint,
    txId?: string,
  ): Promise<CapabilitySnapshot> {
    const names = this.names(workerLabel, txId);
    const snapshot: CapabilitySnapshot = { names, resolutionMode: "names-only" };

    if (this.workerInftAddress) {
      snapshot.whoOwner = await this.ownerOf(tokenId);
      snapshot.resolutionMode = "direct-ownerOf";
    }

    if (this.gatewayUrl) {
      snapshot.resolutionMode = "gateway";
      snapshot.whoOwner = await this.gatewayAddr(names.who);
      snapshot.payAddresses = [
        await this.gatewayAddr(names.pay),
        await this.gatewayAddr(names.pay),
      ];
      snapshot.repCount = await this.gatewayText(names.rep, "ai.rep.count");
      snapshot.repAverage = await this.gatewayText(
        names.rep,
        "ai.rep.average",
      );
      snapshot.memoryCid = await this.gatewayText(names.mem, "ai.mem.cid");
      if (names.tx) {
        snapshot.txIntent = await this.gatewayText(names.tx, "ai.tx.intent");
      }
    }

    return snapshot;
  }

  private async gatewayQuery(name: string, innerData: string): Promise<string> {
    if (!this.gatewayUrl) {
      throw new Error("gatewayUrl is required for gateway queries");
    }

    const callData = serviceInterface.encodeFunctionData("resolve", [
      dnsEncode(name),
      innerData,
    ]);
    const response = await fetch(
      `${this.gatewayUrl}/${this.resolverAddress}/${callData}`,
    );
    const json = (await response.json()) as { data?: string; error?: string };
    if (!json.data) {
      throw new Error(json.error ?? `Gateway did not return data for ${name}`);
    }

    const decoded = serviceInterface.decodeFunctionResult("resolve", json.data);
    const result = decoded[0] as string;
    const expires = decoded[1] as bigint;
    const sig = decoded[2] as string;
    if (expires <= BigInt(Math.floor(Date.now() / 1000))) {
      throw new Error(`Gateway response expired for ${name}`);
    }
    if (!sig.startsWith("0x") || sig.length !== 130) {
      throw new Error(
        `Gateway response has invalid compact signature for ${name}`,
      );
    }
    return result;
  }
}
