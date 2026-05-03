# Proofs

Sponsor-grade evidence that lets a judge verify each sponsor integration is real, in under 60 seconds.

This directory is **populated during execution** (May 2 evening → May 3 morning). It is empty at planning time.

## Files

| File | Verifies | Owner during build |
|---|---|---|
| `0g-proof.md` | Track A Agent Kit framework proof, iNFT contract addresses, 0G Storage memory CIDs, 0G Compute attestation digests, sealed-key parameter in transfer | Builder C |
| `axl-proof.md` | 3 ed25519 peer IDs, 3 Yggdrasil IPv6 addresses, 3 host networks, `/topology` JSON snapshot, kill-the-bootstrap log, judge-typed-nonce trace | Builder A |
| `ens-proof.md` | ENS parent name registration tx, CCIP-Read resolver gateway URL, namespace tree showing live resolution, before/after `who.*` flip on iNFT transfer, ENSIP-25 verification text record | Builder B |

## Pattern (each file)

Each proof doc is one screen, evidence inline. Structure:

```markdown
# <Sponsor> Proof

## What we used
<2-3 sentences of integration scope>

## Why it matters
<1 sentence per sponsor's bounty rubric line>

## Evidence
- Artifact 1: <link or value>
- Artifact 2: <link or value>
- ...

## Known limitations
<honest list — anything seeded, anything mocked, anything testnet>

## Reproduction
<exact command or URL that re-derives the evidence>
```

## Why this exists

Per the council's Stage 2 strategist analysis: sponsor judges read submissions in under 60 seconds and grep for their own product. A `proofs/<sponsor>.md` file lets them jump straight to their section and verify reality in one screen — bypassing the README, the architecture diagram, and the demo video.

The README's top-level **Proof Matrix** (in `docs/07_SUBMISSION_PACK.md`) cross-links to these files for the full evidence trail.
