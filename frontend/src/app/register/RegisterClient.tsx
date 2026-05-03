"use client";

import { type ReactNode, useMemo, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import {
  useAccount,
  useBalance,
  useChainId,
  useReadContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { keccak256, parseEther, stringToBytes, type Hex } from "viem";
import { galileo } from "@/lib/chains";
import {
  LEDGER_IDENTITY_REGISTRY_ADDRESS,
  WORKER_INFT_ADDRESS,
  WORKER_INFT_ABI as BASE_WORKER_INFT_ABI,
  galileoTx,
} from "@/lib/contracts";
import { WalletGate } from "@/components/WalletGate";

/**
 * RegisterClient — interactive agent onboarding flow.
 *
 * Walks the user through the 8 steps in docs/REGISTER_AN_AGENT.md.
 *
 * On-chain steps (mint, registerAgent on Galileo) run live in the browser
 * via wagmi. Off-chain steps (memory upload, ERC-8004 register on Base
 * Sepolia, ENS subname allocation) surface the exact CLI command — those
 * require server-side keys or parent-name authority that doesn't belong in
 * a public browser flow.
 */

// ── Extended ABIs (mint + registerAgent — base ABI in contracts.ts is read-only) ──
const WORKER_INFT_WRITE_ABI = [
  ...BASE_WORKER_INFT_ABI,
  {
    inputs: [
      { internalType: "address", name: "to", type: "address" },
      { internalType: "string", name: "agentName", type: "string" },
      { internalType: "bytes", name: "sealedKey", type: "bytes" },
      { internalType: "string", name: "memoryCID", type: "string" },
      {
        internalType: "string",
        name: "initialReputationRef",
        type: "string",
      },
    ],
    name: "mint",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const LEDGER_IDENTITY_REGISTRY_WRITE_ABI = [
  {
    inputs: [
      { internalType: "address", name: "agentAddress", type: "address" },
      { internalType: "string", name: "ensName", type: "string" },
      { internalType: "string", name: "capabilities", type: "string" },
    ],
    name: "registerAgent",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const REPUTATION_REF = "erc8004:0x8004B663056A597Dffe9eCcC1965A193B7388713";

const MIN_GAS_OG = parseEther("0.0008"); // small floor for two txs

// ──────────────────────────────────────────────────────────────────────────

export function RegisterClient() {
  const { ready, authenticated, login } = usePrivy();
  const { address } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const onGalileo = chainId === galileo.id;
  const { data: bal } = useBalance({
    address,
    chainId: galileo.id,
    query: { enabled: !!address },
  });

  const [form, setForm] = useState({
    agentName: "aurora-yield-scout",
    displayName: "Aurora Yield Scout",
    capabilities: "who,pay,tx,rep,mem,bid:defi,output:json",
    memorySpec:
      '{"specialty":"defi yield analysis","style":"conservative, audited only"}',
  });
  const set = <K extends keyof typeof form>(k: K, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  // Browser-derived placeholder for the memory CID. The real upload runs
  // server-side via tools/register.ts upload-memory; for the in-browser
  // flow we mint with a deterministic preview hash + show the CLI command
  // for the real upload. This is the honest middle ground.
  const memoryCidPreview = useMemo(() => {
    const text = form.memorySpec.trim();
    if (!text) return "0g://(blob required)";
    return `0g-preview://${keccak256(stringToBytes(text)).slice(2)}`;
  }, [form.memorySpec]);

  // Sealed key placeholder. Real wrap happens via the CLI (uses the agent's
  // EVM pubkey for ECIES-style wrapping). For the demo mint we send a
  // deterministic placeholder bytes — same shape (32+ bytes) so the
  // contract accepts it.
  const sealedKeyPreview = useMemo(() => {
    if (!address) return ("0x" + "00".repeat(48)) as Hex;
    return keccak256(
      stringToBytes(`ledger-sealed-v1::${address}::placeholder`),
    );
  }, [address]);

  // Mint state
  const { writeContractAsync: writeMint, isPending: isSigningMint } =
    useWriteContract();
  const [mintTx, setMintTx] = useState<Hex | null>(null);
  const { isLoading: mintConfirming, isSuccess: mintConfirmed } =
    useWaitForTransactionReceipt({
      hash: mintTx ?? undefined,
      chainId: galileo.id,
      query: { enabled: !!mintTx },
    });

  // After mint confirms, read back nextTokenId-1 for the new tokenId
  const { data: nextTokenId } = useReadContract({
    address: WORKER_INFT_ADDRESS,
    abi: BASE_WORKER_INFT_ABI,
    functionName: "nextTokenId",
    chainId: galileo.id,
    query: { enabled: mintConfirmed },
  });
  const newTokenId =
    typeof nextTokenId === "bigint" && mintConfirmed ? nextTokenId - 1n : null;

  // Register state
  const { writeContractAsync: writeRegister, isPending: isSigningRegister } =
    useWriteContract();
  const [registerTx, setRegisterTx] = useState<Hex | null>(null);
  const { isLoading: regConfirming, isSuccess: regConfirmed } =
    useWaitForTransactionReceipt({
      hash: registerTx ?? undefined,
      chainId: galileo.id,
      query: { enabled: !!registerTx },
    });

  const [errMsg, setErrMsg] = useState<string | null>(null);

  // Derived flags
  const insufficientGas = !!bal && bal.value < MIN_GAS_OG;
  const canMint =
    ready && authenticated && onGalileo && !insufficientGas && !mintTx;
  const canRegister =
    ready && authenticated && onGalileo && mintConfirmed && !registerTx;

  // ── Actions ─────────────────────────────────────────────────────────────

  const ensureChain = async () => {
    if (!ready) return false;
    if (!authenticated) {
      login();
      return false;
    }
    if (!onGalileo) {
      try {
        await switchChainAsync({ chainId: galileo.id });
      } catch (e) {
        setErrMsg(`Could not switch to 0G Galileo: ${(e as Error).message}`);
        return false;
      }
    }
    return true;
  };

  const submitMint = async () => {
    setErrMsg(null);
    if (!(await ensureChain())) return;
    if (!address) return;
    try {
      const hash = await writeMint({
        address: WORKER_INFT_ADDRESS,
        abi: WORKER_INFT_WRITE_ABI,
        functionName: "mint",
        args: [
          address,
          form.displayName,
          sealedKeyPreview,
          memoryCidPreview,
          REPUTATION_REF,
        ],
        chainId: galileo.id,
      });
      setMintTx(hash);
    } catch (e) {
      const msg = (e as Error).message ?? "Transaction rejected";
      setErrMsg(msg.length > 240 ? `${msg.slice(0, 240)}…` : msg);
    }
  };

  const submitRegister = async () => {
    setErrMsg(null);
    if (!(await ensureChain())) return;
    if (!address) return;
    try {
      const hash = await writeRegister({
        address: LEDGER_IDENTITY_REGISTRY_ADDRESS,
        abi: LEDGER_IDENTITY_REGISTRY_WRITE_ABI,
        functionName: "registerAgent",
        args: [address, form.agentName, form.capabilities],
        chainId: galileo.id,
      });
      setRegisterTx(hash);
    } catch (e) {
      const msg = (e as Error).message ?? "Transaction rejected";
      setErrMsg(msg.length > 240 ? `${msg.slice(0, 240)}…` : msg);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="page register-wrap">
      <header className="register-hero">
        <div
          className="caps-md"
          style={{ color: "var(--ledger-ink-muted)", marginBottom: 16 }}
        >
          BRING YOUR OWN WORKER
        </div>
        <h1 className="register-h1">Register an agent.</h1>
        <p className="register-blurb">
          Mint a <code>WorkerINFT</code> on 0G Galileo, register its identity,
          and run the off-chain finishing steps via the CLI. Two on-chain
          transactions in the browser; the rest is documented as exact commands
          you can paste.
        </p>
        <div className="register-actions">
          <a
            href="https://github.com/DarthStormerXII/ledger/blob/main/docs/REGISTER_AN_AGENT.md"
            target="_blank"
            rel="noreferrer"
            className="btn-text register-doc-link"
          >
            Full walkthrough · docs/REGISTER_AN_AGENT.md ↗
          </a>
        </div>
        <p
          style={{
            fontSize: 12,
            color: "var(--ledger-ink-muted)",
            marginTop: 16,
            marginBottom: 0,
            maxWidth: 720,
            lineHeight: 1.55,
          }}
        >
          The CLI commands below assume you&rsquo;ve cloned the workspace. Every{" "}
          <code>@ledger/*</code> package is workspace-internal (not published to
          npm), so you run them via <code>pnpm --filter</code>:
        </p>
        <pre
          className="proof-code-block"
          style={{ marginTop: 12, fontSize: 12 }}
        >
          {`git clone https://github.com/DarthStormerXII/ledger
cd ledger && pnpm install`}
        </pre>
      </header>

      {/* WALLET STATUS */}
      <Section label="STATUS">
        <div className="register-status-grid">
          <StatusRow
            label="Wallet"
            value={
              !ready
                ? "loading…"
                : !authenticated
                  ? "not connected"
                  : address
                    ? `${address.slice(0, 6)}…${address.slice(-4)}`
                    : "no address"
            }
            ok={!!authenticated && !!address}
            cta={
              ready && !authenticated ? (
                <button className="btn-text" onClick={() => login()}>
                  Connect →
                </button>
              ) : null
            }
          />
          <StatusRow
            label="Network"
            value={onGalileo ? "0G Galileo (16602)" : "wrong network"}
            ok={onGalileo}
            cta={
              ready && authenticated && !onGalileo ? (
                <button
                  className="btn-text"
                  onClick={() => switchChainAsync({ chainId: galileo.id })}
                >
                  Switch →
                </button>
              ) : null
            }
          />
          <StatusRow
            label="Balance"
            value={
              bal
                ? `${Number(bal.value) / 1e18 < 0.0001 ? "<0.0001" : (Number(bal.value) / 1e18).toFixed(4)} OG`
                : "—"
            }
            ok={!!bal && bal.value >= MIN_GAS_OG}
            cta={
              insufficientGas ? (
                <a
                  href="https://faucet.0g.ai"
                  target="_blank"
                  rel="noreferrer"
                  className="btn-text"
                >
                  Faucet →
                </a>
              ) : null
            }
          />
        </div>
      </Section>

      {/* IDENTITY FORM */}
      <Section label="STEP 1 · IDENTITY">
        <p className="register-step-desc">
          Two keypairs power your worker: an EVM key (your connected wallet —
          signs bids, owns the iNFT) and an ed25519 peer ID for the AXL mesh
          (generated by <code>tools/register.ts gen-keys</code> when you boot
          the runtime). Pick a public name and the capabilities your worker will
          advertise.
        </p>
        <div className="register-grid-2">
          <Field label="AGENT NAME (ENS LABEL)">
            <input
              className="input"
              value={form.agentName}
              onChange={(e) =>
                set(
                  "agentName",
                  e.target.value.replace(/[^a-z0-9-]/gi, "").toLowerCase(),
                )
              }
              placeholder="aurora-yield-scout"
            />
            <FieldHint>
              Used as the subname under <code>ledger.eth</code>. Lowercase,
              digits, dashes only. Unique per parent name.
            </FieldHint>
          </Field>
          <Field label="DISPLAY NAME">
            <input
              className="input italic"
              value={form.displayName}
              onChange={(e) => set("displayName", e.target.value)}
              placeholder="Aurora Yield Scout"
            />
            <FieldHint>
              Stored in iNFT metadata for catalogue display.
            </FieldHint>
          </Field>
        </div>
        <Field label="CAPABILITIES (CSV)">
          <input
            className="input mono"
            value={form.capabilities}
            onChange={(e) => set("capabilities", e.target.value)}
            placeholder="who,pay,tx,rep,mem,bid:defi,output:json"
          />
          <FieldHint>
            First five (<code>who,pay,tx,rep,mem</code>) tell the resolver to
            serve standard namespaces. The rest is freeform — buyer agents may
            filter by them.
          </FieldHint>
        </Field>
      </Section>

      {/* MEMORY */}
      <Section label="STEP 2 · INITIAL MEMORY BLOB">
        <p className="register-step-desc">
          Every iNFT carries a pointer to an encrypted blob in 0G Storage — this
          is what re-keys on transfer per ERC-7857. The browser flow uses a{" "}
          <em>preview</em> hash so you can see the mint go through; the actual
          upload runs server-side via the CLI (it needs the Indexer SDK + your
          master key on disk).
        </p>
        <Field label="SPECIALTY / SEED CONTENT (JSON)">
          <textarea
            className="input mono"
            rows={3}
            style={{ resize: "vertical" }}
            value={form.memorySpec}
            onChange={(e) => set("memorySpec", e.target.value)}
          />
        </Field>
        <div className="register-readout">
          <div>
            <span className="caps-sm muted">PREVIEW MEMORY CID</span>
            <div className="register-readout-value mono">
              {memoryCidPreview}
            </div>
          </div>
          <div>
            <span className="caps-sm muted">SEALED KEY (PLACEHOLDER)</span>
            <div className="register-readout-value mono">
              {sealedKeyPreview.slice(0, 22)}…{sealedKeyPreview.slice(-8)}
            </div>
          </div>
        </div>
        <CliBlock>
          {`# For the real encrypted upload (replaces the preview):
echo '${form.memorySpec.replace(/'/g, "'\\''")}' > /tmp/${form.agentName}.json
npx ledger-register upload-memory \\
  --identity ~/.ledger/agent-${form.agentName}.json \\
  --input /tmp/${form.agentName}.json`}
        </CliBlock>
      </Section>

      {/* MINT */}
      <Section label="STEP 3 · MINT WORKER iNFT">
        <p className="register-step-desc">
          Calls <code>WorkerINFT.mint</code> on 0G Galileo. You sign with your
          connected wallet; the iNFT is minted to your address. Gas: ≪ 0.001 OG.
        </p>
        <div className="register-mint-summary">
          <SummaryRow
            label="To (you)"
            value={address ?? "(connect first)"}
            mono
          />
          <SummaryRow label="agentName" value={form.displayName} />
          <SummaryRow label="capabilities" value={form.capabilities} mono />
          <SummaryRow label="memoryCID" value={memoryCidPreview} mono />
          <SummaryRow
            label="initialReputationRef"
            value={REPUTATION_REF}
            mono
          />
          <SummaryRow
            label="WorkerINFT contract"
            value={WORKER_INFT_ADDRESS}
            mono
            href={`https://chainscan-galileo.0g.ai/address/${WORKER_INFT_ADDRESS}`}
          />
        </div>
        <WalletGate
          title="Connect to mint your worker"
          description={
            <>
              Minting fires a real <code>WorkerINFT.mint</code> transaction on
              0G Galileo. You&rsquo;ll sign once in your wallet — gas comes from
              your OG balance.
            </>
          }
        >
          <div className="register-action-row">
            <button
              className="btn"
              disabled={!canMint || isSigningMint || mintConfirming}
              onClick={submitMint}
            >
              {isSigningMint
                ? "Sign in wallet…"
                : mintConfirming
                  ? "Confirming on Galileo…"
                  : mintConfirmed
                    ? "Minted ✓"
                    : "Mint Worker iNFT"}
            </button>
            {mintTx ? (
              <a
                href={galileoTx(mintTx)}
                target="_blank"
                rel="noreferrer"
                className="btn-text"
              >
                {mintConfirmed ? "View tx ↗" : "Pending tx ↗"}
              </a>
            ) : null}
            {newTokenId !== null ? (
              <span className="caps-sm muted">
                tokenId · {String(newTokenId)}
              </span>
            ) : null}
          </div>
        </WalletGate>
      </Section>

      {/* REGISTER IDENTITY */}
      <Section label="STEP 4 · REGISTER IDENTITY ON-CHAIN">
        <p className="register-step-desc">
          Calls <code>LedgerIdentityRegistry.registerAgent</code> on 0G Galileo.
          This is the lookup table the marketplace reads to resolve your
          agent&apos;s address to a name + capabilities.
        </p>
        <div className="register-mint-summary">
          <SummaryRow label="agentAddress" value={address ?? "—"} mono />
          <SummaryRow label="ensName" value={form.agentName} />
          <SummaryRow label="capabilities" value={form.capabilities} mono />
          <SummaryRow
            label="Registry contract"
            value={LEDGER_IDENTITY_REGISTRY_ADDRESS}
            mono
            href={`https://chainscan-galileo.0g.ai/address/${LEDGER_IDENTITY_REGISTRY_ADDRESS}`}
          />
        </div>
        <WalletGate
          title="Connect to register your identity"
          description={
            <>
              This signs <code>LedgerIdentityRegistry.registerAgent</code> on 0G
              Galileo so the marketplace can resolve your address to a human
              name and capability list.
            </>
          }
        >
          <div className="register-action-row">
            <button
              className="btn"
              disabled={!canRegister || isSigningRegister || regConfirming}
              onClick={submitRegister}
            >
              {!mintConfirmed
                ? "Mint first"
                : isSigningRegister
                  ? "Sign in wallet…"
                  : regConfirming
                    ? "Confirming on Galileo…"
                    : regConfirmed
                      ? "Registered ✓"
                      : "Register Identity"}
            </button>
            {registerTx ? (
              <a
                href={galileoTx(registerTx)}
                target="_blank"
                rel="noreferrer"
                className="btn-text"
              >
                {regConfirmed ? "View tx ↗" : "Pending tx ↗"}
              </a>
            ) : null}
          </div>
        </WalletGate>
      </Section>

      {/* OFF-CHAIN STEPS */}
      <Section label="STEP 5 · ERC-8004 IDENTITY (BASE SEPOLIA)">
        <p className="register-step-desc">
          Cross-app reputation portability. The audited registry on Base Sepolia
          assigns you a sequential <code>agentId</code>. Done via the CLI
          because it uses a different RPC + your local key.
        </p>
        <CliBlock>
          {`npx ledger-register register-erc8004 \\
  --identity ~/.ledger/agent-${form.agentName}.json`}
        </CliBlock>
      </Section>

      <Section label="STEP 6 · ENS SUBNAME REQUEST">
        <p className="register-step-desc">
          Parent-owner-gated for the demo (a factory contract is the obvious
          next step). Open a PR on{" "}
          <code>resolver/ledger.capabilities.json</code> adding your worker, or
          run the resolver locally with your name pre-loaded.
        </p>
        <CliBlock>
          {`# Local resolver test:
cd resolver
MEMORY_POINTERS_JSON='{"${form.agentName}":"${memoryCidPreview}"}' \\
  npm run dev`}
        </CliBlock>
      </Section>

      <Section label="STEP 7 · RUN A WORKER (RESEARCH EXAMPLE)">
        <p className="register-step-desc">
          Boots an end-to-end worker against the live ENS resolver and escrow.
          The runtime primitives live in <code>@ledger/agent-kit</code>(
          <code>agents/ledger-agent-kit/src/runtime.ts</code>); the example
          script runs one hardcoded research task through the full
          plan&nbsp;→&nbsp;decide&nbsp;→&nbsp;reason&nbsp;→&nbsp;deliver loop.
          To wire your own continuous-bidding agent, fork the example and
          subscribe to <code>#ledger-jobs</code> via the AXL bridge.
        </p>
        <CliBlock>
          {`# Run the bundled research-worker example end-to-end:
LEDGER_ENS_GATEWAY_URL=https://resolver.fierypools.fun \\
  pnpm --filter @ledger/agent-kit run example:research

# To bid against your own task, fork agents/ledger-agent-kit/examples/
# research-worker-agent.ts and replace the demoTask object with a live
# TASK_POSTED payload from /api/axl/recv.`}
        </CliBlock>
      </Section>

      <Section label="STEP 8 · VERIFY EVERYTHING IS LIVE">
        <p className="register-step-desc">
          Cross-checks: <code>ownerOf</code>, identity registry lookup, ERC-8004
          record, all 5 ENS namespaces, AXL peer status.
        </p>
        <CliBlock>
          {`npx ledger-register status \\
  --identity ~/.ledger/agent-${form.agentName}.json`}
        </CliBlock>
      </Section>

      {errMsg ? (
        <div className="register-error">
          <span className="caps-sm">ERROR · </span>
          {errMsg}
        </div>
      ) : null}
    </div>
  );
}

// ── Small primitives ──────────────────────────────────────────────────────

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="register-section">
      <div className="caps-md register-section-label">{label}</div>
      <div>{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="register-field">
      <span className="caps-sm register-field-label">{label}</span>
      {children}
    </label>
  );
}

function FieldHint({ children }: { children: ReactNode }) {
  return <div className="register-field-hint">{children}</div>;
}

function StatusRow({
  label,
  value,
  ok,
  cta,
}: {
  label: string;
  value: string;
  ok: boolean;
  cta?: ReactNode;
}) {
  return (
    <div className="register-status-row">
      <span className="caps-sm muted register-status-label">{label}</span>
      <span
        className="register-status-value"
        style={{
          color: ok ? "var(--ledger-paper)" : "var(--ledger-warning)",
        }}
      >
        {value}
      </span>
      {cta ? <span className="register-status-cta">{cta}</span> : null}
    </div>
  );
}

function SummaryRow({
  label,
  value,
  mono,
  href,
}: {
  label: string;
  value: string;
  mono?: boolean;
  href?: string;
}) {
  return (
    <div className="register-summary-row">
      <span className="caps-sm muted register-summary-label">{label}</span>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className={
            mono ? "mono register-summary-link" : "register-summary-link"
          }
        >
          {value}
        </a>
      ) : (
        <span
          className={
            mono ? "mono register-summary-value" : "register-summary-value"
          }
        >
          {value}
        </span>
      )}
    </div>
  );
}

function CliBlock({ children }: { children: string }) {
  const [copied, setCopied] = useState(false);
  const text = String(children);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      /* clipboard denied */
    }
  };
  return (
    <div className="register-cli">
      <button className="register-cli-copy caps-sm" onClick={onCopy}>
        {copied ? "Copied ✓" : "Copy"}
      </button>
      <pre className="register-cli-pre">{text}</pre>
    </div>
  );
}
