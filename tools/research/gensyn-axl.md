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
