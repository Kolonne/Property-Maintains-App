"use client";

import { useMemo, useState } from "react";
import type { MaintenanceRequestListItem } from "@/lib/queries/maintenance";
import type { RequestPriority, RequestStatus, UserRole } from "@/lib/types";
import MaintenanceRowActions from "./MaintenanceRowActions";
import StatusBadge from "./StatusBadge";
import { PriorityBadge } from "@/components/ui/PriorityBadge";

type MaintenanceTableProps = {
    role: UserRole;
    requests: MaintenanceRequestListItem[];
};

type SortKey = "title" | "propertyUnit" | "status" | "priority" | "submittedAt";
type SortDirection = "asc" | "desc";

const priorityRank: Record<RequestPriority, number> = {
    urgent: 1,
    high: 2,
    medium: 3,
    low: 4,
};

const statusRank: Record<RequestStatus, number> = {
    submitted: 1,
    acknowledged: 2,
    in_progress: 3,
    awaiting_landlord_approval: 4,
    landlord_approved: 5,
    completed: 6,
    closed: 7,
};

const tenantInProgressStatuses: RequestStatus[] = [
    "in_progress",
    "awaiting_landlord_approval",
    "landlord_approved",
];

function getPropertyUnitLabel(request: MaintenanceRequestListItem) {
    const suburb = request.property_suburb ? `, ${request.property_suburb}` : "";
    const unit = request.unit_number ? `Unit ${request.unit_number}` : `Unit ${request.unit_id}`;

    return `${request.property_address}${suburb} - ${unit}`;
}

function getTenantStatusLabel(status: RequestStatus) {
    return tenantInProgressStatuses.includes(status) ? "Working on it" : undefined;
}

function formatDate(value: string) {
    return new Date(value).toLocaleDateString("en-AU", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

function compareRequests(
    a: MaintenanceRequestListItem,
    b: MaintenanceRequestListItem,
    key: SortKey
) {
    if (key === "priority") {
        return priorityRank[a.priority] - priorityRank[b.priority];
    }

    if (key === "status") {
        return statusRank[a.status] - statusRank[b.status];
    }

    if (key === "submittedAt") {
        return new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime();
    }

    const left =
        key === "propertyUnit" ? getPropertyUnitLabel(a) : a.title;
    const right =
        key === "propertyUnit" ? getPropertyUnitLabel(b) : b.title;

    return left.localeCompare(right);
}

function SortButton({
    label,
    column,
    activeColumn,
    direction,
    onSort,
}: {
    label: string;
    column: SortKey;
    activeColumn: SortKey;
    direction: SortDirection;
    onSort: (column: SortKey) => void;
}) {
    const isActive = activeColumn === column;

    return (
        <button
            type="button"
            className="btn btn-link p-0 text-decoration-none"
            onClick={() => onSort(column)}
            style={{
                color: isActive ? "#ff4f00" : "#201515",
                fontSize: "12px",
                fontWeight: 750,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
            }}
            >
                {label}
                <span
                    aria-hidden="true"
                style={{
                    marginLeft: "6px",
                    color: isActive ? "#ff4f00" : "#939084",
                }}
            >
                {isActive ? (direction === "asc" ? "▲" : "▼") : "△"}
            </span>
        </button>
    );
}

export default function MaintenanceTable({
    role,
    requests,
}: MaintenanceTableProps) {
    const [sortKey, setSortKey] = useState<SortKey>("submittedAt");
    const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

    const sortedRequests = useMemo(() => {
        return [...requests].sort((a, b) => {
            const result = compareRequests(a, b, sortKey);
            return sortDirection === "asc" ? result : -result;
        });
    }, [requests, sortDirection, sortKey]);

    function updateSort(nextKey: SortKey) {
        if (nextKey === sortKey) {
            setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
            return;
        }

        setSortKey(nextKey);
        setSortDirection(nextKey === "submittedAt" ? "desc" : "asc");
    }

    if (requests.length === 0) {
        return (
            <div
                className="p-4 text-center text-muted"
                style={{
                    background: "#fffefb",
                    border: "1px solid #c5c0b1",
                    borderRadius: "8px",
                }}
            >
                No maintenance requests found.
            </div>
        );
    }

    return (
        <>
            <div
                className="table-responsive pm-maintenance-table-wrap"
                style={{
                    background: "#fffefb",
                    border: "1px solid #c5c0b1",
                    borderRadius: "8px",
                    boxShadow: "0 10px 24px rgba(32, 21, 21, 0.06)",
                    overflow: "hidden",
                }}
            >
                <table className="table align-middle mb-0">
                    <thead>
                        <tr>
                            <th style={{ background: "#eceae3", borderBottom: "1px solid #c5c0b1" }}>
                                <SortButton label="Title" column="title" activeColumn={sortKey} direction={sortDirection} onSort={updateSort} />
                            </th>
                            <th style={{ background: "#eceae3", borderBottom: "1px solid #c5c0b1" }}>
                                <SortButton label="Property / Unit" column="propertyUnit" activeColumn={sortKey} direction={sortDirection} onSort={updateSort} />
                            </th>
                            <th style={{ background: "#eceae3", borderBottom: "1px solid #c5c0b1" }}>
                                <SortButton label="Status" column="status" activeColumn={sortKey} direction={sortDirection} onSort={updateSort} />
                            </th>
                            <th style={{ background: "#eceae3", borderBottom: "1px solid #c5c0b1" }}>
                                <SortButton label="Priority" column="priority" activeColumn={sortKey} direction={sortDirection} onSort={updateSort} />
                            </th>
                            <th style={{ background: "#eceae3", borderBottom: "1px solid #c5c0b1" }}>
                                <SortButton label="Date Submitted" column="submittedAt" activeColumn={sortKey} direction={sortDirection} onSort={updateSort} />
                            </th>
                            <th style={{ background: "#eceae3", borderBottom: "1px solid #c5c0b1", color: "#201515", fontSize: "12px", fontWeight: 750, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                                Action
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {sortedRequests.map((request) => (
                            <tr key={request.request_id}>
                                <td>
                                    <div style={{ color: "#201515", fontWeight: 650 }}>
                                        {request.title}
                                    </div>
                                    <div className="small text-muted">
                                        {request.category ?? "Uncategorised"}
                                    </div>
                                </td>
                                <td className="text-muted">
                                    {getPropertyUnitLabel(request)}
                                </td>
                                <td>
                                    <StatusBadge
                                        status={request.status}
                                        label={role === "tenant" ? getTenantStatusLabel(request.status) : undefined}
                                    />
                                </td>
                                <td>
                                    <PriorityBadge priority={request.priority} />
                                </td>
                                <td className="text-muted">{formatDate(request.submitted_at)}</td>
                                <td>
                                    <MaintenanceRowActions role={role} request={request} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="pm-maintenance-mobile-list">
                {sortedRequests.map((request) => (
                    <article className="pm-maintenance-mobile-card" key={request.request_id}>
                        <div className="pm-maintenance-mobile-card-heading">
                            <div>
                                <h2>{request.title}</h2>
                                <p>{getPropertyUnitLabel(request)}</p>
                            </div>
                            <PriorityBadge priority={request.priority} />
                        </div>
                        <div className="pm-maintenance-mobile-card-meta">
                            <div>
                                <span>Status</span>
                                <StatusBadge
                                    status={request.status}
                                    label={role === "tenant" ? getTenantStatusLabel(request.status) : undefined}
                                />
                            </div>
                            <div>
                                <span>Category</span>
                                <strong>{request.category ?? "Uncategorised"}</strong>
                            </div>
                            <div>
                                <span>Submitted</span>
                                <strong>{formatDate(request.submitted_at)}</strong>
                            </div>
                        </div>
                        <div className="pm-maintenance-mobile-card-actions">
                            <MaintenanceRowActions role={role} request={request} />
                        </div>
                    </article>
                ))}
            </div>
        </>
    );
}
