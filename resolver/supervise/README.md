# Resolver supervision

Runs the Ledger ENS resolver under macOS `launchd` so it survives reboots, sleep, and accidental kills during the demo window.

## One-time setup

1. Create the env file outside the repo:

   ```bash
   mkdir -p ~/.config/ledger-resolver
   touch ~/.config/ledger-resolver/env
   chmod 600 ~/.config/ledger-resolver/env
   ```

2. Edit `~/.config/ledger-resolver/env` and add:

   ```sh
   export RESOLVER_PRIVATE_KEY=0x...   # MUST match the on-chain resolver's trusted signer
   export REP_SUMMARIES_JSON='{"worker-001":{"registry":"0x8004B663056A597Dffe9eCcC1965A193B7388713","agentId":"5444","count":47,"average":4.77,"tags":["accuracy:yield-scout","timeliness:yield-scout","communication:yield-scout","analysis:defi","responsiveness:defi","completeness:yield-scout"]}}'
   export MEMORY_POINTERS_JSON='{"worker-001":"0g://0xd8fb3ad312ca5e9002f7bdd47d93839b9a6dcd83d396bb74a44a9f65344982c4","1":"0g://0xd8fb3ad312ca5e9002f7bdd47d93839b9a6dcd83d396bb74a44a9f65344982c4"}'
   export TX_RECEIPTS_JSON='{"escrow-release-001":{"cid":"0g://0xd8fb3ad312ca5e9002f7bdd47d93839b9a6dcd83d396bb74a44a9f65344982c4","intent":"release-payment","outcome":"released","chain":"0g-galileo:16602","amount":"0.0003","receipt":{"txHash":"0x7f7ff8061ba4a68b6963d27abefa601fbde8d9474e8dadd8207d138fc6e1a3e2","taskId":"0x005ecb1bf6cd06a9d1c7240ab1365aebedbe8104d1b530a892fd0af228c1e604","status":3,"escrow":"0x83dF0Ed0b4f3D1D057cB56494b8c7eE417265489"}}}'
   export AGENT_REGISTRATION_VALUE='{"standard":"ENSIP-25","registry":"0x8004B663056A597Dffe9eCcC1965A193B7388713","chain":"base-sepolia","chainId":84532,"agentId":"5444","identityRegistry":"0x8004A818BFB912233c491871b3d84c89A494BD9e"}'
   ```

3. Install the launchd plist:

   ```bash
   cp resolver/supervise/com.ledger.resolver.plist ~/Library/LaunchAgents/
   launchctl load ~/Library/LaunchAgents/com.ledger.resolver.plist
   ```

4. Verify:

   ```bash
   launchctl list | grep com.ledger.resolver
   curl -s http://localhost:8787/health
   curl -s https://resolver.fierypools.fun/health
   ```

## What it does

- Loads `RESOLVER_PRIVATE_KEY` from `~/.config/ledger-resolver/env` (mode 0600 enforced).
- Refuses to run if the env file has lax permissions.
- Restarts automatically if the resolver process exits (KeepAlive: true).
- Logs to `/tmp/ledger-resolver.out.log` and `/tmp/ledger-resolver.err.log`.

## Stop / restart

```bash
launchctl unload ~/Library/LaunchAgents/com.ledger.resolver.plist
launchctl load   ~/Library/LaunchAgents/com.ledger.resolver.plist
```
