"use client";

import type { RequestStatus, UserRole } from "@/lib/types";

type MaintenanceFiltersProps = {
    role: UserRole;
    statusFilter: RequestStatus | "all";
    searchTerm: string;
    onStatusChange: (value: RequestStatus | "all") => void;
    onSearchChange: (value: string) => void;
};

const tenantStatusOptions: Array<RequestStatus | "all"> = [
    "all",
    "submitted",
    "acknowledged",
    "in_progress",
    "completed",
    "closed",
];

const managerStatusOptions: Array<RequestStatus | "all"> = [
    "all",
    "submitted",
    "acknowledged",
    "in_progress",
    "awaiting_parts",
    "awaiting_landlord_approval",
    "landlord_approved",
    "completed",
    "closed",
];

const landlordStatusOptions: Array<RequestStatus | "all"> = [
    "all",
    "awaiting_landlord_approval",
    "landlord_approved",
    "completed",
    "closed",
];

function formatStatusLabel(status: RequestStatus | "all") {
    if (status === "all") {
        return "All";
    }

    return status
        .split("_")
        .map((word) => word[0].toUpperCase() + word.slice(1))
        .join(" ");
}

export default function MaintenanceFilters({
    role,
    statusFilter,
    searchTerm,
    onStatusChange,
    onSearchChange,
}: MaintenanceFiltersProps) {
    const statusOptions =
        role === "tenant"
            ? tenantStatusOptions
            : role === "landlord"
                ? landlordStatusOptions
                : managerStatusOptions;

    return (
        <div
            className="mb-3"
            style={{
                background: "#fffefb",
                border: "1px solid #c5c0b1",
                borderLeft: "4px solid #ff4f00",
                borderRadius: "8px",
                boxShadow: "0 8px 22px rgba(32, 21, 21, 0.06)",
                padding: "14px",
            }}
        >
            <div className="d-flex flex-wrap gap-3 align-items-center">
                <div
                    className="d-flex flex-wrap"
                    role="group"
                    aria-label="Status filters"
                    style={{
                        background: "#eceae3",
                        border: "1px solid #d8d3c6",
                        borderRadius: "999px",
                        gap: "4px",
                        padding: "4px",
                    }}
                >
                    {statusOptions.map((status) => (
                        <button
                            key={status}
                            type="button"
                            className="btn btn-sm"
                            style={{
                                backgroundColor:
                                    statusFilter === status ? "#201515" : "transparent",
                                border: "1px solid transparent",
                                borderRadius: "999px",
                                color: statusFilter === status ? "#fffefb" : "#36342e",
                                fontWeight: 650,
                                padding: "6px 12px",
                            }}
                            onClick={() => onStatusChange(status)}
                        >
                            {formatStatusLabel(status)}
                        </button>
                    ))}
                </div>

                <input
                    className="form-control form-control-sm ms-auto"
                    style={{
                        maxWidth: "300px",
                        background: "#fffdf9",
                        border: "1px solid #c5c0b1",
                        borderRadius: "999px",
                        color: "#201515",
                        minHeight: "38px",
                        paddingLeft: "14px",
                    }}
                    type="search"
                    placeholder="Search requests..."
                    value={searchTerm}
                    onChange={(event) => onSearchChange(event.target.value)}
                />
            </div>
        </div>
    );
}
