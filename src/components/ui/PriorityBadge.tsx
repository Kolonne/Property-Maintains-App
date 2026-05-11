import type { RequestPriority } from "@/lib/types";

const LABELS: Record<RequestPriority, string> = {
  low:    "Low priority",
  medium: "Medium priority",
  high:   "High priority",
  urgent: "Urgent",
};

export function PriorityBadge({ priority }: { priority: RequestPriority }) {
  const isUrgent = priority === "urgent";
  return (
    <span
      style={{
        fontSize: "11px",
        fontWeight: 600,
        letterSpacing: "0.5px",
        textTransform: "uppercase",
        color: isUrgent ? "#ff4f00" : "#939084",
      }}
    >
      {LABELS[priority]}
    </span>
  );
}

// used by RequestRow for the card left-border colour
export const priorityBorderColour = (p: RequestPriority): string =>
  p === "urgent" ? "#ff4f00" : "#c5c0b1";
