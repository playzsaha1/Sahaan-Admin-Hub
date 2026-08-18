import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sahaan Admin Hub",
  description: "Secure workforce, client, job and schedule management for approved service businesses."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
