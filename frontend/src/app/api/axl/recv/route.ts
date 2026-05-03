import { NextResponse } from "next/server";

/**
 * Live AXL recv proxy with a server-side ring buffer.
 *
 * The upstream `/recv` (or `/receive`) endpoint on the local AXL bridge is
 * single-consumer — it drains messages on read. To let the UI show recent
 * activity we drain the upstream every poll into a small in-memory ring,
 * then return the recent N to the client. Strictly local-process state.
 *
 * If the upstream is unavailable, the route returns 503. The client must
 * surface an explicit empty state — never fake data.
 */

const AXL_BRIDGE = process.env.LEDGER_AXL_BRIDGE ?? "http://127.0.0.1:9002";
const RING_CAP = 128;

export type AxlMessage = {
  receivedAt: number;
  fromPeerId?: string;
  payload: unknown;
};

// Module-scoped ring (per Next.js dev process). Survives across requests in
// the same node process. Acceptable for the single-process demo bridge.
const ring: AxlMessage[] = [];

function pushRing(msg: AxlMessage) {
  ring.push(msg);
  if (ring.length > RING_CAP) ring.splice(0, ring.length - RING_CAP);
}

async function drainUpstream(): Promise<{ ok: boolean; drained: number }> {
  let drained = 0;
  for (let i = 0; i < 32; i++) {
    let resp: Response;
    try {
      resp = await fetch(`${AXL_BRIDGE}/recv`, {
        cache: "no-store",
        signal: AbortSignal.timeout(1500),
      });
    } catch {
      // Older bridge versions exposed /receive instead of /recv.
      try {
        resp = await fetch(`${AXL_BRIDGE}/receive`, {
          cache: "no-store",
          signal: AbortSignal.timeout(1500),
        });
      } catch {
        return { ok: false, drained };
      }
    }
    if (resp.status === 204 || resp.status === 404) break;
    if (!resp.ok) return { ok: false, drained };
    const fromPeerId = resp.headers.get("x-from-peer-id") ?? undefined;
    const text = await resp.text();
    if (!text) break;
    let payload: unknown = text;
    try {
      payload = JSON.parse(text);
    } catch {
      /* keep raw text */
    }
    pushRing({ receivedAt: Date.now(), fromPeerId, payload });
    drained++;
  }
  return { ok: true, drained };
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const limit = Math.min(
    Number(url.searchParams.get("limit") ?? 32) || 32,
    RING_CAP,
  );
  const taskId = url.searchParams.get("taskId")?.toLowerCase();

  const drainResult = await drainUpstream();
  if (!drainResult.ok && ring.length === 0) {
    return NextResponse.json(
      {
        error: "axl_bridge_unavailable",
        bridge: AXL_BRIDGE,
        hint: "Start the AXL daemon — see proofs/axl-proof.md.",
      },
      { status: 503 },
    );
  }

  const filtered = taskId
    ? ring.filter((m) => {
        const p = m.payload as { taskId?: string } | undefined;
        return (
          typeof p?.taskId === "string" && p.taskId.toLowerCase() === taskId
        );
      })
    : ring;

  const out = filtered.slice(-limit).reverse();

  return NextResponse.json({
    ok: true,
    bridge: AXL_BRIDGE,
    drained: drainResult.drained,
    bufferSize: ring.length,
    messages: out,
  });
}
