/**
 * StatCard — clickable tile for a dashboard stat or quick action.
 * Uses warm border + cream surface per guideline §5.2.
 */

import Link from "next/link";
import type { ReactNode } from "react";

interface StatCardProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  value?: string | number;
  href?: string;
  emphasised?: boolean; // if true, the value uses orange accent
}

/**
 * Per §5.2 cards use cream surface + sand border. No pastel pills,
 * no shadows. Icon container is light-sand (#eceae3) only.
 */
export function StatCard({
  icon,
  title,
  subtitle,
  value,
  href,
  emphasised = false,
}: StatCardProps) {
  const inner = (
    <div
      className="h-100 p-3 d-flex flex-row align-items-center"
      style={{
        background: "#fffefb",
        border: "1px solid #c5c0b1",
        borderRadius: "5px",
        gap: "14px",
        cursor: href ? "pointer" : "default",
      }}
    >
      <div
        className="d-flex align-items-center justify-content-center flex-shrink-0"
        style={{
          width: "40px",
          height: "40px",
          background: "#eceae3",
          borderRadius: "5px",
          color: "#36342e",
        }}
      >
        {icon}
      </div>
      <div className="flex-grow-1 min-w-0">
        <div className="d-flex align-items-baseline" style={{ gap: "8px" }}>
          <div style={{ fontSize: "15px", fontWeight: 600, color: "#201515", lineHeight: 1.2 }}>
            {title}
          </div>
          {value !== undefined && (
            <div
              style={{
                fontSize: "18px",
                fontWeight: 600,
                color: emphasised ? "#ff4f00" : "#201515",
                lineHeight: 1,
              }}
            >
              {value}
            </div>
          )}
        </div>
        {subtitle && (
          <div style={{ fontSize: "13px", color: "#939084", marginTop: "2px" }}>
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
  ) : (
    inner
  );
}
