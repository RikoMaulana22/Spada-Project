'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import apiClient from '@/lib/axios';
import Link from 'next/link';

import { FaChevronDown, FaChevronRight, FaFilePdf, FaClipboardList, FaArrowLeft, FaPencilAlt, FaTrash, FaCalendarCheck, FaYoutube } from 'react-icons/fa';
import YouTubeEmbed from '@/components/ui/YouTubeEmbed';

import { useAuth } from '@/contexts/AuthContext';
import AddTopicModal from '@/components/dashboard/AddTopicModal';
import AddActivityModal from '@/components/dashboard/AddActivityModal';
import AddMaterialModal from '@/components/dashboard/AddMaterialModal';
import EditTopicModal from '@/components/dashboard/EditTopicModal';
import AddAssignmentModal from '@/components/dashboard/AddAssignmentModal';
import AddAttendanceModal from '@/components/dashboard/AddAttendanceModal';
import MarkAttendanceModal from '@/components/dashboard/MarkAttendanceModal';
import toast from 'react-hot-toast';

// Define Data Types
interface MaterialInfo {
  id: number;
  title: string;
  fileUrl?: string | null;
  youtubeUrl?: string | null;
}
interface AssignmentInfo { 
    id: number; 
    title: string; 
    type: string;
    dueDate: string; 
    attemptLimit: number;
    studentProgress: {
        attemptCount: number;
        highestScore?: number;
    } | null;}
interface AttendanceInfo { id: number; title: string; }
interface TopicInfo {
  id: number;
  title: string;
  order: number;
  materials: MaterialInfo[];
  assignments: AssignmentInfo[];
  attendance?: AttendanceInfo | null;
}
interface ClassDetails {
  id: number;
  name: string;
  isEnrolled: boolean;
  teacherId: number;
  topics: TopicInfo[];
}

export default function ClassDetailPage() {
    const params = useParams();
    const { id } = params;
    const { user } = useAuth();
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    // State for data and UI
    const [classData, setClassData] = useState<ClassDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [openTopics, setOpenTopics] = useState<Record<number, boolean>>({});
    const [isEditing, setIsEditing] = useState(false);
    
    // State for all modals
    const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
    const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
    const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
    const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
    const [isEditTopicModalOpen, setIsEditTopicModalOpen] = useState(false);
    const [editingTopic, setEditingTopic] = useState<TopicInfo | null>(null);
    const [isAddAttendanceModalOpen, setIsAddAttendanceModalOpen] = useState(false); // For Teachers
    const [isMarkAttendanceModalOpen, setIsMarkAttendanceModalOpen] = useState(false); // For Students
    const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
    const [selectedAttendanceId, setSelectedAttendanceId] = useState<number | null>(null);

    const toggleTopic = (topicId: number) => {
        setOpenTopics(prev => ({ ...prev, [topicId]: !prev[topicId] }));
    };

    const fetchData = useCallback(async () => {
        if (id) {
            if (classData === null) setIsLoading(true);
            setError(null);
            try {
                const response = await apiClient.get(`/classes/${id}`);
                setClassData(response.data);
            } catch (err) {
                setError('Gagal memuat data kelas.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        }
    }, [id]);

    useEffect(() => { fetchData(); }, [fetchData]);

    // Handler for teacher to open the "Add Activity" choice modal
    const handleOpenActivityModal = (topicId: number) => {
        setSelectedTopicId(topicId);
        setIsActivityModalOpen(true);
    };
    
    // Handler for TEACHER to open the modal to CREATE an attendance session
    const handleOpenAddAttendanceModal = () => {
        setIsActivityModalOpen(false);
        setIsAddAttendanceModalOpen(true);
    };
    
    // Handler for STUDENT to open the modal to MARK their attendance
    const handleOpenMarkAttendanceModal = (attendanceId: number) => {
        setSelectedAttendanceId(attendanceId);
        setIsMarkAttendanceModalOpen(true);
    };

    const handleDeleteTopic = async (topicId: number) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus topik ini?')) {
            try {
                await apiClient.delete(`/topics/${topicId}`);
                toast.success('Topik berhasil dihapus.');
                fetchData();
            } catch (error) {
                toast.error('Gagal menghapus topik.');
            }
        }
    };

    const handleOpenEditModal = (topic: TopicInfo) => {
        setEditingTopic(topic);
        setIsEditTopicModalOpen(true);
    };

    const isTeacher = user?.role === 'guru' && user?.id === classData?.teacherId;

    if (isLoading) return <div className="p-8 text-center">Memuat...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
    if (!classData) return <div className="p-8 text-center">Kelas tidak ditemukan.</div>;

    return (
        <>
            {/* --- Render All Modals --- */}
            <AddTopicModal isOpen={isTopicModalOpen} onClose={() => setIsTopicModalOpen(false)} classId={classData.id} nextOrder={classData.topics?.length + 1 || 1} onTopicCreated={fetchData} />
            <AddActivityModal 
                isOpen={isActivityModalOpen}
                onClose={() => setIsActivityModalOpen(false)}
                onSelectMaterial={() => { setIsActivityModalOpen(false); setIsMaterialModalOpen(true); }}
                onSelectAssignment={() => { setIsActivityModalOpen(false); setIsAssignmentModalOpen(true); }}
                onSelectAttendance={handleOpenAddAttendanceModal}
            />
            <AddMaterialModal isOpen={isMaterialModalOpen} onClose={() => setIsMaterialModalOpen(false)} topicId={selectedTopicId} onMaterialAdded={fetchData} />
            <EditTopicModal isOpen={isEditTopicModalOpen} onClose={() => setIsEditTopicModalOpen(false)} topic={editingTopic} onTopicUpdated={fetchData} />
            <AddAssignmentModal isOpen={isAssignmentModalOpen} onClose={() => setIsAssignmentModalOpen(false)} topicId={selectedTopicId} onAssignmentAdded={fetchData} />
            
            <AddAttendanceModal isOpen={isAddAttendanceModalOpen} onClose={() => setIsAddAttendanceModalOpen(false)} topicId={selectedTopicId} onAttendanceAdded={fetchData} />
            <MarkAttendanceModal
                isOpen={isMarkAttendanceModalOpen}
                onClose={() => setIsMarkAttendanceModalOpen(false)}
                onSuccess={fetchData}
                attendanceId={selectedAttendanceId}
                studentName={user?.fullName || ''}
            />

            {/* --- Page Display --- */}
            <div className="space-y-6">
                 <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-700 font-medium transition-colors">
                    <FaArrowLeft />
                    <span>Kembali ke Daftar Kelas</span>
                </Link>
                <div className="flex justify-between items-center pb-4 mb-4 border-b border-gray-200">
                    <h1 className="text-3xl font-bold text-gray-800">{classData.name}</h1>
                    {isTeacher && (
                        <button onClick={() => setIsEditing(!isEditing)} className={`px-4 py-2 rounded-lg text-white font-semibold transition-colors ${isEditing ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}>
                            {isEditing ? 'Matikan Mode Edit' : 'Hidupkan Mode Edit'}
                        </button>
                    )}
                </div>

                <div className="space-y-4">
                    {classData.topics?.map((topic) => (
                        <div key={topic.id} className="bg-white p-4 rounded-lg shadow-md">
                            <div className="flex justify-between items-center">
                                <button onClick={() => toggleTopic(topic.id)} className="flex-grow flex items-center text-gray-800 text-left">
                                    <span className="font-semibold text-xl">{topic.title}</span>
                                    {openTopics[topic.id] ? <FaChevronDown className="ml-4" /> : <FaChevronRight className="ml-4" />}
                                </button>
                                {isEditing && (
                                    <div className="flex gap-3">
                                        <button onClick={() => handleOpenEditModal(topic)} className="text-gray-500 hover:text-blue-600"><FaPencilAlt /></button>
                                        <button onClick={() => handleDeleteTopic(topic.id)} className="text-gray-500 hover:text-red-600"><FaTrash /></button>
                                    </div>
                                )}
                            </div>
                            
                            {openTopics[topic.id] && (
                                <div className="pt-4 pl-6 pr-2 space-y-3 border-t mt-3">
                                    {topic.materials?.map((material) => (
                                        <div key={material.id} className="p-3 bg-slate-50 border rounded-md hover:bg-slate-100 transition-colors">
                                            <div className="flex items-center gap-3 text-gray-700 font-semibold">
                                                {material.fileUrl && <FaFilePdf className="text-red-500" />}
                                                {material.youtubeUrl && <FaYoutube className="text-red-600" />}
                                                <span>{material.title}</span>
                                            </div>
                                            
                                            {material.fileUrl && (
                                                <a href={`${backendUrl}${material.fileUrl}`} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline mt-1 block">
                                                    Download Materi
                                                </a>
                                            )}

                                            {material.youtubeUrl && (
                                                <div className="mt-4">
                                                    <YouTubeEmbed url={material.youtubeUrl} />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    
                                    {topic.assignments?.map((assignment) => {
    // 1. Ambil data yang relevan dari setiap tugas
    const isStudent = user?.role === 'siswa';
    const attemptLimit = assignment.attemptLimit || 1;
    const studentAttemptCount = assignment.studentProgress?.attemptCount || 0;
    
    // 2. Tentukan apakah siswa masih bisa mengerjakan tugas ini
    const canStillAttempt = !isStudent || (studentAttemptCount < attemptLimit);
    
    return (
        <div 
            key={assignment.id} 
            className={`flex justify-between items-center p-3 border rounded-md transition-colors ${
                canStillAttempt
                    ? 'bg-slate-50 hover:bg-slate-100' // Tampilan jika bisa diakses
                    : 'bg-gray-200 text-gray-500'      // Tampilan jika sudah tidak bisa
            }`}
        >
            {canStillAttempt ? (
                // JIKA SISWA MASIH PUNYA KESEMPATAN (atau jika Anda adalah GURU)
                <Link href={`/tugas/${assignment.id}`} className="flex items-center gap-3 font-semibold text-gray-700 w-full">
                    <FaClipboardList className="text-green-500" />
                    <div className="flex-grow">
                        <span>{assignment.title}</span>
                    </div>
                    {isStudent && (
                        <span className="text-sm text-blue-600 font-normal">
                            Sisa: {attemptLimit - studentAttemptCount}x
                        </span>
                    )}
                </Link>
            ) : (
                // JIKA KESEMPATAN SISWA SUDAH HABIS
                <div className="flex items-center gap-3 font-semibold w-full cursor-not-allowed">
                    <FaClipboardList className="text-gray-400" />
                    <div className="flex-grow">
                        <span>{assignment.title}</span>
                    </div>
                    <span className="text-sm text-red-600 font-bold">
                        Selesai
                    </span>
                </div>
            )}
        </div>
    );
})}
                                    
                                    {topic.attendance && (
                                        <div className="flex justify-between items-center p-3 bg-slate-50 border rounded-md hover:bg-slate-100 transition-colors">
                                            <div className="flex items-center gap-3 font-semibold text-gray-800">
                                                <FaCalendarCheck className="text-indigo-500" />
                                                <span>{topic.attendance.title}</span>
                                            </div>
                                            
                                            {user?.role === 'siswa' && (
                                                <button 
                                                    onClick={() => handleOpenMarkAttendanceModal(topic.attendance!.id)}
                                                    className="btn-primary text-sm"
                                                >
                                                    Tandai Kehadiran
                                                </button>
                                            )}
                                        </div>
                                    )}
                                    
                                    {isEditing && (
                                        <div className="mt-4 pt-4 border-t border-dashed">
                                            <button onClick={() => handleOpenActivityModal(topic.id)} className="text-blue-600 font-semibold hover:text-blue-800">
                                                + Tambah Aktivitas atau Sumber Daya
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                    
                    {isEditing && (
                        <div className="flex justify-center mt-6">
                            <button onClick={() => setIsTopicModalOpen(true)} className="btn-primary font-bold py-2 px-6">
                                + Tambah Topik Baru
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}