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

The "three processes on the same machine pretending" attack is obvious. The demo's planned proof is a topology view and log feed (03_DEMO_SCRIPT lines 665-674; 05_CLAUDE_DESIGN_BRIEF lines 1235-12

[continued in next commit]
