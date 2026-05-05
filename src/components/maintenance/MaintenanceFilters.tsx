"use client";

import type { RequestStatus, UserRole } from "@/lib/types";

type MaintenanceFiltersProps = {
    role: UserRole;
    statusFilter: RequestStatus | "all";
    searchTerm: string;
    onStatusChange: (value: RequestStatus | "all") => void;
    onSearchChange: (value: string) => void;
};

const tenantAndManagerStatusOptions: Array<RequestStatus | "all"> = [
    "all",
    "submitted",
    "acknowledged",
    "in_progress",
    "awaiting_parts",
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
    /*
      UI DEV NOTES:
  
      This component shows the filter/search area for the maintenance list.
  
      For now, filters are intentionally simple:
      - status filter
      - search box
  
      Property address filtering is not included yet because MaintenanceRequest
      does not include property address. That will come later when request data
      is joined with Unit and Property data.
    */

    const statusOptions =
        role === "landlord" ? landlordStatusOptions : tenantAndManagerStatusOptions;

    return (
        <div className="border rounded p-3 mb-3">
            <div className="d-flex flex-wrap gap-2 align-items-center">
                <div className="btn-group" role="group" aria-label="Status filters">
                    {statusOptions.map((status) => (
                        <button
                            key={status}
                            type="button"
                            className={`btn btn-sm ${statusFilter === status ? "btn-primary" : "btn-outline-primary"
                                }`}
                            onClick={() => onStatusChange(status)}
                        >
                            {formatStatusLabel(status)}
                        </button>
                    ))}
                </div>

                <input
                    className="form-control form-control-sm ms-auto"
                    style={{ maxWidth: "280px" }}
                    type="search"
                    placeholder="Search requests..."
                    value={searchTerm}
                    onChange={(event) => onSearchChange(event.target.value)}
                />
            </div>
        </div>
    );
}