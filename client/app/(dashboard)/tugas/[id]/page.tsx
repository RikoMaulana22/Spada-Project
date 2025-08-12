"use client";

import { useState, useEffect, useCallback, FormEvent } from 'react';
import { useParams, useRouter, notFound } from 'next/navigation';
import Link from 'next/link';
import apiClient from '@/lib/axios';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import QuizTimer from '@/components/quiz/QuizTimer'; // Impor komponen timer
import { FaArrowLeft } from 'react-icons/fa';


// Definisikan tipe data
interface Option {
  id: number;
  optionText: string;
}
interface Question {
  id: number;
  questionText: string;
  options: Option[];
}
interface AssignmentDetails {
  id: number;
  title: string;
  description: string;
  timeLimit: number | null;
  type: 'pilgan' | 'esai';
  questions: Question[];
  topic: {
    class: {
      id: number;
      teacher: {
        id: number;
      };
    };
  }
}

export default function AssignmentPage() {
  const params = useParams();
  const router = useRouter();
  const assignmentId = params.id;
  const { user } = useAuth(); // Ambil data user yang login
  const [essayAnswers, setEssayAnswers] = useState<Record<number, string>>({});

  const [assignment, setAssignment] = useState<AssignmentDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State untuk jawaban
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [essayAnswer, setEssayAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);

  const handleEssayChange = (questionId: number, value: string) => {
    setEssayAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const fetchData = useCallback(async () => {
    if (!assignmentId) return;
    setIsLoading(true);
    try {
      const response = await apiClient.get(`/assignments/${assignmentId}`);
      setAssignment(response.data);
      setStartTime(new Date());
    } catch (err) {
      setError("Gagal memuat kuis atau kuis tidak ditemukan.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [assignmentId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOptionChange = (questionId: number, optionId: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = useCallback(async (isAutoSubmit: boolean = false) => {
    console.log("Nilai startTime saat submit:", startTime);

    if (!assignment || isSubmitting || !startTime) {
      console.error("Submit dibatalkan karena kondisi tidak terpenuhi.");
      return;
    }

    const proceed = isAutoSubmit || window.confirm('Apakah Anda yakin ingin mengumpulkan jawaban Anda?');

    if (proceed) {
      setIsSubmitting(true);
      const toastId = toast.loading("Mengumpulkan jawaban...");

      const endTime = new Date();
      const timeTakenMs = endTime.getTime() - startTime.getTime();
      const combinedEssayAnswer = assignment.type === 'esai'
        ? assignment.questions.map((q, i) =>
          `SOAL ${i + 1}:\n${q.questionText}\n\nJAWABAN:\n${essayAnswers[q.id] || '(Tidak dijawab)'}`
        ).join('\n\n---\n\n')
        : '';
      const payload = {
        startedOn: startTime.toISOString(),
        timeTakenMs: timeTakenMs,
        ...(assignment.type === 'esai' ? { essayAnswer } : { answers })
      };

      try {
        const response = await apiClient.post(`/assignments/submissions/assignment/${assignmentId}`, payload);

        toast.success(response.data.message || "Jawaban berhasil dikumpulkan!", { id: toastId });

        // =====================================================================
        // === INTI PERBAIKAN UNTUK REDIRECT ADA DI 2 BARIS BERIKUT INI ===
        // =====================================================================

        // LANGKAH 1 (PERBAIKAN): Menangkap ID unik yang dikirim balik oleh server.
        const submissionId = response.data.submission.id;

        // LANGKAH 2 (PERBAIKAN): Menggunakan ID untuk mengarahkan pengguna ke halaman review.
        router.push(`/submission/${submissionId}/review`);

      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Gagal mengumpulkan jawaban.', { id: toastId });
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [assignment, isSubmitting, essayAnswer, answers, assignmentId, router, startTime, essayAnswers]);

  // Handler untuk tombol, agar bisa menampilkan konfirmasi
  const handleManualSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSubmit(false); // Panggil handleSubmit dengan isAutoSubmit = false
  };

  if (isLoading) return <div className="p-8 text-center text-lg">Memuat Kuis...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!assignment) return notFound();

  const isTeacher = user?.role === 'guru' && user?.id === assignment?.topic?.class?.teacher?.id;

  return (
    <div className="container mx-auto p-4 md:p-8 text-gray-700">
      <Link href="/kelas/1" className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-700 font-medium transition-colors mb-4">
        <FaArrowLeft />
        <span>Kembali ke Kelas</span>
      </Link>
      {/* Tampilkan timer jika ini kuis berwaktu untuk siswa */}
      {user?.role === 'siswa' && assignment.timeLimit && assignment.timeLimit > 0 && (
        <QuizTimer
          initialMinutes={assignment.timeLimit}
          onTimeUp={() => handleSubmit(true)} // Panggil handleSubmit otomatis saat waktu habis
        />
      )}

      {/* Header Halaman */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6 border-l-4 text-gray-800 border-blue-600">

        <div className="flex justify-between items-center flex-wrap gap-4">

          <div>
            <h1 className="text-3xl font-bold">{assignment.title}</h1>
            <p className="text-gray-600 mt-2">{assignment.description}</p>
          </div>
          {isTeacher && (
            <Link href={`/tugas/${assignment.id}/submissions`} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 whitespace-nowrap">
              Lihat Pengumpulan
            </Link>
          )}
        </div>
        {assignment.timeLimit && (
          <p className="text-red-500 font-semibold mt-2">Batas Waktu: {assignment.timeLimit} menit</p>
        )}
      </div>

      {/* Tampilkan form pengerjaan HANYA untuk siswa */}
      {user?.role === 'siswa' && (
        <form onSubmit={handleManualSubmit} className="bg-white p-6 rounded-lg text-gray-800 shadow-md">
          <h2 className="text-xl font-semibold mb-6 border-b pb-3">Soal</h2>

          {/* Tampilan soal berdasarkan tipe */}
          {assignment.type === 'pilgan' && (
            <div className="space-y-8">
              {assignment.questions.map((question, index) => (
                <div key={question.id}>
                  <p className="font-semibold text-gray-800">{index + 1}. {question.questionText}</p>
                  <div className="mt-4 space-y-3 pl-4">
                    {question.options.map((option) => (
                      <label key={option.id} className="flex items-center gap-3 cursor-pointer p-2 rounded-md hover:bg-gray-100">
                        <input
                          type="radio"
                          name={`question_${question.id}`}
                          value={option.id}
                          onChange={() => handleOptionChange(question.id, option.id)}
                          className="form-radio h-4 w-4 text-blue-600"
                          required
                        />
                        <span>{option.optionText}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {assignment.type === 'esai' && (
            <div className="space-y-8">
              {/* PERBAIKAN UTAMA: Looping semua soal, bukan hanya menampilkan soal pertama 
      */}
              {assignment.questions.map((question, index) => (
                <div key={question.id}>
                  <p className="font-semibold text-gray-800">{index + 1}. {question.questionText}</p>
                  <textarea
                    value={essayAnswers[question.id] || ''}
                    onChange={(e) => handleEssayChange(question.id, e.target.value)}
                    required
                    rows={8}
                    className="mt-4 w-full p-3 border border-gray-300 rounded-md ..."
                    placeholder={`Ketik jawaban untuk soal ${index + 1} di sini...`}
                  />
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 pt-6 border-t flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
            >
              {isSubmitting ? 'Mengirim...' : 'Kumpulkan Jawaban'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}