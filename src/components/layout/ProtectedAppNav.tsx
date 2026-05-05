"use client";

import { useCurrentUser } from "@/context/UserContext";

export default function Header() {
    const { currentUser, setRole } = useCurrentUser();
    return (
        <header>
            <nav className="navbar navbar-expand-lg navbar-light bg-light border-bottom px-4">
                <div className="container-fluid">
                    {/* Logo / App Name */}
                    <a className="navbar-brand fw-bold" href="/">
                        PropertyCare
                    </a>

                    {/* Desktop navigation */}
                    <div className="collapse navbar-collapse show">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <li className="nav-item">
                                <a className="nav-link active" href="/dashboard">
                                    Dashboard
                                </a>
                            </li>

                            <li className="nav-item">
                                <a className="nav-link" href="/maintenance">
                                    Maintenance Requests
                                </a>
                            </li>

                            <li className="nav-item">
                                <a className="nav-link" href="/properties">
                                    Properties
                                </a>
                            </li>

                            <li className="nav-item">
                                <a className="nav-link" href="/reports">
                                    Reports
                                </a>
                            </li>
                        </ul>

                        {/* Right side */}
                        <div className="d-flex align-items-center gap-2">
                            <div className="d-flex gap-2 align-items-center">
                                <span className="small text-muted">
                                    Current role: <strong>{currentUser.role}</strong>
                                </span>

                                <button
                                    className={`btn btn-sm ${currentUser.role === "tenant"
                                        ? "btn-primary"
                                        : "btn-outline-primary"
                                        }`}
                                    type="button"
                                    onClick={() => setRole("tenant")}
                                >
                                    Tenant
                                </button>
                                <button
                                    className={`btn btn-sm ${currentUser.role === "landlord"
                                        ? "btn-primary"
                                        : "btn-outline-primary"
                                        }`}
                                    type="button"
                                    onClick={() => setRole("landlord")}
                                >
                                    LL
                                </button>
                                <button
                                    className={`btn btn-sm ${currentUser.role === "property_manager"
                                        ? "btn-primary"
                                        : "btn-outline-primary"
                                        }`}
                                    type="button"
                                    onClick={() => setRole("property_manager")}
                                >
                                    PM
                                </button>
                                <button
                                    className={`btn btn-sm ${currentUser.role === 'null'
                                        ? "btn-primary"
                                        : "btn-outline-primary"
                                        }`}
                                    type="button"
                                    onClick={() => setRole('null')}
                                >
                                    not logged in
                                </button>

                                <a href="/profile" className="btn btn-outline-secondary btn-sm ms-5">
                                    Profile
                                </a>
                            </div>

                            <button className="btn btn-primary btn-sm">
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    );
}