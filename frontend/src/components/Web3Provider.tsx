"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { WagmiProvider, createConfig } from "@privy-io/wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http } from "viem";
import { sepolia, baseSepolia, galileo } from "@/lib/chains";

const queryClient = new QueryClient();

// Galileo's RPC is sometimes slow to surface a receipt right after submit
// (the read replica lags the sequencer by 5–15s). With viem's defaults
// (~30s timeout, ~4s polling, 3 retries) the receipt-poll can time out
// while the tx is mining successfully — Privy then surfaces that as
// "Transaction receipt could not be found" and offers Retry, which
// resubmits the same calldata and reverts via the contract's idempotency
// guard. Stretch the polling envelope so the receipt arrives in-window.
const wagmiConfig = createConfig({
  chains: [galileo, baseSepolia, sepolia],
  pollingInterval: 2_000,
  transports: {
    [galileo.id]: http(
      process.env.NEXT_PUBLIC_GALILEO_RPC ?? "https://evmrpc-testnet.0g.ai",
      { retryCount: 8, retryDelay: 1_500, timeout: 90_000 },
    ),
    [baseSepolia.id]: http(
      process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC ?? "https://sepolia.base.org",
      { retryCount: 5, retryDelay: 1_500, timeout: 60_000 },
    ),
    [sepolia.id]: http(
      process.env.NEXT_PUBLIC_SEPOLIA_RPC ??
        "https://ethereum-sepolia-rpc.publicnode.com",
      { retryCount: 5, retryDelay: 1_500, timeout: 60_000 },
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
          theme: "#f5f1e8",
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
