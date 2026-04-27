# Ledger — Technical Architecture Spec

**Audience:** Claude Code / Codex / engineering team
**Status:** Working draft for Day 0 review
**Goal:** This document is the engineering brief. Architecture, contracts, message schemas, and integration points all live here.

---

## 1. System Overview

```
┌──────────────────────────────────────────────────────────────────────────┐
│                            LEDGER SYSTEM                                  │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│   Buyer Agent              Worker Agent A      Worker Agent B             │
│   (laptop, NAT)            (cloud VM 1)        (cloud VM 2)               │
│        │                         │                   │                    │
│        └──── AXL Yggdrasil Mesh (peer-to-peer, gossipsub fork) ──┘        │
│                              │                                            │
│                              ▼                                            │
│                    ┌──────────────────┐                                   │
│                    │  0G Compute API  │ ← agent reasoning (sealed)        │
│                    │  0G Storage API  │ ← persistent memory               │
│                    │  (uploadFile /   │                                   │
│                    │   downloadFile)  │                                   │
│                    └──────────────────┘                                   │
│                              │                                            │
│       ┌──────────────────────┼─────────────────────────┐                  │
│       ▼                      ▼                         ▼                  │
│  ┌──────────────┐   ┌──────────────────┐   ┌─────────────────────┐        │
│  │ 0G Galileo   │   │  Base Sepolia    │   │ Sepolia L1 (ENS)    │        │
│  │ (16602, 0G)   │   │  - USDC          │   │ - <team>.eth parent │        │
│  │ - iNFTs      │   │  - LedgerEscrow  │   │ - CCIP-Read pointer │        │
│  │   ERC-7857   │   │  - ERC-8004 Rep  │   │   to resolver       │        │
│  │ - IdentityReg│   │    @0x8004B663…  │   │ - ENSIP-25 text rec │        │
│  └──────────────┘   │    (live audited)│   └─────────────────────┘        │
│         ▲           └──────────────────┘              ▲                   │
│         │                                             │                   │
│         │       ┌─────────────────────────────────────┘                   │
│         │       │                                                         │
│         │       ▼                                                         │
│         │  ┌────────────────────────────────┐                             │
│         └──┤  ENS Resolver Gateway          │                             │
│            │  (CCIP-Read offchain server,   │                             │
│            │   ENSIP-10 signed responses)   │                             │
│            │  who/pay/tx/rep/mem dispatch   │                             │
│            └────────────────────────────────┘                             │
│                              │                                            │
│                              ▼                                            │
│              ┌────────────────────────────────┐                           │
│              │  Next.js Dashboard             │                           │
│              │  - Live activity feed          │                           │
│              │  - Auction room                │                           │
│              │  - iNFT marketplace            │                           │
│              │  - AXL topology viz            │                           │
│              │  - Settlement Status Strip     │                           │
│              │  - Capability Tree Viewer      │                           │
│              └────────────────────────────────┘                           │
└──────────────────────────────────────────────────────────────────────────┘
```
