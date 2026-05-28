import Link from "next/link";
import type { ReactNode } from "react";

type DashboardHeroProps = {
  title: string;
  subtitle: string;
  eyebrow?: string;
  actionHref?: string;
  actionLabel?: string;
  children?: ReactNode;
};

export function DashboardHero({
  title,
  subtitle,
  eyebrow,
  actionHref,
  actionLabel,
  children,
}: DashboardHeroProps) {
  return (
    <section className="pm-dashboard-hero">
      <div style={{ maxWidth: "720px", padding: "48px 28px 42px", position: "relative", zIndex: 1 }}>
        {/* {eyebrow ? (
          <p
            style={{
              color: "#f97316",
              fontSize: "13px",
              fontWeight: 800,
              letterSpacing: 0,
              marginBottom: "10px",
              textTransform: "uppercase",
            }}
          >
            {eyebrow}
          </p>
        ) : null} */}
        <h1
          style={{
            color: "#1f2933",
            fontSize: "38px",
            fontWeight: 800,
            lineHeight: 1.08,
            marginBottom: "12px",
          }}
        >
          {title}
        </h1>
        <p
          style={{
            color: "#4b5563",
            fontSize: "17px",
            lineHeight: 1.65,
            marginBottom: actionHref && actionLabel ? "22px" : 0,
            maxWidth: "560px",
          }}
        >
          {subtitle}
        </p>
        {actionHref && actionLabel ? (
          <Link
            href={actionHref}
            className="btn pm-dashboard-pill-button"
            style={{
              background: "#f97316",
              border: "1px solid #f97316",
              boxShadow: "0 12px 26px rgba(249, 115, 22, 0.22)",
              color: "#ffffff",
              padding: "10px 18px",
            }}
          >
            {actionLabel}
          </Link>
        ) : null}
        {children}
      </div>
    </section>
  );
}
