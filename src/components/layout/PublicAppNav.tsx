export default function Header() {
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
                                <a className="nav-link active" href="/services">
                                    Services
                                </a>
                            </li>

                            <li className="nav-item">
                                <a className="nav-link" href="/about_us">
                                    About Us
                                </a>
                            </li>

                            <li className="nav-item">
                                <a className="nav-link" href="/contact">
                                    Contact
                                </a>
                            </li>

                        </ul>

                        {/* Right side */}
                        <div className="d-flex align-items-center gap-2">

                            <a href="/login" className="btn btn-outline-primary btn-sm">
                                Login
                            </a>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    )
};