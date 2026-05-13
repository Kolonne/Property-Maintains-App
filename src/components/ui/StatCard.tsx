import Link from "next/link";
import type { ReactNode } from "react";

interface StatCardProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  value?: string | number;
  href?: string;
  emphasised?: boolean;
}

export function StatCard({ icon, title, subtitle, value, href, emphasised = false }: StatCardProps) {
  const inner = (
    <div
      className="pm-stat-card h-100 p-3 d-flex flex-row align-items-center"
      style={{
        background: "#ffffff",
        border: "1px solid #e8e2da",
        borderRadius: "18px",
        boxShadow: "0 10px 26px rgba(31, 41, 51, 0.06)",
        gap: "14px",
        cursor: href ? "pointer" : "default",
        borderLeft: emphasised ? "4px solid #f97316" : "4px solid #e8e2da",
      }}
    >
      <div
        className="d-flex align-items-center justify-content-center flex-shrink-0"
        style={{
          width: "40px",
          height: "40px",
          background: emphasised ? "#fff1e7" : "#fff7f1",
          border: emphasised ? "1px solid #f97316" : "1px solid #e8e2da",
          borderRadius: "12px",
          color: emphasised ? "#f97316" : "#1f2933",
        }}
      >
        {icon}
      </div>
      <div className="flex-grow-1 min-w-0">
        <div className="d-flex align-items-baseline" style={{ gap: "8px" }}>
          <div style={{ fontSize: "15px", fontWeight: 700, color: "#1f2933", lineHeight: 1.2 }}>
            {title}
          </div>
          {value !== undefined && (
            <div style={{ fontSize: "26px", fontWeight: 800, color: emphasised ? "#f97316" : "#1f2933", lineHeight: 1 }}>
              {value}
            </div>
          )}
        </div>
        {subtitle && (
          <div style={{ fontSize: "13px", color: "#6b7280", marginTop: "4px" }}>
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );

  return href ? (
    <Link href={href} style={{ textDecoration: "none" }}>
      {inner}
    </Link>
  ) : inner;
}
