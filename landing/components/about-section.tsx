import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Target, Heart, Lightbulb, Sparkles } from "lucide-react";
import Image from "next/image";

export function AboutSection() {
  const values = [
    {
      icon: BookOpen,
      title: "Pendidikan Berkualitas",
      description:
        "Kurikulum modern yang disesuaikan dengan perkembangan zaman",
      gradient: "from-blue-500 to-blue-700",
    },
    {
      icon: Target,
      title: "Fokus Prestasi",
      description:
        "Mengembangkan potensi siswa di bidang akademik dan non-akademik",
      gradient: "from-blue-600 to-blue-800",
    },
    {
      icon: Heart,
      title: "Karakter Unggul",
      description: "Membentuk siswa yang berakhlak mulia dan berjiwa sosial",
      gradient: "from-blue-700 to-blue-900",
    },
    {
      icon: Lightbulb,
      title: "Inovasi Pembelajaran",
      description: "Metode pembelajaran kreatif dan interaktif",
      gradient: "from-blue-800 to-blue-950",
    },
  ];

  return (
    <section
      id="tentang"
      className="py-16 md:py-24 bg-gradient-to-br from-blue-50 via-white to-blue-50 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-20 right-10 w-40 h-40 rounded-full bg-blue-200 opacity-20 blur-3xl animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-20 left-10 w-32 h-32 rounded-full bg-blue-300 opacity-15 blur-3xl animate-pulse pointer-events-none"></div>

      {/* Decorative Lines */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-30"></div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100/50 backdrop-blur-sm rounded-full border border-blue-200 mb-6">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-700 uppercase tracking-wider">
              Profil Sekolah
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-blue-900">
            Tentang Sekolah Kami
          </h2>

          {/* Decorative Divider */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-blue-300/60"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500/70"></div>
            <div className="h-px w-24 bg-gradient-to-r from-blue-300/60 via-blue-400/70 to-blue-300/60"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500/70"></div>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-blue-300/60"></div>
          </div>

          <p className="text-base md:text-lg text-blue-800/70 leading-relaxed text-justify max-w-4xl mx-auto">
            SMP NEGERI SATU ATAP 1 WAY TENONG merupakan salah satu sekolah
            jenjang SMP berstatus Negeri yang berada di wilayah Kec. Waytenong,
            Kab. Lampung Barat, Lampung.didirikan pada tanggal 10 Juli 2008
            dengan Nomor SK Pendirian 800/645/IV.7/VII/2008 yang berada dalam
            naungan Kementerian Pendidikan dan Kebudayaan. Kepala Sekolah SMPN
            SATU ATAP 1 WAY TENONG saat ini adalah A. Sutikno.
          </p>
        </div>

        {/* Values Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {values.map((value, index) => (
            <Card
              key={index}
              className="group border-2 border-blue-200 bg-white/60 backdrop-blur-sm hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-300/30 transition-all duration-500 hover:-translate-y-2 cursor-default overflow-hidden relative">
              {/* Card Shine Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/0 via-blue-400/5 to-blue-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <CardContent className="p-6 space-y-4 relative z-10">
                <div
                  className={`w-16 h-16 bg-gradient-to-br ${value.gradient} rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                  <value.icon className="h-8 w-8 text-white" />
                </div>

                <h3 className="font-bold text-xl text-blue-900 group-hover:text-blue-700 transition-colors duration-300">
                  {value.title}
                </h3>

                <p className="text-sm text-blue-800/80 leading-relaxed">
                  {value.description}
                </p>

                {/* Bottom Accent Line */}
                <div className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-blue-500 to-blue-700 group-hover:w-full transition-all duration-500"></div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* School Logo Section */}
        <div className="mt-20 text-center">
          <div className="inline-flex flex-col items-center">
            {/* Logo Container with Premium Effects */}
            <div className="relative group">
              {/* Outer Glow Ring */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-[2rem] blur-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-500 animate-pulse"></div>

              {/* Main Logo */}
              <div className="relative w-36 h-36 bg-white rounded-[2rem] shadow-2xl shadow-blue-500/40 flex items-center justify-center border-4 border-blue-200 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 p-4">
                <Image
                  src="/logo.png"
                  alt="Logo SMPN Satu Atap 1 Way Tenong"
                  width={120}
                  height={120}
                  className="object-contain drop-shadow-lg"
                  priority
                />

                {/* Inner Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>

              {/* Corner Decorations */}
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-bounce"></div>
              <div className="absolute -bottom-2 -left-2 w-5 h-5 bg-blue-600 rounded-full shadow-lg shadow-blue-600/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-bounce delay-100"></div>
            </div>

            {/* Logo Label */}
            <div className="mt-6 space-y-2">
              <div className="inline-flex items-center gap-3 px-6 py-2 bg-gradient-to-r from-blue-100 via-blue-50 to-blue-100 backdrop-blur-sm rounded-full border border-blue-200 shadow-md">
                <p className="text-sm font-semibold text-blue-800">
                  SMPN Satu Atap 1 Way Tenong
                </p>
              </div>

              {/* Additional Info */}
              <p className="text-xs text-blue-600/70 italic">
                Simbol Keunggulan & Prestasi
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Decorative Line */}
        <div className="mt-16 flex justify-center">
          <div className="h-1 w-64 bg-gradient-to-r from-transparent via-blue-400 to-transparent rounded-full opacity-40"></div>
        </div>
      </div>
    </section>
  );
}
