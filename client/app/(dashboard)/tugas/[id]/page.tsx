'use client';

import { useState, useEffect, useCallback, FormEvent } from 'react';
import { useParams, useRouter, notFound } from 'next/navigation';
import Link from 'next/link';
import apiClient from '@/lib/axios';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';

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
      // teacherId diganti dengan objek teacher
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

  const [assignment, setAssignment] = useState<AssignmentDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State untuk jawaban
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [essayAnswer, setEssayAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    if (!assignmentId) return;
    setIsLoading(true);
    try {
      const response = await apiClient.get(`/assignments/${assignmentId}`);
      setAssignment(response.data);
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
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!assignment) return;

    // Bagian validasi Anda sudah benar
    if (assignment.type === 'pilgan') {
        const totalQuestions = assignment.questions.length || 0;
        const answeredQuestions = Object.keys(answers).length;
        if (answeredQuestions < totalQuestions) {
            toast.error('Harap jawab semua pertanyaan sebelum mengumpulkan.');
            return;
        }
    } else if (assignment.type === 'esai' && !essayAnswer.trim()) {
        toast.error('Harap isi jawaban esai Anda.');
        return;
    }

    if (window.confirm('Apakah Anda yakin ingin mengumpulkan jawaban Anda?')) {
        setIsSubmitting(true);
        const payload = assignment.type === 'esai' 
            ? { essayAnswer } 
            : { answers };
        
        // Ambil classId dengan aman sebelum masuk ke blok try-catch
        const classId = assignment.topic?.class?.id;

        try {
            const response = await apiClient.post(`/submissions/assignment/${assignmentId}`, payload);
            toast.success(response.data.message || "Jawaban berhasil dikumpulkan!");
            
            // --- PERBAIKAN UTAMA DI SINI ---
            // Gunakan variabel classId yang sudah aman untuk redirect.
            // Ini mencegah error jika karena suatu hal data kelas tidak ada.
            if (classId) {
                router.push(`/kelas/${classId}`);
            } else {
                router.push('/dashboard'); // Arahkan ke dashboard sebagai fallback yang aman
            }

        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Gagal mengumpulkan jawaban.');
        } finally {
            setIsSubmitting(false);
        }
    }
  };

  if (isLoading) return <div className="p-8 text-center text-lg">Memuat Kuis...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!assignment) return notFound();

  // Variabel untuk verifikasi guru
  const isTeacher = user?.role === 'guru' && user?.id === assignment?.topic.class.teacher.id;

  return (
    <div className="container mx-auto p-4 md:p-8 text-gray-700">
      {/* Header Halaman */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6 border-l-4 text-gray-800 border-blue-600">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold">{assignment.title}</h1>
            <p className="text-gray-600 mt-2">{assignment.description}</p>
          </div>
          {/* Tombol ini HANYA untuk guru */}
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

      {/* --- PERBAIKAN DI SINI --- */}
      {/* Tampilkan form pengerjaan HANYA untuk siswa */}
      {user?.role === 'siswa' && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg  text-gray-800 shadow-md">
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
              <div>
                  <p className="font-semibold text-gray-800">{assignment.questions[0]?.questionText}</p>
                  <textarea 
                      value={essayAnswer}
                      onChange={(e) => setEssayAnswer(e.target.value)}
                      required
                      rows={15}
                      className="mt-4 w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ketik jawaban esai Anda di sini..."
                  />
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