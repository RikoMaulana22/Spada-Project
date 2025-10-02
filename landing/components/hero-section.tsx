"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useState, useEffect } from "react";
import {
  GraduationCap,
  Award,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const photos = [
    { src: "/pic1.jpg", title: "Kegiatan Belajar Mengajar" },
    { src: "/pic2.jpg", title: "Fasilitas Sekolah Modern" },
    { src: "/pic3.jpg", title: "Prestasi Siswa Berprestasi" },
    { src: "/pic4.jpg", title: "Lingkungan Sekolah Asri" },
  ];

  // Auto scroll every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % photos.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [photos.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % photos.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + photos.length) % photos.length);
  };

  return (
    <section
      id="beranda"
      className="pt-24 pb-16 md:pt-32 md:pb-24 bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
      {/* Floating decorative circles */}
      <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-blue-200 opacity-20 animate-pulse blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-20 right-8 w-40 h-40 rounded-full bg-blue-300 opacity-15 animate-pulse blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-gradient-to-br from-blue-100/20 to-indigo-100/20 blur-3xl opacity-30 pointer-events-none"></div>

      {/* Decorative lines */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-30"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/90 backdrop-blur-lg rounded-full border-2 border-blue-100 shadow-lg shadow-blue-100/50">
              <GraduationCap className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-semibold text-blue-800 uppercase tracking-wider">
                Sekolah Terakreditasi
              </span>
              <Sparkles className="w-5 h-5 text-blue-600" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-blue-800 leading-tight">
              SMPN Satu Atap 1
              <br className="hidden sm:block" />
              Way Tenong
            </h1>

            {/* Decorative divider */}
            <div className="flex items-center gap-5">
              <div className="h-1 w-16 bg-gradient-to-r from-blue-500 to-blue-700 rounded-full"></div>
              <div className="w-3 h-3 rounded-full bg-blue-600"></div>
              <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-blue-700 rounded-full"></div>
            </div>

            {/* Description */}
            <p className="text-lg text-slate-800 leading-relaxed max-w-xl font-medium">
              Membentuk generasi cerdas, berkarakter, dan berprestasi untuk masa
              depan Indonesia yang lebih baik.
            </p>

            {/* CTA Button */}
            <div className="flex flex-wrap gap-5 pt-4">
              <Button
                asChild
                size="lg"
                className="group relative bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white rounded-full shadow-xl shadow-blue-600/40 hover:shadow-2xl hover:shadow-blue-700/50 transition-all duration-300 hover:scale-105 px-8">
                <a
                  href="http://localhost:3000/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2">
                  <span className="font-semibold">Akses SPADA</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </a>
              </Button>
            </div>
          </div>

          {/* Right Content - Auto Carousel */}
          <div className="relative">
            {/* Premium Carousel Container */}
            <div className="relative group">
              {/* Outer glow effects */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 rounded-3xl blur-3xl opacity-20 group-hover:opacity-35 transition-all duration-500 animate-pulse"></div>
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-300 to-blue-400 rounded-3xl blur-2xl opacity-10 group-hover:opacity-20 transition-opacity duration-500"></div>

              {/* Decorative corner elements */}
              <div className="absolute -top-3 -left-3 w-8 h-8 border-t-4 border-l-4 border-blue-400 rounded-tl-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 z-20"></div>
              <div className="absolute -top-3 -right-3 w-8 h-8 border-t-4 border-r-4 border-blue-400 rounded-tr-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 z-20"></div>
              <div className="absolute -bottom-3 -left-3 w-8 h-8 border-b-4 border-l-4 border-blue-400 rounded-bl-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 z-20"></div>
              <div className="absolute -bottom-3 -right-3 w-8 h-8 border-b-4 border-r-4 border-blue-400 rounded-br-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 z-20"></div>

              {/* Main Carousel Container */}
              <div className="relative aspect-[16/10] rounded-3xl overflow-hidden border-4 border-blue-200 shadow-2xl shadow-blue-300/40 transition-all duration-500 group-hover:border-blue-300 group-hover:shadow-blue-400/50 bg-gradient-to-br from-slate-100 to-blue-50">
                {/* Slides */}
                <div className="relative w-full h-full">
                  {photos.map((photo, index) => (
                    <div
                      key={index}
                      className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                        index === currentSlide
                          ? "opacity-100 scale-100"
                          : "opacity-0 scale-95"
                      }`}>
                      <Image
                        src={photo.src}
                        alt={photo.title}
                        fill
                        className="object-cover"
                        priority={index === 0}
                      />

                      {/* Gradient overlay - Lighter */}
                      <div className="absolute inset-0 bg-gradient-to-t from-blue-900/30 via-transparent to-transparent"></div>

                      {/* Inner shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                    </div>
                  ))}
                </div>

                {/* Navigation Buttons */}
                <button
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 group/btn border-2 border-blue-200 hover:border-blue-400"
                  aria-label="Previous slide">
                  <ChevronLeft className="w-6 h-6 text-blue-700 group-hover/btn:text-blue-900 transition-colors" />
                </button>

                <button
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 group/btn border-2 border-blue-200 hover:border-blue-400"
                  aria-label="Next slide">
                  <ChevronRight className="w-6 h-6 text-blue-700 group-hover/btn:text-blue-900 transition-colors" />
                </button>

                {/* Dots Indicator */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2">
                  {photos.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`transition-all duration-300 rounded-full ${
                        index === currentSlide
                          ? "w-12 h-3 bg-white shadow-lg"
                          : "w-3 h-3 bg-white/50 hover:bg-white/80"
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Floating decorative dots */}
              <div className="absolute top-1/4 -right-2 w-3 h-3 bg-blue-400 rounded-full opacity-60 animate-bounce"></div>
              <div className="absolute top-1/2 -left-2 w-2 h-2 bg-blue-500 rounded-full opacity-40 animate-bounce delay-75"></div>
              <div className="absolute bottom-1/4 -right-2 w-2 h-2 bg-blue-300 rounded-full opacity-50 animate-bounce delay-150"></div>

              {/* Top right floating badge */}
              <div className="absolute -top-4 -right-4 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-4 shadow-xl shadow-blue-600/40 z-20">
                <Sparkles className="w-8 h-8 text-white animate-pulse" />
              </div>
            </div>

            {/* Floating Accreditation Card - Positioned Lower */}
            <div className="absolute bottom- -left-6 bg-white backdrop-blur-xl border-2 border-blue-200 rounded-2xl p-6 shadow-2xl shadow-blue-300/50 transition-all duration-500 hover:translate-y-[-8px] hover:shadow-blue-400/60 z-30">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-600 rounded-xl blur-md opacity-30"></div>
                  <div className="relative w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-xl">
                    <Award className="h-7 w-7 text-white" />
                  </div>
                </div>
                <div>
                  <p className="font-bold text-lg text-blue-800 mb-1">
                    Akreditasi C
                  </p>
                  <p className="text-sm text-slate-600 font-medium">
                    Sekolah Terakreditasi
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
