# Ledger Red-Team Review — Stage 1

The worst attack is simple: Ledger's central claim is "working, owned, intelligent agents," but the docs repeatedly leave themselves an escape hatch where the demo becomes a choreographed UI over pre-baked reputation, cached reasoning, possible local wrappers, and metadata pointers. A judge does not need deep malice to collapse this. They only need to ask whether the intelligence, network, settlement, and reputation are real at the same time.

## 1. Demo-day failure modes

1. **The iNFT inheritance does not actually transfer intelligence.** The project says the worker's memory, reputation, earnings, and learned strategy weights transfer with ownership in the inherit flow (01_PRD lines 144-153), then admits ERC-7857 may not transfer encrypted intelligence and proposes "store memory pointer in iNFT metadata" as the workaround (01_PRD lines 233-240). That mitigation is not sufficient. A pointer in token metadata is not an intelligence transfer. It is a location string. If storage permissions, decryption keys, and runtime authority do not follow the token, the hero moment is an ERC-721 transfer with a story pasted on top.

2. **AXL drops or fails to prove cross-machine P2P under pressure.** The plan depends on three nodes, including a local laptop behind residential NAT (02_ARCHITECTURE lines 366-378), and the verification doc calls this high-risk because failure loses authenticity (08_DAY0_VERIFICATION lines 2121-2124). The current mitigation is "use 3 cloud VMs" if residential NAT fails (01_PRD line 238; 10_ACTION_NAVIGATOR lines 3163-3164). That preserves a technical checkbox, but it weakens the claim that this is an agent network functioning in messy real-world conditions. Worse, the demo proof is currently a topology visualization, which can be animated without proving packet origin.

3. **KeeperHub reroute is a fake button.** The architecture says "Spike Gas" fires a fuzz-tx wallet to flood Base Sepolia and trigger reroute (02_ARCHITECTURE lines 536-542). The demo script then explicitly says that if the spike fails, the team should have a manual override that simulates the reroute UI (03_DEMO_SCRIPT lines 812-816). That is radioactive. If a judge sees a hidden "Spike Gas" button and asks for the Base Sepolia transaction sequence, the project either has real mempool evidence or it has theater.

4. **0G Compute is not available or too slow, so reasoning becomes replay.** The PRD says all reasoning runs on 0G Compute sealed inference (01_PRD lines 159-163), and the demo voiceover claims "Her reasoning is verifiable" (03_DEMO_SCRIPT lines 694-696). But the risk table admits a fallback to local inference or future-work claims (01_PRD line 240), and the recording plan allows "reasoning replay" with pre-recorded tokens (03_DEMO_SCRIPT lines 812-816). That mitigation is not sufficient for a sponsor track that cares about actual 0G integration. It converts the reasoning panel into animation unless the repo and video show live request IDs, responses, and storage writes.

5. **The 47-job reputation history collapses under provenance review.** The demo intends to show 47 jobs, 4.7 rating, and 12,847 USDC earned (03_DEMO_SCRIPT lines 732-739), while the pre-production note says to fire 47 fake completions signed by 47 fake employer agents (03_DEMO_SCRIPT lines 795-810). The mitigation is to make the chain show the numbers. That is not sufficient if the submission copy presents those jobs as earned history. A skeptical judge will ask who the employers were, whether tasks existed, whether payments settled, and why 47 fake employers are not just forged social proof.

## 2. Sponsor integration slideware attack surface

**0G Track B.** Claim: "Each worker agent is minted as an ERC-7857 iNFT on 0G Chain Sepolia" and carries persistent memory, reputation, and earnings history (07_SUBMISSION_PACK lines 1769-1804). Challenge: "Show the exact ERC-7857 encrypted intelligence handoff. Where is the encrypted intelligence transferred, who can decrypt it before and after transfer, and what on-chain event proves access changed?" Current docs only show metadata pointers and a fallback registry concept. That is not enough.

**Gensyn AXL.** Claim: "all inter-agent communication runs over Gensyn's AXL across three independent nodes ... with no central broker" (07_SUBMISSION_PACK lines 1814-1830). Challenge: "Kill the SSE proxy and one local process. Do the other two remote nodes still exchange direct messages? Show logs from separate machines with peer IDs, public IPs, and message hashes matching the UI." The architecture has an SSE proxy feeding the dashboard (02_ARCHITECTURE lines 396-405). That proxy is enough for a hostile reviewer to suspect the dashboard is centralizing the evidence even if AXL exists underneath.

**KeeperHub.** Claim: "Every on-chain action in Ledger flows through KeeperHub's MCP server" and the demo triggers a deliberate gas spike that reroutes via private mempool (07_SUBMISSION_PACK lines 1836-1853). Challenge: "Open the KeeperHub audit trail and the Base Sepolia explorer. Which transaction was priced out, which route did KeeperHub select, and what objective gas data proves the spike?" The docs do not define what "reroute" means on testnet, and the verification doc worries KeeperHub may not support the required testnets (08_DAY0_VERIFICATION lines 2154-2184).

## 3. The iNFT critique

The hostile reviewer's line is correct: the current fallback reads like ERC-721 plus metadata, not ERC-7857. The PRD says "Owner_B clicks Buy" and the purchase happens via "standard ERC-721 transferFrom" (01_PRD lines 144-149). The architecture describes WorkerINFT transfer as "standard ERC-721 with memory pointer carried in metadata" (02_ARCHITECTURE lines 346-351). That is not encrypted intelligence transfer. That is tokenURI continuity.

There is no defensible answer in the current docs that satisfies a strict ERC-7857 critique. The best current answer is rhetorical: reputation is on-chain, memory CID is in metadata, ownerOf controls future earnings. That may defend "transferable worker asset," but it does not defend "encrypted intelligence transfer." A defensible answer would need docs and code proving token-bound memory access, key rotation or permission rebinding on transfer, and a runtime that loads the transferred encrypted memory as the same agent under the new owner. The current docs identify that need in Day 0 verification (08_DAY0_VERIFICATION lines 2085-2117), but they do not prove it.

## 4. The AXL critique

The "three processes on the same machine pretending" attack is obvious. The demo's planned proof is a topology view and log feed (03_DEMO_SCRIPT lines 665-674; 05_CLAUDE_DESIGN_BRIEF lines 1235-1256). That is not convincing by itself. A UI can draw three nodes. A local SSE service can emit "us-west -> eu-central : BID" without a packet ever leaving localhost. The architecture does say two cloud VMs and a local laptop (02_ARCHITECTURE lines 366-372), and the master brief repeats that commitment (00_MASTER_BRIEF lines 47-52), but the demo evidence as written is visual, not forensic. The judge will ask for terminal logs, peer IDs, machine boundaries, and message correlation. The current docs do not require those to be shown.

## 5. The KeeperHub critique

The gas-spike demo has the highest fraud smell because the documents literally instruct the team to include a hidden Spike Gas button (02_ARCHITECTURE lines 536-542) and a manual override that simulates reroute UI if real conditions do not trigger it (03_DEMO_SCRIPT lines 812-816). The demo as written shows a gas chart spike and status text saying "Rerouting via private mempool" and "Confirmed in 4 seconds" (03_DEMO_SCRIPT lines 700-715). That proves nothing. The docs do not say how the gas chart is sourced, how fuzz transactions are linked to Base Sepolia, what KeeperHub response payload contains, or whether private mempool rerouting is even meaningful on the selected testnet. The verification doc explicitly asks if testnet gas-spike reroute can be demonstrated (08_DAY0_VERIFICATION lines 2154-2184), so the current proof is not convincing.

## 6. The 47-jobs / 4.7-rating critique

The team is currently papering over this unless the README is edited with brutal honesty. The demo checklist says the worker iNFT has "47 jobs of fake history pre-baked into reputation registry" (03_DEMO_SCRIPT lines 795-802). The pre-production note says to create those completions using 47 fake employer agents (03_DEMO_SCRIPT lines 808-810). The README template, however, says workers can be bought and inherited with their "full reputation, memory, and earnings history" (07_SUBMISSION_PACK lines 1954-1980) without disclosing that the hero worker's history is synthetic. A hostile reviewer will call it reputation laundering. If the chain contains 47 fake attestations, "on-chain" makes the theater permanent, not credible.

## 7. Document-specific weaknesses

**00_MASTER_BRIEF.md:** The "Core Thesis" claims nobody has wired ERC-8004, x402, and ERC-7857 into a working market and that Ledger does (lines 41-43). The bundle has not established that Ledger can actually implement ERC-7857 encrypted intelligence transfer or real x402.

**01_PRD.md:** The inherit flow claims memory, reputation, earnings, and strategy weights transfer with the iNFT (lines 144-153), but the risk table admits the workaround is just a metadata pointer (lines 233-240). That is a central contradiction.

**02_ARCHITECTURE.md:** WorkerINFT is described as "standard ERC-721 with memory pointer carried in metadata" (lines 346-351). That undercuts the ERC-7857/iNFT sponsor claim before implementation starts.

**03_DEMO_SCRIPT.md:** The gas-reroute fallback explicitly allows a simulated reroute UI (lines 812-816). That is exactly the kind of line a judge would screenshot if they saw the repo.

**04_HIGGSFIELD_PROMPTS.md:** The iNFT transformation shot includes atmospheric labels "47, 4.7, 12K" (lines 860-878). It visually amplifies numbers the docs say are fake.

**05_CLAUDE_DESIGN_BRIEF.md:** It says the AXL topology visualization is what proves "this is really P2P" (lines 1235-1256). A visualization does not prove P2P. It proves the frontend can draw moving dots.

**06_AI_COUNCIL_PROMPTS.md:** The hidden-vulnerabilities prompt already names the five assumptions that could be wrong, including AXL NAT, ERC-7857 memory transfer, KeeperHub chain support, 0G Compute access, and ownership-change mechanics (lines 1516-1547). The weakness is that these are not peripheral; they are the whole project.

**07_SUBMISSION_PACK.md:** The 0G sponsor writeup says the iNFT "genuinely carries embedded intelligence, not just a name" (lines 1798-1804), but the architecture only shows metadata pointers. This is overclaiming.

**08_DAY0_VERIFICATION.md:** It says do not start the build until Q1, Q3, and Q4 are confirmed (lines 2076-2085), but the action navigator simultaneously assigns code setup in hours 1-3 while answers are still pending (lines 2850-2868). That is process incoherence.

**09_BRAND_IDENTITY.md:** The trademark note admits Ledger SAS risk and says to document the acknowledgment in README (lines 2319-2336). The README template later does not include that acknowledgment.

**10_ACTION_NAVIGATOR.md:** The final note says "The plan is locked" and "The architecture is clean" (lines 3185-3195), while the same file contains emergency pivots for failed iNFT, KeeperHub, 0G Compute, and AXL foundations (lines 3150-3167). That confidence is unearned.

## 8. The 30-second judge brutality

The sentence that tanks the submission is: **"This is a beautiful demo of an ERC-721 metadata pointer and a scripted dashboard, not a working market for intelligent agents."**

The current documents cannot fully defend against that sentence. They can defend ambition, visual quality, and a plausible architecture. They cannot yet defend the exact claims that matter: ERC-7857 encrypted intelligence transfer, real AXL cross-node communication, real KeeperHub gas-spike rerouting, real 0G Compute inference, and non-theatrical reputation history. Until those are evidenced directly in the repo and video, the project is vulnerable to being judged as polished slideware.
