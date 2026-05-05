// EmptyState.tsx
// Purpose: Reusable message shown when there is no data to display.
// Example: "No maintenance requests found" or "No properties available".
// Should include a friendly message and optionally an action button,
// such as "Create Maintenance Request".
// This keeps blank pages from looking broken or unfinished.

// src/components/shared/EmptyState.tsx

type EmptyStateProps = {
    title: string;
    message: string;
    action?: React.ReactNode;
};

export default function EmptyState({
    title,
    message,
    action,
}: EmptyStateProps) {
    return (
        <div className="text-center border rounded p-5 bg-light">
            <h2 className="h4">{title}</h2>
            <p className="text-muted">{message}</p>

            {action && <div className="mt-3">{action}</div>}
        </div>
    );
}