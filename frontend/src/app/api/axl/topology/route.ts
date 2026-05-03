import { NextResponse } from "next/server";

/**
 * Live AXL topology proxy.
 * Calls the local AXL HTTP bridge at 127.0.0.1:9002. If the bridge is
 * unreachable (daemon not running), returns 503 — the client must surface
 * an explicit empty state rather than fake mesh data.
 */

const AXL_BRIDGE = process.env.LEDGER_AXL_BRIDGE ?? "http://127.0.0.1:9002";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const resp = await fetch(`${AXL_BRIDGE}/topology`, {
      cache: "no-store",
      signal: AbortSignal.timeout(2000),
    });
    if (!resp.ok) {
      return NextResponse.json(
        {
          error: "axl_bridge_error",
          status: resp.status,
          bridge: AXL_BRIDGE,
        },
        { status: 502 },
      );
    }
    const body = await resp.json();
    return NextResponse.json({ ok: true, topology: body });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        error: "axl_bridge_unavailable",
        detail: err instanceof Error ? err.message : String(err),
        bridge: AXL_BRIDGE,
      },
      { status: 503 },
    );
  }
}
