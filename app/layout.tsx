import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QZH20 Message Portal",
  description: "Private message portal for QZH20 committee members",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
