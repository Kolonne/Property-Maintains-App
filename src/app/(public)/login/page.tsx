"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { CurrentUser } from "@/context/UserContext";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = (await response.json()) as {
                error?: string;
                user?: CurrentUser;
            };

            if (!response.ok || !data.user) {
                throw new Error(data.error ?? "Unable to log in.");
            }

            router.push("/dashboard");
            router.refresh();
        } catch (submitError) {
            setError(
                submitError instanceof Error
                    ? submitError.message
                    : "Unable to log in."
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <main
            className="d-flex justify-content-center align-items-center"
            style={{
                background: "#faf7f3",
                minHeight: "calc(100vh - 78px)",
                padding: "48px 16px",
            }}
        >
            <section
                className="pm-dashboard-card p-4 p-lg-5"
                style={{ maxWidth: "460px", width: "100%" }}
            >
                <div className="text-center mb-4">
                    <span
                        className="d-inline-flex align-items-center justify-content-center mb-3"
                        style={{
                            background: "#fff1e7",
                            border: "1px solid #f3c6a7",
                            borderRadius: "999px",
                            color: "#f97316",
                            height: "54px",
                            width: "54px",
                        }}
                    >
                        <i className="bi bi-person-lock" style={{ fontSize: "23px" }} aria-hidden="true" />
                    </span>
                    <h1 className="h3 fw-bold mb-2" style={{ color: "#1f2933" }}>
                        Log in
                    </h1>
                </div>

                {error ? (
                    <div className="alert alert-danger" role="alert">
                        {error}
                    </div>
                ) : null}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="email" className="form-label fw-semibold">
                            Email address
                        </label>
                        <input
                            type="email"
                            className="form-control"
                            id="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="tenant1@example.com"
                            autoComplete="email"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="password" className="form-label fw-semibold">
                            Password
                        </label>
                        <input
                            type="password"
                            className="form-control"
                            id="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            placeholder="Enter your password"
                            autoComplete="current-password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn pm-dashboard-pill-button w-100"
                        disabled={isSubmitting}
                        style={{
                            background: "#f97316",
                            border: "1px solid #f97316",
                            color: "#ffffff",
                            padding: "10px 18px",
                        }}
                    >
                        {isSubmitting ? "Logging in..." : "Log in"}
                    </button>
                </form>

                <p className="text-center text-muted mt-4 mb-0">
                    Need a prototype account?{" "}
                    <Link href="/contact" className="pm-dashboard-link">
                        Contact support
                    </Link>
                </p>
            </section>
        </main>
    );
}
