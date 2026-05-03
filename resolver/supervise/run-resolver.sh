#!/usr/bin/env bash
# Run the Ledger ENS resolver under launchd supervision.
# Reads RESOLVER_PRIVATE_KEY from a private file outside the repo:
#   ~/.config/ledger-resolver/env
# That file MUST have mode 0600. It is .gitignored by virtue of being outside the repo.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="${LEDGER_RESOLVER_ENV:-$HOME/.config/ledger-resolver/env}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "[resolver] missing $ENV_FILE — see resolver/supervise/README.md" >&2
  exit 1
fi

# Permission check: refuse to load an env file that isn't 0600/0400.
PERM=$(stat -f '%A' "$ENV_FILE")
if [[ "$PERM" != "600" && "$PERM" != "400" ]]; then
  echo "[resolver] $ENV_FILE has insecure perms ($PERM); chmod 600 it" >&2
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

# Defaults — only set if env file didn't already.
: "${PORT:=8787}"
: "${PARENT_ENS_NAME:=ledger.eth}"
: "${GALILEO_RPC:=https://evmrpc-testnet.0g.ai}"
: "${GALILEO_CHAIN_ID:=16602}"
: "${BASE_SEPOLIA_RPC:=https://sepolia.base.org}"
: "${WORKER_INFT_ADDRESS:=0xd4d74E089DD9A09FF768be95d732081bd542E498}"
: "${REPUTATION_REGISTRY_ADDRESS:=0x8004B663056A597Dffe9eCcC1965A193B7388713}"

export PORT PARENT_ENS_NAME GALILEO_RPC GALILEO_CHAIN_ID BASE_SEPOLIA_RPC \
  WORKER_INFT_ADDRESS REPUTATION_REGISTRY_ADDRESS

cd "$ROOT"
NODE_BIN="${NODE_BIN:-$HOME/.local/share/fnm/node-versions/v24.14.0/installation/bin/node}"
exec "$NODE_BIN" dist/src/server.js
