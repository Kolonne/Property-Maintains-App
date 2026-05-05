import type { Metadata } from "next";
import "bootstrap/dist/css/bootstrap.min.css";
import "@/app/globals.css";

import { UserProvider } from "@/context/UserContext";
import Header from "../../components/layout/ProtectedAppNav";

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
        <UserProvider>
          <Header />
          {children}
        </UserProvider>
      </body>
    </html>
  );
}
