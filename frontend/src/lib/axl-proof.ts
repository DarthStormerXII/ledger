export const AXL_CAPTURED_PROOF = {
  capturedAt: "2026-05-02T16:28:18.914Z",
  topologyCapturedAt: "2026-05-02T16:28:38Z",
  taskId: "0x6c65646765722d66756c6c2d6379636c652d31373737373339323838303737",
  nodes: [
    {
      role: "buyer-bootstrap",
      host: "Fly.io sjc",
      peerId:
        "a560b12fe6e16b1c8a94bb99b3019fa6d5f490474c275a31848f022df3a170eb",
      ipv6: "200:b53e:9da0:323d:29c6:ead6:88cc:99fc",
      listener: "66.51.123.38:9001",
    },
    {
      role: "worker-1",
      host: "Fly.io fra",
      peerId:
        "f274bf0f8dadfa028b75f73cf7b29c927ded368b6703caf403abdb0d9aa1fa64",
      ipv6: "200:1b16:81e0:e4a4:bfa:e914:1186:109a",
      listener: "77.83.143.142:9001",
    },
    {
      role: "worker-2",
      host: "Residential NAT laptop",
      peerId:
        "590fa3b614da78d5e50939f708dea209e5cfb5e7ae69f1220611d8eefcc95f4c",
      ipv6: "201:9bc1:7127:ac96:1ca8:6bdb:1823:dc85",
      listener: "outbound-only",
    },
  ],
  lifecycle: [
    { at: "16:28:12.597", event: "TASK_POSTED", node: "bootstrap" },
    { at: "16:28:13.184", event: "DISCOVERED", node: "local" },
    { at: "16:28:13.199", event: "DISCOVERED", node: "worker-1" },
    { at: "16:28:14.064", event: "BID_RECEIVED", node: "bootstrap" },
    { at: "16:28:14.280", event: "BID_RECEIVED", node: "bootstrap" },
    { at: "16:28:15.024", event: "BID_ACCEPTED", node: "worker-1" },
    { at: "16:28:18.351", event: "AUCTION_CLOSED", node: "worker-1" },
    { at: "16:28:18.352", event: "AUCTION_CLOSED", node: "local" },
    { at: "16:28:18.914", event: "RESULT_RECEIVED", node: "bootstrap" },
  ],
  fanout: {
    topic: "#ledger-jobs",
    localLatencyMs: 567,
    workerLatencyMs: 601,
  },
  files: [
    "proofs/data/axl-topology.json",
    "proofs/data/axl-full-cycle.json",
    "proofs/data/axl-gossipsub-fanout.json",
    "proofs/data/axl-kill-bootstrap.log",
    "proofs/data/axl-runtime-smoke.json",
  ],
} as const;
