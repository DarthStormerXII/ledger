#!/usr/bin/env sh
set -eu

if [ -n "${AXL_PRIVATE_KEY_B64:-}" ]; then
  printf '%s' "$AXL_PRIVATE_KEY_B64" | base64 -d > private.pem
else
  openssl genpkey -algorithm ed25519 -out private.pem
fi

cat > node-config.json <<JSON
{
  "PrivateKeyPath": "private.pem",
  "Peers": ${AXL_PEERS_JSON:-[]},
  "Listen": ${AXL_LISTEN_JSON:-[]},
  "api_port": ${AXL_API_PORT:-9002},
  "bridge_addr": "${AXL_BRIDGE_ADDR:-127.0.0.1}",
  "tcp_port": ${AXL_TCP_PORT:-7000}
}
JSON

exec /app/node -config node-config.json
