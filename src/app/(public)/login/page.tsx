export default function LoginPage() {
    return (
        <main className="container d-flex justify-content-center align-items-center min-vh-100">
            <div className="card shadow-sm" style={{ width: "100%", maxWidth: "420px" }}>
                <div className="card-body p-4">
                    <h1 className="h3 text-center mb-4">Login</h1>

                    <form>
                        <div className="mb-3">
                            <label htmlFor="email" className="form-label">
                                Email address
                            </label>
                            <input
                                type="email"
                                className="form-control"
                                id="email"
                                placeholder="Enter your email"
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="password" className="form-label">
                                Password
                            </label>
                            <input
                                type="password"
                                className="form-control"
                                id="password"
                                placeholder="Enter your password"
                            />
                        </div>

                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <div className="form-check">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="rememberMe"
                                />
                                <label className="form-check-label" htmlFor="rememberMe">
                                    Remember me
                                </label>
                            </div>

                            <a href="#" className="small text-decoration-none">
                                Forgot password?
                            </a>
                        </div>

                        <button type="submit" className="btn btn-primary w-100">
                            Login
                        </button>
                    </form>

                    <p className="text-center text-muted mt-4 mb-0">
                        Don&apos;t have an account?{" "}
                        <a href="/register" className="text-decoration-none">
                            Register
                        </a>
                    </p>
                </div>
            </div>
        </main>
    );
}