import type { IncomingMessage, ServerResponse } from "node:http";
import { loadConfig } from "./config.js";
import { handleGatewayRequest } from "./ens.js";

const CORS_HEADERS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,POST,OPTIONS",
  "access-control-allow-headers": "content-type"
};

export async function handleHttp(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (req.method === "OPTIONS") {
    send(res, 204, "");
    return;
  }

  if (req.url === "/health") {
    sendJson(res, 200, {
      ok: true,
      service: "ledger-ens-resolver",
      parentName: loadConfig().parentName
    });
    return;
  }

  try {
    const request = req.method === "POST" ? await readPost(req) : readGet(req);
    const response = await handleGatewayRequest(request, loadConfig());
    sendJson(res, 200, response);
  } catch (error) {
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : "Unknown resolver error"
    });
  }
}

function readGet(req: IncomingMessage): { sender: string; callData: string } {
  const url = new URL(req.url ?? "/", "http://resolver.local");
  const [sender, callData] = url.pathname.split("/").filter(Boolean);
  if (!sender || !callData) {
    throw new Error("GET requests must use /<sender>/<callData>");
  }
  return { sender, callData };
}

async function readPost(req: IncomingMessage): Promise<{ sender: string; callData: string }> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.from(chunk));
  }
  const body = JSON.parse(Buffer.concat(chunks).toString("utf8")) as {
    sender?: string;
    data?: string;
    callData?: string;
  };
  if (!body.sender || (!body.data && !body.callData)) {
    throw new Error("POST body must include sender and data");
  }
  return { sender: body.sender, callData: body.data ?? body.callData ?? "" };
}

function sendJson(res: ServerResponse, statusCode: number, body: unknown): void {
  send(res, statusCode, JSON.stringify(body), "application/json");
}

function send(
  res: ServerResponse,
  statusCode: number,
  body: string,
  contentType = "text/plain"
): void {
  res.writeHead(statusCode, {
    ...CORS_HEADERS,
    "content-type": contentType
  });
  res.end(body);
}
