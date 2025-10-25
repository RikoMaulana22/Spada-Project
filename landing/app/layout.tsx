import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Suspense } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "SMPN Satu Atap 1 Way Tenong - Sekolah Unggulan",
  description:
    "SMPN Satu Atap 1 Way Tenong - Membentuk generasi cerdas, berkarakter, dan berprestasi untuk masa depan Indonesia yang lebih baik.",
    
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={null}>{children}</Suspense>
      </body>
    </html>
  );
}
