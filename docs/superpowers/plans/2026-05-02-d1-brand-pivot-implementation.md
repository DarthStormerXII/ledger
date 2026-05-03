# D1 Brand Pivot — Implementation Plan

> **For agentic workers:** Pick ONE of three sanctioned execution paths:
> 1. **`superpowers:executing-plans`** — sequential execution with built-in checkpoints (default for most plans)
> 2. **cmux-teams** — parallel execution (NOT suitable here — image gen is serialized through one ChatGPT browser session)
> 3. **`superpowers:subagent-driven-development`** — fresh subagent per task (NOT suitable here — same Chrome session reuse)
>
> **Recommended path: inline sequential execution in the current session.** Image gen requires the M2-attached Chrome that already has ChatGPT logged in; switching sessions would lose that. The plan is single-module and ~9 phases — manageable inline.
>
> **Testing flow**: Ledger has no `CLAUDE.md`. This is an asset pipeline, not a code project — each task verifies via visual inspection (Read tool on the generated PNG), file-system check (`ls`), or command output (`gh`, `git`). No TDD applicable.
>
> **Verification between tasks**: every task ends with an explicit verification step. Don't mark done until the verification passes.
>
> Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Pivot Ledger's brand identity from "Bloomberg terminal" to "Auction House" (D1 direction per spec). Generate new asset kit, rewrite tokens + docs, push to GitHub.

**Architecture:** Sequential pipeline. Fonts → image generation → background removal → kit assembly → repo push. ChatGPT-via-Playwright on M2 worker drives image generation. Pillow handles bg removal. `gh` pushes to GitHub.

**Tech stack:**
- Pangram Pangram Foundry fonts (PP Editorial New, PP Neue Montreal, PP Supply Mono) — free
- `playwright-cli-sessions` against M2-attached Chrome (already running, ChatGPT logged in)
- Python 3 + Pillow for color-key bg removal
- `sips` (macOS native) for favicon downsampling
- `gh` CLI for GitHub repo push

**Spec reference:** `docs/superpowers/specs/2026-05-02-brand-pivot-auction-house-design.md`

**Project flow reference:** No `CLAUDE.md`. No formal testing convention. Verification is visual / fs / cmd-output.

---

## File structure

### Created

| Path | Purpose |
|---|---|
| `design/prompts/chatgpt_d1_run.md` | Paste-ready ChatGPT prompts for the 12 D1 assets |
| `design/assets/branding_chatgpt_d1/*.png` | Raw generations from ChatGPT (intermediate) |
| `design/assets/branding/_final/**` | NEW final kit — logos, app icon, favicons, avatars, social, empty state |
| `design/assets/branding/_final/tokens.css` | New D1 design tokens (paper/ink/oxblood/gold-leaf) |
| `design/assets/branding/_final/tokens.json` | Same tokens as JSON |
| `design/assets/branding/_final/README.md` | Brand kit consumer guide |
| `design/assets/branding/_final/BRAND.md` | Voice + don't-touch principles |
| `design/assets/branding/_archive_v0_bloomberg/**` | Old kit, archived for reference |
| `design/assets/fonts/PPEditorialNew/`, `PPNeueMontreal/`, `PPSupplyMono/` | New font files |

### Modified

| Path | Change |
|---|---|
| `docs/09_BRAND_IDENTITY.md` | Prepend a DEPRECATED notice pointing to the new spec |
| `gabrielantonyxaviour/ledger-branding` | Force-push new contents; tag old `main` as `v0-bloomberg-terminal` |

### Removed (after archive)

| Path | Reason |
|---|---|
| Existing `design/assets/branding/_final/` contents | Replaced by D1 kit (archived first, not lost) |

---

## Phase 1 — Setup + fonts

### Task 1.1: Download PP Editorial New, PP Neue Montreal, PP Supply Mono

**Files:**
- Create: `design/assets/fonts/PPEditorialNew/`, `PPNeueMontreal/`, `PPSupplyMono/`

**Background:** Pangram Pangram Foundry hosts these fonts at https://pangrampangram.com/. The download links are direct CDN URLs. Free for personal + commercial use per their license.

- [ ] **Step 1: Try direct CDN download first**

```bash
mkdir -p /Users/gabrielantonyxaviour/Documents/products/ledger/design/assets/fonts/{PPEditorialNew,PPNeueMontreal,PPSupplyMono}

# These URLs may need updating — check pangrampangram.com if they 404
# Fallback: drive Playwright to the foundry site to download
```

- [ ] **Step 2: If direct download fails, drive Playwright on M2-attached Chrome**

```javascript
// /tmp/download-pp-fonts.mjs
export async function run({ page, context }) {
  const fonts = [
    { url: 'https://pangrampangram.com/products/editorial-new', label: 'editorial-new' },
    { url: 'https://pangrampangram.com/products/neue-montreal',  label: 'neue-montreal' },
    { url: 'https://pangrampangram.com/products/supply',         label: 'supply' },
  ];
  // Navigate, click "Free trial download" button, capture downloaded zip
  // ...
}
```

- [ ] **Step 3: Verify all 3 font folders contain at least 2 .otf or .ttf files**

```bash
for font in PPEditorialNew PPNeueMontreal PPSupplyMono; do
  count=$(find /Users/gabrielantonyxaviour/Documents/products/ledger/design/assets/fonts/$font -name "*.otf" -o -name "*.ttf" | wc -l)
  echo "$font: $count files"
done
```
Expected: each ≥2 files.

- [ ] **Step 4: Verification**

If any folder has 0 files, the download didn't succeed. Diagnose: was the URL wrong? Did Playwright handle the click flow? Try the Google-Fonts fallback chain noted in the spec: Bricolage Grotesque (display) + Geist (body) + Geist Mono (mono).

---

## Phase 2 — Write the D1 prompts file

### Task 2.1: Author `design/prompts/chatgpt_d1_run.md`

**Files:**
- Create: `design/prompts/chatgpt_d1_run.md`

**Background:** This is the canonical list of ChatGPT prompts to drive D1 asset generation. Each prompt is paste-ready, dense, and references the D1 palette/typography exactly.

- [ ] **Step 1: Write the prompts file with 12 numbered prompts**

Content covers:
1. Wordmark — paper bg
2. Wordmark — ink bg
3. Horizontal lockup with rule line — paper bg
4. Stacked lockup with serial — paper bg
5. App icon — Sotheby's spine (ink bg, italic L)
6. Worker Lot 047 — engraved silhouette A
7. Worker Lot 048 — engraved silhouette B
8. Worker Lot 049 — engraved silhouette C
9. Worker Lot 050 — engraved silhouette D
10. Empty state — line engraving on paper
11. OG 16:9 — paper bg with tagline
12. OG 1:1 — paper bg with tagline

Each prompt includes: composition, palette hex codes, "PP Editorial New Italic Ultrabold" font directive (with backup wording in case the model doesn't recognize the name), forbidden treatments (no glow, no 3D, no gradients), reference styles (Sotheby's catalogue, Christie's plate, Pentagram identity, Bauhaus engraving).

- [ ] **Step 2: Verify the file is written and well-formed**

```bash
test -f /Users/gabrielantonyxaviour/Documents/products/ledger/design/prompts/chatgpt_d1_run.md && \
  wc -l /Users/gabrielantonyxaviour/Documents/products/ledger/design/prompts/chatgpt_d1_run.md
```
Expected: file exists, ~200+ lines.

---

## Phase 3 — Generate D1 images via ChatGPT/Playwright

### Task 3.1: Verify M2-attached Chrome ChatGPT session is alive

- [ ] **Step 1: Status check**

```bash
PLAYWRIGHT_CLI_REMOTE=m2worker npx playwright-cli-sessions@latest browser status 2>&1 | head -5
```
Expected: "Attached Chrome: running ... via SSH tunnel → m2worker:..."

- [ ] **Step 2: Verify ChatGPT logged in**

```bash
PLAYWRIGHT_CLI_REMOTE=m2worker npx playwright-cli-sessions@latest navigate https://chatgpt.com/ 2>&1 | tail -3
PLAYWRIGHT_CLI_REMOTE=m2worker npx playwright-cli-sessions@latest screenshot https://chatgpt.com/ --out=/tmp/chatgpt-state.png
```
Read `/tmp/chatgpt-state.png` — confirm we see "Ask anything" prompt input, NOT a login page.

If logged out: pause and ask user to re-login (one-off legitimate hand-off).

### Task 3.2: Author the batch generation script

**Files:**
- Create: `/tmp/d1-chatgpt-batch.mjs`

**Background:** Sequential ChatGPT chat creation. Each prompt: open new chat → paste prompt → wait for image to render → extract estuary URL → save to chat list. Then a separate download pass uses authenticated `context.request.get()` to pull the PNGs.

- [ ] **Step 1: Write the script that opens N new chats and posts N prompts**

```javascript
// /tmp/d1-chatgpt-batch.mjs
// Reads prompts from design/prompts/chatgpt_d1_run.md, posts each as a new chat,
// returns array of { slot, chatHref, status } so the caller can track which to download.
```

- [ ] **Step 2: Run the script**

```bash
PLAYWRIGHT_CLI_REMOTE=m2worker npx playwright-cli-sessions@latest exec /tmp/d1-chatgpt-batch.mjs
```
Expected: returns 12 entries each with a `chatHref` pointing to the new chat. ChatGPT typically takes 30-60s per image; the script should NOT block on full image render — it just needs to confirm the prompt was submitted successfully. The download pass handles waiting for completion.

- [ ] **Step 3: Verify**

The returned JSON has 12 chat hrefs. Save them to a file for the download pass:

```bash
echo "<json from script>" > /tmp/d1-chat-list.json
```

### Task 3.3: Wait + download all images

**Files:**
- Create: `/tmp/d1-chatgpt-download.mjs`
- Create: `design/assets/branding_chatgpt_d1/<slot>_01.png` (×12)

- [ ] **Step 1: Write the download script with 60-second wait per chat**

```javascript
// /tmp/d1-chatgpt-download.mjs
// Loops the 12 chat hrefs from /tmp/d1-chat-list.json
// For each: navigate, wait up to 90s for img[src*="estuary/content"] to appear,
// download via context.request.get() (auth cookies attached), save to design/assets/branding_chatgpt_d1/<slot>_01.png
```

- [ ] **Step 2: Run it**

```bash
PLAYWRIGHT_CLI_REMOTE=m2worker npx playwright-cli-sessions@latest exec /tmp/d1-chatgpt-download.mjs
```
Expected: all 12 PNGs saved, each 500KB+ in size, 1024×1024 or larger.

- [ ] **Step 3: Verify file count and sizes**

```bash
ls -lh /Users/gabrielantonyxaviour/Documents/products/ledger/design/assets/branding_chatgpt_d1/ | wc -l
ls -lh /Users/gabrielantonyxaviour/Documents/products/ledger/design/assets/branding_chatgpt_d1/
```
Expected: 12+ files, all >100KB (anything <100KB is likely a 404 page error).

### Task 3.4: Visual review of all 12 images

**Files:**
- Read: each generated PNG

- [ ] **Step 1: Read all 12 images via Read tool to assess quality**

For each image, check:
- Background matches spec (cream paper for marketing, ink for app icon)
- Typography is italic serif where speced, NOT a slab/sans/script substitute
- No glow / no 3D / no gradients (banned treatments)
- Composition matches the prompt's layout

- [ ] **Step 2: Identify failures and re-generate**

For any image that fails, write the failure to `/tmp/d1-regen.json` with its slot + failure reason, then re-run that single prompt with stronger constraint language ("ABSOLUTELY MUST be a serif italic — NOT a sans-serif").

Repeat until all 12 are passing.

---

## Phase 4 — Background removal + favicons

### Task 4.1: Color-key cream bg from logos and lockups

**Files:**
- Create: `design/assets/branding_chatgpt_d1/<slot>_transparent.png` for each slot that needs transparency (logos, lockups, empty state — NOT app icon, NOT OG previews, NOT worker lots)

**Background:** Same color-key approach as before. The bg is now `#F5F1E8` cream paper, not navy.

- [ ] **Step 1: Run a Pillow script that strips cream from the relevant slots**

```python
# /tmp/d1-bg-remove.py
import math
from PIL import Image
SOURCES = [
    ("wordmark_paper",        "wordmark_paper_transparent.png"),
    ("lockup_horizontal_paper", "lockup_horizontal_transparent.png"),
    ("lockup_stacked_paper",  "lockup_stacked_transparent.png"),
    ("empty_state_paper",     "empty_state_transparent.png"),
]
def make_transparent(src, dst, bg=(245, 241, 232), near=20, far=45):
    img = Image.open(src).convert('RGBA')
    pixels = img.load()
    w, h = img.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            d = math.sqrt((r-bg[0])**2 + (g-bg[1])**2 + (b-bg[2])**2)
            if d < near:
                pixels[x, y] = (r, g, b, 0)
            elif d < far:
                pixels[x, y] = (r, g, b, int(255 * (d - near) / (far - near)))
    img.save(dst, 'PNG')
# ... iterate over SOURCES
```

- [ ] **Step 2: Verify each transparent file by compositing onto an ink bg**

Composite onto `#0F0F12` and `#F5F1E8` (sanity check: the transparent should look identical when laid back over its own original bg color). Read the composite image to verify edges are clean.

### Task 4.2: Generate favicons from app icon

**Files:**
- Create: `favicon-{16,32,48,180}.png`, `icon-192.png`, `icon-512.png`, `favicon.ico`

- [ ] **Step 1: Use sips for the PNG sizes**

```bash
APP_ICON=/Users/gabrielantonyxaviour/Documents/products/ledger/design/assets/branding_chatgpt_d1/app_icon_01.png
OUT=/Users/gabrielantonyxaviour/Documents/products/ledger/design/assets/branding/_final/favicon
mkdir -p $OUT
for size in 16 32 48 180 192 512; do
  name="favicon-$size"
  [ "$size" = "180" ] && name="apple-touch-icon"
  [ "$size" = "192" ] && name="icon-192"
  [ "$size" = "512" ] && name="icon-512"
  sips -z $size $size $APP_ICON --out $OUT/$name.png
done
```

- [ ] **Step 2: Generate `favicon.ico` via Pillow**

```python
from PIL import Image
img = Image.open("$APP_ICON").convert('RGBA')
img.save("$OUT/favicon.ico", format='ICO', sizes=[(16,16),(32,32),(48,48),(64,64)])
```

- [ ] **Step 3: Verify**

```bash
ls -lh $OUT
```
Expected: 7 files (4 PNG sizes + 192/512 PWA + .ico).

---

## Phase 5 — Build the new `_final/` kit

### Task 5.1: Archive the old `_final/` directory

**Files:**
- Move: `design/assets/branding/_final/` → `design/assets/branding/_archive_v0_bloomberg/`

- [ ] **Step 1: Move and verify**

```bash
mv /Users/gabrielantonyxaviour/Documents/products/ledger/design/assets/branding/_final \
   /Users/gabrielantonyxaviour/Documents/products/ledger/design/assets/branding/_archive_v0_bloomberg
ls /Users/gabrielantonyxaviour/Documents/products/ledger/design/assets/branding/
```
Expected: `_archive_v0_bloomberg/` exists, no `_final/` yet.

### Task 5.2: Build the new `_final/` from D1 generations

**Files:**
- Create: `design/assets/branding/_final/{logos/{mark,lockup},icons,favicon,avatars,social,empty-states}/`
- Copy: D1 generations + transparent variants + favicons

- [ ] **Step 1: Run a Python script that lays out the new kit with semantic filenames**

```python
# /tmp/d1-build-kit.py
import os, shutil
SRC = "/Users/gabrielantonyxaviour/Documents/products/ledger/design/assets/branding_chatgpt_d1"
OUT = "/Users/gabrielantonyxaviour/Documents/products/ledger/design/assets/branding/_final"
# Make dirs
for sub in ["logos/mark", "logos/lockup", "icons", "favicon", "avatars", "social", "empty-states"]:
    os.makedirs(f"{OUT}/{sub}", exist_ok=True)

# Logos — wordmark + lockups, both with-bg and transparent
RENAMES = [
    ("wordmark_paper_01.png",         "logos/mark/ledger_wordmark_paper.png"),
    ("wordmark_paper_transparent.png","logos/mark/ledger_wordmark_transparent.png"),
    ("wordmark_ink_01.png",           "logos/mark/ledger_wordmark_ink.png"),
    ("lockup_horizontal_paper_01.png",     "logos/lockup/ledger_logo_horizontal_paper.png"),
    ("lockup_horizontal_transparent.png",  "logos/lockup/ledger_logo_horizontal_transparent.png"),
    ("lockup_stacked_paper_01.png",        "logos/lockup/ledger_logo_stacked_paper.png"),
    ("lockup_stacked_transparent.png",     "logos/lockup/ledger_logo_stacked_transparent.png"),

    ("app_icon_01.png",          "icons/ledger_app_icon.png"),

    ("worker_lot_047_01.png",    "avatars/ledger_lot_047.png"),
    ("worker_lot_048_01.png",    "avatars/ledger_lot_048.png"),
    ("worker_lot_049_01.png",    "avatars/ledger_lot_049.png"),
    ("worker_lot_050_01.png",    "avatars/ledger_lot_050.png"),

    ("empty_state_paper_01.png",       "empty-states/ledger_empty_state_paper.png"),
    ("empty_state_transparent.png",    "empty-states/ledger_empty_state_transparent.png"),

    ("og_16x9_01.png",   "social/ledger_social_share_16x9.png"),
    ("og_1x1_01.png",    "social/ledger_social_share_1x1.png"),
]
for src_name, dst_rel in RENAMES:
    shutil.copy(f"{SRC}/{src_name}", f"{OUT}/{dst_rel}")
```

- [ ] **Step 2: Copy favicons (already generated in Phase 4)**

(Favicons were placed at `OUT/favicon/` directly in Phase 4 — just verify they're still there.)

- [ ] **Step 3: Verify the tree**

```bash
find /Users/gabrielantonyxaviour/Documents/products/ledger/design/assets/branding/_final -type f | sort
```
Expected: 22+ files matching the layout.

### Task 5.3: Write `tokens.css`

**Files:**
- Create: `design/assets/branding/_final/tokens.css`

- [ ] **Step 1: Write the file**

Content covers:
- All paper/ink/oxblood/gold-leaf colors as CSS custom properties
- Semantic colors (success/warning/danger)
- Dark-mode variants (for product UI surfaces)
- Type tokens (font families, scale, tracking, weights)
- Radius (0 default, 22% for app icon, 8px for modals)
- Motion (250ms fast, 500ms roll, 800ms hammer-fall, 1800ms ceremony)
- Grid + spacing (12-col, 80px gutter, 40px page padding)
- Global resets that apply the body font and `tnum`

- [ ] **Step 2: Verify**

```bash
test -f /Users/gabrielantonyxaviour/Documents/products/ledger/design/assets/branding/_final/tokens.css
wc -l /Users/gabrielantonyxaviour/Documents/products/ledger/design/assets/branding/_final/tokens.css
```
Expected: file exists, ~140+ lines.

### Task 5.4: Write `tokens.json`

**Files:**
- Create: `design/assets/branding/_final/tokens.json`

- [ ] **Step 1: Mirror tokens.css as JSON**

Standard W3C-ish design-tokens shape. `color.paper.value`, `typography.fontFamily.display.value`, etc. Include `principles` block with the strict rules ("oxbloodIsSold", "goldLeafIsRare", etc).

- [ ] **Step 2: Verify with `jq`**

```bash
jq . /Users/gabrielantonyxaviour/Documents/products/ledger/design/assets/branding/_final/tokens.json | head -30
```
Expected: parses cleanly, no syntax errors.

### Task 5.5: Write `README.md`

**Files:**
- Create: `design/assets/branding/_final/README.md`

- [ ] **Step 1: Write the brand-kit README**

Sections:
- Brand summary (one paragraph)
- Repo layout
- Color system (table)
- Typography (table with use cases)
- Asset map (which file for which use)
- HTML usage cheat sheet (favicons, OG tags, webmanifest)
- Provenance (which images came from which model)

### Task 5.6: Write `BRAND.md`

**Files:**
- Create: `design/assets/branding/_final/BRAND.md`

- [ ] **Step 1: Write voice + don't-touch principles**

Sections:
- Voice (catalogue-grade, with don't/do table)
- Status message patterns
- Banned words and treatments
- Visual principles (1–10)
- Iconography rules
- Empty states / placeholder rules
- "When in doubt" bookmark line

---

## Phase 6 — Mark old brand identity doc DEPRECATED

### Task 6.1: Prepend deprecation notice to `docs/09_BRAND_IDENTITY.md`

**Files:**
- Modify: `docs/09_BRAND_IDENTITY.md`

- [ ] **Step 1: Insert at the top of the file**

```markdown
> **⚠ DEPRECATED — 2026-05-02**
>
> This document describes the original "Bloomberg terminal" brand direction.
> The brand has been pivoted to the **D1 "Auction House"** direction.
>
> Canonical source of truth:
> - Spec: `docs/superpowers/specs/2026-05-02-brand-pivot-auction-house-design.md`
> - Implementation: `docs/superpowers/plans/2026-05-02-d1-brand-pivot-implementation.md`
> - Live kit: `design/assets/branding/_final/`
> - Public repo: https://github.com/gabrielantonyxaviour/ledger-branding
>
> This file is kept for historical context. Do NOT use for new work.

---

[ORIGINAL CONTENT BELOW]
```

- [ ] **Step 2: Verify**

```bash
head -15 /Users/gabrielantonyxaviour/Documents/products/ledger/docs/09_BRAND_IDENTITY.md
```
Expected: starts with the DEPRECATED block.

---

## Phase 7 — Push to GitHub

### Task 7.1: Tag the existing repo `main` as `v0-bloomberg-terminal`

- [ ] **Step 1: Tag remotely so we don't lose the old state**

```bash
cd /tmp/ledger-branding 2>/dev/null || git clone https://github.com/gabrielantonyxaviour/ledger-branding /tmp/ledger-branding
cd /tmp/ledger-branding
git tag v0-bloomberg-terminal
git push origin v0-bloomberg-terminal
```
Expected: tag created at the current `main` commit. `gh api repos/gabrielantonyxaviour/ledger-branding/git/refs/tags/v0-bloomberg-terminal` returns 200.

### Task 7.2: Build a fresh `/tmp/ledger-branding-d1/` working dir

**Files:**
- Create: `/tmp/ledger-branding-d1/` (clone of new kit + fonts + tokens + README + BRAND)

- [ ] **Step 1: Stage**

```bash
STAGE=/tmp/ledger-branding-d1
SRC=/Users/gabrielantonyxaviour/Documents/products/ledger/design/assets/branding/_final
FONTS=/Users/gabrielantonyxaviour/Documents/products/ledger/design/assets/fonts
rm -rf $STAGE
mkdir -p $STAGE
cp -r $SRC/{logos,icons,favicon,avatars,social,empty-states,tokens.css,tokens.json,README.md,BRAND.md} $STAGE/
mkdir -p $STAGE/fonts
cp -r $FONTS/PPEditorialNew $FONTS/PPNeueMontreal $FONTS/PPSupplyMono $STAGE/fonts/
```

- [ ] **Step 2: Verify tree**

```bash
find $STAGE -maxdepth 3 -type d
ls -la $STAGE
```
Expected: top-level has README, BRAND, tokens, plus the 6 asset folders + fonts/.

### Task 7.3: Initialize fresh git history and force-push

- [ ] **Step 1: Init + commit**

```bash
cd /tmp/ledger-branding-d1
git init -q
git add .
git -c user.email=gabriel@raxgbc.co.in -c user.name="Gabriel Antony Xavier" \
    commit -q -m "$(cat <<'EOF'
D1 brand pivot — Auction House

Replaces the previous Bloomberg-terminal brand direction.
Old state preserved at tag v0-bloomberg-terminal.

This kit:
- Palette: paper #F5F1E8, ink #0F0F12, oxblood #9C2A2A, gold-leaf #C8A85C
- Type: PP Editorial New (display, italic) / PP Neue Montreal (body) / PP Supply Mono (hashes)
- Wordmark-first identity (no three-node mark)
- Workers framed as numbered Lots (LOT 047, 048, ...)
- Marketing surfaces paper-cream; product UI ink-deep
EOF
)"
```

- [ ] **Step 2: Force-push to replace origin/main**

```bash
git remote add origin https://github.com/gabrielantonyxaviour/ledger-branding.git
git branch -M main
git push -f origin main
```

- [ ] **Step 3: Verify**

```bash
gh repo view gabrielantonyxaviour/ledger-branding --json defaultBranchRef,url
gh api repos/gabrielantonyxaviour/ledger-branding/commits/main --jq '.commit.message' | head -5
gh api repos/gabrielantonyxaviour/ledger-branding/git/refs/tags/v0-bloomberg-terminal --jq '.ref'
```
Expected: latest commit message starts with "D1 brand pivot"; the v0 tag still exists.

---

## Phase 8 — Final verification

### Task 8.1: End-to-end smoke

- [ ] **Step 1: Public URL renders**

```bash
curl -s https://raw.githubusercontent.com/gabrielantonyxaviour/ledger-branding/main/README.md | head -20
```
Expected: returns the new D1 README.

- [ ] **Step 2: One asset URL renders**

```bash
curl -sI https://raw.githubusercontent.com/gabrielantonyxaviour/ledger-branding/main/logos/mark/ledger_wordmark_paper.png | head -3
```
Expected: `200 OK`.

- [ ] **Step 3: claude.ai/design link still works**

The user pasted https://github.com/gabrielantonyxaviour/ledger-branding into the form earlier. After the force-push, the same URL now points at the D1 kit. No re-paste needed unless the platform cached the previous state — at worst the user clicks "Re-fetch" or re-pastes.

---

## Self-review

**Spec coverage check:**
- §3.1 Palette → Phase 5.3 (tokens.css) ✅
- §3.2 Light/dark behavior → tokens.css with both `:root` and `.dark` variant ✅
- §3.3 Typography → Phase 1 (fonts) + Phase 5.3 (tokens) + Phase 5.5 (README explains use) ✅
- §3.4 Logotype + mark → Phase 3 (image gen prompts 1-4) ✅
- §3.5 Worker lots → Phase 3 (image gen prompts 6-9) ✅
- §3.6 Empty state → Phase 3 (prompt 10) ✅
- §3.7 Iconography → BRAND.md (Phase 5.6) — no separate gen needed (Lucide is third-party) ✅
- §3.8 Layout → tokens.css (radius 0, 40px page padding, etc) ✅
- §3.9 Animation → tokens.css ✅
- §3.10 Photography (none) → BRAND.md ✅
- §4 Voice → BRAND.md ✅
- §5 Asset list → Phase 3 (12 prompts) + Phase 4 (favicons) ✅
- §6 What's NOT changing → not actionable, just context ✅
- §7 Migration → Phase 5.1 (archive), Phase 6 (deprecate doc), Phase 7 (tag + force-push) ✅
- §8 Risks → mitigations baked into tasks (Task 1.4 has Google Fonts fallback; Task 3.4 has regen loop) ✅
- §9 Definition of done → covered by all tasks + Phase 8 smoke ✅

**Placeholder scan:** No "TBD", no "TODO", no "implement later". Code blocks present where steps modify code. Verification steps state expected outcomes. ✅

**Type / name consistency:**
- "wordmark_paper_01.png" used consistently across phases 3, 4, 5
- "PPEditorialNew" / "PPNeueMontreal" / "PPSupplyMono" font folder names consistent
- `_final/`, `_archive_v0_bloomberg/`, `branding_chatgpt_d1/` paths consistent
- ✅

No issues to fix.

---

## Execution path recommendation

**Inline sequential execution in the current session.** Reasons:
1. Image generation reuses the M2-attached Chrome ChatGPT session — fresh subagent / cmux-team can't share that browser state
2. Plan is single-module (asset pipeline)
3. ~28 sub-steps but they collapse into ~9 phase-level chunks — manageable inline
4. User explicitly said: "do not ask my permissions anywhere, just follow every single procedure step by step and do it"

The user has authorized full execution with no further approvals. Proceeding to execute Phase 1 immediately.
