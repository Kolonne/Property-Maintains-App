// This page controls the /maintenance/new route.
// Its job is only to check whether the current role can create a maintenance request,
// then load the maintenance form component.
// UI layout/design should be built inside MaintenanceForm.tsx.

"use client";

import { useCurrentUser } from "@/context/UserContext";
import { hasPermission } from "@/lib/permissions";
import MaintenanceForm from "@/components/maintenance/MaintenanceForm";
import EmptyState from "@/components/shared/EmptyState";

export default function NewMaintenancePage() {
    const { currentUser } = useCurrentUser();

    const canCreateMaintenance = hasPermission(
        currentUser.role,
        "maintenance",
        "create"
    );

    if (!canCreateMaintenance) {
        return (
            <EmptyState
                title="Access denied"
                message="You do not have permission to create maintenance requests."
            />
        );
    }

    return (
        <section>
            <div className="mb-4">
                <h1 className="h3 mb-1">New Maintenance Request</h1>
                <p className="text-muted mb-0">
                    Submit a new maintenance issue for review.
                </p>
            </div>

            <MaintenanceForm currentUser={currentUser} />
        </section>
    );
}