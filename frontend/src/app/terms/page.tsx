import { Shell } from "@/components/Shell";

export const metadata = {
  title: "Terms — Ledger",
  description:
    "Testnet-only terms for the Ledger hackathon submission. Public infrastructure, no warranties, no liability.",
};

export default function TermsPage() {
  return (
    <Shell>
      <div className="page" style={{ padding: "80px 40px", maxWidth: 760 }}>
        <h1
          style={{
            fontFamily: "var(--ledger-font-display)",
            fontStyle: "italic",
            fontWeight: 900,
            fontSize: 64,
            letterSpacing: "-0.03em",
            margin: "0 0 12px",
            color: "var(--ledger-paper)",
          }}
        >
          Terms.
        </h1>
        <div className="caps-md muted" style={{ marginBottom: 40 }}>
          LAST UPDATED · MAY 3, 2026
        </div>

        <Section title="1. What this is">
          Ledger is an ETHGlobal Open Agents 2026 hackathon submission. The
          deployed app at <Mono>ledger-open-agents.vercel.app</Mono> is a public
          demonstration that runs against testnet networks (0G Galileo, Ethereum
          Sepolia, Base Sepolia) and the canonical ERC-8004 ReputationRegistry
          on Base Sepolia. Nothing here is a production financial service.
        </Section>

        <Section title="2. Testnet-only">
          Every contract is on testnet. Tokens you see have no monetary value.
          Do not send mainnet funds to any address surfaced through this app.
          Faucets are public and rate-limited; we don&rsquo;t custody anything
          for you.
        </Section>

        <Section title="3. Wallets and your keys">
          Wallet connection is provided by Privy. If you sign in with email or
          Google, Privy creates an embedded wallet whose private key is held on
          your device under their custody model — see the Privy privacy policy.
          If you connect an external wallet, your keys never leave that wallet.
          We never see your private keys.
        </Section>

        <Section title="4. No warranty">
          The app is provided as-is. We make no warranties about uptime,
          correctness of on-chain reads, accuracy of reputation summaries, or
          anything else. Things may break, especially during the demo window.
        </Section>

        <Section title="5. No liability">
          To the extent permitted by law, the Ledger team accepts no liability
          for any loss arising from use of the app. You use it at your own risk.
        </Section>

        <Section title="6. Open source">
          The full source is at{" "}
          <a
            href="https://github.com/DarthStormerXII/ledger"
            target="_blank"
            rel="noreferrer noopener"
            style={{ color: "var(--ledger-gold-leaf)" }}
          >
            github.com/DarthStormerXII/ledger
          </a>
          . You can audit anything you don&rsquo;t trust before connecting a
          wallet.
        </Section>

        <Section title="7. Contact">
          Issues, takedowns, or questions:{" "}
          <a
            href="https://x.com/gabrielaxyeth"
            target="_blank"
            rel="noreferrer noopener"
            style={{ color: "var(--ledger-gold-leaf)" }}
          >
            @gabrielaxyeth
          </a>{" "}
          on X.
        </Section>
      </div>
    </Shell>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginBottom: 32 }}>
      <h2
        style={{
          fontSize: 22,
          fontWeight: 700,
          margin: "0 0 12px",
          color: "var(--ledger-paper)",
        }}
      >
        {title}
      </h2>
      <p
        style={{
          margin: 0,
          color: "var(--ledger-ink-muted)",
          lineHeight: 1.65,
          fontSize: 15,
        }}
      >
        {children}
      </p>
    </section>
  );
}

function Mono({ children }: { children: React.ReactNode }) {
  return (
    <code
      style={{
        fontFamily: "var(--ledger-font-mono)",
        fontSize: 13,
        color: "var(--ledger-paper)",
      }}
    >
      {children}
    </code>
  );
}
