# Alt-Council Stage 2 — Cross-Critique of All 9 Ideas

You completed Stage 1 with 3 ideas. The other two council members did the same. **All 9 ideas have been bundled, anonymized, and cross-shuffled** as Idea A through Idea I:

```
/Users/gabrielantonyxaviour/Documents/products/ledger/tools/council_alt/stage2_bundle.md
```

(Three of the 9 ideas are yours. You may recognize them. You may not. Evaluate every idea equally and honestly — including any you wrote. Self-correction is part of the value of this stage.)

## Reminder: scope constraint

Solo dev. ~24–40h budget. Polish > complexity. 1–2 bounties max from: **0G Track A ($15K), Uniswap ($5K), ENS-AI ($2.5K), ENS-Creative ($2.5K)**. Sponsor must *love* it, not just accept it. The submission must be unimpeachable on demo day — no hand-waving, no pre-recorded backup, no "well, in production this would..."

## Your task — four sections

### Section 1 — Per-idea evaluation (9 short paragraphs)

For each Idea A through I, write 4–6 sentences covering:

- **Sponsor-love verdict** — would the sponsor's lead engineer screenshot this and PR it into their own monorepo? Why or why not, citing specific bounty signals.
- **Hour realism** — is the proposer's hour budget honest, or undercosted by 50%+? Name the specific chunk that's underestimated.
- **Polish risk** — where does this look mediocre on demo day even if functional? One specific failure mode.
- **Asymmetric edge** — does this have an unfair advantage (taste, scarce knowledge, non-obvious primitive composition), or could 30 other teams produce the same thing?

### Section 2 — Top 3 ideas (best-to-worst, with rationale)

After evaluating all 9, identify the 3 strongest. For each:

- One sentence on why it beat the others.
- One sentence on its specific weakness still worth noting.
- The single hour-pain you'd budget that the proposer didn't.

### Section 3 — Synthesis opportunity

Are any 2 ideas in the bundle better as a *merged* single idea than as separate proposals? If yes, name the merge and why it's stronger than either alone. If no, say "no productive merges" and move on. (Do not force a merge.)

### Section 4 — FINAL RANKING (parseable; required format)

End with this exact format:

```
FINAL RANKING:
1. <Idea letter>
2. <Idea letter>
3. <Idea letter>
4. <Idea letter>
5. <Idea letter>
6. <Idea letter>
7. <Idea letter>
8. <Idea letter>
9. <Idea letter>
```

Rank by: **probability that a 4-person team [edit from your previous solo brief — the team is actually 4-person] could ship this in 30h such that the sponsor reacts with "ship it" and we place top-3 in at least one bounty.** (We're now considering using one of these alt-path ideas as the **Slot-3 sponsor for the main Ledger project**, replacing KeeperHub. The team has 4 builders and ~30 hours. Some ideas re-cost more cheaply at team-of-4 scale; others don't benefit much from extra hands. Reflect that in your ranking.)

## Where to write

```
/Users/gabrielantonyxaviour/Documents/products/ledger/tools/council_alt/stage2/<your-persona>.md
```

Where `<your-persona>` is one of: `whisperer`, `pragmatist`, `inventor` — you know which one you are.

## How to signal completion

After the file is written, run this exact command:

```
cmux send --surface surface:60 "[ALT-COUNCIL:<your-persona>] STAGE2 done — see council_alt/stage2/<your-persona>.md" && cmux send-key --surface surface:60 Enter
```

## Tone for Stage 2

- Honest about your own ideas if you recognize them. If on rereading one of yours is weaker than you thought, demote it. Self-corrections matter more than ego protection.
- Direct about others' ideas. If you think Idea X is mid even though it's polished, say so.
- Specific. If you fault hour estimates, name the specific chunk and explain why. If you praise sponsor-love, cite the line in the bounty brief that the idea answers.
- The ranking criterion changed: solo → 4-person team, ~30h, "Slot 3 of main Ledger project." Adjust your judgment accordingly.

When the file is written and the lead is pinged, Stage 2 is done. Wait silently for Stage 3.
