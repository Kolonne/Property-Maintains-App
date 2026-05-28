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
                className="btn btn-sm"
                style={{
                    backgroundColor: "#eceae3",
                    border: "1px solid #c5c0b1",
                    borderRadius: "999px",
                    color: "#36342e",
                    fontWeight: 650,
                    padding: "6px 14px",
                }}
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
                <button
                    className="btn btn-sm"
                    type="button"
                    style={{
                        backgroundColor: "#fffefb",
                        border: "1px solid #ff4f00",
                        borderRadius: "999px",
                        color: "#ff4f00",
                        fontWeight: 650,
                        padding: "6px 14px",
                    }}
                >
                    {shouldAssign ? "Assign" : "Update"}
                </button>

                <Link
                    href={`/maintenance/${request.request_id}`}
                    className="btn btn-sm"
                    style={{
                        backgroundColor: "#eceae3",
                        border: "1px solid #c5c0b1",
                        borderRadius: "999px",
                        color: "#36342e",
                        fontWeight: 650,
                        padding: "6px 14px",
                    }}
                >
                    View
                </Link>
            </div>
        );
    }

    if (role === "landlord") {
        const needsApproval = request.status === "awaiting_landlord_approval";

        return (
            <div className="d-flex gap-2 flex-wrap">
                {needsApproval && (
                    <>
                        <button
                            className="btn btn-sm"
                            type="button"
                            style={{
                                backgroundColor: "#7d8a6a",
                                border: "1px solid #7d8a6a",
                                borderRadius: "999px",
                                color: "#fffefb",
                                fontWeight: 650,
                                padding: "6px 14px",
                            }}
                        >
                            Approve
                        </button>

                        <button
                            className="btn btn-sm"
                            type="button"
                            style={{
                                backgroundColor: "#fffefb",
                                border: "1px solid #a8593e",
                                borderRadius: "999px",
                                color: "#a8593e",
                                fontWeight: 650,
                                padding: "6px 14px",
                            }}
                        >
                            Reject
                        </button>
                    </>
                )}

                <Link
                    href={`/maintenance/${request.request_id}`}
                    className="btn btn-sm"
                    style={{
                        backgroundColor: "#eceae3",
                        border: "1px solid #c5c0b1",
                        borderRadius: "999px",
                        color: "#36342e",
                        fontWeight: 650,
                        padding: "6px 14px",
                    }}
                >
                    View
                </Link>
            </div>
        );
    }

    return null;
}
