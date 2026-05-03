import type { IncomingMessage, ServerResponse } from "node:http";
import { handleHttp } from "./http.js";

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  await handleHttp(req, res);
}
