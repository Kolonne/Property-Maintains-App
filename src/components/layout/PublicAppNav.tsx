"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navLinks = [
  { label: "Services", href: "/services" },
  { label: "About Us", href: "/about_us" },
  { label: "Contact", href: "/contact" },
];

export default function PublicAppNav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="pm-public-nav-shell">
      <nav className="pm-public-nav" aria-label="Public navigation">
        <Link href="/" className="pm-public-brand">
          <span className="pm-public-brand-icon">
            <i className="bi bi-house-door" aria-hidden="true" />
          </span>
          <span className="pm-public-brand-copy">
            <span>
              Property<span>Maintains</span>
            </span>
            <span>Maintenance Made Clearer</span>
          </span>
        </Link>

        <button
          aria-controls="public-navigation-links"
          aria-expanded={menuOpen}
          aria-label="Toggle navigation menu"
          className="pm-public-menu-toggle"
          onClick={() => setMenuOpen((isOpen) => !isOpen)}
          type="button"
        >
          <i className={`bi ${menuOpen ? "bi-x-lg" : "bi-list"}`} aria-hidden="true" />
        </button>

        <div
          className={`pm-public-nav-links ${menuOpen ? "is-open" : ""}`}
          id="public-navigation-links"
        >
          {navLinks.map((link) => {
            const active =
              pathname === link.href || pathname.startsWith(`${link.href}/`);

            return (
              <Link
                aria-current={active ? "page" : undefined}
                className={`pm-public-nav-link ${active ? "is-active" : ""}`}
                href={link.href}
                key={link.href}
                onClick={() => setMenuOpen(false)}
              >
                <PublicNavIcon label={link.label} />
                <span>{link.label}</span>
              </Link>
            );
          })}
          <Link
            href="/login"
            className="pm-public-nav-link pm-public-nav-login-mobile"
            onClick={() => setMenuOpen(false)}
          >
            <i className="bi bi-box-arrow-in-right" aria-hidden="true" />
            <span>Login</span>
          </Link>
        </div>

        <Link
          href="/login"
          className="pm-public-login-link"
          onClick={() => setMenuOpen(false)}
        >
          Login
        </Link>
      </nav>
    </header>
  );
}

function PublicNavIcon({ label }: { label: string }) {
  const iconClass =
    label === "Services"
      ? "bi-tools"
      : label === "About Us"
        ? "bi-info-circle"
        : label === "Contact"
          ? "bi-question-circle"
          : "bi-circle";

  return <i className={`bi ${iconClass}`} aria-hidden="true" />;
}
