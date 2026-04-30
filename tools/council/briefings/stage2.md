# Council Stage 2 — Cross-Critique

You completed Stage 1. Three other council members did the same. Their reviews and yours have been bundled, anonymized as **Response A, B, C, D**, in:

```
/Users/gabrielantonyxaviour/Documents/products/ledger/tools/council/stage2_bundle.md
```

(Your own Stage 1 response is somewhere in that bundle. You may or may not recognize it. Evaluate every response equally and honestly — including your own. Self-correction is part of the value of this stage.)

## Your task

Produce a Stage 2 review that does four things:

### Section 1 — Per-response evaluation

For each of Response A, B, C, D in turn, write one paragraph (5–8 sentences) covering:

- **What this critic got right** — the most important thing the team must internalize from this lens. Be specific.
- **What this critic got wrong, missed, or overstated** — the one or two places this lens led them astray, or where they missed a constraint that another lens caught.
- **Whether the document-specific changes they propose are correctly stated** — would applying their suggested edits actually improve the doc, or do they have a hidden cost? One sentence answer per response.

Four paragraphs total, one per response.

### Section 2 — Cross-cutting consensus

The 3 strongest findings where two or more responses converge from different angles. For each:

- Name the finding in one sentence.
- Cite which responses make the case (e.g. "B and D both flag X, from strategist and director angles").
- Name the concrete document edit that captures the consensus.

These are the highest-priority changes — they emerged from independent angles, so they are the most defensible.

### Section 3 — Conflicts the team must adjudicate

1–2 places where two responses give incompatible advice. The team has to choose. Identify the conflict, name the responses, and state the criterion the team should use to decide.

### Section 4 — Final ranking

End your response with this exact format (this is parseable; do not add prose around it):

```
FINAL RANKING:
1. Response X
2. Response Y
3. Response Z
4. Response W
```

Rank by **overall actionable value of the critique** — which response, if its changes were fully applied, would most improve the project's odds of placing in finalist + sponsor bounties? The "best" response is the one with the highest delta to outcome, not the one that's most polite or most comprehensive.

## Where to write

```
/Users/gabrielantonyxaviour/Documents/products/ledger/tools/council/stage2/<your-persona>.md
```

Where `<your-persona>` is one of: `architect`, `strategist`, `redteam`, `director`. (You know which one you are — it's in your Stage 1 brief.)

## How to signal completion

After the file is written, run this exact command and press Enter:

```
cmux send --surface surface:60 "[COUNCIL:<your-persona>] STAGE2 done — see stage2/<your-persona>.md" && cmux send-key --surface surface:60 Enter
```

## Tone for Stage 2

- Honest about your own response if you recognize it. If you wrote Response B and on rereading you see it under-weighted X, say so. Self-corrections are valuable.
- Direct about the others. Don't soften criticism to be collegial.
- Specific. If you say a critic missed something, name what they missed and why it matters.

When the file is written and the lead is pinged, Stage 2 is done. Wait silently for Stage 3.
