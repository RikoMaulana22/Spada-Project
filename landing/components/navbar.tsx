"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("beranda");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { href: "#beranda", label: "Beranda" },
    { href: "#tentang", label: "Tentang" },
    { href: "#visi-misi", label: "Visi & Misi" },
    { href: "#prestasi", label: "Prestasi" },
    { href: "#kontak", label: "Kontak" },
  ];

  return (
    <>
      {/* Professional School Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-lg border-b border-blue-100 shadow-lg shadow-blue-100/50"
            : "bg-white/90 backdrop-blur-md border-b border-blue-50"
        }`}>
        {/* Subtle gradient accent */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/80 to-blue-100/50"></div>

        <div className="container mx-auto px-4 relative">
          <div className="flex items-center justify-between h-16">
            {/* Professional School Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-17 h-16 rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-all duration-300">
                  <Image
                    src={"/logo.png"}
                    alt="Logo SMPN Satu Atap 1 Way Tenong"
                    width={150}
                    height={150}
                    className="object-contain"
                    priority
                  />
                </div>
              </div>
            </Link>

            {/* Desktop Navigation - Clean & Professional (Right Side) */}
            <div className="hidden md:flex items-center gap-1 ml-auto">
              {navItems.map((item, index) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative px-5 py-2 rounded-lg text-sm font-medium text-blue-700 hover:text-blue-900 hover:bg-blue-50 transition-all duration-200">
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Mobile Menu Button - Clean Design */}
            <button
              className="md:hidden relative p-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all duration-200"
              onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Mobile Navigation - Clean Slide */}
          <div
            className={`md:hidden overflow-hidden transition-all duration-300 ${
              isOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
            }`}>
            <div className="py-4 border-t border-blue-100">
              <div className="flex flex-col gap-2">
                {navItems.map((item, index) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="px-4 py-3 rounded-lg text-sm font-medium text-blue-700 hover:text-blue-900 hover:bg-blue-50 transition-all duration-200"
                    onClick={() => setIsOpen(false)}>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Professional decorative elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-24 right-10 w-1 h-1 bg-blue-300 rounded-full animate-pulse opacity-60"></div>
        <div className="absolute top-32 left-20 w-1 h-1 bg-blue-400 rounded-full animate-pulse opacity-40"></div>
      </div>

      <style jsx global>{`
        .navbar-shadow {
          box-shadow: 0 4px 20px rgba(59, 130, 246, 0.15);
        }
      `}</style>
    </>
  );
}
