// client/components/ui/FileViewer.tsx
'use client';

import React from 'react';

interface FileViewerProps {
  fileUrl: string;
  fileType: string; // e.g., 'pdf', 'docx', 'png'
  title: string;
}

const FileViewer = ({ fileUrl, fileType, title }: FileViewerProps) => {
  const fullFileUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}${fileUrl}`;

  // Tampilan default jika tipe file tidak didukung
  let content = (
    <div className="p-8 text-center bg-gray-100 rounded-lg">
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="text-sm text-gray-600 mb-4">
        Pratinjau tidak tersedia untuk tipe file ini.
      </p>
      <a
        href={fullFileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-primary"
      >
        Download File
      </a>
    </div>
  );

  // Logika untuk menampilkan file berdasarkan tipe
  switch (fileType) {
    case 'pdf':
      content = (
        <iframe
          src={fullFileUrl}
          title={title}
          className="w-full h-[80vh] border-0"
          allowFullScreen
        />
      );
      break;
    
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
      content = (
        <div className="p-4 bg-gray-100 rounded-lg flex justify-center">
            <img src={fullFileUrl} alt={title} className="max-w-full max-h-[80vh] rounded-md" />
        </div>
      );
      break;

    case 'mp4':
    case 'webm':
    case 'ogg':
      content = (
        <video controls className="w-full max-h-[80vh] rounded-lg">
          <source src={fullFileUrl} type={`video/${fileType}`} />
          Browser Anda tidak mendukung tag video.
        </video>
      );
      break;

    case 'docx':
    case 'pptx':
      // Untuk DOCX dan PPTX, kita gunakan Google Docs Viewer atau Microsoft Office Online Viewer
      // Ini adalah cara paling umum tanpa perlu library sisi klien yang berat
      const viewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fullFileUrl)}`;
      content = (
        <iframe
          src={viewerUrl}
          title={title}
          className="w-full h-[80vh] border-0"
          allowFullScreen
        />
      );
      break;
  }

  return <div>{content}</div>;
};

export default FileViewer;