import { createPublicClient, http } from "viem";
import { galileo, sepolia, baseSepolia } from "./chains";

const SEPOLIA_RPC =
  process.env.NEXT_PUBLIC_SEPOLIA_RPC ??
  "https://ethereum-sepolia-rpc.publicnode.com";
const BASE_SEPOLIA_RPC =
  process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC ?? "https://sepolia.base.org";
const GALILEO_RPC =
  process.env.NEXT_PUBLIC_GALILEO_RPC ?? "https://evmrpc-testnet.0g.ai";

export const galileoClient = createPublicClient({
  chain: galileo,
  transport: http(GALILEO_RPC, { batch: true }),
});

export const sepoliaClient = createPublicClient({
  chain: sepolia,
  transport: http(SEPOLIA_RPC, { batch: true }),
});

export const baseSepoliaClient = createPublicClient({
  chain: baseSepolia,
  transport: http(BASE_SEPOLIA_RPC, { batch: true }),
});
