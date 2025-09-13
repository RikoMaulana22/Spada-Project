'use client'; // <-- PERBAIKAN 1: Jadikan ini Komponen Klien

import type { Metadata } from "next"; // Metadata masih bisa digunakan di client component, walau tidak di-render di server
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from 'react-hot-toast';
import { usePathname } from 'next/navigation';
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const inter = Inter({ subsets: ["latin"] });



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  // Kondisi untuk menampilkan Header dan Footer (tidak tampil di area admin)
  const showPublicLayout = !pathname.startsWith('/admin');

  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} flex flex-col h-full bg-gray-100`}
      suppressHydrationWarning={true}
      >
        <AuthProvider>
          <Toaster 
            position="top-center"
            toastOptions={{ duration: 3000 }}
          />

          {/* PERBAIKAN 2: Struktur layout yang lebih baik */}
          {showPublicLayout ? (
            <>
              <Header />
              <main className="flex-grow container mx-auto px-4 sm:px-6 py-8">
                {/* Wrapper tambahan untuk styling halaman publik */}
                <div className="bg-white shadow-md rounded-lg p-6">
                  {children}
                </div>
              </main>
              <Footer />
            </>
          ) : (
            // Untuk layout admin, kita hanya render children-nya secara langsung
            // karena admin/layout.tsx sudah memiliki <main> dan strukturnya sendiri
            <>{children}</>
          )}
        </AuthProvider>
      </body>
    </html>
  );
}