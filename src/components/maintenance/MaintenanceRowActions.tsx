import Link from "next/link";
import type { UserRole, MaintenanceRequest } from "@/lib/types";

type MaintenanceRowActionsProps = {
    role: UserRole;
    request: MaintenanceRequest;
};

export default function MaintenanceRowActions({
    role,
    request,
}: MaintenanceRowActionsProps) {
    /*
      UI DEV NOTES:
  
      This component controls the action buttons shown in each maintenance table row.
  
      The buttons change based on the current user's role.
  
      Valid roles come from src/lib/types.ts:
      - "tenant"
      - "property_manager"
      - "landlord"
  
      The request object follows the MaintenanceRequest type from src/lib/types.ts.
  
      Important:
      MaintenanceRequest uses request_id, not id.
  
      Example:
      /maintenance/1
      /maintenance/2
      /maintenance/3
    */

    if (role === "tenant") {
        return (
            <Link
                href={`/maintenance/${request.request_id}`}
                className="btn btn-outline-primary btn-sm"
            >
                View
            </Link>
        );
    }

    if (role === "property_manager") {
        const shouldAssign =
            request.status === "submitted" || request.status === "acknowledged";

        return (
            <div className="d-flex gap-2">
                <button className="btn btn-outline-primary btn-sm" type="button">
                    {shouldAssign ? "Assign" : "Update"}
                </button>

                <Link
                    href={`/maintenance/${request.request_id}`}
                    className="btn btn-outline-secondary btn-sm"
                >
                    View
                </Link>
            </div>
        );
    }

    if (role === "landlord") {
        const needsApproval = request.status === "awaiting_landlord_approval";

        return (
            <div className="d-flex gap-2">
                <button
                    className="btn btn-dark btn-sm"
                    type="button"
                    disabled={!needsApproval}
                >
                    Approve
                </button>

                <button
                    className="btn btn-outline-secondary btn-sm"
                    type="button"
                    disabled={!needsApproval}
                >
                    Reject
                </button>

                <Link
                    href={`/maintenance/${request.request_id}`}
                    className="btn btn-outline-primary btn-sm"
                >
                    View
                </Link>
            </div>
        );
    }

    return null;
}