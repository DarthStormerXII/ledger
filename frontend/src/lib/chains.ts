import { defineChain, type Chain } from "viem";
import { sepolia, baseSepolia } from "viem/chains";

export const galileo: Chain = defineChain({
  id: 16602,
  name: "0G Galileo Testnet",
  nativeCurrency: { name: "0G", symbol: "0G", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://evmrpc-testnet.0g.ai"] },
  },
  blockExplorers: {
    default: {
      name: "0G Chainscan Galileo",
      url: "https://chainscan-galileo.0g.ai",
    },
  },
  testnet: true,
});

export { sepolia, baseSepolia };
