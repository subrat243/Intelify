import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import "./globals.css";

export const metadata: Metadata = {
    title: "Intelify - Threat Intelligence Platform",
    description: "Production-ready Threat Intelligence Platform for SOC operations",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="antialiased">
                <SessionProvider>{children}</SessionProvider>
            </body>
        </html>
    );
}
