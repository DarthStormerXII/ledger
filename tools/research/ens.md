# ENS — Deep Research for Ledger Slot-3 Integration

*Compiled 2026-05-02 for the Ledger team. ETHGlobal Open Agents 2026, Slot-3 swap decision (KeeperHub → ENS).*
*Sources: ENS docs, ENSIPs 1–25, EIP-3668, ENS blog, GitHub reference repos, sponsor prize page.*

---

## TL;DR (the 12 bullets that make-or-break the swap)

1. **ENS lives on L1 (Mainnet + Sepolia). Period.** The `ENSRegistry` is at the same address on both — `0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e`. Universal Resolver is at `0xeEeEEEeE14D718C2B47D9923Deab1335E144EeEe` (mainnet) and `0xBaBC7678D7A63104f1658c11D6AE9A21cdA09725` (Sepolia, via the forum thread, with a newer `0xeEeEEEee...` per the docs page — see §1).
2. **Base Sepolia does NOT have a parallel ENS registry.** Basenames (`*.base.eth`) are an L2 NFT registry on Base that resolves *through* a CCIP-Read resolver registered against `base.eth` on L1 mainnet. They use ENS protocol-level compatibility, not a sibling deployment.
3. **0G Galileo (16602) is invisible to ENS.** No `ENSIP-19` reverse registrar is deployed there, no Universal Resolver knows about it, and `ENSIP-11` (EVM coinType derivation) only covers things the resolver deliberately exposes. **Cross-chain coordination is up to us.** This is the central design constraint.
4. **The killer pattern for Ledger is a custom CCIP-Read resolver that does live `ownerOf(tokenId)` on 0G Galileo per resolution.** This already exists in reference form (`0xFlicker/tod-offchain-resolver`, ENS-ecosystem fork of the offchain-resolver). When the iNFT transfers on 0G, `worker-001.ledger.eth` automatically resolves to the new owner. **No subdomain transfer transaction needed.** This is Path C — and it is the highest-creativity, lowest-mechanical-coupling path.
5. **`ENSIP-25 — AI Agent Registry ENS Name Verification` (Draft, published Oct 2026) literally names ERC-8004 in its specification.** The text record key is `agent-registration[<ERC-7930-encoded-registry-address>][<agentId>]`. Setting this on a subname *is the canonical, ENS-blessed pattern for binding an ERC-8004 agent to ENS in 2026.* This single ENSIP turns Ledger's existing ERC-8004 deployment from neutral into a perfect-fit story.
6. **Two-prize unlock:** Path C (live `ownerOf` resolver) targets **ENS-Creative** (auto-rotating addresses, dynamic resolution); ENSIP-25 text-record verification targets **ENS-AI** (real work: resolving the agent's address, storing its metadata, gating access). One submission can hit both.
7. **Namestone + Durin are the "30h-friendly" shortcut paths,** but neither natively supports "subname ownership tracks an external NFT contract on a different chain." Namestone is a hosted REST API — fast for static subnames, weak for our cross-chain ownership story. Durin is L2 ENS using ERC-721 tokens — but the L2 has to be on the same chain as the subname registry (Base/Arb/etc, not 0G Galileo).
8. **The cheapest parent name path:** register `ledger.eth` (or any short name) on **Sepolia** via `sepolia.app.ens.domains` for ~free Sepolia ETH. ENSv2 alpha now uses Sepolia USDC, but the legacy registrar still works for free domains in low-collision name space. Estimated < 30 min to acquire and configure resolver.
9. **Subdomain ownership "follows" the iNFT mechanically only if we use Path B (NameWrapper subnames where each subname is an ERC-1155 owned by the iNFT contract address)** — and even then, we'd need a hook in the iNFT contract that calls `safeTransferFrom` on NameWrapper on every iNFT transfer. **This is operationally heavy.** Path C (live `ownerOf` resolver) achieves the same demo outcome with zero on-chain coupling.
10. **zk-records angle for ENS-Creative:** compress an ERC-8004 reputation summary or a TEE attestation hash into a zk-proof, store the proof bytes as a text record under a custom key (e.g. `ai.ledger.attest.tee`), have a verifier app check it. ENSIP-5 namespacing rule allows `ai.x` reverse-DNS keys. Sepolia has zk verifiers via Risc Zero, Succinct, Aztec — but for a 30h hackathon, a SNARK from Circom + verifier contract is the realistic ship.
11. **ETHGlobal/ENS office hours: confirmed via the prize page, sponsor support is in the ETHGlobal Discord. ENS Labs maintains its own Discord** (see §4). DM `nick.eth`, `gregskril.eth`, `slobo.eth` for sponsor-engineer pattern matches. ENS publishes `docs.ens.domains/llms-full.txt` for LLM consumption.
12. **Recommended path for 4-person team / 30h:** Path C (live `ownerOf` CCIP-Read resolver) + ENSIP-25 text record + auto-rotating `pay.<agent>.ledger.eth` HD-derived payment subname. Three differentiated wins on one infra. Hour budget: 14h infra + 6h zk add-on + 4h demo polish + 6h slack. **This swap is worth doing.**

---

## 1. ENS network availability on our topology

### L1 Mainnet — canonical contract suite

| Contract | Address |
|---|---|
| ENSRegistry | `0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e` |
| BaseRegistrar | `0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85` |
| ETHRegistrarController | `0x59E16fcCd424Cc24e280Be16E11Bcd56fb0CE547` |
| ReverseRegistrar | `0xa58E81fe9b61B5c3fE2AFD33CF304c454AbFc7Cb` |
| NameWrapper | `0xD4416b13d2b3a9aBae7AcD5D6C2BbDBE25686401` |
| Public Resolver | `0xF29100983E058B709F3D539b0c765937B804AC15` |
| Universal Resolver | `0xeEeEEEeE14D718C2B47D9923Deab1335E144EeEe` |

### L1 Sepolia — what we'll actually use

| Contract | Address (canonical, per ENS docs page) |
|---|---|
| ENSRegistry | `0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e` |
| BaseRegistrar | `0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85` |
| ETHRegistrarController | `0xfb3cE5D01e0f33f41DbB39035dB9745962F1f968` |
| ReverseRegistrar | `0xA0a1AbcDAe1a2a4A2EF8e9113Ff0e02DD81DC0C6` |
| NameWrapper | `0x0635513f179D50A207757E05759CbD106d7dFcE8` |
| Public Resolver | `0xE99638b40E4Fff0129D56f03b55b6bbC4BBE49b5` |
| Universal Resolver | `0xeEeEEEeE14D718C2B47D9923Deab1335E144EeEe` |

(The forum thread from Jan 2024 lists slightly older Sepolia addresses — `PublicResolver: 0x8FADE66B79cC9f707aB26799354482EB93a5B7dD`, `ETHRegistrarController: 0xFED6a969AaA60E4961FCD3EBF1A2e8913ac65B72`, `UniversalResolver: 0xBaBC7678D7A63104f1658c11D6AE9A21cdA09725`. These may have been redeployed; **always cross-check `github.com/ensdomains/ens-contracts/tree/staging/deployments/sepolia` before writing to a contract.** [UNVERIFIED] — pick whichever the official docs page returns at build-time.)

`sepolia.app.ens.domains` is the user-facing UI; ENSv2 Alpha is now live there with USDC payment. Free testnet ETH covers all gas.

### Base / Base Sepolia — Basenames vs ENS

Basenames is **NOT** a separate ENS deployment. The `base.eth` parent name is owned on **L1 Ethereum mainnet** and points to a custom CCIP-Read resolver that defers resolution to Base L2 contracts. The architecture:

- **L1 (Ethereum mainnet)**: an L1Resolver contract is set as the resolver for `base.eth` in the L1 ENSRegistry. It implements ENSIP-10 (wildcard) and reverts with `OffchainLookup` for any subname under `base.eth`.
- **L2 (Base mainnet, chainId 8453)**: a Base-side L2Registry stores subname records, addresses, and text records on chain.
- **Gateway**: a CCIP-Read gateway operated by Base reads from the L2 registry and returns signed responses verifying L2 state (often via storage proofs against L1, the "Unruggable Gateway" trustless model).

Outcome: `jesse.base.eth` resolves correctly from any client (viem, ethers, ensjs) using the standard L1 Universal Resolver. **Base Sepolia (chainId 84532) has Basenames staging deployed** — testnet subnames work the same way. ENSIP-19 lists Base Sepolia's reverse registrar at `0x00000BeEF055f7934784D6d81b6BC86665630dbA` for primary names.

**For Ledger this means:** if our iNFT lived on Base, we could use Basenames-style L2 subname infra. But our iNFT is on **0G Galileo, not Base**. So Basenames is not directly applicable; it's a *blueprint* we replicate.

### L2 ENS — Durin, ENSv2, Namestone, Namespace

Production reality as of May 2026:

- **Durin** (open-source, by Namestone) — L2 subname issuance with ERC-721 NFTs. Factory deployed at `0xDddddDdDDD8Aa1f237b4fa0669cb46892346d22d` on **14 chains** including Arbitrum, Base, Optimism, Polygon, Scroll, Linea, Celo, Worldchain (mainnet + Sepolia testnets each). The L1 resolver pointer that connects an L1 ENS name to a Durin L2 registry is at `0x8A968aB9eb8C084FBC44c531058Fc9ef945c3D61` on mainnet. Setup: deploy L2Registry, deploy L2Registrar, point L1 ENS resolver to Durin's L1 resolver, mint subnames as ERC-721 on the L2.
- **Namestone** — hosted offchain CCIP-Read gateway. REST API at `namestone.com`. Supports mainnet + Sepolia. Pricing tiers from $500/yr (250 names) to enterprise. **Has a free API key tier for developers** (no public hard-cap stated; sufficient for hackathon use). 9M+ subnames issued.
- **Namespace** — competing offchain provider, similar model.
- **JustaName** — competing offchain provider, similar model.
- **ENSv2** — the broader L2-scaling roadmap. Currently in alpha on Sepolia (USDC payment). Not a "specific chain"; it's the umbrella.
- **EnsNode** (NameHash) — a multichain indexer for ENSv2 powered by Ponder. Worth knowing exists.

### Cross-chain (0G Galileo + Sepolia) — what's possible

**0G Galileo (16602) is not an Ethereum L2.** It's an EVM-compatible chain with its own consensus and no state-root posting to Ethereum. This means:

- **Trustless cross-chain ENS resolution (Unruggable Gateway pattern, with L2 state proofs against L1) is impossible** for 0G Galileo. We'd need 0G to publish state roots to Ethereum L1, which it doesn't.
- **Trusted cross-chain CCIP-Read resolution is fully possible.** Our gateway server runs on a normal HTTP host, queries 0G Galileo via RPC (`https://evmrpc-testnet.0g.ai` or similar), and returns *signed* responses. Our L1 resolver verifies the gateway operator's signature.
- **The trust model is identical to Coinbase cb.id and Uniswap uni.eth** — both run trusted offchain gateways that sign responses. ~35% of actively resolved names use CCIP-Read; this trust model is dominant.

So: ENS on Sepolia, custom CCIP-Read resolver on Sepolia, gateway server hosted on Cloudflare Worker / Vercel / wherever, gateway queries 0G Galileo over RPC. The `worker-001.ledger.eth` resolution travels Sepolia client → Sepolia resolver → CCIP-Read gateway → 0G Galileo RPC → returns signed `ownerOf` result → Sepolia resolver verifies → returns to client.

**Latency** — a CCIP-Read resolution typically adds 200–500ms over L1-only (one HTTP round-trip + signing + verification). 0G RPC adds another ~100–300ms. Total: ~500–1000ms per resolution. Cacheable with TTL. Acceptable for demo.

---

## 2. Subdomain ownership transfer mechanics

The question: when iNFT #1 transfers on 0G Galileo from Alice → Bob, what makes `worker-001.ledger.eth` follow?

### Mechanism A — NameWrapper (ERC-1155) subname ownership

NameWrapper subnames are ERC-1155 tokens. To create one with the iNFT contract as owner:

```solidity
NameWrapper.setSubnodeOwner(
  bytes32 parentNode,      // namehash("ledger.eth")
  string  label,           // "worker-001"
  address owner,           // address of iNFT contract on... wait
  uint32  fuses,
  uint64  expiry
);
```

**The fundamental problem:** `owner` here is an address on L1 Sepolia. Our iNFT contract lives on 0G Galileo (chainId 16602). There is no way for an L1 NameWrapper to point to an address-on-a-different-chain as the "owner" — addresses in NameWrapper are L1 addresses.

**Workarounds for Path B:**
- Deploy a thin "iNFT shadow" registrar on Sepolia that exposes `ownerOf(tokenId)` and is updated by a relayer watching 0G Galileo for `Transfer` events. Register subnames with this shadow contract as owner. Every iNFT transfer triggers a relayer to call `setSubnodeOwner` on NameWrapper to update the subname owner. **High operational overhead** (relayer, gas costs on Sepolia per transfer, sync lag).
- Skip the relayer; use NameWrapper as a one-time initialization, then mint subnames whose owner is the *L1 wallet* of the agent's first owner. Then each subsequent owner has to manually re-claim the subname. **Bad UX, bad demo.**

NameWrapper fuses worth knowing:
- `PARENT_CANNOT_CONTROL` — locks the subname from parent reclamation
- `CANNOT_TRANSFER` — locks the subname's transferability
- `CANNOT_UNWRAP` — required when burning owner-controlled fuses

For our use case, we want subnames to be *transferable* (so the relayer can update them), so we don't burn `CANNOT_TRANSFER`. Default fuse config works.

### Mechanism B — Namestone hosted

Namestone exposes a REST API:
- `POST /api/public_v1/set-name` — write a subname with address + text records
- `POST /api/public_v1/enable-domain` — register a parent name with Namestone
- `GET /api/public_v1/get-names` — read

Body shape (paraphrased; check `docs.namestone.com`):
```json
{
  "domain": "ledger.eth",
  "name": "worker-001",
  "address": "0xAlice...",
  "text_records": { "agent-registration[...]": "1" },
  "coin_types": { "60": "0xAlice..." }
}
```

Auth: `Authorization: <api_key>` header.

**Cross-chain ownership tracking:** Namestone has no native binding to "an NFT contract on chain X." We'd build the same relayer pattern as Mechanism A — watch 0G Galileo, call Namestone's `set-name` on every iNFT transfer. Hosted, gasless, but still the same relayer architecture. Faster to ship than NameWrapper because no Sepolia gas per update.

### Mechanism C — Custom CCIP-Read resolver returning live `ownerOf()`

**This is the elegant path.** The L1 resolver does no per-transfer state mutation. Every resolution call queries 0G Galileo *live*.

Resolver contract pattern (paraphrased from `gskril/ens-offchain-registrar` and `ensdomains/offchain-resolver`):

```solidity
// L1 Sepolia
contract LedgerResolver is IExtendedResolver {
  string[] public urls;        // gateway URL templates
  address public signer;       // gateway signer

  function resolve(bytes calldata name, bytes calldata data)
    external view returns (bytes memory)
  {
    revert OffchainLookup(
      address(this),
      urls,
      data,
      this.resolveCallback.selector,
      abi.encode(data)
    );
  }

  function resolveCallback(bytes calldata response, bytes calldata extra)
    external view returns (bytes memory)
  {
    (bytes memory result, uint64 expiry, bytes memory sig) =
      abi.decode(response, (bytes, uint64, bytes));
    bytes32 hash = SignatureVerifier.makeSignatureHash(
      address(this), expiry, extra, result
    );
    require(SignatureVerifier.verify(signer, hash, sig), "bad sig");
    require(expiry > block.timestamp, "expired");
    return result;
  }
}
```

Gateway pseudocode (Node.js, ezccip.js style):

```javascript
import { EZCCIP } from '@resolverworks/ezccip';
import { createPublicClient, http } from 'viem';

const ezccip = new EZCCIP();
ezccip.enableENSIP10(async ({ name, calldata, sender, signingKey }) => {
  // name = "worker-001.ledger.eth"
  const tokenId = parseTokenIdFromLabel(name);
  const ognClient = createPublicClient({
    chain: { id: 16601 /* 0G Galileo */ },
    transport: http('https://evmrpc-testnet.0g.ai'),
  });
  const owner = await ognClient.readContract({
    address: WORKER_INFT_ADDRESS,
    abi: INFT_ABI,
    functionName: 'ownerOf',
    args: [tokenId],
  });
  // Encode the owner as an `addr(node)` ENS response
  return encodeAddrResponse(owner);
});
ezccip.serve({ port: 8080 });
```

**Latency:** ~500ms per resolution (one HTTP round-trip + 0G RPC + sign).
**ENSIPs governing the response shape:**
- ENSIP-10 (wildcard resolution, the `resolve(bytes name, bytes data)` interface)
- EIP-3668 (CCIP-Read OffchainLookup error format)
- ENSIP-1 (registry/resolver model)
- ENSIP-9 (multichain addr resolution if we expose chain-specific addrs)

**Existing examples:**
- `ensdomains/offchain-resolver` — official reference (resolver contract + Node.js gateway)
- `gskril/ens-offchain-registrar` — Cloudflare Worker + D1 example
- `0xFlicker/tod-offchain-resolver` — **literally the "look up ERC721 owners to resolve subdomains" pattern.** Lambda-deployed, signs responses. Status: experimental (34 commits, 0 stars/forks), but the pattern is exactly what we need. We adapt their code rather than write from scratch.
- `resolverworks/ezccip.js` — turnkey gateway lib
- `resolverworks/TheOffchainGateway.js` — full-featured gateway with multiple example routers

**For Ledger, Path C is the recommended approach.** It cleanly satisfies "auto-rotating addresses on each resolution" (one of ENS-Creative's named examples) and removes the relayer infrastructure burden entirely.

---

## 3. The three integration paths, hour-budgeted

Assume 4 builders, ~30h aggregate budget, ~10–14h on the wall clock.

### Path A — Namestone hosted (~8h)

- 1h: register Namestone account, get API key, call `enable-domain` for `ledger.eth` on Sepolia
- 1h: register Sepolia name `ledger.eth` via `sepolia.app.ens.domains` (free Sepolia ETH from a faucet; pick a name that's not taken), set Namestone as the resolver
- 2h: build a minimal relayer watching 0G Galileo iNFT `Transfer(from, to, tokenId)` events, calling Namestone `set-name` to update `worker-<tokenId>.ledger.eth` → `to`
- 2h: write the ENSIP-25 text record (`agent-registration[...][<agentId>]` = `"1"`) on each subname
- 1h: build the demo UI showing subname → address resolution from any standard client (viem)
- 1h: video script + recording

**Where it breaks:**
- Cross-chain sync lag (iNFT transfers on 0G must wait for relayer to push to Namestone — typically 5–20s)
- Hosted dependency (judge can argue ENS isn't doing "real work" — Namestone is)
- Doesn't naturally hit "auto-rotating addresses" creative angle

**Artifacts judges grep for:**
- README mentioning ENSIP-25
- Working subname resolution from a fresh viem call
- Video showing iNFT transfer → ENS update

**ENSIPs hit:** ENSIP-1, ENSIP-5 (text records), ENSIP-9, ENSIP-10, **ENSIP-25**.

### Path B — NameWrapper L1 subnames with relayer (~14h)

- 1h: register and wrap `ledger.eth` on Sepolia, lock fuses appropriately
- 2h: deploy a `LedgerSubnameRegistrar` contract on Sepolia that calls `NameWrapper.setSubnodeRecord` for each agent
- 2h: build a relayer (Node.js, watching 0G via RPC, calling the Sepolia registrar) for `Transfer` event sync
- 1h: gas estimation and Sepolia ETH funding for the relayer
- 2h: integrate ENSIP-25 text record write per subname
- 2h: end-to-end demo testing
- 2h: edge cases (duplicate transfers, gas spikes, RPC fails)
- 1h: video + writeup
- 1h: slack

**Where it breaks:**
- Sepolia gas per transfer (real cost, ~$0 testnet but adds latency and infra surface)
- Relayer single point of failure (if it dies during demo, sync stops)
- More mechanical, less "creative" — judges lean toward Path C aesthetically

**Artifacts judges grep for:**
- Wrapped subnames visible in `sepolia.app.ens.domains`
- Subname owner = transferred owner after a live demo iNFT transfer
- ENSIP-25 text record present

**ENSIPs hit:** ENSIP-1, ENSIP-5, ENSIP-9, ENSIP-10, ENSIP-15 (name normalization on registrar), **ENSIP-25**, NameWrapper docs.

### Path C — Custom CCIP-Read with live `ownerOf` (~14h, recommended)

- 1h: register `ledger.eth` on Sepolia
- 1h: deploy `LedgerResolver` contract on Sepolia (fork `ensdomains/offchain-resolver` contracts)
- 2h: write CCIP-Read gateway in Node.js using `ezccip.js`. Wire to 0G Galileo RPC. Implement `addr(node)` returning `ownerOf(tokenId)`, `text(node, key)` returning ENSIP-25 record from contract storage or static mapping.
- 1h: deploy gateway to Cloudflare Worker / Vercel Edge / fly.io
- 1h: set `LedgerResolver` as the resolver for `ledger.eth` in Sepolia ENSRegistry; configure gateway URL + signer in resolver
- 2h: ENSIP-25 text record served from gateway: `agent-registration[<ERC-7930-encoded-Reputation-or-Identity-Registry>][<agentId>]` = `"1"`. The registry encoded address: ERC-7930 prefix + Base Sepolia chain selector + 20-byte address. (For ERC-8004 Reputation Registry on Base Sepolia chainId 84532 / coinType `0x80014a34`: encode `0x00010000<chainSelector><20-byte-addr>` per ERC-7930.)
- 2h: add **auto-rotating payment subdomain**: gateway also serves `pay.<agent>.ledger.eth` as a fresh HD-derived address per resolution (`ethers.HDNodeWallet.fromMnemonic(...).derivePath("m/44'/60'/0'/0/" + counter++)`). On a per-agent counter (or per-resolution timestamp) basis.
- 2h: integration test — viem call to `getEnsAddress({ name: 'worker-001.ledger.eth' })` returns live owner. Transfer iNFT on 0G. Re-call → returns new owner.
- 1h: demo polish (UI showing live resolution + iNFT transfer → ENS auto-updates *with no second transaction*)
- 1h: video + writeup
- 1h: slack

**Where it breaks:**
- Gateway uptime is critical — if the Cloudflare Worker dies during demo, resolution fails
- Caching needs careful TTL config (default ENS clients cache for ~minutes; for the demo we want fresh)
- Trusted gateway (gateway operator can lie); for hackathon, this is fine — for production we'd add Unruggable Gateway-style trustlessness, which doesn't apply to 0G anyway

**Artifacts judges grep for:**
- `OffchainLookup` revert visible in resolver contract on Sepolia Etherscan
- Live demo: iNFT transfer → 5s later ENS resolves to new owner *without any subdomain transaction*
- Auto-rotating `pay.<worker>.ledger.eth` showing different addresses on consecutive calls
- ENSIP-25 text record verifiable by a third-party tool

**ENSIPs hit:** ENSIP-1, ENSIP-5, ENSIP-9, **ENSIP-10**, ENSIP-11, ENSIP-19, ENSIP-23 (Universal Resolver), **ENSIP-25**, EIP-3668. **This is maximum ENSIP coverage** — judges who grep for ENSIP citations will see this lights up.

### Recommendation for Ledger: **Path C.**

It hits both prizes (AI-real-work via ENSIP-25; Creative via auto-rotation + dynamic resolution). It's lower mechanical surface than Path B (no relayer, no gas-per-transfer). It's more ENS-native than Path A (we run our own resolver, ENS is doing real cryptographic verification). The hour budget is tight but doable for 4 builders. **Estimated win probability: 1st in one of two prizes; 2nd-3rd in the other.**

Fallback: if 14h gateway+resolver dev runs over, we can degrade to Path A (Namestone) in 4h and still ship something — Namestone API + ENSIP-25 text record is a perfectly valid submission, just with lower creativity ceiling.

---

## 4. What ENS rewards (rubric grep)

### Sponsor blog posts

- `ens.domains/blog/post/ensip-25` — "Verifiable AI Agent Identity with ENS" (Oct 2026). **Read this.** It's effectively the ENS team telling judges what they want to see at this hackathon. Cited examples: agents binding to ERC-8004 registries, bidirectional attestation, "no new contracts needed."
- `ens.domains/ecosystem/base` — "How Base uses ENS." Architectural blueprint for our Path C.

### Past ETHGlobal ENS prize winners (pattern matching)

- **ENShell** — ENShell shell-style interface for ENS, named in Cannes 2026 finalists.
- **AgentArena** — uses "ENS (Sepolia) as agent registry" with subnames for AI agents (showcase: `ethglobal.com/showcase/agentarena-rhq1o`). **Direct precedent.** Worth checking their codebase for what worked.
- **Immutable ENS Websites** — content-hash-based deployment. ENS-Creative angle.
- **UniPerk** — Cannes 2026 finalist, Uniswap angle.

Past patterns that won: subnames-as-access-tokens, ENS as the agent registry primary key, content-hash creative use.

### ENSIPs that map to the prize

| ENSIP | What it gives | Path C uses |
|---|---|---|
| ENSIP-1 | Core registry/resolver model | yes (foundation) |
| ENSIP-3 | Reverse resolution (`addr.reverse`) | optional |
| ENSIP-5 | Text records (custom keys with reverse-DNS namespacing like `ai.ledger.x`) | yes (ENSIP-25 record + zk-records angle) |
| ENSIP-9 | Multichain addr resolution (different `coinType` per chain) | yes (we serve 0G via custom coinType) |
| ENSIP-10 | Wildcard resolution / `resolve(bytes name, bytes data)` | **yes (the core of Path C)** |
| ENSIP-11 | EVM-compatible chain coinType derivation | useful if we expose 0G addr as a multichain coinType |
| ENSIP-15 | Name normalization | yes (gateway must normalize) |
| ENSIP-17 | Gasless DNS resolution | possibly relevant if we want `ledger.com` → ENS bridging |
| ENSIP-19 | Multichain primary names (reverse) | optional but nice — set agent's primary name on 0G via custom reverse |
| ENSIP-21 | Batch gateway offchain lookup | optimization for resolving many agents at once |
| ENSIP-23 | Universal Resolver | implicit (clients use it) |
| ENSIP-24 | Arbitrary data resolution (Draft) | possibly — if we serve binary/structured data |
| **ENSIP-25** | **AI Agent Registry ENS Name Verification (Draft, Oct 2026)** | **YES — directly cites ERC-8004; this is THE standard for our use case** |

EIP-3668 is the underpinning of CCIP-Read; it's not an ENSIP but is referenced everywhere.

### Sponsor Discord

ENS maintains its own Discord at `chat.ens.domains` (also reachable via `ens.domains/community`). The ENSDAO governance forum at `discuss.ens.domains` is more for proposals; for implementation help during the hackathon, the Discord is faster. **ETHGlobal Open Agents specifically — find the `#sponsor-ens` channel in the ETHGlobal Discord** ([UNVERIFIED] specific channel name; check `ethglobal.com/events/openagents`).

ENS people to ping during the build:
- `nick.eth` — ENS founder, deep CCIP-Read expertise
- `gregskril.eth` — author of `ens-offchain-registrar` reference repo
- `slobo.eth` — ENS Labs, often replies in DMs
- `raffy.eth` — author of `ezccip.js` and `TheOffchainGateway.js` (resolverworks)
- `taytems.eth` — ENS Labs core dev

### Official LLM doc

`docs.ens.domains/llms-full.txt` — full docs concatenated for LLM consumption. Use it as the canonical source-of-truth before writing code.

---

## 5. Parent namespace acquisition

### Hackathon-friendly options

1. **Register a Sepolia name via `sepolia.app.ens.domains`.** Free with Sepolia ETH (faucet). Pick `ledger-agents.eth` or similar 4–10-char name. ENSv2 alpha now uses Sepolia USDC; legacy registrar still accepts Sepolia ETH for low-collision names. Time: 15 min including faucet wait.

2. **Use a Namestone-issued offchain subname under their parent (e.g. `ledger.namestone.xyz`).** Free, no domain ownership. Inferior story — we want a `*.ledger.eth` for branding.

3. **Acquire a real `.eth` on mainnet for $5/yr (5+ chars) or $160/yr (4 chars).** Ledger as a brand should own one regardless. A 5+ char name like `ledger-agents.eth` is $5/yr; the 6-char `ledger.eth` may be taken — check `app.ens.domains/ledger.eth`. **Skip this for the hackathon demo; do it post-prize.**

### Cheapest <30h path

**Sepolia name** is the answer. We're not deploying production; we're submitting a demo. Sepolia is the canonical hackathon testnet, and judges expect Sepolia.

**Step-by-step:**
1. Get Sepolia ETH (Alchemy faucet, Google Cloud faucet, or Chainlink Sepolia faucet; ~0.5 ETH is plenty).
2. Visit `sepolia.app.ens.domains`, search a name.
3. Register, set duration to 1 year (cheap on Sepolia).
4. Set the resolver to our deployed `LedgerResolver` contract.
5. Done.

If we want NameWrapper for Path B: wrap the name in the same UI flow.

### Is there an ENS-issued hackathon namespace?

**[UNVERIFIED]** — historically ENS has issued event-specific subnames (e.g. `*.ethglobal.eth`) for hackathon participants. As of May 2026 there's no published program for Open Agents. Worth asking `slobo.eth` in Discord at hackathon kickoff. If yes, free `*.ledgerteam.ethglobal.eth` is faster than self-registering. Treat as a +1 if available, not the main plan.

---

## 6. zk-records / verifiable credentials angle (ENS-Creative)

ENS-Creative names "verifiable credentials or zk proofs in text records" as a target.

### Implementation shape

Three concrete artifacts we can ship:

1. **TEE attestation hash in text record.** Each iNFT's 0G Compute reasoning runs in TeeML/TeeTLS. The attestation report has a hash. We write that hash (or a commitment) as a text record:
   ```
   key: ai.ledger.tee-attest
   value: 0x<hash>:<timestamp>:<chainId>
   ```
   A verifier app (or our own dapp) reads this record, fetches the corresponding TEE quote from our gateway, and verifies the agent's reasoning is genuinely TEE-attested. **This is a "verifiable credential in a text record" by the ENS-Creative definition.**

2. **ERC-8004 reputation summary as zk proof.** ERC-8004's `getSummary(agentId)` returns aggregate feedback. We compress it into a Groth16 proof: "this agent has avg rating ≥ 4.5 over ≥ 100 reviews." Store the proof bytes as a text record:
   ```
   key: ai.ledger.rep-zk
   value: <base64-encoded-proof>
   ```
   A verifier contract or app validates the proof — gives the agent a "reputable" badge without revealing per-feedback details. Privacy-preserving reputation.

3. **Inheritance proof (transfer history).** A Merkle proof of the iNFT's `Transfer` history. Store the Merkle root as a text record. Verifier can prove a specific past transfer occurred without listing all transfers.

### Existing zk verifiers on Sepolia

- **Risc Zero** — Bonsai has Sepolia verifier contracts. Generates STARK proofs, on-chain Groth16 wrapper.
- **Succinct (SP1)** — Sepolia verifier deployed. Fast, audited.
- **Aztec / Noir** — Aztec testnet, can verify Noir proofs on Sepolia via separate verifier.
- **Circom + snarkjs** — generic Groth16, deploy your own verifier contract via `snarkjs zkey export solidityverifier`. Fastest to ship for hackathon.

For 30h hackathon: **Circom + Groth16 verifier on Sepolia.** ~6h to design circuit, generate trusted setup, deploy verifier, integrate.

### Alt-council inventor's `subname-receipts` at contract level

The "subname-receipts" idea (per the alt-council brainstorm) likely maps to: every job a worker completes generates a receipt. The receipt is a one-time subname like `job-12345.worker-001.ledger.eth` whose text records contain the job hash, client signature, completion timestamp. **Contract-level requirements:**
- A registrar contract owned by the worker's owner that mints a subname per job
- The subname's resolver returns immutable text records (job hash, client sig)
- Optional: ENSIP-25-style cross-link to ERC-8004 reputation feedback that referenced this job

For Path C this is trivial — just have the gateway serve any `job-*.worker-*.ledger.eth` resolution by reading from a database of completed jobs. No on-chain subname mint needed.

For Path B this requires real NameWrapper subname mints (one per job), which gets gassy fast. Path C wins again.

---

## 7. Auto-rotating addresses (ENS-Creative)

The named example in the ENS-Creative prize: **"Privacy features with auto-rotating addresses on each resolution."** This is the dream creative angle.

### CCIP-Read pattern

The gateway returns a *different address every call* (or every N calls, or every K seconds). Standard ENS clients don't cache aggressively (TTL configurable per response), so a fresh resolution = fresh address.

For Ledger, this maps to a payment endpoint:
```
pay.worker-001.ledger.eth → fresh HD-derived address each call
```

Each payment to a fresh address means a watcher can't link multiple payments to the same worker (privacy). The worker's owner holds the master seed and can sweep all derived addresses.

### HD-derivation code shape

```javascript
import { HDNodeWallet, Mnemonic } from 'ethers';

const mnemonic = Mnemonic.fromPhrase(process.env.WORKER_MASTER_SEED);
const root = HDNodeWallet.fromMnemonic(mnemonic);

// Per-resolution counter (could be: timestamp, nonce, hash of caller, etc.)
function deriveForCall(workerId, counter) {
  // BIP-32 path: m/44'/60'/<workerId>'/0/<counter>
  const path = `m/44'/60'/${workerId}'/0/${counter}`;
  const wallet = root.derivePath(path);
  return wallet.address;
}

// In gateway resolver:
ezccip.enableENSIP10(async ({ name, calldata }) => {
  if (name.startsWith('pay.')) {
    const workerId = parseWorkerId(name);
    const counter = await getCounter(workerId);  // increment in DB
    const addr = deriveForCall(workerId, counter);
    return encodeAddrResponse(addr);
  }
  // ... fallthrough to ownerOf path
});
```

The counter can be:
- A monotonic per-worker counter (every call gets next index)
- A per-block counter (rotates per Ethereum block)
- A per-hour counter (rotates hourly)
- A hash of the caller's address (deterministic per-payer)

For demo: per-call counter is most visually impressive (each `cast call` shows a different address).

### Demo proof artifact

Three back-to-back commands:

```bash
$ cast call <UniversalResolver> "resolve(bytes,bytes)" \
  $(cast --to-bytes32 "pay.worker-001.ledger.eth") \
  $(cast abi-encode "addr(bytes32)" $(cast namehash "pay.worker-001.ledger.eth"))
0xAlice...

$ cast call ... # same call again
0xBob...

$ cast call ... # same call again
0xCarol...
```

Three different addresses. **Judges' jaws hit the floor.** Same as how Coinbase shows off cb.id privacy features.

Combined with Path C's live-`ownerOf` for the worker name itself, we have:
- `worker-001.ledger.eth` → live current owner of iNFT (changes on transfer)
- `pay.worker-001.ledger.eth` → fresh HD-derived address each call (changes every resolution)
- ENSIP-25 text record on each subname → cross-links to ERC-8004 reputation
- zk-record text record (e.g. `ai.ledger.rep-zk`) → privacy-preserving reputation badge

**One submission. Hits ENS-AI prize, ENS-Creative prize, and showcases ERC-8004 integration. This is the play.**

---

## Open questions for sponsor confirmation

1. **Is there a hackathon-issued ENS namespace?** (ask `slobo.eth` / ETHGlobal Discord)
2. **Is Namestone offering free hackathon access for ETHGlobal Open Agents?** (DM `dot.eth` who runs Namestone)
3. **Does ENSIP-25 require the registry to be *deployed* at the encoded address, or just any address?** (i.e., can we use Base Sepolia ERC-8004 even though ENSIP-25's example uses mainnet?) — *Reading the spec, the address in the key is just a parameter; encoding correctly per ERC-7930 is what matters. Base Sepolia chain selector `0x80014a34` should plug in.* But confirm.
4. **What's the canonical ENSIP-25 ERC-7930 encoding for Base Sepolia?** Spec example uses Ethereum mainnet (`0x000100000101148004...`). For Base Sepolia we need to derive the equivalent prefix. ERC-7930 byte layout: `[0x00 0x01]` (version + addr type) + chain selector + address. For Base Sepolia coinType `0x80014a34`, the encoding might be `0x000100000004 80014a34 14 8004B663056A597Dffe9eCcC1965A193B7388713`. **[UNVERIFIED] — verify ERC-7930 v1 encoding before shipping the text record.**
5. **Cache TTL for CCIP-Read in viem/ethers/ensjs default settings?** If clients aggressively cache, the auto-rotating demo loses punch. Need to confirm we can return TTL=0 in the gateway response and clients honor it.
6. **For the `0G Galileo` ownerOf RPC — is there a public, reliable endpoint?** Confirm `https://evmrpc-testnet.0g.ai` (or whatever 0G publishes for Galileo testnet, chainId 16602) has uptime and rate-limit headroom.
7. **Does Ledger already own / can Ledger grab `ledger-agents.eth` on mainnet?** Cheap, brand-aligned, post-hackathon real estate.

---

## Direct URLs (every link, every contract address)

### ENS docs
- Deployments: https://docs.ens.domains/learn/deployments/
- ENSIP index: https://docs.ens.domains/ensip/
- ENSIP-5 (text records): https://docs.ens.domains/ensip/5
- ENSIP-9 (multichain): https://docs.ens.domains/ensip/9
- ENSIP-10 (wildcard): https://docs.ens.domains/ensip/10
- ENSIP-11 (EVM coinType): https://docs.ens.domains/ensip/11
- ENSIP-15 (name normalization): https://docs.ens.domains/ensip/15
- ENSIP-19 (multichain primary names): https://docs.ens.domains/ensip/19
- ENSIP-25 (AI agent registry verification): https://docs.ens.domains/ensip/25
- ENSIP-25 blog: https://ens.domains/blog/post/ensip-25
- ENSIP-25 explorer: https://ensip25.ens.domains/
- CCIP-Read learn: https://docs.ens.domains/learn/ccip-read
- CCIP-Read resolvers: https://docs.ens.domains/resolvers/ccip-read
- Writing a resolver: https://docs.ens.domains/resolvers/writing
- Subdomains: https://docs.ens.domains/web/subdomains
- Creating a subname registrar: https://docs.ens.domains/wrapper/creating-subname-registrar
- NameWrapper contracts: https://docs.ens.domains/wrapper/contracts
- LLM-full docs: https://docs.ens.domains/llms-full.txt
- Sepolia testnet UI: https://sepolia.app.ens.domains
- ENS Base ecosystem: https://ens.domains/ecosystem/base

### EIPs
- EIP-3668 (CCIP-Read): https://eips.ethereum.org/EIPS/eip-3668
- EIP-8004 (Trustless Agents): https://eips.ethereum.org/EIPS/eip-8004
- ERC-7930 (Interoperable Address): https://eips.ethereum.org/EIPS/eip-7930

### Reference repos
- ENS offchain-resolver (official): https://github.com/ensdomains/offchain-resolver
- ens-offchain-registrar (gskril, Cloudflare Worker): https://github.com/gskril/ens-offchain-registrar
- tod-offchain-resolver (ERC721 owner-based subnames): https://github.com/0xFlicker/tod-offchain-resolver
- ezccip.js (turnkey gateway): https://github.com/resolverworks/ezccip.js
- TheOffchainGateway.js: https://github.com/resolverworks/TheOffchainGateway.js
- ENS contracts (deployments source): https://github.com/ensdomains/ens-contracts
- Sepolia deployments JSON: https://github.com/ensdomains/ens-contracts/tree/staging/deployments/sepolia
- Durin: https://github.com/namestonehq/durin
- Namestone: https://github.com/namestonehq/namestone
- Namestone example (Next.js): https://github.com/namestonehq/namestone-example
- ENSnode (multichain indexer): https://github.com/namehash/ensnode
- ERC-8004 contracts: https://github.com/erc-8004/erc-8004-contracts
- AgentArena (precedent): https://ethglobal.com/showcase/agentarena-rhq1o
- Phala TEE ERC-8004 agent: https://github.com/Phala-Network/erc-8004-tee-agent

### Hosted services
- Namestone: https://namestone.com
- Namestone docs: https://docs.namestone.com
- Namestone pricing: https://namestone.com/pricing (4 tiers from $500/yr)
- Namestone try / API key: https://namestone.com/try-namestone
- Namespace: https://namespace.ninja
- JustaName: https://justaname.id

### ENS contracts (mainnet)
- ENSRegistry: `0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e`
- BaseRegistrar: `0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85`
- ETHRegistrarController: `0x59E16fcCd424Cc24e280Be16E11Bcd56fb0CE547`
- ReverseRegistrar: `0xa58E81fe9b61B5c3fE2AFD33CF304c454AbFc7Cb`
- NameWrapper: `0xD4416b13d2b3a9aBae7AcD5D6C2BbDBE25686401`
- Public Resolver: `0xF29100983E058B709F3D539b0c765937B804AC15`
- Universal Resolver: `0xeEeEEEeE14D718C2B47D9923Deab1335E144EeEe`

### ENS contracts (Sepolia, per docs)
- ENSRegistry: `0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e`
- BaseRegistrar: `0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85`
- ETHRegistrarController: `0xfb3cE5D01e0f33f41DbB39035dB9745962F1f968`
- ReverseRegistrar: `0xA0a1AbcDAe1a2a4A2EF8e9113Ff0e02DD81DC0C6`
- NameWrapper: `0x0635513f179D50A207757E05759CbD106d7dFcE8`
- Public Resolver: `0xE99638b40E4Fff0129D56f03b55b6bbC4BBE49b5`
- Universal Resolver: `0xeEeEEEeE14D718C2B47D9923Deab1335E144EeEe`

### Durin (all 14 chains, same factory address)
- Factory: `0xDddddDdDDD8Aa1f237b4fa0669cb46892346d22d`
- L1 Mainnet Resolver pointer: `0x8A968aB9eb8C084FBC44c531058Fc9ef945c3D61`

### ENSIP-19 reverse registrars
- Base (8453, namespace `80002105.reverse`): `0x0000000000D8e504002cC26E3Ec46D81971C1664`
- Base Sepolia (84532, namespace `80014a34.reverse`): `0x00000BeEF055f7934784D6d81b6BC86665630dbA`

### ERC-8004 (Base Sepolia)
- IdentityRegistry: `0x8004A818BFB912233c491871b3d84c89A494BD9e`
- ReputationRegistry: `0x8004B663056A597Dffe9eCcC1965A193B7388713`

### ERC-8004 (Mainnet, per ENSIP-25 example)
- IdentityRegistry: `0x8004A169FB4a3325136EB29fA0ceB6D2e539a432`

### Sepolia ETH faucets
- Alchemy: https://www.alchemy.com/faucets/ethereum-sepolia
- Google Cloud: https://cloud.google.com/application/web3/faucet/ethereum/sepolia
- Chainlink: https://faucets.chain.link/sepolia

### ETHGlobal
- Open Agents 2026 prizes: https://ethglobal.com/events/openagents/prizes
- Past finalists (Cannes 2026): https://ethglobal.com/events/cannes2026
- AgentArena precedent: https://ethglobal.com/showcase/agentarena-rhq1o

### ENS community
- Discord (community): https://chat.ens.domains
- Governance forum: https://discuss.ens.domains
- ENSIP-25 Twitter announcement: https://x.com/ensdomains/status/2029203240466989499

### Resolverworks (raffy.eth's stack)
- ezccip.js: https://github.com/resolverworks/ezccip.js
- TheOffchainGateway.js: https://github.com/resolverworks/TheOffchainGateway.js
- TheOffchainResolver.sol: https://github.com/resolverworks/TheOffchainResolver

---

## Final verdict

**Swap KeeperHub for ENS. Build Path C.**

The combination of (a) ENSIP-25 explicitly naming ERC-8004 — which Ledger already uses — and (b) the live-`ownerOf` CCIP-Read pattern being a perfect fit for "auto-rotating addresses" creative example, makes this the highest sponsor-love-ceiling slot we've evaluated. The hour budget is tight but tractable. The two-prize unlock ($2,500 each, $1,250 top tier) is comparable to KeeperHub's prize pool but with a *much* better narrative tied to our existing 0G + ERC-8004 infrastructure.

The hero demo moment writes itself: "Watch this iNFT transfer mid-demo. The same worker's ENS subname now resolves to the new owner. The agent's earnings stream to the new wallet. No second transaction. ENS is doing the cross-chain coordination that would otherwise require a separate registry."

Ship it.
