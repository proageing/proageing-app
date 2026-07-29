import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ProAgeing — Add life to your years",
  description: "The 21-Day ProAgeing Challenge — try the 7 ProAgeing Steps for healthy longevity.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#ff9c00",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
