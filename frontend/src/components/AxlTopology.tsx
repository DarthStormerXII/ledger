// AXL topology: bootstrap top, cloud worker bottom-right, NAT worker bottom-left.
// Direct port of the handoff component — true SVG <animateMotion> packets.
export function AxlTopology() {
  return (
    <div
      style={{
        position: "relative",
        width: 280,
        height: 240,
        margin: "0 auto",
      }}
    >
      <svg
        viewBox="0 0 280 240"
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          overflow: "visible",
        }}
        aria-hidden
      >
        {/* Edges */}
        <line
          x1="140"
          y1="40"
          x2="40"
          y2="200"
          stroke="rgba(245,241,232,0.4)"
          strokeWidth="1"
        />
        <line
          x1="140"
          y1="40"
          x2="240"
          y2="200"
          stroke="rgba(245,241,232,0.4)"
          strokeWidth="1"
        />
        <line
          x1="40"
          y1="200"
          x2="240"
          y2="200"
          stroke="rgba(245,241,232,0.4)"
          strokeWidth="1"
          strokeDasharray="4 4"
        />

        {/* Packets — SVG animateMotion */}
        <circle r="3" fill="var(--ledger-oxblood)">
          <animateMotion
            dur="1.6s"
            repeatCount="indefinite"
            path="M 140 40 L 240 200"
          />
        </circle>
        <circle r="3" fill="var(--ledger-oxblood)">
          <animateMotion
            dur="1.4s"
            repeatCount="indefinite"
            begin="0.5s"
            path="M 240 200 L 40 200"
          />
        </circle>
        <circle r="3" fill="var(--ledger-oxblood)">
          <animateMotion
            dur="1.8s"
            repeatCount="indefinite"
            begin="0.9s"
            path="M 40 200 L 140 40"
          />
        </circle>
        <circle r="3" fill="var(--ledger-oxblood)">
          <animateMotion
            dur="1.6s"
            repeatCount="indefinite"
            begin="0.2s"
            path="M 140 40 L 40 200"
          />
        </circle>

        {/* Nodes */}
        <circle cx="140" cy="40" r="9" fill="var(--ledger-paper)" />
        <circle cx="240" cy="200" r="9" fill="var(--ledger-paper)" />
        <circle cx="40" cy="200" r="9" fill="var(--ledger-paper)" />
      </svg>

      {/* Labels */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 0,
          transform: "translate(-50%, -120%)",
        }}
        className="caps-sm muted"
      >
        Fly sjc
      </div>
      <div
        style={{ position: "absolute", right: -10, bottom: -22 }}
        className="caps-sm muted"
      >
        Fly fra
      </div>
      <div
        style={{ position: "absolute", left: -6, bottom: -22 }}
        className="caps-sm muted"
      >
        NAT laptop
      </div>
    </div>
  );
}
