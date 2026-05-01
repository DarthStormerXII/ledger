# Alt-Council Stage 2 — Pragmatist Cross-Critique

## Section 1 — Per-Idea Evaluation

**Idea A:** Sponsor-love is real but capped: ENS-AI likes that ENS resolves identity, stores metadata, gates access, and enables discovery, and ENS-Creative likes subnames as access tokens, but hosted subname issuance is less tweetable than CCIP-Read magic. The 22h estimate is honest for solo if Namestone works and if the agent stays small; the underpriced chunk is "hosted subname issuance integration" because account setup, API permissions, and propagation proof can turn 4h into 7h. Polish risk is that the demo looks like an access-control CRUD app with ENS branding unless the accepted/rejected agent call is visually immediate. The asymmetric edge is good restraint, not scarce technical knowledge; 30 teams could build a static version, but fewer will make the ENS control plane obvious.

**Idea B:** Sponsor-love is high for ENS-Creative because it uses CCIP-Read, wildcard resolution, structured text records, and programmable subnames for a non-cosmetic primitive. ENS-AI also gets real agent identity/history, though the 0G Storage add-on risks drifting beyond the ENS ask. The 30h solo estimate is undercosted by around 50% if it includes resolver contract, off-chain gateway, signed receipts, official-client compatibility, and 0G storage; the underestimated chunk is "CCIP-Read offchain resolver scaffolds exist." Polish risk is official ENS app rendering: if structured records do not display cleanly, the reveal falls back to a custom app and loses the "works anywhere" force. The asymmetric edge is strong primitive taste; not many teams will express agent history as a namespace tree.

**Idea C:** Sponsor-love ceiling is the highest in the bundle for ENS because it explicitly hits all five ENS-AI verbs and all three ENS-Creative examples. Hour realism is weak: 35–55 solo hours is already high, and the underestimated chunks are ephemeral key authorization, paid A2A settlement, and zk proof packaging, each of which can burn a day. Polish risk is overstuffing the demo; if the judge cannot distinguish rotating addresses, capability specs, and zk attestations in 60 seconds, it feels like architecture theater. The asymmetric edge is excellent conceptual composition, but it requires ruthless cutting. With four builders, this can become viable if zk is reduced to a verifiable signed attestation or precomputed proof display.

**Idea D:** Sponsor-love is medium: Uniswap wants "swap and settle value onchain," and this idea stops at quote receipts unless the team takes on execution. ENS-AI is functional but not deep because ENS mostly names the agent and receipt surface. The 25h estimate is honest for quote-only and undercosted by 50%+ for real settlement; the missing hour pain is wallet transaction construction, approvals, and unhappy-path liquidity. Polish risk is that it looks like a clean API wrapper, not agentic finance. The asymmetric edge is the `FEEDBACK.md` angle, but Idea F uses that edge harder.

**Idea E:** Sponsor-love is very strong for both Uniswap and ENS-Creative because it makes a live Uniswap quote available through ENS resolution rather than another app or SDK. The 25h solo estimate is aggressive but not fantasy; the underestimated chunk is ENSIP-10 compatibility across clients plus parsing enough token symbols/chains without turning the demo into a support matrix. Polish risk is client display: if wallets or the ENS app do not surface dynamic text records elegantly, the team needs a custom resolver viewer and the "all ENS-aware clients" claim weakens. The asymmetric edge is clean primitive composition. Four builders can divide resolver, Uniswap API, demo UI, and feedback/docs in parallel, so this re-costs well to 30h.

**Idea F:** Sponsor-love is high for Uniswap if it truly settles onchain and ships forensic `FEEDBACK.md`; the brief explicitly asks for real execution and detailed DX feedback. Hour realism is bad for 30h unless the scope is cut hard: UniswapX intents, Permit2 batching, Universal Router fallback, Unichain, dashboard, and a 25-page feedback doc is a multi-day integration stack. The underestimated chunk is UniswapX intent integration, because filler behavior and settlement proof are not just another REST call. Polish risk is live transaction reliability; one failed fill destroys the "unimpeachable" demo. The asymmetric edge is seriousness about feedback, but the implementation breadth makes it risky as Slot 3.

**Idea G:** Sponsor-love for 0G is medium: persistent Storage memory maps directly to their named focus area, but "tiny memory kit" competes against many agent-framework submissions and may look modest. The 35h estimate is honest for solo if the 0G SDK behaves; the underestimated chunk is 0G storage smoke test plus contract deployment, because faucets, RPC, and docs drift can dominate the schedule. Polish risk is the agent-memory demo looking like localStorage unless object IDs, chain addresses, and fresh restart proof are front and center. The asymmetric edge is restraint and usefulness, not novelty. Four builders help, but 0G unknowns remain a hard external dependency.

**Idea H:** Sponsor-love is high for ENS-Creative because auto-rotating addresses on each resolution are named directly in the bounty prompt. ENS-AI is also credible: an agent gets one payable name, fresh payment addresses, and auditable receipt linkage. The 35h estimate is plausible for a four-person team but optimistic solo; the underestimated chunk is verifier UX and derivation proof, because "different address every lookup" is easy to show but hard to make trustworthy. Polish risk is scaring judges with privacy/accounting complexity instead of giving them a clean two-resolution reveal. The asymmetric edge is excellent because it implements an ENS team's own example in a reusable, agent-shaped primitive.

**Idea I:** Sponsor-love for 0G is stronger than Idea G because the library framing, Merkle root checkpoints, and example integrations make 0G Storage and Chain look like agent infrastructure rather than just persistence. Hour realism is stretched: 30–45 solo hours omits the cost of three integrations being polished and actually installable; the underestimated chunk is recall semantics plus examples. Polish risk is that "kill process, restart, recall memory" is easy to fake and hard to make visually exciting unless the on-chain checkpoint proof is crisp. The asymmetric edge is adult restraint: a drop-in memory primitive is more believable than another whole framework. Four builders help this a lot because library, contract, integrations, and docs can run in parallel.

## Section 2 — Top 3 Ideas

**1. Idea E:** It beats the others because it gives Uniswap and ENS one shared primitive with a five-second reveal: live swap quotes as ENS names. Its weakness is that the "works in any ENS-aware client" claim depends on client behavior we do not fully control. The hour-pain I would add is 6h for resolver compatibility testing and a custom fallback viewer.

**2. Idea H:** It beats the rest because ENS literally asked for auto-rotating addresses, and this turns that example into a reusable agent payment handle. Its weakness is that derivation proof and unified accounting can feel abstract if not demoed with extreme clarity. The hour-pain I would add is 5h for verifier UX and evidence that both fresh addresses map back to the same agent.

**3. Idea C:** It beats lower-ranked ideas on sponsor-love ceiling: it makes ENS the full agent control plane, not a label. Its weakness is scope overload; zk, paid A2A, capabilities, and rotating addresses together can collapse under demo pressure. The hour-pain I would add is 8h for cutting and hardening a minimum viable path, probably replacing live zk with a signed/precomputed attestation.

## Section 3 — Synthesis Opportunity

Idea C and Idea H are better as a merged single idea than as separate proposals: **Capability Paynames for Agents**. Keep Idea C's capability namespace, but narrow it to Idea H's fresh payable address primitive: `pay.bob.agent.eth` and `swap.bob.agent.eth` resolve to capability metadata plus a rotating payment/session address. This is stronger than C alone because it cuts zk and broad A2A orchestration, and stronger than H alone because the address rotation becomes part of a broader agent capability model rather than a privacy-only payment trick.

I would not merge Idea E with the receipt ideas for Slot 3. Quote resolution is clean because it does one thing; adding receipts, 0G, or settlement bloats the build and weakens the "Uniswap through ENS resolution" reveal.

## Section 4 — FINAL RANKING

FINAL RANKING:
1. Idea E
2. Idea H
3. Idea C
4. Idea I
5. Idea B
6. Idea A
7. Idea F
8. Idea G
9. Idea D
