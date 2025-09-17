"use client";

import { useState, useEffect, useCallback } from 'react';
import { useParams, notFound } from 'next/navigation';
import apiClient from '@/lib/axios';
import toast from 'react-hot-toast';
import { FaCheck, FaTimes, FaInfoCircle } from 'react-icons/fa';
import QuizNavigation from '@/components/quiz/QuizNavigation';

// Tipe data tidak perlu diubah, sudah sesuai
interface ReviewData {
  id: number;
  score: number | null;
  selectedOptions: Record<string, number>;
  startedOn: string;
  completedOn: string;
  timeTakenMs: number;
  assignment: {
    title: string;
    questions: {
        // Ini adalah tipe untuk AssignmentQuestion (tabel join)
        question: { // Ini adalah tipe untuk QuestionBank
            id: number; 
            questionText: string; 
            options: { 
                id: number; 
                optionText: string; 
                isCorrect: boolean;
                explanation?: string;
            }[]; 
        }
    }[];
  };
}

// Fungsi helper tidak berubah
const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
};
const formatDuration = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes} menit ${seconds} detik`;
};


export default function SubmissionReviewPage() {
    const params = useParams();
    const submissionId = params.id;
    const [reviewData, setReviewData] = useState<ReviewData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = useCallback(async () => {
        if (!submissionId) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            const response = await apiClient.get(`/submissions/review/${submissionId}`);
            setReviewData(response.data);
        } catch (error) {
            console.error("Gagal memuat hasil review:", error);
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

    const { assignment, selectedOptions, score, startedOn, completedOn, timeTakenMs } = reviewData;
    
    // ==================================================================
    // PERBAIKAN 1 DI SINI
    // ==================================================================
    const questionResults = assignment.questions.map(assignmentQuestion => {
        const question = assignmentQuestion.question; // Ambil objek soal yang sebenarnya
        const studentAnswerId = selectedOptions[question.id];
        const correctOption = question.options.find(opt => opt.isCorrect);
        return { isCorrect: studentAnswerId === correctOption?.id };
    });

    return (
        <div className="container mx-auto p-4 md:p-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Konten Utama */}
            <div className="flex-grow">
              <div className="bg-white p-6 rounded-lg shadow-md">
                  <h1 className="text-2xl text-gray-700 font-bold mb-4">Post Test: {assignment.title}</h1>

                  {/* Tabel Ringkasan Pengerjaan */}
                  <div className="border rounded-md p-4 mb-6 text-sm text-gray-900 space-y-2 bg-gray-50">
                      <div className="flex justify-between"><strong>Started on:</strong> <span>{formatDate(startedOn)}</span></div>
                      <div className="flex justify-between"><strong>State:</strong> <span>Finished</span></div>
                      <div className="flex justify-between"><strong>Completed on:</strong> <span>{formatDate(completedOn)}</span></div>
                      <div className="flex justify-between"><strong>Time taken:</strong> <span>{formatDuration(timeTakenMs)}</span></div>
                      <div className="flex justify-between"><strong>Grade:</strong> <span className="font-bold">{score?.toFixed(2) ?? "N/A"} out of 100.00 ({score ? `${score}%` : 'N/A'})</span></div>
                  </div>

                  {/* Tampilan Soal dan Jawaban */}
                  <div className="space-y-6">
                      {/* ================================================================== */}
                      {/* PERBAIKAN 2 DI SINI */}
                      {/* ================================================================== */}
                      {assignment.questions.map((assignmentQuestion, index) => {
                          const question = assignmentQuestion.question; // Ambil objek soal yang sebenarnya
                          const studentAnswerId = selectedOptions[question.id];
                          const correctOption = question.options.find(opt => opt.isCorrect);
                          const isCorrect = studentAnswerId === correctOption?.id;

                          return (
                              <div key={question.id} id={`question-${question.id}`} className={`p-4 rounded-lg text-gray-700 border ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                  <div className="flex justify-between items-start mb-3">
                                      <p className="font-bold">Question {index + 1}</p>
                                      <p className={`font-semibold ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                                          {isCorrect ? 'Correct' : 'Incorrect'}
                                      </p>
                                  </div>
                                  <p className="mb-4">{question.questionText}</p>
                                  <div className="space-y-2">
                                      {question.options.map(opt => { // Akses dari question.options
                                          const isSelected = studentAnswerId === opt.id;
                                          return (
                                              <div key={opt.id} className={`flex items-center gap-3 p-2 rounded ${isSelected ? 'bg-gray-200' : ''}`}>
                                                  {isSelected && (opt.isCorrect ? <FaCheck className="text-green-600 flex-shrink-0"/> : <FaTimes className="text-red-500 flex-shrink-0"/>)}
                                                  <span className={`flex-grow ${isSelected ? 'font-semibold' : ''}`}>{opt.optionText}</span>
                                                  {opt.isCorrect && <span className="text-green-600 ml-auto flex-shrink-0">(Jawaban Benar)</span>}
                                              </div>
                                          );
                                      })}
                                  </div>
                                  
                                  <div className="mt-4 pt-3 border-t border-gray-300">
                                      {!isCorrect && (
                                        <p className="text-sm">The correct answer is: <strong>{correctOption?.optionText}</strong></p>
                                      )}
                                      {correctOption?.explanation && (
                                          <div className="mt-2 p-3 rounded bg-blue-50 border border-blue-200 text-blue-800 text-sm">
                                              <div className="flex items-start gap-2">
                                                  <FaInfoCircle className="mt-1 flex-shrink-0"/>
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
                      })}
                  </div>
              </div>
            </div>
            
            {/* Sidebar Navigasi Kuis */}
            <div className="md:w-64 flex-shrink-0">
              <QuizNavigation results={questionResults} />
            </div>
          </div>
        </div>
    );
}