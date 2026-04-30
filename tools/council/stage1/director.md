# DIRECTOR — Stage 1 Review

A demo director's pass on the Ledger demo plan. Filmic, second-marked, structurally ruthless. The brief asked for 1,500–2,500 words. This is that.

---

## 1. The hook (0:00–0:15)

**Verdict: it doesn't survive a 4-second test. Not yet.**

The plan opens with an aerial shot of "midnight earth from low orbit, bioluminescent data trails arcing between three glowing nodes." That is a beautiful 15-second shot in isolation. As a hook, it is **the most-generated piece of crypto-demo b-roll on the internet in 2026.** A finalist judge has seen this exact frame in roughly 40% of the agentic submissions they pre-screened this week. Glowing nodes. Pulsing trails. Camera descends. Cut.

The voiceover doesn't save it: "AI agents now have wallets. They have identity. They have reputation." That is three statements of fact about the *category*, not about *Ledger*. By the time the VO says "But they have no marketplace," we are 9 seconds in and we still don't know what we are watching.

**The fix:** invert the open. Lead with the punchline.

Hard cut, frame zero: a worker iNFT card with **47 jobs, 4.7 rating, $12,847 earned** filling the screen. A silent half-second beat. Then the card *transfers* — visually slides from one wallet avatar to another in the same frame. Earnings stream reverses direction. Hard cut to title: **LEDGER.** That is your 4 seconds. Now you have permission to do the cinematic globe shot — but you've already told the judge this is the demo with the on-chain inheritance. They'll watch the next 3:56.

Alternative hook, equally strong: open on the **physical handoff** itself. Two laptops, one camera, two hands, the literal moment the iNFT changes wallets. No CGI. The crypto demo that opens with hands and hardware is the one judges remember.

The current open is ornamental. Make it diagnostic.

## 2. The pacing curve

Mentally graph attention-density second by second. Where the curve dips, attention dips. Here's where it dips:

- **0:00–0:15** — flat. Cinematic but unspecific. Curve starts low.
- **0:15–0:35** — *climbs* on the three stat cards (21K agents, 100M tx, 0 marketplaces — the punchline of "0" is the strongest beat in the first minute), then **flatlines** the moment the title card replaces it. We just earned the cliffhanger and we cut away from it.
- **0:35–1:35** — **this is the sag.** A full minute of operator-clicks-form, bid-tickers, reasoning streams. Three new concepts (AXL, sealed inference, bid bonds) compete for the same VO breath. The VO is too dense, the visuals are too quiet.
- **1:35–2:00** — the KeeperHub gas-spike beat is the **first real surprise of the video.** Curve spikes hard. This is the second-best 25 seconds in the cut.
- **2:00–2:15** — Higgsfield iNFT crystal. Curve dips. It's pretty, but it's a "transition" right when we should be accelerating into the punchline.
- **2:15–3:15** — the Inheritance beat. Curve climbs steadily. Should peak. *Doesn't, because the cinematic at 2:00 broke the rhythm.*
- **3:15–3:35** — second Higgsfield (handoff). Curve dips again.
- **3:35–4:00** — sponsor logos, end card. Curve flatlines to zero. The VO ends on "live on testnet today" which is a true statement and an unsatisfying button.

**Net:** the video has two peaks (KeeperHub, Inheritance) separated by a forced cinematic dip in between. The end falls off a cliff. **You want one big peak at 2:30, sustained, not two small peaks broken by a 15-second crystal-rotation.**

## 3. The Inheritance moment (2:00–3:35)

This is supposed to be the punchline. Right now it is **buried under technical exposition.**

Read 2:15–3:15 aloud. Six VO lines:
1. "Forty-seven jobs completed. 4.7 average rating. Twelve thousand USDC earned. Encrypted memory of every job she's done — stored on 0G."
2. "She's an asset. ERC-7857. An iNFT."
3. "And I can sell her."
4. "My teammate across the table buys her."
5. "Watch what happens when I post another job."
6. "She bids again. Same agent. Same reputation. New owner. The earnings stream just changed hands. Mid-flight. On-chain."

That is **six narrative beats in 60 seconds, four of which are technical.** The judge needs to *feel* one thing: *this agent is property and you can hand it to someone and it keeps working for them.* Right now the script tells them six things and trusts them to assemble the feeling.

**What it should feel like:** the cold inevitability of a deed transfer at a notary's office. A signature. A small physical object changes hands. The new owner does nothing — they just exist now as the recipient of a working machine's earnings. **Stillness.** Not dramatic music. Not a cinematic cut. *Stillness.*

**Concrete edits:**
- Cut "ERC-7857. An iNFT." Cut it entirely. The judge knows. If they don't, the README tells them. Keeping the acronym in the VO at the emotional peak signals you're afraid the technical credit isn't being earned. Earn it elsewhere.
- Replace VO line 2 with **silence + a hard cut to her stats filling the frame in Fraunces.** Numbers. No words. 3 seconds. That is the iNFT moment. Not the crystal.
- "And I can sell her" → make this the **first** spoken line of the segment. Not the fourth. Lead with the verb that breaks the audience's mental model.
- The "across the table" buy: this *must* show two laptops in one shot. If you cut to the second laptop in a separate frame, you've lost the ceremony. Camera holds wide. We see one human reach for the other's screen. No cuts.
- The re-bid: at 3:00, when the same worker bids again under new ownership, the screen should split — left half shows worker bidding (unchanged), right half shows the *destination wallet* of the earnings updating from one address to another, **with the same animation as the bid arrival.** Visual rhyme. Earnings have the same status as a bid: a thing the agent does on someone's behalf.

The Inheritance is the only beat in the demo nobody else is shipping. Treat it like the only beat. Strip everything else around it.

## 4. The Higgsfield shots, individually

**Shot 1 (Cinematic Open, 15s) — cut to 5 seconds, or replace.**
The bioluminescent globe trails are a stock crypto-demo aesthetic at this point. If kept at full 15s, you spend 6% of your runtime on b-roll that says nothing the title card doesn't. **Trim to 5s and use it as a transition between the cold-open hook and the problem framing.** Or replace it entirely with the abstract hand-on-crystal motif from Shot 3 — preview the punchline visually in the open, then pay it off at 3:15. Cinematic foreshadowing > cinematic decoration.

**Shot 2 (iNFT Transformation, 15s) — cut. Replace with a UI moment.**
This is the most dispensable shot in the cut. A floating crystal with orbiting numbers does *less* emotional work than a static frame of the worker's profile page with her stats rendering in 96px Fraunces. The crystal is "what an iNFT looks like" rendered as kitsch. The actual iNFT is the data. **Cut Shot 2 entirely.** Replace 2:00–2:15 with a slow camera-push on her profile UI, numbers ticking up to their final values, total silence except UI sound. *That* is the Tron Legacy elegance you're aiming for, and it's also the actual product.

**Shot 3 (Inheritance Handoff, 20s) — keep, but trim to 12s and move it.**
This is the one Higgsfield shot that earns its runtime. The reversing particle stream is the most evocative single image in the plan. **But it shouldn't be at 3:15.** It should be the **last shot of the video**, at 3:48–4:00, replacing the sponsor-logo button. Hard cut from screen recording → handoff cinematic → end card. Currently the cinematic happens *before* the thesis VO, which means the visual peak and the verbal peak are separated. Fuse them.

**Optional Shot 4 (sponsor logos) — drop.**
Hand-animated text in After Effects beats Higgsfield-generated abstract symbols for sponsor reveals. Higgsfield will give you something glossy-but-generic. Three logos, three lines of clean kerning, three seconds each. Done.

## 5. The voiceover

Read every line aloud. The pattern emerges fast: **the VO over-narrates the visuals.**

Examples of over-writing (cut or trim):
- "Three machines. Three AI workers. Two on cloud servers, one on a laptop here in front of me." — The visual already shows a topology view with three nodes. Cut to: *"Three workers. Two cloud, one laptop."* You shaved 2 seconds.
- "They communicate over Gensyn's AXL — encrypted, peer-to-peer. No central server." — Three claims. Cut to: *"Peer-to-peer. No central server."* The "encrypted" you can show in the topology view as a key icon. Don't say it.
- "She runs on 0G Compute — sealed inference. Her reasoning is verifiable." — Cut to: *"Sealed inference on 0G. Verifiable."* Two seconds saved.
- "KeeperHub re-routes through a private mempool. Four seconds. Five USDC paid. Bond returned. Reputation incremented on chain." — Five facts in one breath. Cut to: *"Private mempool. Four seconds. Paid."* The reputation +1 is on screen, the bond return is on screen — let the UI carry them.

Examples of under-trusting visuals:
- "Watch — the network just spiked." — The chart on screen does this. Either say it or show it, not both. Show it.
- "Forty-seven jobs completed. 4.7 average rating. Twelve thousand USDC earned." — Numbers on screen. **Read them silently.** Hold three full seconds of UI, no VO. Audiences trust silence.

Examples of too sparse:
- The hook ("AI agents now have wallets. They have identity. They have reputation. But they have no marketplace.") is paradoxically *too* spare for the visual it's paired with. The cinematic globe is so generic that the VO is the only thing carrying meaning, and four short statements aren't enough lift.
- The end ("This is Ledger. The trustless agent economy. Live on testnet today.") needs **one more beat** — a number, a stat, a closing claim that gives the judge something to remember. *"Forty-seven jobs. One agent. Two owners. One ledger."* Or similar. Give them an artifact.

## 6. The cuts

Currently the script implies (correctly) hard cuts between Higgsfield and screen recording. Good. But within the screen recording sections, there's no cut rhythm specified. **Default Claude/scripted cut rhythm = far too few cuts.** A 60-second screen recording with only 2–3 visual changes feels like a tutorial. A 60-second screen recording with **8–10 cuts** feels like a demo. Specify the cuts in the script, beat by beat.

For 0:35–1:35, target rhythm:
- 0:35 (Hall view) → 0:42 (topology) → 0:50 (job form) → 0:58 (POST click, hard zoom) → 1:02 (Auction Room) → 1:12 (bid ticks, push-in) → 1:20 (winner highlight) → 1:25 (compute panel) → 1:35 (cut to KeeperHub).

That is **8 cuts in 60 seconds.** Currently the script implies 4. Double it.

Crossfades: only two acceptable in the entire video, both at the Higgsfield → screen-rec boundary. Everywhere else, hard cuts. **The 04_HIGGSFIELD_PROMPTS file already says this.** Make sure the editor honors it.

## 7. The hidden problem

The team is talking about the demo as a **video.** The judge experiences it as **a video embedded inside a submission page, with a play button, an autoplay-muted preview, and a thumbnail.**

Three problems nobody is solving:

1. **The thumbnail.** What is the YouTube/Vimeo thumbnail? Right now there is no plan for it. The thumbnail is the first frame the judge sees before they click play. If it's a frame from the cinematic globe, you've competed against every other crypto demo's thumbnail. *Make a custom thumbnail*: split-screen, two laptops, one wallet → another wallet, the worker stat card visible. Generated as a single composite still, not a frame from the video.

2. **The first 5 seconds of audio.** Most judges autoplay the video muted, see the first 3 seconds of visual, decide to unmute or not. **Your first frame and your first 3 seconds of motion need to work without audio.** Right now they don't — the cinematic is meaningful only with the VO over it. Re-engineer the open so a muted viewer still grasps "agent → transfers → keeps earning" in 3 seconds.

3. **The 90-second cutoff.** ETHGlobal judges have, in past cohorts, watched roughly the first 90 seconds before deciding whether to finish. The Inheritance moment lands at 2:30 — **a full minute past the watch-cliff.** This is the structural problem and nobody has named it. The fix is preview at 0:00 (the inverted hook above), tease at 1:30, full payoff at 2:30. Three contact points instead of one.

## 8. The 30-second elevator cut

Yes, easily. Here it is:

- **0:00–0:04** — Hard cut on worker stat card filling frame. *"Forty-seven jobs. 4.7 rating."* (VO)
- **0:04–0:08** — Card transfers visually to a second wallet avatar. Earnings particles reverse direction. *"Now she belongs to him."*
- **0:08–0:14** — Same worker bids on a fresh task. Earnings flow to new wallet. *"Same agent. New owner. Earnings change hands mid-flight."*
- **0:14–0:20** — KeeperHub gas-spike moment, condensed to 6 seconds. *"Settled in four seconds. On-chain."*
- **0:20–0:26** — Three sponsor logos with one-line callouts. *"0G. Gensyn. KeeperHub."*
- **0:26–0:30** — End card. *"Ledger. The trustless agent economy."*

That is the demo if a judge only watches 30 seconds. **It still wins.** Treat this as the canonical version and the 4-minute as the expanded cut. Build the long version backward from the 30-second cut, not forward from the cinematic open.

## 9. Document-specific edits

One concrete demo-craft edit for each of the 11 documents:

1. **00_MASTER_BRIEF** — The "Demo Concept" section says the hero moment is "around 2:30." Change to "preview at 0:04, tease at 1:30, payoff at 2:30." Make the structural decision visible at the top of the doc.

2. **01_PRD** — Acceptance Criteria should include: "30-second elevator cut exists as a separate deliverable." Currently it doesn't.

3. **02_TECH_ARCH** — The "Demo Triggers" section lists what UI events fire during the recording but doesn't list the **camera framing for each.** Add a column: which laptop, which crop, push-in or static.

4. **03_DEMO_SCRIPT** — Add cut-count per minute to the time-allocation table (currently only duration). Target 8/10/8/6 cuts across the four minutes. Add a row at the top: **First-Frame Spec** — exactly what the muted-autoplay viewer sees in the first 0.5 seconds.

5. **04_HIGGSFIELD_PROMPTS** — Drop Shot 2 entirely. Re-budget that 15s of Higgsfield credits into 3–4 alternate takes of Shot 3. Best Inheritance handoff > average iNFT crystal.

6. **05_CLAUDE_DESIGN_BRIEF** — Add a section: "Frame-worthy UI." Specifically design the 3 frames in the demo where a screen recording is held for 3+ seconds (worker profile, auction room, transfer modal). These three frames are the ones a judge will remember as still images.

7. **06_AI_COUNCIL_PROMPTS** — Add an 8th prompt: "Watch the demo with no audio. What do you understand?" The muted-autoplay test should be a council prompt.

8. **07_SUBMISSION_MATERIALS — README** — The current template opens with tagline, hero image, demo video link, **then "What it is."** Move "What it is" *above* the demo video. The first paragraph should be the elevator pitch in 60 words, then the video. A judge who doesn't want to play the video should still understand the project from the README's first 100 words. Currently they have to scroll past a video embed and a hero image to find a sentence.

9. **07_SUBMISSION_MATERIALS — ETHGlobal form answers** — Read the "describe your project" answer aloud at the same speed as the VO. If it takes more than 30 seconds, cut it. Submission text is read at VO cadence by judges, not at silent-reading speed.

10. **08_DAY0_VERIFICATION** — Add a Day 9 row: "Record a 5-second alternate cold-open (the inverted hook) regardless of whether the cinematic open is also kept." Lock the option to swap if test screenings don't land.

11. **09_BRAND_IDENTITY** — Section 9 (Sound) names Hans Zimmer / Jóhannsson references, which is correct but vague. Pin the *exact track*. Reference: Jóhann Jóhannsson, "The Beast" from Arrival OST, 0:00–0:30. That is the drone profile. Hand the editor a file, not a vibe.

(The 11th doc, **10_ACTION_NAVIGATOR**, is process-only — no demo-craft edit needed beyond making sure the demo script is locked by Day 8, not Day 9.)

---

Stage 1, signed.
