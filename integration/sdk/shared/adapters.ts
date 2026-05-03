import { MockEscrow } from "./escrow-mock.js";
import { MockReputationRegistry } from "./reputation-mock.js";
import { MockAxlBus } from "./axl-bus.js";
import { MockWorkerINFTRegistry } from "./inft-mock.js";
import { MockEnsResolver } from "./ens-mock.js";
import { MockCompute } from "./compute-mock.js";
import { MockStorage } from "./storage-mock.js";

// A bundle of adapters wired together. The SDK accepts this so a frontend or test
// can swap in either mock or live implementations without changing call sites.

export interface LedgerAdapters {
  escrow: MockEscrow;
  reputation: MockReputationRegistry;
  axl: MockAxlBus;
  inft: MockWorkerINFTRegistry;
  ens: MockEnsResolver;
  compute: MockCompute;
  storage: MockStorage;
  parentEnsName: string;
  galileoChainId: number;
  baseSepoliaChainId: number;
}

export function createMockAdapters(
  opts: { parentEnsName?: string } = {},
): LedgerAdapters {
  const inft = new MockWorkerINFTRegistry();
  const reputation = new MockReputationRegistry();
  const parentEnsName = opts.parentEnsName ?? "ledger-demo.eth";
  const ens = new MockEnsResolver(parentEnsName, inft, reputation);
  return {
    escrow: new MockEscrow(),
    reputation,
    axl: new MockAxlBus(),
    inft,
    ens,
    compute: new MockCompute(),
    storage: new MockStorage(),
    parentEnsName,
    galileoChainId: 16602,
    baseSepoliaChainId: 84532,
  };
}
