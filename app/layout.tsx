import type { Metadata } from "next";

import { SiteHeader } from "@/components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: "Real News",
  description:
    "A non-partisan credibility and context layer for current news coverage."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
