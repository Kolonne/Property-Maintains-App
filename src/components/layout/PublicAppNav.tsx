import Link from "next/link";

export default function Header() {
    return (
        <header>
            <nav className="navbar navbar-expand-lg navbar-light bg-light border-bottom px-4">
                <div className="container-fluid">
                    {/* Logo / App Name */}
                    <Link className="navbar-brand fw-bold" href="/">
                        PropertyCare
                    </Link>

                    {/* Desktop navigation */}
                    <div className="collapse navbar-collapse show">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <li className="nav-item">
                                <Link className="nav-link active" href="/services">
                                    Services
                                </Link>
                            </li>

                            <li className="nav-item">
                                <Link className="nav-link" href="/about_us">
                                    About Us
                                </Link>
                            </li>

                            <li className="nav-item">
                                <Link className="nav-link" href="/contact">
                                    Contact
                                </Link>
                            </li>

                        </ul>

                        {/* Right side */}
                        <div className="d-flex align-items-center gap-2">

                            <Link href="/login" className="btn btn-outline-primary btn-sm">
                                Login
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    )
};
