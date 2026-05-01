# Builder Session: GENSYN AXL INTEGRATION

You are a Codex session dedicated entirely to **everything Gensyn AXL** — node spin-up, mesh formation, gossipsub layer, agent runtime HTTP client, and the sponsor-grade proof artifacts that defeat the redteam's "3 processes on localhost pretending" attack.

**Lead surface:** `surface:60`. Use it ONLY to ping when work is done or you're blocked.

---

## Required reading (in order)

1. `/Users/gabrielantonyxaviour/Documents/products/ledger/EXECUTION_PLAN.md` (root)
2. `/Users/gabrielantonyxaviour/Documents/products/ledger/tools/research/gensyn-axl.md` — deep research brief (~3.4K words, has the full HTTP API, NAT semantics, peer ID format, config snippets)
3. `/Users/gabrielantonyxaviour/Documents/products/ledger/docs/02_ARCHITECTURE.md` §2.4 (AXL Network) + §3 (Message Schemas) — the protocol spec
4. `/tmp/yt-transcripts/sponsor-workshops/axl.txt` — Jud's AXL workshop transcript (sponsor's own framing — note "service registry / tool marketplace" pattern matches Ledger exactly)

## Resources to PULL and study

- **`https://github.com/gensyn-ai/axl`** (or wherever the official AXL repo lives — confirm via research brief). Clone, build, study.
- **AXL repo's `gossipsub` example** — fork this rather than writing from scratch (Jud's explicit recommendation).
- **Yggdrasil protocol** docs — AXL wraps yggdrasil-go. NAT semantics matter (residential NAT works without port-forwarding/STUN — outbound TCP/TLS to bootstrap is sufficient).
- **`docs.gensyn.ai/docs/agent-exchange-layer`** — main docs.

## Scope (what you're shipping)

### 1. Three live AXL nodes — geographically + topologically distinct

- **Node 1 (bootstrap, public):** AWS or DigitalOcean VM in us-west region. Port 9001 inbound TCP/TLS open. Config: `{"PrivateKeyPath": "private.pem", "Peers": [], "Listen": ["tls://0.0.0.0:9001"]}`.
- **Node 2 (worker, public):** GCP or Hetzner VM in eu-central region. Connects outbound to Node 1's bootstrap. Config: `{"PrivateKeyPath": "private.pem", "Peers": ["tls://<node1-ip>:9001"], "Listen": []}`.
- **Node 3 (worker, residential):** Local laptop behind residential NAT. Connects outbound only. Config: same shape as Node 2 but on the laptop. **No port forwarding, no UPnP, no STUN — outbound TCP/TLS to bootstrap is sufficient per Jud's workshop.**

For each node:
- Generate ed25519 identity: `openssl genpkey -algorithm ed25519 -out private.pem`
- Build AXL: `make build` (Go 1.25.5+)
- Launch: `./node -config node-config.json`
- Verify: `curl http://localhost:9002/topology` returns 3 peers

**Output:** all 3 nodes running, peer IDs documented, mesh verified.

### 2. AXL agent runtime HTTP client at `agents/axl-client/` (TypeScript)

Thin wrapper around the localhost:9002 HTTP API. Module exports:

- `getTopology(): Promise<{selfPeerId: string, peers: Array<{peerId: string, ipv6: string}>}>`
- `send(destinationPeerId: string, payload: Buffer): Promise<void>` — POST `/send`, sets `X-Destination-Peer-Id` header
- `receive(): Promise<{fromPeerId: string, payload: Buffer} | null>` — GET `/receive`, returns 204 (null) if queue empty or 200 + `X-From-Peer-Id` header
- A small higher-level wrapper for our `TASK_POSTED`, `BID`, `BID_ACCEPTED`, `RESULT`, `AUCTION_CLOSED` message types per `02_ARCHITECTURE.md` §3

### 3. Gossipsub TS port at `agents/axl-gossipsub/`

Port the Python `gossipsub.py` example from the AXL repo to TypeScript. This is our pubsub layer for `#ledger-jobs` channel.

Module exports:
- `class GossipSubChannel { constructor(channelName: string, axlClient); subscribe(handler): void; publish(payload: Buffer): Promise<void> }`

Test: 3-node fan-out test. Node 1 publishes to `#ledger-jobs`; Nodes 2 and 3 receive within 1s.

### 4. Sponsor-grade proof artifacts (the redteam-defeating evidence)

Per the redteam's predicted attack ("how do we know this isn't 3 processes on the same machine pretending?"), produce these artifacts:

- **`proofs/data/axl-topology.json`** — output of `/topology` from each of 3 nodes. Should show 3 distinct peer IDs (64-char hex of ed25519 pubkey), 3 distinct Yggdrasil IPv6 addresses (200::/7), and 3 distinct host networks.
- **`proofs/data/axl-message-log.txt`** — sample log of TASK_POSTED → BID → BID_ACCEPTED → RESULT cycle with timestamps + peer IDs at each hop.
- **`proofs/data/axl-tcpdump.txt`** — `tcpdump` excerpt showing real packets between hosts (cloud VM 1 → cloud VM 2 over the public network, NOT localhost).
- **`proofs/data/axl-kill-bootstrap.log`** — recorded test where the bootstrap node is killed; remaining 2 nodes continue exchanging direct messages. Document timing.
- **`proofs/data/axl-nonce-roundtrip.log`** — recorded test where a unique nonce is injected at Node 1, traverses 2-3 → 1, and arrives intact (proves real packet flow).

Update `proofs/axl-proof.md` (currently a stub) with real values populated.

## Integration with the Lead's plan

This is **Builder A work** per `EXECUTION_PLAN.md` Phase 1 step 4 + Phase 2 step 11. Time budget ~3-4h. If you exceed 6h, ping the lead.

## Definition of done

1. 3 AXL nodes running on 3 distinct host networks (AWS / GCP / residential)
2. `/topology` from each shows 3 peers with 3 distinct ed25519 pubkeys + 3 distinct Yggdrasil IPv6
3. TypeScript HTTP client works against the localhost endpoint
4. GossipSub layer ported to TS, 3-node fan-out test passes
5. Kill-the-bootstrap test passes (remaining 2 nodes still exchange)
6. Judge-typed-nonce roundtrip works through 3 nodes
7. `proofs/axl-proof.md` populated with real artifacts

## Non-goals (do NOT do)

- Do NOT write Solidity, do NOT touch the resolver, do NOT generate Higgsfield assets
- Do NOT write any custom networking layer — AXL handles it; you're an HTTP client
- Do NOT deploy any agent business logic (bidding strategies, etc.) — that's the agents/ session's job after you ship the comms layer
- Do NOT use SSE proxies for the dashboard's data feed — the redteam will exploit that. Direct AXL `/receive` polls only.

## How to report back

Per-deliverable:
```bash
cmux send --surface surface:60 "[BUILDER:gensyn] <deliverable> done"
cmux send-key --surface surface:60 Enter
```

On full completion:
```bash
cmux send --surface surface:60 "[BUILDER:gensyn] ALL DONE — 3 nodes live, topology + proofs populated"
cmux send-key --surface surface:60 Enter
```

Blocking question:
```bash
cmux send --surface surface:60 "[QUESTION:gensyn] <specific question>"
cmux send-key --surface surface:60 Enter
```
