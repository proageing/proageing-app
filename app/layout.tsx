import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ProAgeing — Add life to your years",
  description:
    "A guided 90-day healthy longevity transformation programme for adults 45–70.",
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
