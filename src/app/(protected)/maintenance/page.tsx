"use client";

import { useCurrentUser } from "@/context/UserContext";
import { hasPermission } from "@/lib/permissions";
import EmptyState from "@/components/shared/EmptyState";
import MaintenancePageClient from "@/components/maintenance/MaintenancePageClient";

export default function MaintenancePage() {
    const { currentUser } = useCurrentUser();

    const canViewMaintenance = hasPermission(
        currentUser.role,
        "maintenance",
        "view"
    );

    if (!canViewMaintenance) {
        return (
            <EmptyState
                title="Access denied"
                message="You do not have permission to view maintenance requests."
            />
        );
    }

    return <MaintenancePageClient currentUser={currentUser} />;
}