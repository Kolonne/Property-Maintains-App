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
      className="pm-request-row d-flex align-items-center p-3"
      style={{
        background: "#ffffff",
        border: "1px solid #e8e2da",
        borderLeft: `4px solid ${priorityBorderColour(request.priority)}`,
        borderRadius: "16px",
        gap: "16px",
        marginBottom: "10px",
        cursor: href ? "pointer" : "default",
      }}
    >
      <div className="flex-grow-1 min-w-0">
        <div style={{ fontSize: "16px", fontWeight: 700, color: "#1f2933", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {request.title}
        </div>
        <div className="d-flex align-items-center" style={{ gap: "12px", marginTop: "4px" }}>
          <span style={{ fontSize: "13px", color: "#6b7280" }}>
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
