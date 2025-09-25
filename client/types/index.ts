
export type AssignmentType = 'pilgan' | 'esai' | 'upload_gambar' | 'link_google';

export interface User {
  id: number;
  fullName: string;
  username: string; // <-- Ini properti yang hilang
  role: 'guru' | 'siswa' | 'admin' | 'wali_kelas';
  email: string;
  createdAt?: string;
  nisn?: string | null; // Dibuat opsional karena tidak semua user punya


}
export interface Settings {
  schoolName?: string;
  headerLogo?: string;
  loginLogo?: string;
  homeHeroTitle?: string;      
  homeHeroSubtitle?: string;
  homeHeroImage?: string;
  schoolProfile?: string;
  footerText?: string;
}

export interface ClassInfo {
  id: number;
  name: string;
}

export interface QuestionOption {
  id: number;
  optionText: string;
  isCorrect: boolean;
    explanation?: string;

}

// Tipe untuk Soal di Gudang Soal (BankedQuestion)
export interface BankedQuestion {
  id: number;
  questionText: string;
  type: 'pilgan' | 'esai' | 'upload_gambar' | 'link_google';
  difficulty: 'MUDAH' | 'SEDANG' | 'SULIT';
  subjectId: number;
  subject: Subject;
  author: { fullName: string }; // Sesuai dengan data yang dikirim controller
  options?: QuestionOption[]; // Opsi jawaban (bisa jadi tidak ada untuk soal esai)
}

export interface Subject {
  id: number;
  name: string;
  grade: number;
  Class: ClassInfo[];
}

export interface ClassSummary {
  id: number;
  name: string;
  description: string | null;
  imageUrl?: string | null;
  subject: {
    name: string;
  };
  // --- TAMBAHKAN PROPERTI INI ---
  teacher: {
    fullName: string;
  };
  // ------------------------------
  _count: {
    members: number;
  };
}
export interface MaterialInfo {
  id: number;
  title: string;
  fileUrl?: string | null;      // <-- Ubah di sini (tambahkan ?)
  youtubeUrl?: string | null;   // <-- Ubah di sini (tambahkan ?)
  content?: string | null;      // <-- Ubah di sini (tambahkan ?)
}

export interface AssignmentInfo {
  id: number;
  title: string;
  type: string;
  dueDate: string;

}

export interface AssignmentDetails {
  id: number;
  title: string;
  description: string;
  type: AssignmentType;
  dueDate: string;
  externalUrl?: string | null;
  // You can add other fields like 'questions' if needed by other components
}

export interface GlobalMaterial {
  id: number;
  title: string;
  fileUrl: string;
}

export interface ScheduleItem {
  id: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  class: { name: string };
  subject: { name: string };
  teacher?: { fullName: string }; // Opsional, karena siswa mungkin tidak perlu tahu
}

// INI YANG PALING PENTING: Definisikan dan ekspor TopicInfo
export interface TopicInfo {
  id: number;
  title: string;
  order: number;
  materials: MaterialInfo[];
  assignments: AssignmentInfo[];
}

// Anda mungkin juga perlu menambahkan ClassDetails jika belum ada secara terpusat
export interface ClassDetails {
  id: number;
  name: string;
  isEnrolled: boolean;
  teacherId: number;
  topics: TopicInfo[];
}
export interface Submission {
  id: number;
  submissionDate: string;
  score: number | null;
  essayAnswer?: string | null; // <-- PASTIKAN PROPERTI INI ADA
  student: { fullName: string };
  selectedOptions?: Record<number, number>; // Opsional, untuk pilihan ganda

}
export interface Announcement {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  author: {
    fullName: string;
  };
}

export type GroupedSubjects = Record<string, Subject[]>;