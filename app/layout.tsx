import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CODFlow — Orders. Deliveries. Profit.",
  description:
    "Manage your COD business — customers, orders, deliveries, and real profit — from one simple dashboard.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
