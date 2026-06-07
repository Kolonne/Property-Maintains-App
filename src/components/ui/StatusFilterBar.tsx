import Link from "next/link";

const FILTERS = [
  { value: "all",                          label: "All" },
  { value: "submitted",                    label: "Submitted" },
  { value: "acknowledged",                 label: "Acknowledged" },
  { value: "in_progress",                  label: "In Progress" },
  { value: "awaiting_landlord_approval",   label: "Awaiting Approval" },
  { value: "landlord_approved",            label: "Approved" },
  { value: "completed",                    label: "Completed" },
  { value: "closed",                       label: "Closed" },
];

interface Props {
  basePath: string;
  current: string;
}

export function StatusFilterBar({ basePath, current }: Props) {
  return (
    <div
      className="d-flex flex-wrap p-2 mb-3"
      style={{
        background: "#fffdf9",
        border: "1px solid #c5c0b1",
        borderRadius: "5px",
        gap: "4px",
      }}
    >
      {FILTERS.map(f => {
        const active = f.value === current || (f.value === "all" && !current);
        const href = f.value === "all" ? basePath : `${basePath}?status=${f.value}`;
        return (
          <Link
            key={f.value}
            href={href}
            style={{
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "0.3px",
              textTransform: "uppercase",
              padding: "6px 12px",
              borderRadius: "3px",
              color: active ? "#fffefb" : "#36342e",
              background: active ? "#201515" : "transparent",
              border: `1px solid ${active ? "#201515" : "transparent"}`,
              textDecoration: "none",
            }}
          >
            {f.label}
          </Link>
        );
      })}
    </div>
  );
}
