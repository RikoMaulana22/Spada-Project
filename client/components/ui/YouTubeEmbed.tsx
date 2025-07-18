'use client';

interface YouTubeEmbedProps {
  url: string;
}

// Fungsi untuk mengekstrak ID video dari berbagai format URL YouTube
const getYouTubeVideoId = (url: string): string | null => {
  // Regex yang lebih kuat untuk menangani berbagai format link
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([A-Za-z0-9_-]{11})/;
  const match = url.match(regExp);

  return (match && match[1].length === 11) ? match[1] : null;
};

export default function YouTubeEmbed({ url }: YouTubeEmbedProps) {
  const videoId = getYouTubeVideoId(url);

  if (!videoId) {
    return <p className="text-red-500">URL YouTube tidak valid atau tidak didukung.</p>;
  }

  // URL embed yang benar
  const embedUrl = `https://www.youtube.com/embed/${videoId}`;

  return (
    // Wrapper untuk membuat video responsif dengan rasio 16:9
    <div className="relative w-full " style={{ paddingBottom: '56.25%' }}>
      <iframe
        className="absolute top-0 left-0 w-full h-full rounded-lg"
        src={embedUrl}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      ></iframe>
    </div>
  );
}