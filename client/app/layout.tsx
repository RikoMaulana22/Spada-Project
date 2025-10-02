'use client';

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
  
  // Daftar halaman yang tidak menggunakan layout utama (Header/Footer)
  const noLayoutPages = [
    '/login', 
    '/admin/login', 
  ];

  // Cek apakah halaman saat ini termasuk dalam daftar noLayoutPages
  // atau jika merupakan bagian dari area admin.
  const isLayoutHidden = noLayoutPages.includes(pathname) || pathname.startsWith('/admin/');

  // Khusus untuk halaman admin/login, layout admin akan menangani dirinya sendiri,
  // jadi kita perlu pastikan layout ini tidak ikut campur.
  const showPublicLayout = !isLayoutHidden && !pathname.startsWith('/admin');

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
          
          {showPublicLayout ? (
            <>
              <Header />
              <main className="flex-grow container mx-auto px-4 sm:px-6 py-8">
                <div className="bg-white shadow-md rounded-lg p-6">
                  {children}
                </div>
              </main>
              <Footer />
            </>
          ) : (
            // Untuk halaman login dan area admin, render children secara langsung.
            <>{children}</>
          )}
        </AuthProvider>
      </body>
    </html>
  );
}