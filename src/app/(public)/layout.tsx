import type { Metadata } from "next";
import "bootstrap/dist/css/bootstrap.min.css";
import "@/app/globals.css";

import Header from "@/components/layout/PublicAppNav";

export const metadata: Metadata = {
    title: "Property Maintains App",
    description: "COIT13232 Group Project — Rental Maintenance Management Application",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>
                <Header />
                {children}
            </body>
        </html>
    );
}
