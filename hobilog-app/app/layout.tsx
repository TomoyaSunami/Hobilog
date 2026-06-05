import type { Metadata, Viewport } from "next";
import { withBasePath } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  title: "HobiLog",
  description: "Personal habit tracking PWA",
  manifest: withBasePath("/manifest.webmanifest"),
  icons: {
    icon: [
      { url: withBasePath("/icon.svg"), type: "image/svg+xml" },
      { url: withBasePath("/icon-192.png"), sizes: "192x192", type: "image/png" },
      { url: withBasePath("/icon-512.png"), sizes: "512x512", type: "image/png" }
    ],
    apple: withBasePath("/icon-192.png")
  }
};

export const viewport: Viewport = {
  themeColor: "#F2F2F7",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
