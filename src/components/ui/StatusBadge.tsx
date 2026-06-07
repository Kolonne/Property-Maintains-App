import type { RequestStatus } from "@/lib/types";

type Tier = "open" | "attention" | "progress" | "approved" | "done" | "archived";

const STATUS_MAP: Record<RequestStatus, { label: string; tier: Tier }> = {
  submitted:                  { label: "Submitted",         tier: "open" },
  acknowledged:               { label: "Acknowledged",      tier: "open" },
  in_progress:                { label: "In Progress",       tier: "progress" },
  awaiting_landlord_approval: { label: "Awaiting Approval", tier: "attention" },
  landlord_approved:          { label: "Approved",          tier: "approved" },
  completed:                  { label: "Completed",         tier: "done" },
  closed:                     { label: "Closed",            tier: "archived" },
};

const TIER_STYLES: Record<Tier, React.CSSProperties> = {
  open: {
    background: "#eceae3",
    color: "#36342e",
    border: "1px solid #c5c0b1",
    boxShadow: "inset 3px 0 0 #c5c0b1",
  },
  attention: {
    background: "#fffefb",
    color: "#ff4f00",
    border: "1px solid #ff4f00",
    boxShadow: "inset 3px 0 0 #ff4f00",
  },
  progress: {
    background: "#fffefb",
    color: "#a8593e",
    border: "1px solid #a8593e",
    boxShadow: "inset 3px 0 0 #a8593e",
  },
  approved: {
    background: "#fffefb",
    color: "#8d6a78",
    border: "1px solid #8d6a78",
    boxShadow: "inset 3px 0 0 #8d6a78",
  },
  done: {
    background: "#7d8a6a",
    color: "#fffefb",
    border: "1px solid #7d8a6a",
  },
  archived: {
    background: "#fffdf9",
    color: "#939084",
    border: "1px solid #c5c0b1",
  },
};

export function StatusBadge({
  status,
  label: labelOverride,
}: {
  status: RequestStatus;
  label?: string;
}) {
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
        padding: "5px 11px",
        borderRadius: "999px",
        whiteSpace: "nowrap",
        lineHeight: 1,
      }}
    >
      {labelOverride ?? label}
    </span>
  );
}
