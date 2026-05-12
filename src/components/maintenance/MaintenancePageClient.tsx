"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { CurrentUser } from "@/context/UserContext";
import type { MaintenanceRequestListItem } from "@/lib/queries/maintenance";
import type { RequestStatus, UserRole } from "@/lib/types";
import { hasPermission } from "@/lib/permissions";
import MaintenanceFilters from "./MaintenanceFilters";
import MaintenanceTable from "./MaintenanceTable";

type MaintenancePageClientProps = {
    currentUser: CurrentUser;
};

export default function MaintenancePageClient({
    currentUser,
}: MaintenancePageClientProps) {
    const [statusFilter, setStatusFilter] = useState<RequestStatus | "all">(
        "all"
    );
    const [searchTerm, setSearchTerm] = useState("");
    const [requests, setRequests] = useState<MaintenanceRequestListItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const role: UserRole =
        currentUser.role === "null" ? "tenant" : currentUser.role;

    const pageTitle =
        role === "tenant"
            ? "My Maintenance Requests"
            : role === "property_manager"
                ? "All Maintenance Requests"
                : "Requests for Your Approval";

    const pageDescription =
        role === "tenant"
            ? "View and track maintenance requests you have submitted."
            : role === "property_manager"
                ? "View and manage maintenance requests across properties."
                : "Review maintenance requests linked to your properties.";
    const canCreateRequest = hasPermission(currentUser.role, "maintenance", "create");

    useEffect(() => {
        let isMounted = true;

        async function loadRequests() {
            if (currentUser.id === null || currentUser.role === "null") {
                setRequests([]);
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                setError(null);

                const params = new URLSearchParams({
                    userId: String(currentUser.id),
                    role: currentUser.role,
                    status: statusFilter,
                });

                if (searchTerm.trim()) {
                    params.set("search", searchTerm.trim());
                }

                const response = await fetch(`/api/maintenance/requests?${params}`);
                const data = (await response.json()) as {
                    error?: string;
                    requests?: MaintenanceRequestListItem[];
                };

                if (!response.ok || !data.requests) {
                    throw new Error(data.error ?? "Unable to load maintenance requests.");
                }

                if (isMounted) {
                    setRequests(data.requests);
                }
            } catch (loadError) {
                if (isMounted) {
                    setError(
                        loadError instanceof Error
                            ? loadError.message
                            : "Unable to load maintenance requests."
                    );
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        loadRequests();

        return () => {
            isMounted = false;
        };
    }, [currentUser.id, currentUser.role, searchTerm, statusFilter]);

    if (currentUser.role === "null") {
        return <p>You do not have permission to view this page.</p>;
    }

    return (
        <section>
            <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
                <div>
                    <h1 className="h3 mb-1">{pageTitle}</h1>
                    <p className="text-muted mb-0">{pageDescription}</p>
                </div>

                {canCreateRequest && (
                    <Link
                        href="/maintenance/new"
                        className="btn"
                        style={{
                            backgroundColor: "#ff4f00",
                            border: "1px solid #ff4f00",
                            borderRadius: "999px",
                            color: "#fffefb",
                            fontWeight: 700,
                            padding: "9px 16px",
                            boxShadow: "0 8px 18px rgba(255, 79, 0, 0.18)",
                            whiteSpace: "nowrap",
                        }}
                    >
                        + New Request
                    </Link>
                )}
            </div>

            <MaintenanceFilters
                role={role}
                statusFilter={statusFilter}
                searchTerm={searchTerm}
                onStatusChange={setStatusFilter}
                onSearchChange={setSearchTerm}
            />

            {isLoading ? (
                <div className="border rounded p-4 text-center text-muted">
                    Loading maintenance requests...
                </div>
            ) : error ? (
                <div className="border rounded p-4 text-center text-danger">
                    {error}
                </div>
            ) : (
                <MaintenanceTable role={role} requests={requests} />
            )}

            <p className="small text-muted mt-3">
                Showing {requests.length} request{requests.length === 1 ? "" : "s"}
            </p>
        </section>
    );
}
