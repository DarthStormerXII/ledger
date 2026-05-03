import Link from "next/link";

export function Footer() {
  return (
    <footer className="footer">
      <span className="footer-wm">Ledger</span>
      <span className="footer-edition">
        NO. 0001 — ETHGLOBAL OPEN AGENTS 2026
      </span>
      <div className="footer-links">
        <Link href="/pitch">Pitch</Link>
        <Link href="/proof">Proof</Link>
        <a
          href="https://github.com/DarthStormerXII/ledger"
          target="_blank"
          rel="noreferrer noopener"
        >
          GitHub
        </a>
        <a
          href="https://ethglobal.com/showcase/ledger-bineb"
          target="_blank"
          rel="noreferrer noopener"
        >
          Demo
        </a>
        <a
          href="https://x.com/gabrielaxyeth"
          target="_blank"
          rel="noreferrer noopener"
        >
          X
        </a>
        <Link href="/terms">Terms</Link>
        <Link href="/privacy">Privacy</Link>
      </div>
    </footer>
  );
}
