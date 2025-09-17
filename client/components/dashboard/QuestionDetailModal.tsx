'use client';

import { useState, useEffect, FormEvent, useCallback } from 'react';
import Modal from '@/components/ui/Modal';
import apiClient from '@/lib/axios';
import toast from 'react-hot-toast';
import { BankedQuestion, Subject, QuestionOption } from '@/types';
import { FaPlus, FaTrash } from 'react-icons/fa';

interface QuestionDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    questionId: number | null;
    onQuestionUpdated: () => void;
}

// Komponen untuk Loading Spinner yang lebih baik
const Spinner = () => (
    <div className="flex justify-center items-center h-full p-10">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    </div>
);

export default function QuestionDetailModal({ isOpen, onClose, questionId, onQuestionUpdated }: QuestionDetailModalProps) {
    const [question, setQuestion] = useState<BankedQuestion | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    
    useEffect(() => {
        if (isOpen && questionId) {
            setIsLoading(true);
            setQuestion(null); // Reset state untuk menampilkan loading spinner
            Promise.all([
                apiClient.get('/subjects'),
                apiClient.get(`/question-banks/${questionId}`)
            ]).then(([subjectsRes, questionRes]) => {
                setSubjects(subjectsRes.data);
                setQuestion(questionRes.data);
            }).catch(() => {
                toast.error("Gagal memuat detail soal.");
                onClose();
            }).finally(() => {
                setIsLoading(false);
            });
        }
    // Hapus 'onClose' dari dependency array untuk mencegah re-render loop
    }, [isOpen, questionId]);

    const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setQuestion(prev => prev ? { ...prev, [name]: value } : null);
    }, []);
    
    const handleOptionTextChange = useCallback((index: number, text: string) => {
        setQuestion(prev => {
            if (!prev || !prev.options) return prev;
            const newOptions = prev.options.map((opt, idx) => 
                idx === index ? { ...opt, optionText: text } : opt
            );
            return { ...prev, options: newOptions };
        });
    }, []);

    const handleCorrectOptionChange = useCallback((index: number) => {
         setQuestion(prev => {
            if (!prev || !prev.options) return prev;
            const newOptions = prev.options.map((opt, idx) => ({
                ...opt,
                isCorrect: idx === index
            }));
            return { ...prev, options: newOptions };
        });
    }, []);
    
    const addOption = useCallback(() => {
        setQuestion(prev => {
            if (!prev) return null;
            const newOption: QuestionOption = { id: Date.now(), optionText: '', isCorrect: false };
            const newOptions = [...(prev.options || []), newOption];
            return { ...prev, options: newOptions };
        });
    }, []);

    const removeOption = useCallback((indexToRemove: number) => {
        setQuestion(prev => {
            if (!prev || !prev.options) return prev;
            const newOptions = prev.options.filter((_, index) => index !== indexToRemove);
            return { ...prev, options: newOptions };
        });
    }, []);

    const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    if (!question) return;

    setIsSaving(true);
    const toastId = toast.loading("Menyimpan perubahan...");

    // 1. Menyiapkan data (payload) yang akan dikirim ke server
    const payload = {
        questionText: question.questionText,
        difficulty: question.difficulty.toUpperCase(),
        subjectId: Number(question.subjectId),
        options: question.options?.map(({ optionText, isCorrect }) => ({ text: optionText, isCorrect }))
    };

    try {
        // 2. Mengirim data ke server menggunakan metode PUT
        await apiClient.put(`/question-banks/${question.id}`, payload);
        
        toast.success("Soal berhasil diperbarui!", { id: toastId });
        
        // 3. Memberi tahu halaman sebelumnya bahwa ada pembaruan dan menutup modal
        onQuestionUpdated(); 
    } catch (error: any) {
        toast.error(error.response?.data?.message || "Gagal menyimpan perubahan.", { id: toastId });
    } finally {
        setIsSaving(false);
    }
}, [question, onQuestionUpdated]); 

    const difficultyValue = question?.difficulty ? question.difficulty.toLowerCase() : '';

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Detail & Edit Soal" isFullScreen={true}>
            <div className="h-full flex flex-col bg-gray-50">
                {isLoading && <Spinner />}
                {!isLoading && question && (
                    <form onSubmit={handleSubmit} className="flex-grow flex flex-col">
                        {/* Area Konten Form dibuat scrollable */}
                        <div className="flex-grow p-6 space-y-6 overflow-y-auto">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Teks Pertanyaan
                                </label>
                                <textarea 
                                    name="questionText" 
                                    value={question.questionText} 
                                    onChange={handleTextChange} 
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                                    rows={5}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Mata Pelajaran
                                    </label>
                                    <select 
                                        name="subjectId" 
                                        value={question.subjectId} 
                                        onChange={handleTextChange} 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tingkat Kesulitan
                                    </label>
                                    <select 
                                        name="difficulty" 
                                        value={difficultyValue} 
                                        onChange={handleTextChange} 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 capitalize"
                                    >
                                        <option value="mudah">Mudah</option>
                                        <option value="sedang">Sedang</option>
                                        <option value="sulit">Sulit</option>
                                    </select>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Pilihan Jawaban
                                </label>
                                <div className="space-y-3">
                                    {question.options?.map((opt, index) => (
                                        <div key={opt.id || index} className="flex items-center gap-3">
                                            <input 
                                                type="radio" 
                                                name="correctOption" 
                                                checked={opt.isCorrect} 
                                                onChange={() => handleCorrectOptionChange(index)} 
                                                className="h-5 w-5 flex-shrink-0 text-blue-600 focus:ring-blue-500 border-gray-300"
                                            />
                                            <input 
                                                type="text" 
                                                value={opt.optionText} 
                                                onChange={(e) => handleOptionTextChange(index, e.target.value)} 
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 flex-grow"
                                                placeholder={`Teks untuk opsi ${index + 1}`}
                                            />
                                            {question.options && question.options.length > 1 && (
                                                <button 
                                                    type="button" 
                                                    onClick={() => removeOption(index)} 
                                                    className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-100 transition-colors"
                                                    aria-label="Hapus Opsi"
                                                >
                                                    <FaTrash size={14} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button type="button" onClick={addOption} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-semibold pt-2">
                                        <FaPlus size={12} />
                                        <span>Tambah Opsi Jawaban</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        {/* Tombol Aksi diletakkan di bagian bawah dan diberi border atas */}
                        <div className="flex-shrink-0 p-4 flex justify-end gap-3 bg-white border-t">
                            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold">
                                Batal
                            </button>
                            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold disabled:bg-blue-300" disabled={isSaving}>
                                {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </Modal>
    );
}