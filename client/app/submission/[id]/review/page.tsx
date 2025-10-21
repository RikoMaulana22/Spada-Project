"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter, notFound } from "next/navigation";
import Link from "next/link";
import apiClient from "@/lib/axios";
import toast from "react-hot-toast";
import {
  FaCheck,
  FaTimes,
  FaInfoCircle,
  FaArrowLeft,
  FaCommentAlt,
} from "react-icons/fa";
import QuizNavigation from "@/components/quiz/QuizNavigation";

// 🧩 Tipe data
interface ReviewData {
  id: number;
  score: number | null;
  selectedOptions: Record<string, number> | null;
  essayAnswer: string | null;
  essayScore: number | null;
  essayFeedback: string | null;
  startedOn: string;
  completedOn: string;
  timeTakenMs: number;
  assignment: {
    title: string;
    type: "pilgan" | "esai";
    questions: {
      question: {
        id: number;
        questionText: string;
        options?: {
          id: number;
          optionText: string;
          isCorrect: boolean;
          explanation?: string;
        }[];
      };
    }[];
    topic: {
      class: {
        id: number;
      };
    };
  };
}

// 🔧 Helper functions
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDuration = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes} menit ${seconds} detik`;
};

// 🌟 Komponen utama
export default function SubmissionReviewPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const submissionId = params.id;

  const [reviewData, setReviewData] = useState<ReviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 🔹 Fetch data
  const fetchData = useCallback(async () => {
    if (!submissionId) return;
    setIsLoading(true);
    try {
      const response = await apiClient.get(`/submissions/review/${submissionId}`);
      setReviewData(response.data);
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat hasil pengerjaan.");
      setReviewData(null);
    } finally {
      setIsLoading(false);
    }
  }, [submissionId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) return <div className="p-8 text-center">Memuat hasil...</div>;
  if (!reviewData) return notFound();

  const {
    assignment,
    selectedOptions,
    essayAnswer,
    score,
    essayScore,
    essayFeedback,
    startedOn,
    completedOn,
    timeTakenMs,
  } = reviewData;

  // 🔹 Buat hasil tiap soal (untuk navigasi)
  const questionResults = assignment.questions.map((aq) => {
    const question = aq.question;
    if (assignment.type === "pilgan" && selectedOptions && question.options) {
      const studentAnswerId = selectedOptions[String(question.id)];
      const correctOption = question.options.find((opt) => opt.isCorrect);
      return { isCorrect: studentAnswerId === correctOption?.id };
    }
    return { isCorrect: null };
  });

  // 🔹 Nilai akhir
  const finalScore = assignment.type === "esai" ? essayScore : score;

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Link
        href={`/kelas/${assignment.topic.class.id}`}
        className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-700 font-medium transition-colors mb-4"
      >
        <FaArrowLeft />
        <span>Kembali ke Kelas</span>
      </Link>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Bagian Kiri */}
        <div className="flex-grow">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h1 className="text-2xl text-gray-700 font-bold mb-4">
              Review Tugas: {assignment.title}
            </h1>

            {/* Info Umum */}
            <div className="border rounded-md p-4 mb-6 text-sm text-gray-900 space-y-2 bg-gray-50">
              <div className="flex justify-between">
                <strong>Mulai pada:</strong> <span>{formatDate(startedOn)}</span>
              </div>
              <div className="flex justify-between">
                <strong>Selesai pada:</strong>{" "}
                <span>{formatDate(completedOn)}</span>
              </div>
              <div className="flex justify-between">
                <strong>Waktu Pengerjaan:</strong>{" "}
                <span>{formatDuration(timeTakenMs)}</span>
              </div>
              <div className="flex justify-between">
                <strong>Nilai:</strong>{" "}
                <span className="font-bold">
                  {finalScore !== null ? finalScore.toFixed(2) : "Belum dinilai"}
                </span>
              </div>
            </div>

            {/* Soal dan Jawaban */}
            <div className="space-y-6">
              {assignment.questions.map((aq, index) => {
                const question = aq.question;

                // 📝 Soal Esai
                if (assignment.type === "esai") {
                  return (
                    <div
                      key={question.id}
                      id={`question-${index + 1}`}
                      className="p-4 rounded-lg border bg-gray-50 border-gray-200"
                    >
                      <p className="font-bold text-gray-800">
                        Soal {index + 1}
                      </p>
                      <p className="mt-2 mb-4 text-gray-700">
                        {question.questionText}
                      </p>

                      <div className="mt-4 pt-3 border-t">
                        <h4 className="font-semibold text-gray-800">
                          Jawaban Anda:
                        </h4>
                        <div className="mt-2 p-3 bg-white border rounded-md text-gray-600 whitespace-pre-wrap">
                          {essayAnswer || "(Tidak ada jawaban)"}
                        </div>
                      </div>

                      {essayFeedback && (
                        <div className="mt-4 pt-3 border-t">
                          <h4 className="font-semibold text-gray-800">
                            Feedback dari Guru:
                          </h4>
                          <div className="mt-2 p-3 rounded bg-blue-50 border border-blue-200 text-blue-800">
                            <div className="flex items-start gap-3">
                              <FaCommentAlt className="mt-1 flex-shrink-0" />
                              <p className="whitespace-pre-wrap">
                                {essayFeedback}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                // 🔘 Soal Pilihan Ganda
                if (
                  assignment.type === "pilgan" &&
                  question.options &&
                  selectedOptions
                ) {
                  const studentAnswerId = selectedOptions[String(question.id)];
                  const correctOption = question.options.find(
                    (opt) => opt.isCorrect
                  );
                  const isCorrect = studentAnswerId === correctOption?.id;

                  return (
                    <div
                      key={question.id}
                      id={`question-${index + 1}`}
                      className={`p-4 rounded-lg text-gray-700 border ${
                        isCorrect
                          ? "bg-green-50 border-green-200"
                          : "bg-red-50 border-red-200"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <p className="font-bold">Soal {index + 1}</p>
                        <p
                          className={`font-semibold ${
                            isCorrect ? "text-green-700" : "text-red-700"
                          }`}
                        >
                          {isCorrect ? "Benar" : "Salah"}
                        </p>
                      </div>

                      <p className="mb-4">{question.questionText}</p>

                      <div className="space-y-2">
                        {question.options.map((opt) => {
                          const isSelected = studentAnswerId === opt.id;
                          return (
                            <div
                              key={opt.id}
                              className={`flex items-center gap-3 p-2 rounded ${
                                isSelected ? "bg-gray-200" : ""
                              }`}
                            >
                              {isSelected &&
                                (opt.isCorrect ? (
                                  <FaCheck className="text-green-600 flex-shrink-0" />
                                ) : (
                                  <FaTimes className="text-red-500 flex-shrink-0" />
                                ))}
                              <span
                                className={`flex-grow ${
                                  isSelected ? "font-semibold" : ""
                                }`}
                              >
                                {opt.optionText}
                              </span>
                              {opt.isCorrect && (
                                <span className="text-green-600 ml-auto flex-shrink-0">
                                  (Jawaban Benar)
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-300">
                        {!isCorrect && correctOption && (
                          <p className="text-sm">
                            Jawaban yang benar adalah:{" "}
                            <strong>{correctOption.optionText}</strong>
                          </p>
                        )}
                        {correctOption?.explanation && (
                          <div className="mt-2 p-3 rounded bg-blue-50 border border-blue-200 text-blue-800 text-sm">
                            <div className="flex items-start gap-2">
                              <FaInfoCircle className="mt-1 flex-shrink-0" />
                              <div>
                                <h4 className="font-bold">Penjelasan</h4>
                                <p>{correctOption.explanation}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }

                return null;
              })}
            </div>
          </div>
        </div>

        {/* Navigasi Soal */}
        <div className="md:w-64 flex-shrink-0">
          <QuizNavigation results={questionResults} />
        </div>
      </div>
    </div>
  );
}
