import type { RequestPriority } from "@/lib/types";

const LABELS: Record<RequestPriority, string> = {
  low:    "Low priority",
  medium: "Medium priority",
  high:   "High priority",
  urgent: "Urgent",
};

const PRIORITY_STYLES: Record<RequestPriority, React.CSSProperties> = {
  low: {
    background: "#fffdf9",
    color: "#939084",
    border: "1px solid #c5c0b1",
  },
  medium: {
    background: "#eceae3",
    color: "#36342e",
    border: "1px solid #c5c0b1",
  },
  high: {
    background: "#fffefb",
    color: "#a8593e",
    border: "1px solid #a8593e",
  },
  urgent: {
    background: "#fffefb",
    color: "#ff4f00",
    border: "1px solid #ff4f00",
  },
};

export function PriorityBadge({ priority }: { priority: RequestPriority }) {
  return (
    <span
      style={{
        ...PRIORITY_STYLES[priority],
        display: "inline-block",
        fontSize: "11px",
        fontWeight: 600,
        letterSpacing: "0.5px",
        textTransform: "uppercase",
        borderRadius: "999px",
        padding: "4px 9px",
        lineHeight: 1,
        whiteSpace: "nowrap",
      }}
    >
      {LABELS[priority]}
    </span>
  );
}

// used by RequestRow for the card left-border colour
export const priorityBorderColour = (p: RequestPriority): string =>
  p === "urgent"
    ? "#ff4f00"
    : p === "high"
      ? "#a8593e"
      : p === "medium"
        ? "#8d6a78"
        : "#c5c0b1";
