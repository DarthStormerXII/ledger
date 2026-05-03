import { Shell } from "@/components/Shell";

export const metadata = {
  title: "Privacy — Ledger",
  description:
    "What Ledger does and doesn't collect. Testnet-only hackathon submission, no analytics, no tracking, no data sales.",
};

export default function PrivacyPage() {
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
          Privacy.
        </h1>
        <div className="caps-md muted" style={{ marginBottom: 40 }}>
          LAST UPDATED · MAY 3, 2026
        </div>

        <Section title="1. What we collect">
          Nothing on our side. Ledger has no backend account system, no
          analytics, no tracking pixels, and no first-party logging of users.
          The frontend is a Next.js app served by Vercel; we don&rsquo;t pull
          your IP or behavioral data out of Vercel&rsquo;s built-in logs.
        </Section>

        <Section title="2. Wallet connection (Privy)">
          When you click <Mono>Connect Wallet</Mono>, the auth flow is handled
          by Privy. Privy may collect your email address, phone number, or OAuth
          identifiers if you choose those login methods, and it manages the
          embedded wallet they create for you. Their privacy policy at{" "}
          <a
            href="https://privy.io/privacy-policy"
            target="_blank"
            rel="noreferrer noopener"
            style={{ color: "var(--ledger-gold-leaf)" }}
          >
            privy.io/privacy-policy
          </a>{" "}
          governs what they do with that data. Ledger never sees your email,
          phone, or private keys.
        </Section>

        <Section title="3. On-chain data">
          Once you sign a transaction, the resulting event is public on the
          relevant testnet (0G Galileo, Ethereum Sepolia, Base Sepolia).
          That&rsquo;s how blockchains work; we don&rsquo;t control it. The{" "}
          <Mono>/proof</Mono> page only displays addresses, tx hashes, CIDs, and
          digests that are already public on-chain.
        </Section>

        <Section title="4. RPC providers">
          We read from public RPC endpoints (PublicNode for Sepolia, the public
          0G Galileo RPC, the Base Sepolia public RPC). Your wallet may also use
          its own RPC. RPC providers can in principle observe which addresses
          and contracts you query.
        </Section>

        <Section title="5. ENS resolver">
          Resolving any <Mono>*.ledger.eth</Mono> name routes through our
          CCIP-Read gateway at <Mono>resolver.fierypools.fun</Mono>. The gateway
          logs the requested name and timestamp in process memory for
          observability; it doesn&rsquo;t persist or share that log.
        </Section>

        <Section title="6. No third-party sharing">
          We don&rsquo;t sell or share data with anyone, because we don&rsquo;t
          collect any.
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
