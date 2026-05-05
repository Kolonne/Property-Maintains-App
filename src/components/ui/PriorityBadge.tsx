/**
 * PriorityBadge — warm-palette priority indicator.
 *
 * Strictly Zapier rules: no bright colour-wheel decoration.
 * Only "urgent" earns the orange accent; everything else is a
 * subdued uppercase label. The card's left-border (see helper
 * below) follows the same restraint.
 */

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

/**
 * Card left-border colour for priority. Only urgent gets the orange
 * accent; everything else stays in the warm sand palette.
 */
export const priorityBorderColour = (p: RequestPriority): string =>
  p === "urgent" ? "#ff4f00" : "#c5c0b1";
