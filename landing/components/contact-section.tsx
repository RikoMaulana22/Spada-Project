"use client";

import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Mail, Clock, Sparkles } from "lucide-react";

export function ContactSection() {
  const contactInfo = [
    {
      icon: Phone,
      title: "Telepon",
      content: "+62 857-8979-8947",
      link: "https://wa.me/6285789798947",
      gradientFrom: "from-blue-600",
      gradientTo: "to-blue-800",
    },
    {
      icon: Mail,
      title: "Email",
      content: "smpnsatuatap1waytenong@yahoo.co.id",
      link: "mailto:smpnsatuatap1waytenong@yahoo.co.id",
      gradientFrom: "from-blue-600",
      gradientTo: "to-blue-800",
    },
    {
      icon: Clock,
      title: "Jam Operasional",
      content: "Senin - Jumat: 07.00 - 15.00 WIB",
      gradientFrom: "from-blue-600",
      gradientTo: "to-blue-800",
    },
    {
      icon: MapPin,
      title: "Alamat",
      content:
        "Way Tenong, Karangagung, Kec. Waytenong, Kab. Lampung Barat, Lampung.",
      gradientFrom: "from-blue-600",
      gradientTo: "to-blue-800",
    },
  ];

  return (
    <section
      id="kontak"
      className="py-16 md:py-24 bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
      {/* Decorative floating circles */}
      <div className="absolute top-12 left-10 w-24 h-24 rounded-full bg-blue-200 opacity-20 blur-3xl animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-16 right-12 w-32 h-32 rounded-full bg-blue-300 opacity-15 blur-3xl animate-pulse pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-gradient-to-br from-blue-100/20 to-indigo-100/20 blur-3xl opacity-30 pointer-events-none"></div>

      {/* Top decorative line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-25"></div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-8 py-3 bg-white/90 backdrop-blur-lg rounded-full border-2 border-blue-100 mb-6 shadow-lg shadow-blue-100/50">
            <Phone className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-semibold text-blue-800 uppercase tracking-wider">
              Informasi Kontak
            </span>
            <Sparkles className="w-5 h-5 text-blue-600" />
          </div>

          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-blue-800">
            Hubungi Kami
          </h2>

          {/* Accent Divider */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-0.5 w-16 bg-gradient-to-r from-transparent to-blue-400"></div>
            <div className="w-3 h-3 rounded-full bg-blue-600"></div>
            <div className="h-0.5 w-24 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-400"></div>
            <div className="w-3 h-3 rounded-full bg-blue-600"></div>
            <div className="h-0.5 w-16 bg-gradient-to-l from-transparent to-blue-400"></div>
          </div>

          <p className="text-lg text-slate-600 leading-relaxed">
            Kami siap membantu menjawab pertanyaan terkait pendaftaran dan
            informasi sekolah.
          </p>
        </div>

        {/* Contact info and map */}
        <div className="grid lg:grid-cols-2 gap-10 max-w-6xl mx-auto">
          {/* Contact Cards */}
          <div className="space-y-6">
            {contactInfo.map((info, idx) => (
              <Card
                key={idx}
                className="group border-2 border-blue-100 rounded-2xl bg-white hover:shadow-2xl hover:shadow-blue-200/40 hover:border-blue-300 transition-all duration-500 hover:-translate-y-1 overflow-hidden relative">
                {/* Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 via-blue-50/50 to-blue-50/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

                <CardContent className="p-6 relative z-10">
                  <div className="flex items-start gap-5">
                    <div className="relative flex-shrink-0">
                      {/* Icon Glow Effect */}
                      <div className="absolute inset-0 bg-blue-600 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
                      <div
                        className={`relative w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br ${info.gradientFrom} ${info.gradientTo} shadow-xl shadow-blue-600/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                        <info.icon className="h-7 w-7 text-white" />
                      </div>
                    </div>

                    <div className="space-y-2 flex-grow">
                      <h3 className="text-lg font-bold text-blue-800 group-hover:text-blue-700 transition-colors duration-300">
                        {info.title}
                      </h3>
                      {info.link ? (
                        <a
                          href={info.link}
                          target={
                            info.title === "Telepon" || info.title === "Email"
                              ? "_blank"
                              : undefined
                          }
                          rel={
                            info.title === "Telepon" || info.title === "Email"
                              ? "noopener noreferrer"
                              : undefined
                          }
                          className="text-sm text-slate-600 hover:text-blue-600 transition-colors duration-300 inline-block font-medium group-hover:underline break-words">
                          {info.content}
                        </a>
                      ) : (
                        <p className="text-sm text-slate-600 font-medium break-words">
                          {info.content}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>

                {/* Bottom accent line */}
                <div className="absolute bottom-0 left-0 w-0 h-1.5 bg-gradient-to-r from-blue-500 to-blue-700 group-hover:w-full transition-all duration-1000"></div>
              </Card>
            ))}
          </div>

          {/* Google Maps */}
          <div className="relative group">
            {/* Glow effect behind map */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>

            <div className="relative rounded-3xl overflow-hidden border-2 border-blue-200 shadow-2xl shadow-blue-300/30 h-[400px] lg:h-full group-hover:border-blue-300 transition-all duration-500">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3974.54202063052!2d104.3804875750405!3d-5.015437494961027!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e477b0cd2895d3d%3A0x7093902a1e9bb7f7!2sSMPN%20SATU%20ATAP%201%20WAYTENONG!5e0!3m2!1sid!2sid!4v1759395144808!5m2!1sid!2sid"
                title="Lokasi SMPN Satu Atap 1 Way Tenong"
                className="w-full h-full border-0"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom decorative line */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-25"></div>
    </section>
  );
}
