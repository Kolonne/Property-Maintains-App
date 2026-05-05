// maintenance/[id]/page.tsx
// - reads the request ID from the URL
// - checks if user can view maintenance details
// - shows MaintenanceDetail

"use client";

import { useParams } from "next/navigation";
import { useCurrentUser } from "@/context/UserContext";
import { hasPermission } from "@/lib/permissions";
import EmptyState from "@/components/shared/EmptyState";
import MaintenanceDetail from "@/components/maintenance/MaintenanceDetail";

// export default function MaintenanceDetailPage() {
//     const params = useParams();
//     const { currentUser } = useCurrentUser();

//     const requestId = params.id as string;

//     const canViewMaintenance = hasPermission(
//         currentUser.role,
//         "maintenance",
//         "view"
//     );

//     if (!canViewMaintenance) {
//         return (
//             <EmptyState
//                 title="Access denied"
//                 message="You do not have permission to view this maintenance request."
//             />
//         );
//     }

//     return <MaintenanceDetail requestId={requestId} currentUser={currentUser} />;
// }

export default function MaintenanceDetailPage() {
    return <MaintenanceDetail />;
}