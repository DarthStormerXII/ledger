# Gensyn AXL Proof

Status: Phase 1 live proof captured on May 2, 2026.

## What We Used

Ledger is running the official `gensyn-ai/axl` Go node across three independent nodes:

- `node-buyer-bootstrap`: Fly.io `sjc` public TCP bootstrap at `66.51.123.38:9001`
- `node-worker-1`: Fly.io `fra` worker at `77.83.143.142:9001`, outbound peer to bootstrap and public listener for bootstrap-kill continuity
- `node-worker-2`: local `Noir.local` laptop, outbound-only residential/NAT peer to the bootstrap

Application code talks only to the localhost HTTP bridge on port `9002` using `/topology`, `/send`, and `/recv`. The TypeScript client is in `agents/axl-client`; the TypeScript GossipSub port is in `agents/axl-gossipsub`.

## Why It Matters

The Gensyn AXL qualifying line is communication across separate AXL nodes, not three local processes. This proof shows separate host networks, distinct ed25519 peer IDs, distinct Yggdrasil IPv6 addresses, public TCP bootstrap traffic, and real payload roundtrips.

## Evidence

- Buyer/bootstrap peer: `a560b12fe6e16b1c8a94bb99b3019fa6d5f490474c275a31848f022df3a170eb`
- Worker 1 peer: `f274bf0f8dadfa028b75f73cf7b29c927ded368b6703caf403abdb0d9aa1fa64`
- Worker 2 peer: `590fa3b614da78d5e50939f708dea209e5cfb5e7ae69f1220611d8eefcc95f4c`
- Yggdrasil IPv6 addresses: `200:b53e:9da0:323d:29c6:ead6:88cc:99fc`, `200:1b16:81e0:e4a4:bfa:e914:1186:109a`, `201:9bc1:7127:ac96:1ca8:6bdb:1823:dc85`
- Topology snapshot: `proofs/data/axl-topology.json`
- Message log: `proofs/data/axl-message-log.txt`
- TCP packet excerpt on the bootstrap: `proofs/data/axl-tcpdump.txt`
- Judge nonce roundtrip: `proofs/data/axl-nonce-roundtrip.log`
- launchd restart + post-recovery direct roundtrip: `proofs/data/axl-launchd-roundtrip.log`
- Bootstrap-kill continuity: `proofs/data/axl-kill-bootstrap.log`
- TypeScript GossipSub fanout on `#ledger-jobs`: `proofs/data/axl-gossipsub-fanout.json`
- Full Ledger AXL cycle: `proofs/data/axl-full-cycle.json`
- App-facing runtime smoke: `proofs/data/axl-runtime-smoke.json`

## Notes

- AWS EC2 was attempted first but the current IAM principal cannot create key pairs, security groups, or instances. Fly.io was used for the two public regions because the CLI was authenticated and executable.
- Fly DNS did not resolve before allocating a dedicated IPv4, so worker and local peers use `tls://66.51.123.38:9001`.
- `GET /recv` is the endpoint exposed by the current AXL repo; the TypeScript client falls back to `/receive` only if `/recv` is absent.
- The current AXL response header truncates/pads `X-From-Peer-Id` in received messages, but payload delivery and topology peer IDs are correct.
- Local NAT stability recovery completed at `2026-05-02T15:14:13Z`: the local AXL node now runs under launchd at `~/Library/LaunchAgents/com.ledger.axl.plist` with `KeepAlive=true`. Recovery test killed the launchd child process, launchd restarted it (`59798` -> `60532`), and `localhost:9002` responded after restart.
- Fresh post-launchd direct AXL roundtrip succeeded: local NAT node sent `TASK_POSTED` to the Frankfurt worker, Frankfurt received it, Frankfurt sent `RESULT` back to local, and local received the same nonce. Evidence: `proofs/data/axl-launchd-roundtrip.log`.
- Bootstrap-kill continuity completed at `2026-05-02T16:23:39Z`: the `sjc` bootstrap machine was stopped, local NAT and Frankfurt exchanged `TASK_POSTED` and `RESULT` directly through the Frankfurt public listener, then the bootstrap was restarted.
- TypeScript GossipSub fanout completed at `2026-05-02T16:27:22Z`: bootstrap published to `#ledger-jobs`; local received in `567ms`, Frankfurt received in `601ms`.
- Full protocol cycle completed at `2026-05-02T16:28:18Z`: `TASK_POSTED -> BID -> BID_ACCEPTED -> AUCTION_CLOSED -> RESULT` passed across the real AXL nodes.
- App-facing runtime smoke completed at `2026-05-02T16:48:32Z`: `LedgerAxlRuntime.postTask()` and `LedgerAxlRuntime.startPubSub()` delivered a real `TASK_POSTED` to both worker nodes.
- For test harness access only, Fly cloud nodes bind the HTTP bridge to `0.0.0.0` inside the Fly private network and are accessed through `fly proxy` on local ports `9101` and `9102`; public exposure remains the AXL TCP listener on `9001`.

## Reproduction

```bash
curl http://localhost:9002/topology

curl -X POST http://localhost:9002/send \
  -H "X-Destination-Peer-Id: <recipient-pubkey>" \
  --data-binary @payload.bin

curl http://localhost:9002/recv
```
