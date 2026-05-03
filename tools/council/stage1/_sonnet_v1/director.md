# DIRECTOR — Stage 1 Review
*Ledger demo plan. 4-minute timeline. Three Higgsfield shots. Brand voice. All 11 documents.*

---

## 1. The Hook (0:00–0:15) — Does It Grab in 4 Seconds?

No. Not yet.

At second 4 the judge sees: Higgsfield aerial, nodes, trails. VO hasn't started or is mid-first-syllable. The visual alone has to do the work, and "aerial shot of glowing nodes over Earth at night" is the single most recycled image in tech demo history. Blade Runner 2049 as a reference means nothing if Higgsfield gives you something that could run before a satellite TV ad.

The VO that opens the sequence starts with a statement of existing fact: *"AI agents now have wallets. They have identity. They have reputation."* That's a setup, not a hook. You're confirming what a judge in this room already knows. The 4-second rule says: surprise them or lose them. The current line earns no surprise.

**Concrete fix:** Front-load the tension. The first words out of the VO should be the thing that's missing, not the things that exist. Try:

> *"She has forty-seven jobs completed. Four-point-seven stars. Twelve thousand dollars earned."*
>
> *[beat]*
>
> *"And today she changes hands."*

Now the judge is asking *who is she* before the demo has explained anything. They're curious. The aerial visual suddenly becomes a search — three nodes, one of them is her. The "We built one." line from the current script is strong; move it to 0:14, not 0:12.

Alternatively, restructure entirely: open on Shot 2 (the crystal/iNFT form) as the first visual, not the aerial. Establish the *agent* before the *network*. The judge's first image is an asset — mysterious, contained, luminous. Then the VO explains the world she operates in. This is riskier in production but more original as an opening.

Either way, the current 0:00–0:15 is undeniable as a *visual* if the Higgsfield delivery is good. It's the VO that's failing the first 4 seconds, not the shot.

---

## 2. The Pacing Curve — Where It Sags, Where It Rushes, Where It Over-Explains

**Mental graph of attention density (scale 1–10):**

| Segment | Mark | Density | Problem |
|---|---|---|---|
| Cinematic open | 0:00–0:15 | 9 | Strong if Higgsfield delivers |
| Stat cards | 0:15–0:35 | 4 | **SAG.** Slide deck aesthetic. |
| Live demo: posting + auction | 0:35–1:35 | 6→7 | **RUSH.** Too many concepts |
| KeeperHub moment | 1:35–2:00 | 8 | Right length, right VO |
| Shot 2: iNFT Transformation | 2:00–2:15 | 9 | Works |
| Inheritance: stat recitation | 2:15–2:50 | 5 | **SAG.** 35 seconds of reading stats |
| Inheritance: the punchline | 2:50–3:15 | 9 | This is what wins |
| Shot 3: Handoff | 3:15–3:35 | 8 | Works, wrong position |
| Thesis + CTA | 3:35–4:00 | 5 | **SAG.** Mechanical sponsor parade |

**Three specific problems:**

**Sag 1 — 0:15–0:35 (Stat Cards).** The three cards ("21,000+ agents," "100M+ payments," "0 marketplaces") are a corporate slide deck inserted into a film. The VO *reads the screen* while the screen *displays the VO.* They're saying the same thing. Cut the VO to three fragments that the visual extends, not duplicates. Or cut this section to 10 seconds and spend the recovered time on the auction sequence, which earns its clock.

**Sag 2 — 2:15–2:50 (Inheritance Setup).** The judge just watched Shot 2 — a luminous iNFT crystal slowly rotating. They got the impression. They don't need thirty seconds of stat narration before the reveal. "Forty-seven jobs completed. 4.7 average rating. Twelve thousand USDC earned. Encrypted memory of every job she's done — stored on 0G." That's four separate data points delivered in sequence. By the time *"She's an asset. ERC-7857. An iNFT."* lands, the judge has been waiting for twenty-five seconds. Move that line to 2:25. Then let the stats arrive *around the reveal*, not before it.

**Rush — 0:35–1:35 (Live Demo Posting).** AXL topology, task posting, auction opening, three workers bidding, bid bond, 0G Compute streaming — in 60 seconds. That's one concept every 10 seconds. The AXL explanation competes with the UI action competing with the VO. Something in this section needs to be cut. The bid bond is the weakest link for pacing; the judge needs to understand the auction wins, the bond is a detail. Cut the VO line about the bond entirely. The UI can show it; let the judge discover it.

---

## 3. The Inheritance Moment (2:00–3:35) — Is the Script Serving It?

The script is **burying it under setup.**

The actual punchline — *"She bids again. Same agent. Same reputation. New owner. The earnings stream just changed hands. Mid-flight. On-chain."* — doesn't arrive until approximately 3:05. That's five minutes in the build and over 45 seconds of screen time in this section before the money line. The ratio is wrong.

What does the moment need to FEEL like? It needs to feel like a reversal. Not an explanation of a reversal. The Higgsfield Shot 3 prompt already understands this instinctively — the particle stream physically changing direction. That's the emotion. The screen recording section needs to find the visual equivalent.

**What's missing:** after the new task completes and KeeperHub confirms the payment, the judge never sees the money actually land in the new owner's wallet. The script shows a transfer modal confirming. It shows the worker bidding again. But it never shows the USDC balance in the new wallet incrementing. That number — going from 0.00 to 4.50 in the second wallet — is the proof. Without it, the claim "The earnings stream just changed hands" is a VO assertion backed by a confirmation modal. A skeptical judge will think: *I saw a UI say "complete." I didn't see the money move.*

**Edits to get there:**

1. Move *"She's an asset. ERC-7857. An iNFT."* to 2:18 — immediately after Shot 2 fades.
2. Drop the stat narration from 4 lines to 2: earnings total and job count. The profile screen shows the rest.
3. The line *"Watch what happens when I post another job"* is a tell. It telegraphs the surprise. Cut it. Post the job. Let the judge realize on their own.
4. After the new task settles, cut to the new owner's wallet showing a USDC balance update. Hold for 3 seconds. VO: *"His wallet."* Nothing else needed.

---

## 4. The Higgsfield Shots — Ornamental or Doing Work?

**Shot 1 (0:00–0:15) — Aerial nodes:** Conceptually right, production-fragile. The gold pulse at the San Francisco node as the shot ends is clever — it's the brand's first visual signature before the brand appears. Keep that beat specifically. However: the shot's differentiation depends entirely on Higgsfield delivering Blade Runner 2049 quality, not screensaver quality. Budget 8–12 generations for this. The negative prompt needs *"no glowing globe clichés, no circular orbit animations, no blue-on-black Web3 imagery"* — much more aggressive than the current draft.

Verdict: Keep. 15 seconds is correct. Strengthen the negative prompt.

**Shot 2 (2:00–2:15) — iNFT Transformation:** This shot is doing the most emotional work per second of any element in the demo. The VO is "Now look at her." — three words. The crystal/vessel concept translates an abstract concept (ownable agent identity) into something visceral (a precious object in a container). 15 seconds is right. The risk is that Higgsfield muddles the crystal concept; the prompt is asking for a lot simultaneously (figure, orbiting numbers, crystal, rotation). Simplify the prompt to prioritize the crystal form above all else. The orbiting numbers are optional.

Verdict: Keep. Potentially increase to 18 seconds by slowing the rotation. The more time the judge spends looking at that crystal, the more they value it.

**Shot 3 (3:15–3:35) — Inheritance Handoff:** This shot is correctly conceived but in the wrong position. Currently: screen recording shows the transfer → then Shot 3 shows the metaphor → then CTA. That's conclusion then metaphor then outro. The metaphor should precede the proof, not follow it. Move Shot 3 to 2:00–2:20, *before* the screen recording of the inheritance flow. The abstract (particles reversing) sets up the concrete (actual transfer happening). This inverts the current structure in a way that makes the screen recording feel like the *proof* of what the shot just promised.

One additional note: the particle reversal must be legible at 1:1 playback speed, at 1080p, without the viewer reading any caption. If a judge watches this on a laptop at 75% volume with no captions, they need to see the directional change as clearly as they'd see a ball reversing direction. Add this as an explicit requirement in the prompt iteration notes. Generate both directions separately (particles flowing left, particles flowing right) and crossfade if needed.

Verdict: Keep. Move earlier. Be ruthless about legibility of the reversal.

---

## 5. The Voiceover — Over-written, Sparse, Under-trusting

**Over-written (cut these):**

*"She pays a bid bond — half a USDC, locked in escrow."* — "locked in escrow" is for the judge who doesn't know crypto. The judge who matters does. Cut to: *"She pays a bond."* The UI handles the rest.

*"KeeperHub re-routes through a private mempool. Four seconds. Five USDC paid. Bond returned. Reputation incremented on chain."* — "Reputation incremented on chain" while the screen shows the +1 animation. That's VO narrating visual. Cut the last sentence.

*"Watch — the network just spiked."* — the gas chart is spiking on screen. Cut entirely. Let the visual happen first, then: *"Most agents would fail here."* Silence is more dramatic than announcing the spike.

*"Twenty-one thousand agents are registered on Ethereum's identity standard. Coinbase's payment protocol has cleared a hundred million transactions. None of these agents can hire each other. Until now."* — this is a press release sentence. Replace the whole VO block with: *"Twenty-one thousand agents. A hundred million payments. Zero places to hire each other."* Let the cards do the counting.

**Sparse (keep exactly as written):**

*"Now look at her."* — do not touch this line. Do not add to it.

*"And I can sell her."* — the period is the VO.

*"She's an asset. ERC-7857. An iNFT."* — three fragments, correct.

**Under-trusting:**

*"She runs on 0G Compute — sealed inference. Her reasoning is verifiable."* — the streaming reasoning panel is on screen. The VO doesn't need to re-explain what the visual is showing. Cut to: *"Her reasoning is sealed."* "Sealed" lands harder than "verifiable" for a non-technical judge.

---

## 6. The Cuts — Hard vs. Crossfade, Rhythm

Post-production note in `04_HIGGSFIELD_PROMPTS.md` says: *"Keep cuts hard between Higgsfield → screen recording."* Correct. That contrast (cinematic to functional) is the demo's structural grammar. Every Higgsfield-to-screen transition must be a hard cut, no exceptions.

Within screen recording sections: the script only explicitly marks *"Cut to Auction Room view"* and *"Cut back to first laptop."* The editor will guess at the rest. The Inheritance section especially needs choreographed cut points, not fluid narrative.

The KeeperHub section (1:35–2:00) has the best internal rhythm in the script: short action, short VO reaction, short action, short VO reaction. That's the template. The auction section and inheritance section should cut at the same tempo — roughly every 8–10 seconds within the screen recording, not 20–30.

The sponsor logo CTA (3:35–4:00) should have three hard cuts: one logo, hard cut, second logo, hard cut, third logo. Each holds 3 seconds with the one-line callout, then cuts to the end card. Don't crossfade logos. The institutional coldness of hard cuts matches the brand voice.

---

## 7. The Hidden Problem

**The demo doesn't prove its central claim at the frame level.**

The entire submission rides on *"The earnings stream just changed hands."* A judge watching carefully will note: the screen recording shows a transfer modal saying "complete," then shows the same worker bidding on a new job. It does not show a specific wallet address receiving a specific USDC amount that wasn't there before the transfer.

This is the difference between a demo that *claims* something and a demo that *proves* something. The inheritance claim needs one screen — just one — where the judge sees USDC arrive in a previously-empty or lower-balance wallet that belongs to the new owner. Not a transaction hash (too much cognitive load). Not an explorer link (requires trust). A dashboard widget showing "Owner B balance: +4.50 USDC" that the judge can read in under a second.

This is a UI change, not a technical change. Add a "Wallet B" balance display to the dashboard. Hold on it for 3 seconds after the job settles. That's the proof. Without it, everything after the transfer modal is assertion.

No document in the bundle acknowledges this gap. The architecture, PRD, and demo script all treat the inheritance transfer as complete when the modal confirms. It isn't — not for a judge in a deliberation room.

---

## 8. The 30-Second Elevator Cut

Judges sometimes only watch the first 30 seconds. Here are those 30 seconds:

| Time | Content |
|---|---|
| 0:00–0:06 | Higgsfield aerial (nodes, trails, scale). VO: *"She has forty-seven jobs. Twelve thousand dollars earned."* |
| 0:06–0:09 | Hard cut. LEDGER title card. Fraunces. Pale gold. VO: *"And today she changes hands."* |
| 0:09–0:18 | Auction Room: three workers bidding, topology visualization showing real packets, countdown timer at 1:23 |
| 0:18–0:24 | Worker Profile: the stats grid, the portrait, the earnings in gold. VO: *"She's an iNFT. An agent you can buy."* |
| 0:24–0:28 | Hard cut to Higgsfield Shot 3: particle stream reversing. |
| 0:28–0:30 | Hard cut. VO: *"Same agent. New owner."* Silence. |

This version abandons KeeperHub, abandons 0G Compute, abandons the full explanation. It gives the judge the world, the asset, and the punchline in 30 seconds. If they only watch this far and remember one thing for deliberation, they remember: *"an AI worker you can buy and sell."*

The current script's first 30 seconds ends mid-sentence in the stat card section. That version doesn't have a punchline. It has setup.

---

## 9. Document-Specific Changes

**00_MASTER_BRIEF.md** — "Demo Concept" says "hero moment (around 2:30 mark)." The actual punchline as currently scripted is at 3:05–3:10. Either fix the script to make the inheritance reveal happen at 2:30, or update the brief time marker. The team building the UI needs the right anchor.

**01_PRD.md** — Acceptance Criterion 3 ("iNFT transfer flow works: Transfer to second wallet, second wallet receives next earnings") has no visual proof requirement. Add: *"Evidence: second wallet's dashboard balance displays the USDC increment during the recorded demo run."*

**02_ARCHITECTURE.md** — Section 2.7 (Frontend routes) has no route for a dual-wallet balance view during the demo. The inheritance moment needs a screen state — likely the Worker Profile or a dedicated demo overlay — that shows both wallet balances simultaneously. Add this to the frontend spec.

**03_DEMO_SCRIPT.md** — Three surgical edits: (1) Cut *"Watch what happens when I post another job"* — it telegraphs the surprise. (2) After the new job settles, add: cut to new owner's wallet balance widget showing +4.50 USDC. Hold 3 seconds. VO: *"His wallet."* (3) In the stat card section, replace the four-sentence VO with three fragments matching the three cards.

**04_HIGGSFIELD_PROMPTS.md** — Shot 3 iteration tip: add *"The directional change in the particle stream must be clearly legible within the first 8 seconds. Generate a version where the reversal happens at second 6, not second 15. If unclear, generate particle-left and particle-right as separate clips and crossfade."* Also: strengthen all negative prompts with *"no circular UI elements, no 3D holographic displays, no sci-fi dashboard aesthetics, no animated rings."*

**05_CLAUDE_DESIGN_BRIEF.md** — Screen 4 (Inheritance Modal): after the confirmation state, add a requirement: the modal's success state should reveal a small "Owner B" balance line updating in real time below the "Confirm Transfer" button area, before auto-closing. This is the on-screen proof moment. Also: the particle stream animation in the modal should match Shot 3's visual language — same direction of flow, same gold color, same speed.

**06_AI_COUNCIL_PROMPTS.md** — Prompt 7 (Final Demo Polish), Question 3: add *"After the transfer confirms, is there a single verifiable on-screen element that proves the earnings reached the new wallet address? Not a modal saying 'complete' — an actual balance or transaction visible to the judge."*

**07_SUBMISSION_PACK.md** — The README template opens below the hero image with a 4-bullet list. The most compelling sentence in the entire submission — *"The workers themselves are tradeable iNFTs whose reputation, memory, and earnings travel with them across owners"* — is buried in the tagline and "What it does" section. Put a display-styled pull quote here, above the bullets: **"The workers are the assets."** One sentence, largest text on the page. Then the bullets explain.

**08_DAY0_VERIFICATION.md** — Missing from the Day 9 recording checklist: *"Verify both laptop screens are simultaneously legible on camera without panning. Test the camera angle before recording day. The physical handoff needs two screens visible at once — this is a blocking constraint for the inheritance scene."*

**09_BRAND_IDENTITY.md** — Sound section: specify that the inheritance transfer confirmation sound is distinct from the standard transaction confirmation. The standard confirmation is ~330Hz. The transfer confirmation should be a lower, longer tone — something more ceremonial, 200Hz, 400ms, with a slight reverb tail. The ear should register: *this transaction is different from all the others.*

**10_ACTION_NAVIGATOR.md** — Day 9 schedule: before "Record voiceover via Eleven Labs" at 08:00, add a 30-minute step at 07:30: *"Table read of full script aloud. Time the Inheritance section specifically. If 2:15–3:15 runs over 62 seconds or under 55 seconds, adjust pause lengths before recording. VO recorded to a metronome of the script's timing beats, not free-form."* Voiceover recorded without timing reference is the single most common Day 9 failure mode.

---

*Stage 1 complete. Waiting for Stage 2.*
