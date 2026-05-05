// This is a simple badge component to display the status of a maintenance request. 
// It's purpose is to have a repeatable UI element for showing request status in the list and details views.

import type { RequestStatus } from "@/lib/types";

type StatusBadgeProps = {
    status: RequestStatus;
};

export default function StatusBadge({ status }: StatusBadgeProps) {
    return <span className="badge bg-secondary">{status}</span>;
}