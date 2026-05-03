# Gensyn AXL — Research Brief

Research date: 2026-05-02. Sources: `docs.gensyn.ai`, `github.com/gensyn-ai/axl` (main branch), `blog.gensyn.ai`, `ethglobal.com/events/openagents`, `yggdrasil-network.github.io`.

## TL;DR

- **AXL = thin Go binary that wraps `yggdrasil-go` + a userspace TCP stack (gVisor) + a localhost HTTP bridge on `127.0.0.1:9002`.** It is a **fork-flavored integration**, not a from-scratch protocol — Yggdrasil does the routing and crypto, AXL adds the HTTP API, MCP/A2A multiplexing, and a Python client.
- **Residential NAT works out of the box.** A node with `Listen: []` (no listener) makes an outbound TLS dial to a public peer's `tls://host:port`, and is then **fully addressable** on the Yggdrasil overlay via its IPv6 address — confirmed by the Yggdrasil FAQ: *"Regardless of whether your peering connections are inbound or outbound, you will be able to accept incoming connections on your Yggdrasil IPv6 addresses."* No UDP hole-punching, no STUN, no relay heuristics — just outbound TCP + a long-lived peering.
- **You need at least one publicly-reachable bootstrap peer** to seed your topology. For Ledger that means one of the cloud VMs runs with `Listen: ["tls://0.0.0.0:9001"]`; the other VM and the laptop run with `Peers: ["tls://<bootstrap-ip>:9001"]`.
- **Identity is a 32-byte ed25519 keypair persisted to a PEM file (`PrivateKeyPath`).** Peer ID surfaced by the API is the **64-character hex** of the public key (used in the `X-Destination-Peer-Id` header). It is **stable across restarts** as long as you keep the PEM. There's also a derived IPv6 address (Yggdrasil's `200::/7` range) — judge-readable and mappable to a node label in the dashboard.
- **The API is HTTP, language-agnostic.** Four core endpoints: `GET /topology`, `POST /send`, `GET /recv`, `POST /mcp/{peer_id}/{service}`, `POST /a2a/{peer_id}`. There is no native Node SDK; there is a reference Python client in `examples/python-client/`. We will write a thin TS HTTP wrapper for the Ledger frontend — trivial.
- **Wire format is whatever bytes you put in the body.** AXL itself does not impose serialization; the published examples use `msgpack` for structured payloads and raw `torch.save` for tensors. Max message size defaults to **16 MiB** (`max_message_size: 16777216`).
- **No native pubsub.** GossipSub is implemented **on top of `/send` + `/recv`** in the Python example (`examples/python-client/gossipsub/gossipsub.py`). For Ledger's job announcements we will mirror that pattern: a thin pubsub-over-direct-send layer keyed on a topic string.
- **Bounty pool: $5,000 total — 1st $2,500 / 2nd $1,500 / 3rd $1,000.** Two suggested tracks (Agent Town, Decentralised Agent Messaging); custom proposals welcome. **Hard qualifying line:** *"Must demonstrate communication across separate AXL nodes, not just in-process."* This is exactly what we're building.
- **Judge-readable proof of P2P realness exists, easily.** `GET /topology` on each of our 3 nodes returns `our_public_key`, `our_ipv6`, `peers[]`, and `tree[]` — three different public keys, three different IPv6 addresses, all referencing each other in their peer/tree lists. Plus `traceroute` over the Yggdrasil IPv6 to confirm cross-machine hops. This kills the "3 processes pretending" critique in one screenshot.
- **No Gensyn-published HTTP-on-top-of-AXL wrapper exists** beyond the `/send` `/recv` `/topology` endpoints already provided by the node binary. The node IS the HTTP wrapper — we don't need to write one. We just need a TS client that calls those endpoints.

---

## Networking primitive

### What AXL actually is (Yggdrasil? Fork? Custom?)

AXL is a Go binary at `github.com/gensyn-ai/axl` (~72% Go, ~27% Python). Architecture per `docs/architecture.md` — four layers in one process:

1. **Yggdrasil Core** — the official `yggdrasil-go`. Manages the ed25519 keypair, derives IPv6, runs spanning-tree routing.
2. **gVisor TCP** — userspace TCP/IP stack. *"No TUN device or root privileges needed."* Gensyn's main value-add over vanilla Yggdrasil.
3. **Multiplexer** — inspects every inbound TCP envelope, routes to MCP Router / A2A Server / `/recv` queue.
4. **HTTP API** — `127.0.0.1:9002` bridge for application code.

Two **optional Python sidecars** handle MCP (`mcp_routing/` port 9003) and A2A (`a2a_serving/` port 9004) — *not* required for raw `/send` `/recv`.

**Verdict:** AXL is a Yggdrasil-based composition, not a fork. Yggdrasil semantics (peer keys, IPv6, spanning tree, e2e encryption) are intact. Gensyn's value-add is operational ergonomics (no TUN, no root, single binary, HTTP API).

### NAT traversal behavior (residential NAT specifically)

**Answer: Yes, residential NAT works without port forwarding, UDP hole-punching, or STUN.** Mechanism:

- Yggdrasil peers over **TCP/TLS** (outbound dial `tls://host:port`).
- Once the TCP socket is up, the node joins the spanning tree. Inbound packets to its IPv6 address route back over the same long-lived socket.
- Yggdrasil FAQ: *"Regardless of whether your peering connections are inbound or outbound, you will be able to accept incoming connections on your Yggdrasil IPv6 addresses."*
- AXL docs: *"Connects outbound to peers and receives data over the same encrypted tunnel, so standard nodes work behind NATs and firewalls without any extra configuration."*

**For Ledger's laptop:** `Listen: []`, `Peers: ["tls://<bootstrap-ip>:9001"]`. Home router needs only outbound TCP — every consumer ISP permits this.

**Bootstrap time from cold** is not documented. Yggdrasil community reports <5s on LAN, 10–30s over WAN. **`[UNVERIFIED]`** for AXL — measure on day 1.

**Caveat:** *"If you're bootstrapping a new network from scratch, at least one node needs to be publicly reachable with an exposed port."* Cloud VM **must** have 9001 open inbound.

### Bootstrap peers

AXL's `node-config.json` has a `Peers` array of TLS URIs. There is **no built-in public bootstrap list** in the AXL repo — Gensyn presumably runs their own public peers but the addresses aren't pinned in the config. For Ledger we provide our own bootstrap (the cloud VM with the listener), which is the cleanest demo anyway: a closed 3-node mesh that we control, with proof of cross-machine packets.

If we wanted to join the broader Yggdrasil overlay, we could add public peers from `github.com/yggdrasil-network/public-peers`. **For the bounty submission, a self-hosted bootstrap is preferable** — eliminates external dependencies during judging.

### Ports / firewall requirements

| Port  | Direction | Used by | Required on |
|-------|-----------|---------|-------------|
| 9001  | inbound TCP/TLS | Yggdrasil peer listener (`Listen: ["tls://0.0.0.0:9001"]`) | Public bootstrap node only |
| 9001  | outbound TCP/TLS | Yggdrasil peer dialer | All nodes that have `Peers: [...]` |
| 9002  | localhost | HTTP API bridge (`api_port`, `bridge_addr: 127.0.0.1`) | All nodes (local only) |
| 7000  | internal | gVisor TCP listener (`tcp_port`) | All nodes (loopback) |
| 9003  | localhost | MCP Router (Python sidecar, optional) | Nodes wanting MCP |
| 9004  | localhost | A2A Server (Python sidecar, optional) | Nodes wanting A2A |

For Ledger: cloud-VM bootstrap opens 9001 inbound; everyone else only needs outbound 9001 to that VM. The dashboard talks to its local 9002.

---

## Messaging API

### Pubsub channels

**There is no native pubsub primitive in AXL.** The `examples/python-client/gossipsub/gossipsub.py` file implements a full GossipSub-over-`/send`-and-`/recv` library, with topic subscribe/publish/forward, IHAVE/IWANT control messages, MESSAGE/GRAFT/PRUNE — JSON-encoded on the wire. Function shape:

```python
def subscribe(self, topic: str) -> None
def publish(self, topic: str, data: bytes) -> str
def add_peer(self, peer_id: str) -> None
def tick(self) -> None
def get_stats(self) -> dict
```

**For Ledger:** we'll write the equivalent TS layer for our 3-node mesh. Job announcements broadcast on a `ledger.jobs.announce` topic, bid messages on `ledger.jobs.<id>.bids`. Same pattern: each topic message is a wrapped envelope `{topic, msg_id, sender_pubkey, payload}` sent to every known peer's `/send`.

### Direct messages

`POST /send` to `127.0.0.1:9002` with:
- Header `X-Destination-Peer-Id: <64-hex-pubkey>`
- Header `Content-Type: application/octet-stream`
- Body: raw bytes (any payload).

Response: `200 OK` with header `X-Sent-Bytes: <n>`. **Fire-and-forget — no delivery confirmation from the destination, only confirmation that the local node accepted the bytes.**

`GET /recv` polls the inbound queue:
- `204 No Content` if empty.
- `200 OK` with binary body and `X-From-Peer-Id` header otherwise.

This is HTTP long-poll territory — for an event-driven UI we'll wrap it in a 1s polling loop or upgrade to websockets at the wrapper layer (which we control, since the wrapper is ours).

### Wire format + size limits

- **Wire format:** unconstrained at the AXL layer. Examples use `msgpack` (Python `msgpack` library, `use_bin_type=True`) for structured records, raw bytes for tensors.
- **For Ledger** we'll use `msgpack` for inter-agent messages (compact, well-supported in Node and Python), with a top-level envelope `{type, sender_id, ts, payload}`.
- **TCP framing**: 4-byte big-endian length prefix + payload (this is internal to the node, you don't see it from HTTP).
- **Max message size: 16 MiB default**, configurable via `max_message_size`. Plenty for our use case (job specs are KB, not MB).
- `max_concurrent_conns: 128`, `conn_read_timeout_secs: 60`, `conn_idle_timeout_secs: 300` — all defaults are fine for 3 nodes.

### Ordering / delivery guarantees

**`[UNVERIFIED]` — not explicitly documented.** Inferring from architecture:

- Within a single TCP peering, ordering is preserved (it's TCP).
- Across the mesh, Yggdrasil routes over the spanning tree — packets between two peers traverse a deterministic path while the tree is stable, so ordering should hold. If the tree reshuffles (peer drops), there's no guarantee.
- `/send` is fire-and-forget. **No automatic retry, no acks at the AXL layer.** If the destination is offline or the path drops mid-flight, the bytes are lost.
- For Ledger's bidding flow this means: at-most-once delivery; we should add app-level dedupe keys and request-ack pairs on critical messages. Cheap to implement.

---

## Identity + peer model

### How peer IDs work

- Each node holds an **ed25519 keypair** in a PEM file at `PrivateKeyPath` (default `private.pem`).
- Generated with `openssl genpkey -algorithm ed25519 -out private.pem`. Or auto-generated in-memory if you skip the field (lost on restart — don't do this for a demo).
- The **peer ID surfaced in the HTTP API is the 64-character hex of the public key.** Used as the destination address in `X-Destination-Peer-Id` and as the sender in `X-From-Peer-Id`.
- The Yggdrasil layer also derives a **deterministic IPv6 address in the `200::/7` block** from the public key — visible as `our_ipv6` in `/topology`. Two equally valid identifiers; the IPv6 is the routing primitive, the hex pubkey is the API primitive.

### Persistence across restarts

**Stable iff you keep the PEM.** Same PEM → same pubkey → same peer ID → same IPv6 → same routing identity. Standard ed25519. We commit `private.pem` files **outside** the repo (or use one-shot deploy steps) and bake them into each node's working directory.

### What's surfaceable in a UI for P2P proof

The `GET /topology` response is gold for the dashboard. Per `docs/api.md` it returns:

```json
{
  "our_ipv6": "200:abcd:...",
  "our_public_key": "<64-hex>",
  "peers": [ { "key": "<peer-pubkey>", "uri": "tls://1.2.3.4:9001", ... } ],
  "tree": [ { "public_key": "<key>", "parent": "<parent-key>" }, ... ]
}
```

For Ledger's "is this real P2P?" panel we render, per node:
- The 64-hex public key (truncated `e3a4...c91f`, full on hover/click).
- The Yggdrasil IPv6 (`200:abcd:...`).
- The host IPv4/hostname (we self-report this from a sidecar field — it's not in `/topology`, but our wrapper attaches it).
- The peer list with link arrows to the other 2 nodes.
- The spanning tree visualized as a graph — three different parent/child relationships.
- Live `/send` packets animating along the edges with `X-Sent-Bytes` and `X-From-Peer-Id` shown.

A judge sees three distinct public keys, three distinct IPv6 addresses, three distinct host IPs (one of which is residential — a 192.168.x or a CGNAT 100.64.x will be obvious), and live cross-machine packets. That's irrefutable.

---

## SDK / wrapper

### Languages supported

- **Go**: the `node` binary itself. No published Go client for the HTTP API — you'd just `net/http`.
- **Python**: reference client at `examples/python-client/client.py` with `get_topology()`, `send_msg_via_bridge(dest_key, data)`, `recv_msg_via_bridge()` plus `serialize_tensor` / `deserialize_tensor` helpers. Used by `convergecast.py` (tree aggregation example) and `gossipsub.py`.
- **Node/TypeScript**: **none published**. We'll write our own — it's literally three `fetch` calls.
- **Anything else**: any HTTP-capable language works.

### Code samples

The Python `convergecast.py` demonstrates the core pattern:

```python
topo = get_topology()
parent = topo["tree"][...]["parent"]
msg = msgpack.packb({"type": "convergecast_data", "from": our_key, "data": aggregated})
send_msg_via_bridge(parent, msg)

while time.time() < deadline:
    msg = recv_msg_via_bridge()  # returns {'from_peer_id': str, 'data': bytes} or None
    if msg is None:
        time.sleep(0.01); continue
    data = msgpack.unpackb(msg['data'], raw=False)
    ...
```

The whole multi-node hello-world is ~30 lines.

### HTTP wrapper availability

**The AXL node IS the HTTP wrapper.** There is no separate HTTP-over-AXL service — `localhost:9002` is the official, documented surface. We don't need to write or run an additional wrapper.

For Ledger we will write `tools/axl-client.ts` (and mirror to `axl_client.py` if needed) — a 50-line module exposing:

```ts
class AxlClient {
  constructor(baseUrl = "http://127.0.0.1:9002") {}
  async topology(): Promise<Topology>
  async send(peerId: string, body: Uint8Array): Promise<{ sentBytes: number }>
  async recv(): Promise<{ fromPeerId: string; body: Uint8Array } | null>
  // pubsub layer on top:
  publish(topic: string, payload: any): Promise<void>
  subscribe(topic: string, cb: (msg) => void): void
}
```

### What we'd have to build vs reuse

| Component | Reuse | Build |
|---|---|---|
| Yggdrasil networking | ✅ AXL binary | — |
| HTTP API | ✅ `127.0.0.1:9002` | — |
| Python client (if we use Python anywhere) | ✅ `examples/python-client/client.py` | — |
| TS client | — | ~50 LOC wrapper |
| Pubsub topics | partial — copy `gossipsub.py` patterns | TS port: ~150 LOC |
| Job announcement schema | — | App-level msgpack envelopes |
| Dashboard topology viz | — | React + the `/topology` polling loop |

---

## Node setup (concrete)

### Install

Per AXL README:

```bash
git clone https://github.com/gensyn-ai/axl
cd axl
make build                                              # produces ./node
openssl genpkey -algorithm ed25519 -out private.pem     # one per node
./node -config node-config.json
```

Requires **Go 1.25.5+**. No Docker image is published in the repo at time of research — we'll likely write our own Dockerfile for the cloud VMs (5-line wrapper around the Go build).

### Config

**Bootstrap (cloud VM 1):** `node-config.json`
```json
{
  "PrivateKeyPath": "private.pem",
  "Peers": [],
  "Listen": ["tls://0.0.0.0:9001"]
}
```

**Cloud VM 2 (peer to bootstrap):**
```json
{
  "PrivateKeyPath": "private.pem",
  "Peers": ["tls://<bootstrap-public-ip>:9001"],
  "Listen": []
}
```

**Laptop (residential NAT, peer to bootstrap):**
```json
{
  "PrivateKeyPath": "private.pem",
  "Peers": ["tls://<bootstrap-public-ip>:9001"],
  "Listen": []
}
```

All three additionally accept the operational fields (`api_port: 9002`, `bridge_addr: 127.0.0.1`, `max_message_size`, etc.) — defaults are fine.

### Verifying mesh formation

1. **`curl http://127.0.0.1:9002/topology`** on each node. Confirm:
   - Each `our_public_key` is unique.
   - Each `peers[]` lists the other nodes' keys.
   - The `tree[]` entries have parent/child relationships matching the bootstrap topology.
2. **Round-trip ping test:** node A `POST /send` with `X-Destination-Peer-Id: <B-pubkey>`, body `"ping"`. Node B `GET /recv` returns `200 OK` with `X-From-Peer-Id: <A-pubkey>` and body `"ping"`. Then reverse.
3. **`ping6 <B-ipv6>` from A's host** (if Yggdrasil IPv6 is exposed via the AXL gVisor stack to userspace tools — `[UNVERIFIED]`, may need the optional TUN mode; the HTTP-based ping in step 2 is the supported path).
4. **Three-way fan-out:** A sends to B and C; both receive. Confirms the mesh is doing real routing.

---

## Proving P2P realness in a demo

This is the section the redteam cares about. The hostile reviewer's hypothesis: *"You started 3 processes on one machine, named them differently, and called it P2P."*

### What artifacts judges can grep for

1. **Three distinct ed25519 public keys** — committed as `node-{1,2,3}.pub`, full hex.
2. **Three distinct Yggdrasil IPv6 addresses** in `200::/7`, deterministically derived from those keys (judge can repro derivation).
3. **Three distinct host networks** — VM 1 on AWS, VM 2 on GCP (different cloud = stronger proof), laptop on residential ISP. Self-reported via `https://api.ipify.org` sidecar.
4. **Live `/topology` JSON** from all three nodes, side-by-side in the dashboard, refreshing every 5s.
5. **Packet log** — every `/send` and `/recv` with timestamp, source key, dest key, bytes. Downloadable JSON.
6. **Server access logs** from cloud VMs showing peering TCP connections from 2 distinct remote IPs.
7. **tcpdump screenshot** on the bootstrap showing TLS on 9001 from two remote IPs.

### What artifacts a hostile reviewer would demand

- "Show me residential NAT" → `traceroute 8.8.8.8` + `whois <egress-ip>` showing the ISP. Save to `proof/laptop-environment.txt`.
- "Show me messages aren't pre-baked" → live demo accepts a judge-typed nonce, sends it from node 1, other two display it within seconds. Or CLI: `npx ledger send --to node-2 "<nonce>"` then `recv --on node-2`.
- "Show me you're not piping over a backchannel" → kill the bootstrap mid-demo. Mesh degrades. Restart. Mesh recovers. Proves AXL is the dependency.
- "Show me encryption" → `tcpdump` on 9001 shows TLS handshake then opaque ciphertext.

### Concrete checklist of "this is real" evidence

- [ ] `proof/topology-node-1.json`, `topology-node-2.json`, `topology-node-3.json` — committed snapshots taken at submission time.
- [ ] `proof/keys-summary.txt` — the three pubkey hex strings + three IPv6 addresses, plus a one-line `python -c "..."` repro to derive the IPv6 from the pubkey.
- [ ] `proof/host-environment.txt` — per node: cloud provider, public IPv4, ASN, ISP. Generated automatically.
- [ ] `proof/packet-log.json` — chronological log of every cross-node message during the demo.
- [ ] `proof/screenshots/` — tcpdump on bootstrap, dashboard with all 3 nodes lit up, live message flowing.
- [ ] `proof/video.mp4` (≤2 min) — judge types nonce, watches it propagate. Dashboard timeline shows the cross-node packets.
- [ ] **Red team script:** `scripts/redteam-verify.sh` — a 30-second runnable check that hits each node's `/topology`, asserts distinct keys, sends a random nonce from node 1, asserts it arrives at nodes 2 and 3.

---

## Bounty rules

### Pool + amount

- **Total: $5,000** for "Best Application of Agent eXchange Layer (AXL)".
- 1st: **$2,500**
- 2nd: **$1,500**
- 3rd: **$1,000**

### Judging criteria

Per `ethglobal.com/events/openagents/prizes/gensyn`:

1. **Depth of AXL integration** — is AXL doing real work, or is it a thin afterthought?
2. **Quality of code**.
3. **Clear documentation**.
4. **Working examples**.

Plus the hard qualification line: *"AXL must enable inter-agent or inter-node communication (no centralized message broker substitution); must demonstrate communication across separate AXL nodes, not just in-process."*

### Artifacts rewarded

Implicit from the criteria, **not enumerated**:
- A demo that runs and shows cross-node traffic.
- README explaining how AXL is used.
- Working code in the GitHub repo.

Winners get *"fast-tracked into the Gensyn Foundation grant programme"* — meaningful upside beyond the $5k.

### Submission requirements

ETHGlobal-standard: project on the ETHGlobal platform with title, description, demo video, GitHub link, deployed URL. **Specifics for the AXL track were not enumerated on the prizes page** — we should confirm via the workshop video or the Gensyn Discord during the build window. **`[UNVERIFIED]`** whether they require a screen-recording of cross-node traffic or accept code + topology screenshots.

### Two suggested tracks

- **Agent Town** — multi-agent simulation with personalities, AXL-mediated communication, watchable.
- **Decentralised Agent Messaging** — discovery + group formation + p2p chat, "Telegram for AI agents".

**Ledger fits comfortably as a custom proposal under the second** ("agent marketplaces, self-organising working groups" is verbatim from the bounty page) — the judges already have language for what we're building.

---

## Support + community

- **Discord**: linked from `gensyn.ai` (Community section). Active during hackathons. **Must join early on day 1** to get the AXL channel and sponsor mention.
- **Workshop video**: referenced on the prizes page; specific link not extracted — should appear in the ETHGlobal event materials before April 24.
- **GitHub Issues**: `github.com/gensyn-ai/axl/issues` — 1 open at time of research, ~3 PRs in flight. Low traffic but active.
- **No Telegram or office-hours schedule documented** in research sources. **`[UNVERIFIED]`** — confirm via Discord on hackathon kickoff.

---

## Open questions

1. **`[UNVERIFIED]`** Bootstrap time over a real residential NAT — measure on day 1.
2. **`[UNVERIFIED]`** Does `/send` retry, or is loss fully on us? Inferred: fully on us. Confirm in `cmd/node/`.
3. **`[UNVERIFIED]`** Ordering during spanning-tree reshuffles. Treat as eventually-delivered, add app-level dedupe.
4. **Decide:** Port `gossipsub.py` to TS or run as Python sidecar? Recommend **port to TS** — fewer moving parts.
5. **Decide:** MCP/A2A or raw `/send` + `/recv`? Recommend **raw**. MCP/A2A adds Python deps without bounty value for our use case.
6. **Decide:** One bootstrap node or two? Recommend **one + docs** explaining how to scale.
7. **Sponsor:** Specific submission artifacts beyond ETHGlobal default? Ask Discord day 1.
8. **Sponsor:** Novelty bonus or pure rubric? Two-sided agent marketplace is novel — surface it in writeup.

---

## Direct URLs

- AXL docs: https://docs.gensyn.ai/tech/agent-exchange-layer
- AXL repo: https://github.com/gensyn-ai/axl
- AXL README: https://github.com/gensyn-ai/axl/blob/main/README.md
- AXL API doc: https://github.com/gensyn-ai/axl/blob/main/docs/api.md
- AXL configuration doc: https://github.com/gensyn-ai/axl/blob/main/docs/configuration.md
- AXL architecture doc: https://github.com/gensyn-ai/axl/blob/main/docs/architecture.md
- AXL examples doc: https://github.com/gensyn-ai/axl/blob/main/docs/examples.md
- AXL integrations doc: https://github.com/gensyn-ai/axl/blob/main/docs/integrations.md
- Python client: https://github.com/gensyn-ai/axl/tree/main/examples/python-client
- GossipSub example: https://github.com/gensyn-ai/axl/tree/main/examples/python-client/gossipsub
- Convergecast example: https://github.com/gensyn-ai/axl/blob/main/examples/python-client/convergecast.py
- AXL announcement post: https://blog.gensyn.ai/introducing-axl/
- Gensyn org GitHub: https://github.com/gensyn-ai
- Collaborative autoresearch demo (canonical AXL app): https://github.com/gensyn-ai/collaborative-autoresearch-demo
- ETHGlobal Open Agents event: https://ethglobal.com/events/openagents
- ETHGlobal Open Agents prizes: https://ethglobal.com/events/openagents/prizes
- Gensyn bounty page: https://ethglobal.com/events/openagents/prizes/gensyn
- Yggdrasil project: https://yggdrasil-network.github.io/
- Yggdrasil FAQ (NAT confirmation): https://yggdrasil-network.github.io/faq.html
- Yggdrasil Go implementation: https://github.com/yggdrasil-network/yggdrasil-go
- Yggdrasil public peer list: https://github.com/yggdrasil-network/public-peers
- Gensyn website: https://gensyn.ai/
- Gensyn AXL launch tweet: https://x.com/gensynai/status/2044467361550348406
