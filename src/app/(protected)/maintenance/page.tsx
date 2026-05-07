"use client";

import { useCurrentUser } from "@/context/UserContext";
import { hasPermission } from "@/lib/permissions";
import EmptyState from "@/components/shared/EmptyState";
import TenantMaintenanceList from "@/components/maintenance/TenantMaintenanceList";
import PropertyManagerMaintenanceList from "@/components/maintenance/PropertyManagerMaintenanceList";
import LandlordMaintenanceList from "@/components/maintenance/LandlordMaintenanceList";

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

  if (currentUser.role === "tenant") {
    return <TenantMaintenanceList />;
  }

  if (currentUser.role === "property_manager") {
    return <PropertyManagerMaintenanceList />;
  }

  if (currentUser.role === "landlord") {
    return <LandlordMaintenanceList />;
  }

  return <p>Unknown role.</p>;
}