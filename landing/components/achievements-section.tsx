"use client";

import React, { useState } from "react";
import Image from "next/image";

import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Medal, Star, Award, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function AchievementsSection() {
  const [selectedAchievement, setSelectedAchievement] = useState<number | null>(
    null
  );

  const achievements = [
    {
      icon: Trophy,
      title: "Juara 2 OSN",
      year: "2024",
      level: "Tingkat Kabupaten",
      color: "bg-gradient-to-br from-blue-600 to-blue-800",
      image: "/picpre1.jpg",
      description:
        "Siswa kami berhasil meraih juara 1 dalam Olimpiade Matematika tingkat Kabupaten. Prestasi ini membuktikan dedikasi dan kemampuan luar biasa dalam bidang matematika.",
    },
    {
      icon: Medal,
      title: "Juara Taekwondo",
      year: "2024",
      level: "Tingkat Provinsi",
      color: "bg-gradient-to-br from-slate-500 to-slate-700",
      image: "/picpre2.jpeg",
      description:
        "Tim karya ilmiah kami berhasil meraih juara 2 di tingkat Provinsi dengan penelitian inovatif tentang lingkungan hidup.",
    },
    {
      icon: Star,
      title: "Pencak Silat",
      year: "2023",
      level: "Tingkat Nasioal",
      color: "bg-gradient-to-br from-blue-600 to-blue-800",
      image: "/picpre3.jpg",
      description:
        "Siswa kami menunjukkan kemampuan berbahasa Inggris yang luar biasa dengan meraih juara 1 dalam lomba pidato tingkat Kabupaten.",
    },
  ];

  return (
    <section
      id="prestasi"
      className="py-16 md:py-24 bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
      {/* Floating decorative circles */}
      <div className="absolute top-10 left-8 w-24 h-24 rounded-full bg-blue-200 opacity-20 blur-3xl animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-16 right-10 w-32 h-32 rounded-full bg-blue-300 opacity-15 blur-3xl animate-pulse pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-gradient-to-br from-blue-100/20 to-indigo-100/20 blur-3xl opacity-30 pointer-events-none"></div>

      {/* Top decorative line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-25"></div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-8 py-3 bg-white/90 backdrop-blur-lg rounded-full border-2 border-blue-100 mb-6 shadow-lg shadow-blue-100/50">
            <Trophy className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-semibold text-blue-800 uppercase tracking-wider">
              Prestasi Membanggakan
            </span>
            <Sparkles className="w-5 h-5 text-blue-600" />
          </div>

          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-blue-800">
            Prestasi Sekolah
          </h2>

          {/* Accent Divider */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-0.5 w-16 bg-gradient-to-r from-transparent to-blue-400"></div>
            <div className="w-3 h-3 rounded-full bg-blue-600"></div>
            <div className="h-0.5 w-24 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-400"></div>
            <div className="w-3 h-3 rounded-full bg-blue-600"></div>
            <div className="h-0.5 w-16 bg-gradient-to-l from-transparent to-blue-400"></div>
          </div>

          <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Berbagai pencapaian membanggakan yang telah diraih oleh siswa-siswi
            kami
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {achievements.map((achievement, index) => (
            <Card
              key={index}
              onClick={() => setSelectedAchievement(index)}
              className="group border-2 border-blue-100 bg-white hover:shadow-2xl hover:shadow-blue-200/40 hover:border-blue-300 transition-all duration-500 hover:-translate-y-2 overflow-hidden relative flex flex-col rounded-3xl cursor-pointer">
              {/* Shine Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 via-blue-50/50 to-blue-50/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

              {/* Image */}
              <div className="relative h-52 w-full overflow-hidden">
                <Image
                  src={achievement.image || "/placeholder.svg"}
                  alt={achievement.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  priority={index < 3}
                />

                {/* Icon badge */}
                <div className="absolute top-4 right-4">
                  <div className="absolute inset-0 bg-blue-600 rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity duration-300"></div>
                  <div
                    className={`relative ${achievement.color} w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-600/40 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                    {React.createElement(achievement.icon, {
                      className: "h-7 w-7 text-white",
                      "aria-hidden": true,
                    })}
                  </div>
                </div>

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent pointer-events-none"></div>
              </div>

              <CardContent className="relative z-10 p-6 flex-grow flex flex-col justify-between bg-gradient-to-br from-slate-50/50 to-blue-50/30">
                <div>
                  <h3 className="font-bold text-xl leading-tight text-blue-800 mb-3 group-hover:text-blue-700 transition-colors duration-300">
                    {achievement.title}
                  </h3>
                  <div className="inline-block px-3 py-1 bg-blue-100 rounded-full">
                    <p className="text-sm text-blue-700 font-semibold">
                      {achievement.level}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm font-bold text-blue-600">
                    {achievement.year}
                  </p>
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-300">
                    <svg
                      className="w-4 h-4 text-blue-600"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path d="M9 5l7 7-7 7"></path>
                    </svg>
                  </div>
                </div>
              </CardContent>

              {/* Bottom accent line */}
              <div className="absolute bottom-0 left-0 w-0 h-1.5 bg-gradient-to-r from-blue-500 to-blue-700 group-hover:w-full transition-all duration-1000"></div>
            </Card>
          ))}
        </div>

        {/* Achievement Dialog */}
        <Dialog
          open={selectedAchievement !== null}
          onOpenChange={() => setSelectedAchievement(null)}>
          <DialogContent className="max-w-3xl p-0 rounded-3xl bg-white border-2 border-blue-200 shadow-2xl overflow-hidden">
            {selectedAchievement !== null && (
              <>
                {/* Dialog Image Header */}
                <div className="relative h-72 w-full overflow-hidden">
                  <Image
                    src={
                      achievements[selectedAchievement].image ||
                      "/placeholder.svg"
                    }
                    alt={achievements[selectedAchievement].title}
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

                  {/* Icon Badge on Image */}
                  <div className="absolute top-6 right-6">
                    <div
                      className={`${achievements[selectedAchievement].color} w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-900/40`}>
                      {React.createElement(
                        achievements[selectedAchievement].icon,
                        {
                          className: "h-8 w-8 text-white",
                          "aria-hidden": true,
                        }
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-8 bg-gradient-to-br from-slate-50/50 to-blue-50/30">
                  <DialogHeader className="mb-6">
                    <DialogTitle className="text-3xl text-blue-800 font-extrabold mb-2">
                      {achievements[selectedAchievement].title}
                    </DialogTitle>
                    <div className="flex items-center gap-3">
                      <span className="inline-block px-4 py-1.5 bg-blue-100 rounded-full text-sm text-blue-700 font-semibold">
                        {achievements[selectedAchievement].level}
                      </span>
                      <span className="text-sm font-bold text-blue-600">
                        • {achievements[selectedAchievement].year}
                      </span>
                    </div>
                  </DialogHeader>

                  <DialogDescription className="text-base leading-relaxed text-slate-700 font-medium">
                    {achievements[selectedAchievement].description}
                  </DialogDescription>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Bottom decorative line */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-25"></div>
    </section>
  );
}
