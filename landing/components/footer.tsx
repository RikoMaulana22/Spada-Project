import Link from "next/link";
import Image from "next/image";
import {
  Facebook,
  Instagram,
  Youtube,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  Globe,
  Award,
} from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    sekolah: [
      { label: "Tentang Kami", href: "#tentang" },
      { label: "Visi & Misi", href: "#visi-misi" },
      { label: "Prestasi", href: "#prestasi" },
    ],
    kontak: [
      { label: "Hubungi Kami", href: "#kontak" },
      { label: "Lokasi", href: "#kontak" },
    ],
  };

  const socialLinks = [
    {
      icon: Facebook,
      href: "https://web.facebook.com/profile.php?id=100071036643158",
      label: "Facebook",
      color: "hover:bg-blue-600",
    },
    {
      icon: Instagram,
      href: "https://www.instagram.com/smpnsatuatap1waytenong/?hl=id",
      label: "Instagram",
      color: "hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-600",
    },
    {
      icon: Youtube,
      href: "https://youtu.be/CgN3nHd1Rm4?si=ssrt_zZ-EaXK99kU",
      label: "YouTube",
      color: "hover:bg-red-600",
    },
    {
      icon: Mail,
      href: "mailto:smpnsatuatap1waytenong@yahoo.co.id",
      label: "Email",
      color: "hover:bg-yellow-600",
    },
  ];

  return (
    <footer className="bg-gradient-to-br from-blue-950 via-blue-900 to-blue-950 text-white relative overflow-hidden">
      {/* Premium Decorative background elements */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-700 rounded-full opacity-10 blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-600 rounded-full opacity-10 blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none animate-pulse"></div>
      <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-blue-500 rounded-full opacity-5 blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

      {/* Premium top decorative line with gradient */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-50"></div>

      {/* Decorative dots pattern */}
      <div className="absolute top-10 left-20 w-2 h-2 rounded-full bg-blue-400 opacity-30 animate-ping"></div>
      <div className="absolute top-32 right-32 w-2 h-2 rounded-full bg-blue-300 opacity-20 animate-ping delay-75"></div>
      <div className="absolute bottom-20 left-40 w-2 h-2 rounded-full bg-blue-500 opacity-25 animate-ping delay-150"></div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid md:grid-cols-3 gap-12 mb-16 max-w-6xl mx-auto">
          {/* Premium Brand Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-4 group">
              <div className="relative">
                {/* Multi-layer glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl blur-xl opacity-40 group-hover:opacity-60 transition-all duration-500 scale-110"></div>
                <div className="absolute inset-0 bg-white rounded-2xl blur-md opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>

                <div className="relative w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-900/50 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 border-2 border-blue-300/30 p-2">
                  <Image
                    src="/logo.png"
                    alt="Logo SMPN Satu Atap 1 Way Tenong"
                    width={48}
                    height={48}
                    className="object-contain"
                    priority
                  />
                </div>

                {/* Corner accents */}
                <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              <div>
                <span className="font-bold text-xl block leading-tight bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                  SMPN Satu Atap 1
                </span>
                <span className="text-sm text-blue-300 font-medium">
                  Way Tenong
                </span>
              </div>
            </div>

            <p className="text-sm text-blue-100/90 leading-relaxed border-l-2 border-blue-600/50 pl-4">
              Membentuk generasi cerdas, berkarakter, dan berprestasi untuk masa
              depan Indonesia yang gemilang.
            </p>

            {/* Premium contact info with icons */}
            <div className="space-y-4 pt-6 border-t border-blue-700/50">
              <div className="flex items-start gap-3 group cursor-pointer">
                <div className="w-9 h-9 bg-blue-800/50 rounded-lg flex items-center justify-center group-hover:bg-blue-700 transition-all duration-300 group-hover:scale-110">
                  <MapPin className="w-4 h-4 text-blue-300 group-hover:text-white transition-colors" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-blue-400 font-semibold mb-0.5">
                    Alamat
                  </p>
                  <p className="text-sm text-blue-100">
                    Way Tenong, Lampung Barat
                  </p>
                </div>
              </div>

              <a
                href="https://wa.me/6285789798947?text=Halo%20SMPN%20Satu%20Atap%201%20Way%20Tenong"
                target="_blank"
                rel="noopener noreferrer"
                className="group text-sm text-blue-100 hover:text-white transition-all duration-300 flex items-center gap-3 hover:translate-x-2">
                <div className="w-9 h-9 bg-blue-800/50 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition-all duration-300 group-hover:scale-110">
                  <Phone className="w-4 h-4 text-blue-300 group-hover:text-white transition-colors" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-blue-400 font-semibold mb-0.5">
                    Telpon
                  </p>
                  <p className="text-sm text-blue-100 group-hover:text-white transition-colors">
                    +62 857-8979-8947
                  </p>
                </div>
              </a>
            </div>
          </div>

          {/* Premium Links - Sekolah */}
          <div>
            <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 bg-blue-800/30 backdrop-blur-sm rounded-full border border-blue-700/50">
              <Sparkles className="w-4 h-4 text-blue-300" />
              <h3 className="font-bold text-base text-blue-100">Sekolah</h3>
            </div>

            <ul className="space-y-4">
              {footerLinks.sekolah.map((link, index) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="group text-sm text-blue-100 hover:text-white transition-all duration-300 flex items-center gap-3 hover:translate-x-2">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-500 font-semibold group-hover:text-blue-300 transition-colors">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="w-8 h-px bg-blue-600 group-hover:w-12 group-hover:bg-blue-400 transition-all duration-300"></span>
                    </div>
                    <span className="group-hover:font-semibold transition-all">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            {/* Additional Info Badge */}
            <div className="mt-8 p-4 bg-gradient-to-br from-blue-800/40 to-blue-900/40 backdrop-blur-sm rounded-xl border border-blue-700/30">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-4 h-4 text-blue-300" />
                <span className="text-xs font-bold text-blue-300">
                  Akreditasi
                </span>
              </div>
              <p className="text-2xl font-extrabold text-white">C</p>
              <p className="text-xs text-blue-400 mt-1">
                Terakreditasi BAN-S/M
              </p>
            </div>
          </div>

          {/* Premium Links - Kontak & Social */}
          <div>
            <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 bg-blue-800/30 backdrop-blur-sm rounded-full border border-blue-700/50">
              <Globe className="w-4 h-4 text-blue-300" />
              <h3 className="font-bold text-base text-blue-100">Kontak</h3>
            </div>

            <ul className="space-y-4 mb-8">
              {footerLinks.kontak.map((link, index) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="group text-sm text-blue-100 hover:text-white transition-all duration-300 flex items-center gap-3 hover:translate-x-2">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-500 font-semibold group-hover:text-blue-300 transition-colors">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="w-8 h-px bg-blue-600 group-hover:w-12 group-hover:bg-blue-400 transition-all duration-300"></span>
                    </div>
                    <span className="group-hover:font-semibold transition-all">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            {/* Premium Social Links */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="h-px w-8 bg-gradient-to-r from-blue-600 to-transparent"></div>
                <h4 className="text-sm font-bold text-blue-300 tracking-wide">
                  Ikuti Kami
                </h4>
                <div className="h-px flex-1 bg-gradient-to-l from-blue-600 to-transparent"></div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group relative w-12 h-12 bg-blue-800/50 backdrop-blur-sm rounded-xl flex items-center justify-center transition-all duration-500 hover:scale-125 hover:-translate-y-2 border border-blue-700/30 hover:border-transparent ${social.color}`}
                    aria-label={social.label}>
                    {/* Multi-layer glow effect */}
                    <div className="absolute inset-0 bg-white rounded-xl blur-lg opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    <social.icon className="h-5 w-5 relative z-10 text-blue-200 group-hover:text-white transition-all duration-300 group-hover:scale-110" />

                    {/* Tooltip */}
                    <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none">
                      {social.label}
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></span>
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Premium Decorative divider */}
        <div className="flex items-center justify-center gap-4 my-12">
          <div className="h-px w-32 bg-gradient-to-r from-transparent via-blue-500 to-blue-400 rounded-full"></div>
          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg shadow-blue-500/50 animate-pulse"></div>
          <div className="h-px w-40 bg-gradient-to-r from-blue-400 via-blue-300 to-blue-400 rounded-full"></div>
          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg shadow-blue-500/50 animate-pulse"></div>
          <div className="h-px w-32 bg-gradient-to-l from-transparent via-blue-500 to-blue-400 rounded-full"></div>
        </div>

        {/* Premium Bottom Bar */}
        <div className="pt-8 border-t border-blue-700/30">
          <div className="text-center">
            <p className="text-sm text-blue-300/80 mb-4">
              © {currentYear}{" "}
              <span className="font-bold text-blue-200">
                SMPN Satu Atap 1 Way Tenong
              </span>
              . All rights reserved.
            </p>
          </div>
        </div>

        {/* Premium Bottom decorative element */}
        <div className="mt-10 flex justify-center">
          <div className="inline-flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-blue-900/60 via-blue-800/60 to-blue-900/60 backdrop-blur-md rounded-full border border-blue-600/40 shadow-xl shadow-blue-900/30">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
            </span>
            <span className="text-xs text-blue-100 font-bold tracking-wider">
              SMPN SATU ATAP 1 WAY TENONG
            </span>
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
