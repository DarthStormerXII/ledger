import type { LedgerEvent } from "./types.js";

export interface LogEntry {
  ts: number;
  level: "info" | "warn" | "error";
  correlationId: string;
  scope: string;
  msg: string;
  data?: unknown;
}

export class StructuredLogger {
  private readonly entries: LogEntry[] = [];
  private readonly silent: boolean;

  constructor(opts: { silent?: boolean } = {}) {
    this.silent = opts.silent ?? false;
  }

  log(
    level: LogEntry["level"],
    correlationId: string,
    scope: string,
    msg: string,
    data?: unknown,
  ): void {
    const entry: LogEntry = {
      ts: Date.now(),
      level,
      correlationId,
      scope,
      msg,
      data,
    };
    this.entries.push(entry);
    if (!this.silent) {
      const tag = `[${level.toUpperCase()}][${correlationId}][${scope}]`;
      // eslint-disable-next-line no-console
      console.log(`${tag} ${msg}`, data ?? "");
    }
  }

  info(corr: string, scope: string, msg: string, data?: unknown): void {
    this.log("info", corr, scope, msg, data);
  }

  warn(corr: string, scope: string, msg: string, data?: unknown): void {
    this.log("warn", corr, scope, msg, data);
  }

  error(corr: string, scope: string, msg: string, data?: unknown): void {
    this.log("error", corr, scope, msg, data);
  }

  asEvent(entry: LogEntry): LedgerEvent {
    return {
      type: "Log",
      level: entry.level,
      correlationId: entry.correlationId,
      msg: `[${entry.scope}] ${entry.msg}`,
      data: entry.data,
    };
  }

  drain(): LogEntry[] {
    return [...this.entries];
  }
}
