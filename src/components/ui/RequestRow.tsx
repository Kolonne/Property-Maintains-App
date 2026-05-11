import Link from "next/link";
import { StatusBadge } from "./StatusBadge";
import { PriorityBadge, priorityBorderColour } from "./PriorityBadge";
import type { MaintenanceRequest } from "@/lib/types";

interface RequestRowProps {
  request: Pick<MaintenanceRequest, "request_id" | "title" | "status" | "priority" | "submitted_at">;
  href?: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-AU", { year: "numeric", month: "short", day: "numeric" });
}

export function RequestRow({ request, href }: RequestRowProps) {
  const inner = (
    <div
      className="d-flex align-items-center p-3"
      style={{
        background: "#fffefb",
        border: "1px solid #c5c0b1",
        borderLeft: `3px solid ${priorityBorderColour(request.priority)}`,
        borderRadius: "5px",
        gap: "16px",
        marginBottom: "8px",
        cursor: href ? "pointer" : "default",
      }}
    >
      <div className="flex-grow-1 min-w-0">
        <div style={{ fontSize: "16px", fontWeight: 600, color: "#201515", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {request.title}
        </div>
        <div className="d-flex align-items-center" style={{ gap: "12px", marginTop: "4px" }}>
          <span style={{ fontSize: "13px", color: "#939084" }}>
            Submitted {formatDate(request.submitted_at)}
          </span>
          <PriorityBadge priority={request.priority} />
        </div>
      </div>
      <div className="flex-shrink-0">
        <StatusBadge status={request.status} />
      </div>
    </div>
  );

  return href ? (
    <Link href={href} style={{ textDecoration: "none" }}>
      {inner}
    </Link>
  ) : inner;
}
