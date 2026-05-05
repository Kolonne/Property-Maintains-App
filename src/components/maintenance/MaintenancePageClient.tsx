"use client";

import { useMemo, useState } from "react";
import type { CurrentUser } from "@/context/UserContext";
import type { MaintenanceRequest, RequestStatus } from "@/lib/types";
import MaintenanceFilters from "./MaintenanceFilters";
import MaintenanceTable from "./MaintenanceTable";

type MaintenancePageClientProps = {
    currentUser: CurrentUser;
};

/*
  MOCK MAINTENANCE DATA

  This data is temporary and is only used so the UI team can build and test
  the maintenance list screen.

  Each object follows the MaintenanceRequest interface from:
  src/lib/types.ts

  Later, when the database is connected, this mock array can be replaced with
  real rows from the maintenance_requests table.
*/
const mockMaintenanceRequests: MaintenanceRequest[] = [
    {
        request_id: 1,
        unit_id: 101,
        reported_by: 1,
        title: "Kitchen sink leak",
        description: "Water is leaking under the kitchen sink cabinet.",
        category: "plumbing",
        priority: "high",
        status: "submitted",
        submitted_at: "2026-04-12",
        acknowledged_at: null,
        completed_at: null,
        closed_at: null,
    },
    {
        request_id: 2,
        unit_id: 102,
        reported_by: 2,
        title: "Air conditioner not cooling",
        description: "The air conditioner turns on but does not cool the room.",
        category: "appliance",
        priority: "medium",
        status: "in_progress",
        submitted_at: "2026-04-10",
        acknowledged_at: "2026-04-11",
        completed_at: null,
        closed_at: null,
    },
    {
        request_id: 3,
        unit_id: 103,
        reported_by: 3,
        title: "Bathroom light flickering",
        description: "The bathroom light flickers when switched on.",
        category: "electrical",
        priority: "low",
        status: "completed",
        submitted_at: "2026-04-05",
        acknowledged_at: "2026-04-06",
        completed_at: "2026-04-09",
        closed_at: null,
    },
    {
        request_id: 4,
        unit_id: 104,
        reported_by: 4,
        title: "Balcony door difficult to open",
        description: "The balcony sliding door appears to be off its track.",
        category: "structural",
        priority: "urgent",
        status: "awaiting_landlord_approval",
        submitted_at: "2026-04-14",
        acknowledged_at: "2026-04-15",
        completed_at: null,
        closed_at: null,
    },
];

export default function MaintenancePageClient({
    currentUser,
}: MaintenancePageClientProps) {
    /*
      These hold the current filter/search values.
  
      "all" means no filter is applied.
      For example, statusFilter === "all" means show all statuses.
    */
    const [statusFilter, setStatusFilter] = useState<RequestStatus | "all">(
        "all"
    );
    const [searchTerm, setSearchTerm] = useState("");

    /*
      The page heading changes based on the current role.
  
      This lets tenants, property managers, and landlords all use the same
      /maintenance page, while still seeing wording that makes sense for them.
    */
    const pageTitle =
        currentUser.role === "tenant"
            ? "My Maintenance Requests"
            : currentUser.role === "property_manager"
                ? "All Maintenance Requests"
                : "Requests for Your Approval";

    const pageDescription =
        currentUser.role === "tenant"
            ? "View and track maintenance requests you have submitted."
            : currentUser.role === "property_manager"
                ? "View and manage maintenance requests across properties."
                : "Review maintenance requests linked to your properties.";

    /*
      This filters the mock data before it is shown in the table.
  
      For now, it only filters by:
      - status
      - search text
  
      We are NOT adding property address filtering yet because the current
      MaintenanceRequest type does not include property address. That will come
      later when requests are joined with Unit and Property data.
    */
    const filteredRequests = useMemo(() => {
        return mockMaintenanceRequests.filter((request) => {
            const matchesStatus =
                statusFilter === "all" || request.status === statusFilter;

            const matchesSearch =
                request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                request.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                request.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                request.priority.toLowerCase().includes(searchTerm.toLowerCase()) ||
                request.status.toLowerCase().includes(searchTerm.toLowerCase());

            return matchesStatus && matchesSearch;
        });
    }, [statusFilter, searchTerm]);

    return (
        <section>
            {/*
        UI DEV NOTES:

        This component controls the main maintenance list screen.

        Route:
        /maintenance

        Current role:
        currentUser.role

        Valid role values:
        - "tenant"
        - "property_manager"
        - "landlord"

        Mock data:
        mockMaintenanceRequests

        Filtered data:
        filteredRequests

        The table receives the filtered requests and displays them.

        The current MaintenanceRequest type includes:
        - request_id
        - unit_id
        - reported_by
        - title
        - description
        - category
        - priority
        - status
        - submitted_at
        - acknowledged_at
        - completed_at
        - closed_at

        It does NOT include property address, tenant name, unit number, or cost yet.
        Those will come later from related database tables.
      */}

            <div className="mb-4">
                <h1 className="h3 mb-1">{pageTitle}</h1>
                <p className="text-muted mb-0">{pageDescription}</p>
            </div>

            <div className="border rounded p-4 mb-4">
                <p className="mb-1">
                    Current role: <strong>{currentUser.role}</strong>
                </p>

                <p className="text-muted mb-0">
                    This page is using mock maintenance request data for UI development.
                </p>
            </div>

            <MaintenanceFilters
                role={currentUser.role}
                statusFilter={statusFilter}
                searchTerm={searchTerm}
                onStatusChange={setStatusFilter}
                onSearchChange={setSearchTerm}
            />

            <MaintenanceTable role={currentUser.role} requests={filteredRequests} />

            <p className="small text-muted mt-3">
                Showing {filteredRequests.length} of {mockMaintenanceRequests.length}{" "}
                requests
            </p>
        </section>
    );
}