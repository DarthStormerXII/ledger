import Link from "next/link";
import { Shell } from "@/components/Shell";
import {
  WORKER_INFT_ADDRESS,
  LEDGER_ESCROW_ADDRESS,
  LEDGER_IDENTITY_REGISTRY_ADDRESS,
  MOCK_TEE_ORACLE_ADDRESS,
  ERC8004_REPUTATION_REGISTRY,
  LEDGER_ENS_RESOLVER_CONTRACT,
  LEDGER_ENS_PARENT,
  DEMO_TOKEN_ID,
  DEMO_OWNER_A,
  DEMO_OWNER_B,
  DEMO_MEMORY_CID,
  DEMO_ATTESTATION_DIGEST,
  DEMO_TRANSFER_TX,
  DEMO_MINT_TX,
  DEMO_ESCROW_DEPLOY_TX,
  DEMO_POST_TASK_TX,
  DEMO_ACCEPT_TOKEN_BID_TX,
  DEMO_RELEASE_TX,
  DEMO_RESULT_HASH,
  DEMO_TASK_ID,
  DEMO_PAY_NONCE_0,
  DEMO_PAY_NONCE_1,
  ensSepoliaName,
  ledgerAxlTopology,
  GENSYN_AXL_REPO,
  FLY_BOOTSTRAP_APP,
  FLY_WORKER_APP,
  ERC8004_SPEC,
  ERC7857_DRAFT,
  GALILEO_TESTNET_DOCS,
  ogStorageCid,
} from "@/lib/contracts";

export const metadata = {
  title: "Proof — Ledger",
  description:
    "Every live tx hash, contract address, attestation digest, storage CID, AXL peer ID, and ENS namespace, in one place. Click anything to verify on-chain.",
};

// ──────────────────────────────────────────────────────────────────────────
// Explorer URL helpers
// ──────────────────────────────────────────────────────────────────────────
const galileoTx = (h: string) => `https://chainscan-galileo.0g.ai/tx/${h}`;
const galileoAddr = (a: string) =>
  `https://chainscan-galileo.0g.ai/address/${a}`;
const baseAddr = (a: string) => `https://sepolia.basescan.org/address/${a}`;
const sepoliaAddr = (a: string) => `https://sepolia.etherscan.io/address/${a}`;
const sepoliaTx = (h: string) => `https://sepolia.etherscan.io/tx/${h}`;

const ERC8004_IDENTITY_ADDRESS = "0x8004A818BFB912233c491871b3d84c89A494BD9e";
const ERC8004_AGENT_ID = 5444;
const STORAGE_FLOW_CONTRACT = "0x22e03a6a89b950f1c82ec5e74f8eca321a105296";
const STORAGE_UPLOAD_TX =
  "0xc6cd5ca57b2c005114fef5705d89da67bcff578659a4ca5a8f5d50d4220eb5ca";
const STORAGE_ROOT =
  "0xd8fb3ad312ca5e9002f7bdd47d93839b9a6dcd83d396bb74a44a9f65344982c4";

const COMPUTE_LEDGER_TX =
  "0xc27d4f36505320f24f60d6ab6cc0e0cf7899b374def9ee953527c2d0aac78ff2";
const COMPUTE_PROVIDER = "0xa48f01287233509FD694a22Bf840225062E67836";
const COMPUTE_MODEL = "qwen/qwen-2.5-7b-instruct";

const SEALED_KEY_AFTER_TRANSFER =
  "0x7365616c65642d666f722d726573657276652d6f776e6572";

// AXL evidence (proofs/axl-proof.md)
const AXL_BOOTSTRAP_PEER =
  "a560b12fe6e16b1c8a94bb99b3019fa6d5f490474c275a31848f022df3a170eb";
const AXL_WORKER_1_PEER =
  "f274bf0f8dadfa028b75f73cf7b29c927ded368b6703caf403abdb0d9aa1fa64";
const AXL_WORKER_2_PEER =
  "590fa3b614da78d5e50939f708dea209e5cfb5e7ae69f1220611d8eefcc95f4c";
const AXL_BOOTSTRAP_IPV6 = "200:b53e:9da0:323d:29c6:ead6:88cc:99fc";
const AXL_WORKER_1_IPV6 = "200:1b16:81e0:e4a4:bfa:e914:1186:109a";
const AXL_WORKER_2_IPV6 = "201:9bc1:7127:ac96:1ca8:6bdb:1823:dc85";

// ENS evidence (proofs/ens-proof.md)
const ENS_PARENT_OWNER = "0x32FE11d9900D63350016374BE98ff37c3Af75847";
const ENS_RESOLVER_TX =
  "0xc49a3288274156d826bec3898bf31c15121a90d3bf885f39a8cb74ba67d89caf";
const ENS_GATEWAY_DURABLE = "https://resolver.fierypools.fun";

// ──────────────────────────────────────────────────────────────────────────
// Sections — declarative data describing every artifact judges can verify
// ──────────────────────────────────────────────────────────────────────────
type Row = {
  label: string;
  value: string;
  href?: string;
  mono?: boolean;
  caption?: string;
};

type Section = {
  id: string;
  title: string;
  blurb: string;
  rows: Row[];
};

const sections: Section[] = [
  {
    id: "0g",
    title: "0G",
    blurb:
      "Galileo Testnet (chainId 16602). Hosts the iNFT, escrow, identity registry, and the encrypted memory blob in 0G Storage. Inference runs sealed on 0G Compute and the attestation digest is verifiable.",
    rows: [
      {
        label: "Chain",
        value: "0G Galileo Testnet · chainId 16602",
        href: GALILEO_TESTNET_DOCS,
        mono: true,
        caption: "Official 0G developer docs — testnet overview.",
      },
      {
        label: "iNFT spec",
        value: "ERC-7857 (0G iNFT draft)",
        href: ERC7857_DRAFT,
        caption: "0G Labs reference implementation our WorkerINFT mirrors.",
      },
      {
        label: "WorkerINFT (ERC-7857 draft)",
        value: WORKER_INFT_ADDRESS,
        href: galileoAddr(WORKER_INFT_ADDRESS),
        mono: true,
      },
      {
        label: "LedgerEscrow",
        value: LEDGER_ESCROW_ADDRESS,
        href: galileoAddr(LEDGER_ESCROW_ADDRESS),
        mono: true,
        caption:
          "Upgraded live escrow. This address proves token-owned payout routing with acceptTokenBid, taskWorkerTokenIds, payoutRecipient, and releasePayment resolving ownerOf(tokenId) on Galileo.",
      },
      {
        label: "LedgerIdentityRegistry",
        value: LEDGER_IDENTITY_REGISTRY_ADDRESS,
        href: galileoAddr(LEDGER_IDENTITY_REGISTRY_ADDRESS),
        mono: true,
      },
      {
        label: "MockTEEOracle",
        value: MOCK_TEE_ORACLE_ADDRESS,
        href: galileoAddr(MOCK_TEE_ORACLE_ADDRESS),
        mono: true,
        caption:
          "Honest disclosure — this is a shim. The ERC-7857 spec is followed mechanically (sealed-key bytes change on transfer, proof verified) but a real TEE enclave is not running.",
      },
      {
        label: "Source verification",
        value: "ChainScan exactMatch=true",
        caption:
          "MockTEEOracle, WorkerINFT, LedgerEscrow, and LedgerIdentityRegistry are exact-match source verified on the Galileo explorer.",
      },
      {
        label: "Mint tx (token #1)",
        value: DEMO_MINT_TX,
        href: galileoTx(DEMO_MINT_TX),
        mono: true,
      },
      {
        label: "Transfer tx (Owner_A → Owner_B)",
        value: DEMO_TRANSFER_TX,
        href: galileoTx(DEMO_TRANSFER_TX),
        mono: true,
        caption:
          "ownerOf(1) flipped from Owner_A (0x6B9a…) to Owner_B (0x6641…) at this block. Sealed key was re-keyed in the same call.",
      },
      {
        label: "Sealed key (post-transfer)",
        value: SEALED_KEY_AFTER_TRANSFER,
        mono: true,
        caption:
          'ASCII-decodes to "sealed-for-reserve-owner" — proves bytes rotated. A real TEE would emit ciphertext.',
      },
      {
        label: "Owner_A (mint recipient)",
        value: DEMO_OWNER_A,
        href: galileoAddr(DEMO_OWNER_A),
        mono: true,
      },
      {
        label: "Owner_B (current ownerOf)",
        value: DEMO_OWNER_B,
        href: galileoAddr(DEMO_OWNER_B),
        mono: true,
      },
      {
        label: "0G Storage flow contract",
        value: STORAGE_FLOW_CONTRACT,
        href: galileoAddr(STORAGE_FLOW_CONTRACT),
        mono: true,
      },
      {
        label: "Storage upload tx",
        value: STORAGE_UPLOAD_TX,
        href: galileoTx(STORAGE_UPLOAD_TX),
        mono: true,
      },
      {
        label: "Memory root hash",
        value: STORAGE_ROOT,
        mono: true,
        caption:
          "AES-256-CTR encrypted client-side. Roundtrip download + decrypt was byte-equal with the plaintext.",
      },
      {
        label: "Memory CID (in iNFT metadata)",
        value: DEMO_MEMORY_CID,
        mono: true,
      },
      {
        label: "0G Compute ledger tx",
        value: COMPUTE_LEDGER_TX,
        href: galileoTx(COMPUTE_LEDGER_TX),
        mono: true,
      },
      {
        label: "Live provider",
        value: COMPUTE_PROVIDER,
        href: galileoAddr(COMPUTE_PROVIDER),
        mono: true,
      },
      {
        label: "Model",
        value: COMPUTE_MODEL,
        mono: true,
      },
      {
        label: "Attestation digest",
        value: DEMO_ATTESTATION_DIGEST,
        mono: true,
        caption:
          "Returned by broker.inference.verifyService. verifyAttestation() returned true.",
      },
      {
        label: "Escrow deploy tx",
        value: DEMO_ESCROW_DEPLOY_TX,
        href: galileoTx(DEMO_ESCROW_DEPLOY_TX),
        mono: true,
      },
      {
        label: "Escrow postTask",
        value: DEMO_POST_TASK_TX,
        href: galileoTx(DEMO_POST_TASK_TX),
        mono: true,
      },
      {
        label: "Escrow acceptTokenBid",
        value: DEMO_ACCEPT_TOKEN_BID_TX,
        href: galileoTx(DEMO_ACCEPT_TOKEN_BID_TX),
        mono: true,
        caption:
          "Token ID 1 is attached to the task; taskWorkerTokenIds(taskId) returns 1.",
      },
      {
        label: "Escrow payoutRecipient(taskId)",
        value: DEMO_OWNER_B,
        href: galileoAddr(DEMO_OWNER_B),
        mono: true,
        caption:
          "Direct RPC read resolves the payee from WorkerINFT.ownerOf(1), so the payout follows the current iNFT owner.",
      },
      {
        label: "Escrow releasePayment",
        value: DEMO_RELEASE_TX,
        href: galileoTx(DEMO_RELEASE_TX),
        mono: true,
        caption:
          "PaymentReleased event topic 2 is the current owner 0x6641…600b. Final task status readback is 3 (Released).",
      },
      {
        label: "Result hash",
        value: DEMO_RESULT_HASH,
        mono: true,
      },
      {
        label: "Demo task ID",
        value: DEMO_TASK_ID,
        mono: true,
      },
    ],
  },
  {
    id: "axl",
    title: "Gensyn AXL",
    blurb:
      "Three independent nodes — two cloud, one residential laptop. Full mesh via Yggdrasil over hop-by-hop TLS plus end-to-end payload encryption. Bootstrap-kill resilience verified; mesh stays connected without the seed peer.",
    rows: [
      {
        label: "AXL node source",
        value: "github.com/gensyn-ai/axl",
        href: GENSYN_AXL_REPO,
        caption: "Go binary every node runs — same source on Fly + laptop.",
      },
      {
        label: "Live mesh /topology (judges)",
        value: "axl.fierypools.fun/topology",
        href: ledgerAxlTopology(),
        caption: "Cloudflared tunnel → M2 HTTP bridge. Returns peers + IPv6.",
      },
      {
        label: "Bootstrap peer ID",
        value: AXL_BOOTSTRAP_PEER,
        href: FLY_BOOTSTRAP_APP,
        mono: true,
        caption: "Fly.io · sjc · public TCP listener at 66.51.123.38:9001",
      },
      {
        label: "Bootstrap Yggdrasil IPv6",
        value: AXL_BOOTSTRAP_IPV6,
        mono: true,
      },
      {
        label: "Worker-1 peer ID",
        value: AXL_WORKER_1_PEER,
        href: FLY_WORKER_APP,
        mono: true,
        caption: "Fly.io · fra · cloud worker, public listener for resilience",
      },
      {
        label: "Worker-1 Yggdrasil IPv6",
        value: AXL_WORKER_1_IPV6,
        mono: true,
      },
      {
        label: "Worker-2 peer ID",
        value: AXL_WORKER_2_PEER,
        mono: true,
        caption:
          "Residential laptop (NAT) · launchd-managed (KeepAlive=true) · proves outbound NAT traversal",
      },
      {
        label: "Worker-2 Yggdrasil IPv6",
        value: AXL_WORKER_2_IPV6,
        mono: true,
      },
      {
        label: "Encryption (transport)",
        value: "Hop-by-hop TLS + end-to-end payload (two layers)",
      },
      {
        label: "Channels",
        value: "#ledger-jobs, #ledger-auction-closed (gossipsub fork)",
        mono: true,
      },
      {
        label: "Bootstrap-kill resilience",
        value: "Verified 2026-05-02T16:23:39Z",
        caption:
          "sjc bootstrap was stopped, fra and residential exchanged TASK_POSTED + RESULT directly through the fra public listener, then bootstrap restarted.",
      },
      {
        label: "GossipSub fanout (TS port)",
        value: "local 567ms · fra 601ms",
        caption: "Ports the AXL repo's gossipsub example to TypeScript.",
      },
      {
        label: "Full protocol cycle",
        value: "TASK_POSTED → BID → BID_ACCEPTED → AUCTION_CLOSED → RESULT",
        caption:
          "Verified end-to-end on 2026-05-02T16:28:18Z across the live mesh.",
      },
      {
        label: "Qualification boundary",
        value: "Separate AXL nodes, not in-process",
        caption:
          "Two Fly.io regions plus one residential NAT laptop. The app did not replace AXL with a centralized broker.",
      },
      {
        label: "Topology snapshot",
        value: "proofs/data/axl-topology.json",
      },
      {
        label: "Full-cycle event log",
        value: "proofs/data/axl-full-cycle.json",
      },
      {
        label: "TCP packet capture",
        value: "proofs/data/axl-tcpdump.txt",
      },
    ],
  },
  {
    id: "ens",
    title: "ENS Resolver",
    blurb:
      "Custom CCIP-Read offchain resolver under ledger.eth on Sepolia. Five capability namespaces per worker — who, pay, tx, rep, mem — each with its own dispatch logic. ENSIP-10 signed responses. ENSIP-25 text record closes the verification loop with the audited ERC-8004 deployment on Base.",
    rows: [
      {
        label: "Parent ENS",
        value: `${LEDGER_ENS_PARENT} (Sepolia)`,
        href: ensSepoliaName(LEDGER_ENS_PARENT),
        mono: true,
        caption: "Open in the official ENS app to view records + signed text.",
      },
      {
        label: "Parent owner / signer",
        value: ENS_PARENT_OWNER,
        href: sepoliaAddr(ENS_PARENT_OWNER),
        mono: true,
      },
      {
        label: "Resolver contract",
        value: LEDGER_ENS_RESOLVER_CONTRACT,
        href: sepoliaAddr(LEDGER_ENS_RESOLVER_CONTRACT),
        mono: true,
        caption: "Source verified on Sourcify for Sepolia chainId 11155111.",
      },
      {
        label: "Set-resolver tx",
        value: ENS_RESOLVER_TX,
        href: sepoliaTx(ENS_RESOLVER_TX),
        mono: true,
      },
      {
        label: "Gateway URL (durable)",
        value: ENS_GATEWAY_DURABLE,
        caption:
          "Cloudflare named tunnel `kosyn-cre` → localhost:8787. Survives client IP changes and Wi-Fi reconnects.",
      },
      {
        label: "who.worker-001.ledger.eth",
        value: DEMO_OWNER_B,
        href: ensSepoliaName(`worker-001.${LEDGER_ENS_PARENT}`),
        mono: true,
        caption:
          "Reads ownerOf(1) on Galileo, 30s TTL cache. Ownership flips without a new ENS transaction.",
      },
      {
        label: "pay.worker-001.ledger.eth (rotation 0)",
        value: DEMO_PAY_NONCE_0,
        href: ensSepoliaName(`pay.worker-001.${LEDGER_ENS_PARENT}`),
        mono: true,
        caption: "HD-derived from a parent xpub, indexed by tokenId + nonce.",
      },
      {
        label: "pay.worker-001.ledger.eth (rotation 1)",
        value: DEMO_PAY_NONCE_1,
        href: ensSepoliaName(`pay.worker-001.${LEDGER_ENS_PARENT}`),
        mono: true,
      },
      {
        label: "rep.worker-001.ledger.eth",
        value:
          "ai.rep.registry=0x8004B663… · ai.rep.agent=5444 · count=47 · avg=4.77",
        href: ensSepoliaName(`rep.worker-001.${LEDGER_ENS_PARENT}`),
        caption:
          "Live read from ERC-8004 ReputationRegistry on Base Sepolia. The 47 giveFeedback records were seeded for the demo (see ERC-8004 disclosure below) — the resolver path itself is real.",
      },
      {
        label: "mem.worker-001.ledger.eth",
        value: DEMO_MEMORY_CID,
        href: ogStorageCid(DEMO_MEMORY_CID),
        mono: true,
        caption: "Open the encrypted blob's tx on the 0G Storage explorer.",
      },
      {
        label: "ledger.eth ENSIP-25 text record",
        value:
          'agent-registration={"standard":"ENSIP-25","registry":"0x8004B663…","chain":"base-sepolia","chainId":84532,"agentId":"5444"}',
      },
      {
        label: "Live smoke artifact",
        value: "proofs/data/ens-sepolia-resolve.json",
      },
    ],
  },
  {
    id: "erc8004",
    title: "ERC-8004",
    blurb:
      "Audited reputation registry on Base Sepolia. Ledger does not deploy its own — every settlement writes feedback() to the canonical deployment. The 47-job, 4.77-rating demo number is reproducible on-chain (47 giveFeedback txs from 8 employer-agent keys) but those records were seeded for the demo, not earned organically. Honest disclosure on the last row.",
    rows: [
      {
        label: "Standard",
        value: "ERC-8004 (EIPs.ethereum.org)",
        href: ERC8004_SPEC,
        caption: "Audited reputation registry standard the iNFT references.",
      },
      {
        label: "IdentityRegistry",
        value: ERC8004_IDENTITY_ADDRESS,
        href: baseAddr(ERC8004_IDENTITY_ADDRESS),
        mono: true,
      },
      {
        label: "ReputationRegistry",
        value: ERC8004_REPUTATION_REGISTRY,
        href: baseAddr(ERC8004_REPUTATION_REGISTRY),
        mono: true,
      },
      {
        label: "Source verification",
        value: "Basescan verified + Sourcify partial match",
        caption:
          "The ERC-8004 reference contracts are external audited deployments; Ledger uses them and does not redeploy them.",
      },
      {
        label: "Demo agentId",
        value: String(ERC8004_AGENT_ID),
        mono: true,
      },
      {
        label: "Total feedback records",
        value: "47",
      },
      {
        label: "Distinct client wallets",
        value: "8",
      },
      {
        label: "getSummary() raw return",
        value: "count=47 · sumValue=224190000000000000000 · decimals=18",
        mono: true,
        caption: "Direct read: average = 4.77 (17 decimals after divide).",
      },
      {
        label: "Verify command",
        value:
          'cast call 0x8004B663… "getSummary(uint256,address[],string,string)(uint64,int128,uint8)" 5444 [<8 client addresses>] "" "" --rpc-url https://sepolia.base.org',
        mono: true,
      },
      {
        label: "Disclosure",
        value: "Reputation history was seeded for the demo.",
        caption:
          "47 seeded completion feedback records signed across 8 employer-agent keys. Disclosed in README and 0g-proof.md per ETHGlobal anti-fraud norms.",
      },
    ],
  },
];

// ──────────────────────────────────────────────────────────────────────────
// Page
// ──────────────────────────────────────────────────────────────────────────
const ANCHOR_LINK_STYLE: React.CSSProperties = {
  color: "var(--ledger-gold-leaf)",
  borderBottom: "1px solid var(--ledger-gold-leaf)",
  paddingBottom: 4,
};

export default function ProofPage() {
  return (
    <Shell>
      <div className="page">
        <hr className="rule rule-strong" />

        {/* HERO BAND */}
        <section
          className="proof-section"
          style={{ paddingTop: 96, paddingBottom: 40 }}
        >
          <div
            className="caps-md"
            style={{ color: "var(--ledger-ink-muted)", marginBottom: 24 }}
          >
            VERIFY · EVERY · CLAIM
          </div>
          <h1 className="proof-hero-h1">Proof.</h1>
          <p className="proof-hero-blurb">
            Every contract address, transaction hash, attestation digest,
            storage CID, AXL peer ID, and ENS namespace behind Ledger&rsquo;s
            three sponsor integrations. Every entry is reproducible — click
            anything mono-spaced to verify on the relevant explorer, or run{" "}
            <code style={{ fontFamily: "var(--ledger-font-mono)" }}>
              pnpm tsx tools/register.ts
            </code>{" "}
            to put your own worker on the same rails.
          </p>
          <div className="proof-anchors">
            <Link href="#0g" className="caps-md" style={ANCHOR_LINK_STYLE}>
              0G ↓
            </Link>
            <Link href="#axl" className="caps-md" style={ANCHOR_LINK_STYLE}>
              AXL ↓
            </Link>
            <Link href="#ens" className="caps-md" style={ANCHOR_LINK_STYLE}>
              ENS ↓
            </Link>
            <Link href="#erc8004" className="caps-md" style={ANCHOR_LINK_STYLE}>
              ERC-8004 ↓
            </Link>
          </div>
        </section>

        <hr className="rule rule-strong" />

        {/* SECTIONS */}
        {sections.map((s) => (
          <ProofSection key={s.id} section={s} />
        ))}

        {/* FOOTER NOTE */}
        <section
          className="proof-section"
          style={{ paddingTop: 56, paddingBottom: 96 }}
        >
          <div
            className="caps-md"
            style={{ color: "var(--ledger-ink-muted)", marginBottom: 16 }}
          >
            REPRODUCE LOCALLY
          </div>
          <pre className="proof-code-block">
            {`# Mint your own worker iNFT
git clone https://github.com/DarthStormerXII/ledger
cd ledger/tools && pnpm install
pnpm tsx register.ts gen-keys --name my-worker
pnpm tsx register.ts mint --identity my-worker \\
  --memory-cid 0g://… --sealed-key 0x… --dry-run

# Verify the live ENS namespaces
cd ../resolver && npm run smoke:ens

# Read demo worker on-chain
cast call ${WORKER_INFT_ADDRESS} \\
  "ownerOf(uint256)(address)" ${DEMO_TOKEN_ID} \\
  --rpc-url https://evmrpc-testnet.0g.ai`}
          </pre>
          <p
            style={{
              fontSize: 14,
              color: "var(--ledger-ink-muted)",
              marginTop: 24,
              maxWidth: 640,
              lineHeight: 1.6,
            }}
          >
            Full walkthrough at{" "}
            <Link
              href="https://github.com/DarthStormerXII/ledger/blob/main/docs/REGISTER_AN_AGENT.md"
              target="_blank"
              rel="noreferrer noopener"
              style={{
                color: "var(--ledger-gold-leaf)",
                borderBottom: "1px solid var(--ledger-gold-dim)",
              }}
            >
              docs/REGISTER_AN_AGENT.md
            </Link>
            . Source proofs at{" "}
            <Link
              href="https://github.com/DarthStormerXII/ledger/tree/main/proofs"
              target="_blank"
              rel="noreferrer noopener"
              style={{
                color: "var(--ledger-gold-leaf)",
                borderBottom: "1px solid var(--ledger-gold-dim)",
              }}
            >
              /proofs
            </Link>
            .
          </p>
        </section>
      </div>
    </Shell>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────────────────────────────────
function ProofSection({ section }: { section: Section }) {
  return (
    <section id={section.id} className="proof-section">
      <div className="proof-section-grid">
        <div>
          <div
            className="caps-md"
            style={{
              color: "var(--ledger-gold-leaf)",
              marginBottom: 16,
              letterSpacing: "0.14em",
            }}
          >
            INTEGRATION
          </div>
          <h2 className="proof-section-title">{section.title}</h2>
          <p className="proof-section-blurb">{section.blurb}</p>
        </div>
        <div>
          <table className="proof-table">
            <tbody>
              {section.rows.map((r, idx) => (
                <ProofRow key={idx} row={r} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function ProofRow({ row }: { row: Row }) {
  const valueClass = row.mono ? "proof-value-mono" : "proof-value-text";
  return (
    <tr className="proof-row">
      <td className="proof-row-label">{row.label}</td>
      <td className="proof-row-cell">
        {row.href ? (
          <Link
            href={row.href}
            target="_blank"
            rel="noreferrer"
            className={`${valueClass} proof-value-link`}
          >
            {row.value}
          </Link>
        ) : (
          <span className={valueClass}>{row.value}</span>
        )}
        {row.caption ? (
          <div className="proof-row-caption">{row.caption}</div>
        ) : null}
      </td>
    </tr>
  );
}
