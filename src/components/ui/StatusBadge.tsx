/**
 * StatusBadge — warm-palette pill for a maintenance request status.
 *
 * Strictly Zapier-faithful: only sand / cream / charcoal / orange.
 * Three visual tiers:
 *   - "open"      → light-sand pill (in flight, no action needed)
 *   - "attention" → orange-accented pill (needs someone to act)
 *   - "closed"    → dark pill (done) or muted (archived)
 */

import type { RequestStatus } from "@/lib/types";

type Tier = "open" | "attention" | "done" | "archived";

const STATUS_MAP: Record<RequestStatus, { label: string; tier: Tier }> = {
  submitted:                  { label: "Submitted",         tier: "open" },
  acknowledged:               { label: "Acknowledged",      tier: "open" },
  in_progress:                { label: "In Progress",       tier: "open" },
  awaiting_parts:             { label: "Awaiting Parts",    tier: "open" },
  awaiting_landlord_approval: { label: "Awaiting Approval", tier: "attention" },
  landlord_approved:          { label: "Approved",          tier: "open" },
  completed:                  { label: "Completed",         tier: "done" },
  closed:                     { label: "Closed",            tier: "archived" },
};

const TIER_STYLES: Record<Tier, React.CSSProperties> = {
  open: {
    background: "#eceae3",
    color: "#36342e",
    border: "1px solid #c5c0b1",
  },
  attention: {
    background: "#fffefb",
    color: "#ff4f00",
    border: "1px solid #ff4f00",
  },
  done: {
    background: "#201515",
    color: "#fffefb",
    border: "1px solid #201515",
  },
  archived: {
    background: "#fffdf9",
    color: "#939084",
    border: "1px solid #c5c0b1",
  },
};

export function StatusBadge({ status }: { status: RequestStatus }) {
  const { label, tier } = STATUS_MAP[status];
  return (
    <span
      style={{
        ...TIER_STYLES[tier],
        display: "inline-block",
        fontSize: "11px",
        fontWeight: 600,
        letterSpacing: "0.5px",
        textTransform: "uppercase",
        padding: "4px 10px",
        borderRadius: "3px",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}
