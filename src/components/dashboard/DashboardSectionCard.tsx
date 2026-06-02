import Link from "next/link";
import type { ReactNode } from "react";

type DashboardSectionCardProps = {
  title: string;
  count?: number;
  rightHref?: string;
  rightLabel?: string;
  children: ReactNode;
  className?: string;
};

export function DashboardSectionCard({
  title,
  count,
  rightHref,
  rightLabel,
  children,
  className = "",
}: DashboardSectionCardProps) {
  return (
    <section className={`pm-dashboard-card p-3 p-lg-4 ${className}`}>
      <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
        <h2
          style={{
            color: "#1f2933",
            fontSize: "20px",
            fontWeight: 800,
            margin: 0,
          }}
        >
          {title}
          {count !== undefined ? ` (${count})` : ""}
        </h2>
        {rightHref && rightLabel ? (
          <Link href={rightHref} className="pm-dashboard-link">
            {rightLabel}
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  );
}

