---
description: Reconcile docs/SUBMISSION.md, current git/proof state, live Ledger URLs, and the ETHGlobal Open Agents draft. Updates the dashboard only for material changes and never final-submits without Gabriel approval.
---

# `/sync-submission` — ETHGlobal draft sync

Use this before final submission, after any sponsor-proof commit, or whenever another cmux tab lands a meaningful Ledger change.

`docs/SUBMISSION.md` is the source of truth. If the repo/proofs changed, update that file first, then update the ETHGlobal dashboard only if the live draft is materially stale.

## Safety Rules

- Run browser work on the M2 worker only: `PLAYWRIGHT_CLI_REMOTE=m2worker`.
- Do not use local M4 Chrome unless Gabriel explicitly authorizes it.
- Do not click the final ETHGlobal Submit button. Saving draft fields is allowed; final submit needs Gabriel's explicit approval.
- Do not paste unverified claims.
- Preserve unrelated dirty files from other cmux sessions.

## Phase 1 — Current State

Run:

```bash
node tools/submission/sync-state.mjs --json
```

Use the JSON to record the current `HEAD`, public repo refs, dirty count, live route status, contract verification manifest, commit-pinned code anchors, and stale address hits.

Hard fail if any stale deployment address appears outside the allowed guard text:

- old WorkerINFT `0x48B051F3e565E394ED8522ac453d87b3Fa40ad62`
- old LedgerEscrow `0x12D2162F47AAAe1B0591e898648605daA186D644`
- old LedgerEscrow `0xCAe1c804932AB07d3428774058eC14Fb4dfb2baB`
- old LedgerIdentityRegistry `0xa6a621e9C92fb8DFC963d2C20e8C5CB4C5178cBb`
- old MockTEEOracle `0x229869949693f1467b8b43d2907bDAE3C58E3047`

## Phase 2 — Update `docs/SUBMISSION.md` First

If state changed, update:

- captured timestamp in IST and UTC
- current `HEAD`, subject, and `origin/main`
- public repo refs
- dirty count
- live route checks
- production and backup aliases
- contract verification lane
- commit-pinned line-of-code URLs

Run `node tools/submission/sync-state.mjs --json` again. Continue only when `submissionHasHead=true` and stale hits are empty.

## Phase 3 — Decide Whether ETHGlobal Needs Editing

Update the live ETHGlobal draft only for material changes:

- repository URL or commit-pinned code anchors changed
- live deployment/proof URL changed
- contract addresses, verification status, or proof files changed
- sponsor prize text changed
- 0G, Gensyn, or ENS framing changed
- contact handles changed

Ignore spelling-only or uncommitted non-submission changes.

## Phase 4 — Browser Sync on M2

Use attached M2 Chrome:

```bash
zsh -lc 'echo $PLAYWRIGHT_CLI_REMOTE'
tailscale status 2>/dev/null | grep -E 'workers-macbook-pro|100\.115\.214\.82'
npx playwright-cli-sessions@latest browser status || npx playwright-cli-sessions@latest browser start
npx playwright-cli-sessions@latest navigate 'https://ethglobal.com/auth?use_redirect=/events/openagents/project'
```

If login is required, complete it in the M2 Chrome window or use available Gmail MCP OTP tools. Do not ask Gabriel to open his own browser.

Inspect existing form values before editing. Compare against `docs/SUBMISSION.md`.

Update only stale material fields:

- project name: `Ledger`
- short description
- long description
- how it is made
- demo video / live deployment / proof dashboard / backup alias
- GitHub repository
- tech stack tags
- 0G sponsor block
- Gensyn sponsor block
- ENS sponsor block
- lead contact: Telegram `@gabrielaxyy`, X `@gabrielaxyeth`

After saving, re-open or re-read the form state and confirm the saved values match `docs/SUBMISSION.md`.

## Phase 5 — Output

Report current `HEAD`, whether `docs/SUBMISSION.md` changed, whether ETHGlobal changed, fields changed, saved/draft state observed, and anything requiring Gabriel approval.
