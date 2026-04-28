# Ledger — Higgsfield Prompts

**Tool:** Higgsfield AI Ultimate (you have access)
**Total cinematic budget:** ~27 seconds across 2 shots (Shot 2 cut entirely; budget reallocated to Shot 1/3 retakes)
**Style anchor:** Blade Runner 2049 cinematography meets Apple keynote restraint
**Pipeline:** Two-stage — Stage A image gen (multi-model comparison) → Stage B image-to-video (Cinema Studio with explicit camera/lens + camera move from menu)

---

## Two-Stage Pipeline (Apply To Every Shot)

Per the YouTube workshop learnings, native text-to-video produces inconsistent results and Cling 3 has a strong bias to inject auto-dialogue and foley. The fix: **never go straight to text-to-video**. Always produce a hero start frame as a still first, then drive Higgsfield image-to-video off that frame with explicit cinematic controls.

### Stage A — Start Frame (image generation, multi-model comparison)

For each shot, generate the start frame in **4–5 different image models** and pick the best one as the input to Stage B:

1. **Soul 2** — sharpest cinematic lens emulation, strongest for locked-off frames
2. **Nano Banana Pro** — best for warm, atmospheric lighting on figures
3. **Seedream 4.0** — strongest for abstract geometric forms and crystalline surfaces
4. **GPT Image** — strongest for compositional clarity (rule-of-thirds adherence)
5. **Cinema Studio (image tab)** — best for matching the in-app Cinema Studio look you'll inherit in Stage B

Generate 3–5 seeds per model. Curate 1 winner per model. Compare side-by-side. Pick the one with the strongest light direction, cleanest negative space, and highest perceived production value. **That winning frame is the input to Stage B.**

### Stage B — Image-to-Video (Higgsfield Cinema Studio)

Drop the winning Stage A frame into Cinema Studio's image-to-video tab. Use explicit controls — never free-text the camera move:

- **Camera/lens:** select from the dropdown (e.g. "full-frame cine + 24mm" or "anamorphic + 50mm")
- **Camera move:** select from the menu (e.g. "slow dolly in," "locked-off," "slow push down")
- **Audio specification (mandatory in every video prompt):** `no dialogue, no foley, low ambient drone only` — Cling 3's audio engine will inject voice and sound effects unless you suppress them explicitly

### Gemini Prompt-Helper Checkpoint

Before submitting any Stage B generation, paste your chosen Stage A frame into Gemini, describe the animation you want (camera move, focal point, particle behavior, ambient mood), and ask Gemini to write a refined Higgsfield video prompt for that exact frame. **Append the literal suffix `DO NOT GENERATE — JUST GIVE ME THE PROMPT`** so Gemini doesn't try to generate the video itself. Use Gemini's output as your Stage B prompt.

---

## Shot 1 — Cinematic Open (0:00–0:15, 15 seconds)

### Stage A — Start frame prompt

```
Cinematic aerial frame, midnight earth from low orbit. Bioluminescent
data trails arcing between three glowing nodes — one in San Francisco,
one in Berlin, one in Tokyo. The trails read like fiber-optic veins at
30% opacity. Atmosphere of quiet technological sublime. Color palette:
deep navy, electric cyan, warm gold accents. Frame composed for a slow
descent toward the San Francisco node — that node sits at the lower
golden-ratio intersection. Style: Blade Runner 2049 meets Apple keynote.
16:9. The San Francisco node lit with a warm gold pulse #E8D4A0.
```

Run this in Soul 2, Nano Banana Pro, Seedream 4.0, GPT Image, and Cinema Studio image tab. Pick the strongest single frame.

### Stage B — Image-to-video controls

- **Lens:** Cinema Studio → full-frame cine + 24mm
- **Camera move:** slow dolly down + slight push in
- **Duration:** 15s
- **Audio:** `no dialogue, no foley, low ambient drone only`

### Stage B prompt (paste into Cinema Studio i2v after Gemini refinement)

```
Hold the framing of the input image. Slow dolly down toward the
San Francisco node, with a gentle push in over 15 seconds. The bioluminescent
fiber-optic trails subtly pulse at 30% opacity throughout. End on the
San Francisco node lighting up with a single warm gold pulse #E8D4A0
at frame 14.5s, holding through 15s. No dialogue, no foley, low ambient
drone only.
```

### Negative prompt
```
no logos, no text overlays, no rocket ships, no humans, no neon green,
no glitchy crypto aesthetics, no 3D wireframe globe cliches, no glow
particles overload, no chromatic aberration, no auto-generated voice,
no synthetic dialogue, no UI sound effects
```

### Iteration tips
- If first generation feels too generic "tech globe," push the Stage A prompt toward "Ridley Scott blockbuster opening shot."
- If the trails look like garish neon, replace "bioluminescent" with "fiber-optic glow at 30% opacity" in Stage A.
- Goal: someone watching this should not immediately think "crypto demo."

---

## Shot 2 — CUT

**Director's call (Opus): the iNFT crystal cinematic has been removed entirely.**

The reasoning: the actual iNFT IS the data. A cinematic crystal vessel adds nothing the worker profile UI doesn't already convey — and the contrast between the cinematic crystal and the literal data dashboard reads as inconsistent. The replacement (2:00–2:15) is a slow camera push on the worker profile UI itself, in 96px Fraunces, showing the ENS capability tree on the right. That happens in screen recording, not Higgsfield.

**Budget reallocated:** Shot 2's generation budget is folded into additional Shot 1 and Shot 3 retakes — aim for ~10 generations on each remaining shot.

---

## Shot 3 — Inheritance Handoff (3:48–4:00, 12 seconds, closing cinematic)

Trimmed from 20s → 12s. Moved from 3:15–3:35 → 3:48–4:00 (the demo's closing beat). Locked-off framing, almost still, particle reversal generated in slow-motion and **sped up in post-production** rather than direction-reversed natively (Higgsfield's native reverse looks artifacted; slow-mo source sped up gives a cleaner result).

### Stage A — Start frame prompt

```
Two figures standing in a void of soft warm-white light, faceless and
abstract — silhouettes only, no detailed features. Frame composed locked-off,
the handoff happens at the golden ratio intersection. The figure on the
left holds a glowing geometric data artifact extending across a center
line of warm gold particles toward the figure on the right. The artifact
emits a soft golden pulse. Color: warm gold #E8D4A0 against muted blue-grey.
Style: Denis Villeneuve composition, Roger Deakins lighting. 16:9.
```

Run in all 5 models. Pick the cleanest silhouettes with strongest light direction.

### Stage B — Image-to-video controls

- **Lens:** Cinema Studio → anamorphic + 50mm
- **Camera move:** locked-off (no movement)
- **Duration:** generate at 12s, in slow-motion mode (effective ~30s of action), then speed up 2.5× in post to land at 12s
- **Audio:** `no dialogue, no foley, low ambient drone only`

### Stage B prompt (paste into Cinema Studio i2v after Gemini refinement)

```
Locked-off frame, almost still. Over the duration of the clip in slow-motion,
the artifact transfers from the left figure's hand to the right figure's
hand. Golden particles flow gradually — initially drifting toward the left
figure, then pausing as the artifact crosses center, then resolving toward
the right figure as the artifact fully lands. The artifact pulses brighter
on contact with the new hand. Cinematic, slow-motion, emotional weight.
No dialogue, no foley, low ambient drone only.
```

(Sped up 2.5× in post to land at 12s final duration.)

### Negative prompt
```
no detailed faces, no specific clothing, no recognizable people, no
text, no logos, no obvious crypto symbols, no money/dollar signs,
no rapid cuts, no flashy effects, no auto-generated voice, no synthetic
dialogue, no UI sound effects
```

### Iteration tips
- Generate slow-motion natively, speed up 2.5× in After Effects/Resolve. Do NOT ask Higgsfield to reverse direction natively — the artifacting is visible.
- The two figures must read as anonymous/universal. If they look too specific, push toward "abstract bipedal silhouettes" in Stage A.
- The particle direction reversal during the speed-up looks cleanest if the Stage A frame already shows the artifact at the center line (the moment of crossing).

---

## Sponsor Sigil Sequence — CUT

**Director's call: dropped entirely.** The original optional bonus shot (three abstract geometric symbols representing the sponsors) has been replaced with a hard-cut After Effects animation of the **real sponsor logos** — 0G, Gensyn AXL, ENS. Real logos communicate the integration faster than abstract sigils and don't burn Higgsfield budget. See `docs/03_DEMO_SCRIPT.md` 3:30–3:48.

---

## Image Generation (for static assets)

Beyond video, you may want stills for:
1. **Worker iNFT artwork** — 3-4 unique generated portraits (reduced from 10 — strategist's call: 3-4 hero portraits well-iterated beats 10 mediocre ones)
2. **Hero image for README** — single composition combining the visual themes
3. **OG / social preview image** — for the public deployment

### Worker iNFT artwork prompt (reuse for each unique worker)
```
Abstract geometric portrait of an AI agent — concentric circles,
hexagonal lattice patterns, fractal nested structures. No face, no
human features. Treat like a precision watch dial. Background:
deep ink #0A0E1A. Foreground: the geometric form rendered in cyan
#5FB3D4 with pale gold #E8D4A0 accents at key intersections.
Symmetrical, balanced, elegant. Style: Bauhaus design meets
generative art. Square format, 1024×1024.
```

Generate 3-4 of these with seed variations. Use them for the worker leaderboard, the auction cards, and the iNFT detail pages. Run all 5 image models per portrait, pick the best.

### Hero image for README
```
Wide cinematic composition, 16:9. Three glowing nodes connected by
fiber-optic data trails in mid-foreground. In the foreground: an
abstract geometric data form representing an iNFT (no crystal vessel —
the form itself stands alone). Subtle grid receding to vanishing point
in the background. Color: cyan and pale gold against deep ink. Mood:
institutional, restrained, slightly futuristic. Style: cover image
for a Stripe Press book about AI agents. 1920×1080.
```

---

## Budget Check

| Asset | Estimated cost |
|---|---|
| Shot 1 (15s) | ~10 generations × cost-per-15s (multi-model Stage A + Stage B retakes) |
| Shot 2 | CUT — budget reallocated |
| Shot 3 (12s, closing) | ~10 generations × cost-per-12s (multi-model Stage A + slow-mo Stage B retakes) |
| Worker portraits (3-4 stills) | 3-4 × cost-per-image × 5 model comparison |
| Hero / OG images | 2 × cost-per-image × 5 model comparison |

Plan for ~25 generations across all assets. Don't accept the first take on any of them. The cinematic quality is what separates a finalist demo from a Round 1 elimination.

---

## Post-Production Notes

- All Higgsfield clips render at fixed 30fps. If your screen recording is 60fps, downsample to 30 to match.
- Color-grade all clips to the same LUT (warm shadow, cool highlight, slight desaturation). Free LUTs from FilmConvert or just a custom one in DaVinci Resolve.
- Keep cuts hard between Higgsfield → screen recording. Don't crossfade — the contrast (cinematic to functional) is part of the demo's rhythm.
- Audio: a single subtle low-frequency drone bed for the cinematic shots, ducking under the voiceover. **In every Higgsfield video prompt, the audio specification line `no dialogue, no foley, low ambient drone only` is mandatory** — without it, Cling 3 auto-injects synthetic voice and UI sounds. No music during screen recordings — let the UI sounds (transaction confirmations, bid alerts) do the work.
- Shot 3 specifically: speed up the slow-motion source 2.5× in post to land at 12s — do NOT use Higgsfield's native direction reversal.
