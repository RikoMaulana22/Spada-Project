"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Target, Star, Sparkles } from "lucide-react";

export function VisionMissionSection() {
  const missions = [
    "Menyelenggarakan pendidikan yang berkualitas dan berkarakter",
    "Mengembangkan potensi siswa secara optimal di bidang akademik dan non-akademik",
    "Menciptakan lingkungan belajar yang kondusif, aman, dan nyaman",
    "Menerapkan pembelajaran berbasis teknologi dan inovasi",
    "Membangun kerjasama dengan orang tua dan masyarakat",
    "Membentuk siswa yang berakhlak mulia dan berjiwa nasionalis",
  ];

  return (
    <section
      id="visi-misi"
      className="py-16 md:py-24 bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
      {/* Luxury Blur & Accent Circles */}
      <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-blue-200 opacity-20 blur-3xl animate-pulse pointer-events-none"></div>
      <div
        className="absolute bottom-20 right-10 w-40 h-40 rounded-full bg-blue-300 opacity-15 blur-3xl animate-pulse pointer-events-none"
        style={{ animationDelay: "2s" }}></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-gradient-to-br from-blue-100/30 to-indigo-100/20 blur-3xl opacity-30 pointer-events-none"></div>

      {/* Decorative Luxury Lines */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-25"></div>
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-25"></div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-8 py-3 bg-white/90 backdrop-blur-lg rounded-full border-2 border-blue-100 mb-6 shadow-lg shadow-blue-100/50">
            <Star className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-semibold text-blue-800 uppercase tracking-wider">
              Komitmen Pendidikan
            </span>
            <Sparkles className="w-5 h-5 text-blue-600" />
          </div>

          <h2 className="text-5xl md:text-6xl font-extrabold mb-6 text-blue-800">
            Visi & Misi
          </h2>

          {/* Divider */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="h-0.5 w-16 bg-gradient-to-r from-transparent to-blue-400"></div>
            <div className="w-3 h-3 rounded-full bg-blue-600"></div>
            <div className="h-0.5 w-24 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-400"></div>
            <div className="w-3 h-3 rounded-full bg-blue-600"></div>
            <div className="h-0.5 w-16 bg-gradient-to-l from-transparent to-blue-400"></div>
          </div>

          <p className="text-lg text-slate-600 leading-relaxed font-normal">
            Komitmen kami untuk menciptakan pendidikan yang berkualitas dan
            berkarakter
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Vision Card */}
          <Card className="group border-2 border-blue-100 bg-white hover:shadow-2xl hover:shadow-blue-200/40 transition-all duration-500 hover:-translate-y-2 overflow-hidden relative rounded-3xl">
            {/* Shine Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 via-blue-50/50 to-blue-50/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

            <CardHeader className="relative z-10 pb-4">
              <div className="flex items-center gap-4 mb-2">
                <div className="relative">
                  {/* Icon Glow */}
                  <div className="absolute inset-0 bg-blue-600 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-400"></div>
                  <div className="relative w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-600/30 group-hover:scale-110 transition-all duration-500">
                    <Eye className="h-8 w-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-3xl font-bold text-blue-800 group-hover:text-blue-700 transition-colors duration-300">
                  Visi
                </CardTitle>
              </div>
            </CardHeader>

            <CardContent className="relative z-10">
              <div className="relative p-6 bg-gradient-to-br from-slate-50/80 to-blue-50/50 rounded-2xl border border-blue-100/60 backdrop-blur-sm">
                <p className="text-base leading-relaxed text-slate-700 font-medium">
                  Mewujudkan generasi yang cerdas, berkarakter, berprestasi, dan
                  berakhlak mulia berdasarkan nilai-nilai Pancasila dan budaya
                  bangsa.
                </p>
                {/* Quote Marks */}
                <div className="absolute -top-2 -left-2 text-4xl text-blue-200 font-serif opacity-60">
                  "
                </div>
                <div className="absolute -bottom-4 -right-2 text-4xl text-blue-200 font-serif opacity-60 rotate-180">
                  "
                </div>
              </div>
            </CardContent>

            <div className="absolute bottom-0 left-0 w-0 h-1.5 bg-gradient-to-r from-blue-500 to-blue-700 group-hover:w-full transition-all duration-1000"></div>
          </Card>

          {/* Mission Card */}
          <Card className="group border-2 border-blue-100 bg-white hover:shadow-2xl hover:shadow-blue-200/40 transition-all duration-500 hover:-translate-y-2 overflow-hidden relative rounded-3xl">
            {/* Shine Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 via-blue-50/50 to-blue-50/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

            <CardHeader className="relative z-10 pb-4">
              <div className="flex items-center gap-4 mb-2">
                <div className="relative">
                  {/* Icon Glow */}
                  <div className="absolute inset-0 bg-blue-600 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-400"></div>
                  <div className="relative w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-600/30 group-hover:scale-110 transition-all duration-500">
                    <Target className="h-8 w-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-3xl font-bold text-blue-800 group-hover:text-blue-700 transition-colors duration-300">
                  Misi
                </CardTitle>
              </div>
            </CardHeader>

            <CardContent className="relative z-10">
              <div className="relative p-6 bg-gradient-to-br from-slate-50/80 to-blue-50/50 rounded-2xl border border-blue-100/60 backdrop-blur-sm">
                <ul className="space-y-4">
                  {missions.map((mission, index) => (
                    <li
                      key={index}
                      className="flex gap-4 items-start group/item hover:translate-x-2 transition-all duration-400">
                      <div className="relative flex-shrink-0">
                        {/* Number Badge Glow */}
                        <div className="absolute inset-0 bg-blue-500 rounded-full blur-md opacity-0 group-hover/item:opacity-30 transition-opacity duration-300"></div>
                        <span className="relative w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-blue-500/30 group-hover/item:scale-110 transition-all duration-300">
                          {index + 1}
                        </span>
                      </div>
                      <span className="text-sm leading-relaxed text-slate-700 font-medium group-hover/item:text-slate-900 transition-colors duration-300">
                        {mission}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>

            <div className="absolute bottom-0 left-0 w-0 h-1.5 bg-gradient-to-r from-blue-500 to-blue-700 group-hover:w-full transition-all duration-1000"></div>
          </Card>
        </div>

        {/* Bottom Decorative Element */}
        <div className="mt-16 flex justify-center">
          <div className="flex items-center gap-2">
            <div className="h-1 w-20 bg-gradient-to-r from-transparent to-blue-400 rounded-full"></div>
            <div className="w-3 h-3 rounded-full bg-blue-600 shadow-lg"></div>
            <div className="h-1 w-32 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-400 rounded-full"></div>
            <div className="w-3 h-3 rounded-full bg-blue-600 shadow-lg"></div>
            <div className="h-1 w-20 bg-gradient-to-l from-transparent to-blue-400 rounded-full"></div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </section>
  );
}
