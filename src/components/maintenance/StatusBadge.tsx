import type { RequestStatus } from "@/lib/types";
import { StatusBadge as SharedStatusBadge } from "@/components/ui/StatusBadge";

type StatusBadgeProps = {
    status: RequestStatus;
    label?: string;
};

export default function StatusBadge({ status, label }: StatusBadgeProps) {
    return <SharedStatusBadge status={status} label={label} />;
}
