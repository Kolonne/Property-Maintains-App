"use client";

import { useParams } from "next/navigation";
import { useCurrentUser } from "@/context/UserContext";
import { hasPermission } from "@/lib/permissions";
import EmptyState from "@/components/shared/EmptyState";
import MaintenanceDetail from "@/components/maintenance/MaintenanceDetail";

export default function MaintenanceDetailPage() {
  const params = useParams<{ id: string }>();
  const { currentUser } = useCurrentUser();

  const canViewMaintenance = hasPermission(
    currentUser.role,
    "maintenance_detail",
    "view"
  );

  if (!canViewMaintenance) {
    return (
      <EmptyState
        title="Access denied"
        message="You do not have permission to view this maintenance request."
      />
    );
  }

  return (
    <MaintenanceDetail requestId={params.id} currentUser={currentUser} />
  );
}
