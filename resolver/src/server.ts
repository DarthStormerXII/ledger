import { createServer } from "node:http";
import { handleHttp } from "./http.js";

const port = Number.parseInt(process.env.PORT ?? "8787", 10);

createServer((req, res) => {
  handleHttp(req, res).catch(error => {
    res.writeHead(500, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }));
  });
}).listen(port, () => {
  process.stdout.write(`ledger ENS resolver listening on http://localhost:${port}\n`);
});
