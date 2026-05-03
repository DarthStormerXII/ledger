"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { WagmiProvider, createConfig } from "@privy-io/wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http } from "viem";
import { sepolia, baseSepolia, galileo } from "@/lib/chains";

const queryClient = new QueryClient();

const wagmiConfig = createConfig({
  chains: [galileo, baseSepolia, sepolia],
  transports: {
    [galileo.id]: http(
      process.env.NEXT_PUBLIC_GALILEO_RPC ?? "https://evmrpc-testnet.0g.ai",
    ),
    [baseSepolia.id]: http(
      process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC ?? "https://sepolia.base.org",
    ),
    [sepolia.id]: http(
      process.env.NEXT_PUBLIC_SEPOLIA_RPC ??
        "https://ethereum-sepolia-rpc.publicnode.com",
    ),
  },
});

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  if (!appId) {
    return <>{children}</>;
  }

  return (
    <PrivyProvider
      appId={appId}
      config={{
        appearance: {
          theme: "dark",
          accentColor: "#A91B0D",
          logo: "https://ledger-open-agents.vercel.app/assets/logos/privy/ledger_logo_180x90.png",
          showWalletLoginFirst: false,
        },
        legal: {
          termsAndConditionsUrl: "https://ledger-open-agents.vercel.app/terms",
          privacyPolicyUrl: "https://ledger-open-agents.vercel.app/privacy",
        },
        loginMethods: ["wallet", "email", "google"],
        embeddedWallets: {
          ethereum: {
            createOnLogin: "users-without-wallets",
          },
        },
        defaultChain: galileo,
        supportedChains: [galileo, baseSepolia, sepolia],
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>{children}</WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
