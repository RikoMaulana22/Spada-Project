'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import apiClient from '@/lib/axios';
import Link from 'next/link';
// Icon Download (FaDownload) ditambahkan
import { FaChevronDown, FaChevronRight, FaFilePdf, FaClipboardList, FaFileAlt ,FaArrowLeft, FaPencilAlt, FaTrash, FaCalendarCheck, FaYoutube, FaFileWord, FaFilePowerpoint, FaFileImage, FaDownload } from 'react-icons/fa';
import YouTubeEmbed from '@/components/ui/YouTubeEmbed';
import { useAuth } from '@/contexts/AuthContext';
import AddTopicModal from '@/components/dashboard/AddTopicModal';
import AddActivityModal from '@/components/dashboard/AddActivityModal';
import AddMaterialModal from '@/components/dashboard/AddMaterialModal';
import EditTopicModal from '@/components/dashboard/EditTopicModal';
import AddAttendanceModal from '@/components/dashboard/AddAttendanceModal';
import MarkAttendanceModal from '@/components/dashboard/MarkAttendanceModal';
import toast from 'react-hot-toast';
import QuestionBankModal from '@/components/dashboard/QuestionBankModal';

// Definisikan tipe data yang dibutuhkan
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
    } | null;
}
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

    // State untuk data dan UI
    const [classData, setClassData] = useState<ClassDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [openTopics, setOpenTopics] = useState<Record<number, boolean>>({});
    const [isEditing, setIsEditing] = useState(false);
    const [viewingMaterial, setViewingMaterial] = useState<MaterialInfo | null>(null);

    // State untuk semua modal
    const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
    const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
    const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
    const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
    const [isEditTopicModalOpen, setIsEditTopicModalOpen] = useState(false);
    const [editingTopic, setEditingTopic] = useState<TopicInfo | null>(null);
    const [isAddAttendanceModalOpen, setIsAddAttendanceModalOpen] = useState(false);
    const [isMarkAttendanceModalOpen, setIsMarkAttendanceModalOpen] = useState(false);
    const [isQuestionBankModalOpen, setIsQuestionBankModalOpen] = useState(false);
    const [selectedAttendanceId, setSelectedAttendanceId] = useState<number | null>(null);

    const toggleTopic = (topicId: number) => {
        setOpenTopics(prev => ({ ...prev, [topicId]: !prev[topicId] }));
    };
    
    const fetchData = useCallback(async () => {
        if (id) {
            setIsLoading(true);
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

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Handler untuk membuka dan menutup modal
    const handleOpenActivityModal = (topicId: number) => { setSelectedTopicId(topicId); setIsActivityModalOpen(true); };
    const handleOpenAddAttendanceModal = () => { setIsActivityModalOpen(false); setIsAddAttendanceModalOpen(true); };
    const handleOpenMarkAttendanceModal = (attendanceId: number) => { setSelectedAttendanceId(attendanceId); setIsMarkAttendanceModalOpen(true); };
    const handleOpenQuestionBankModal = () => { setIsActivityModalOpen(false); setIsQuestionBankModalOpen(true); };
    const handleDeleteTopic = async (topicId: number) => { if (window.confirm('Apakah Anda yakin ingin menghapus topik ini?')) { try { await apiClient.delete(`/topics/${topicId}`); toast.success('Topik berhasil dihapus.'); fetchData(); } catch (error) { toast.error('Gagal menghapus topik.'); } } };
    const handleOpenEditModal = (topic: TopicInfo) => { setEditingTopic(topic); setIsEditTopicModalOpen(true); };
    const handleCloseTopicModal = useCallback(() => setIsTopicModalOpen(false), []);
    const handleCloseActivityModal = useCallback(() => setIsActivityModalOpen(false), []);
    const handleCloseMaterialModal = useCallback(() => setIsMaterialModalOpen(false), []);
    const handleCloseEditTopicModal = useCallback(() => setIsEditTopicModalOpen(false), []);
    const handleCloseQuestionBankModal = useCallback(() => setIsQuestionBankModalOpen(false), []);
    const handleCloseAddAttendanceModal = useCallback(() => setIsAddAttendanceModalOpen(false), []);
    const handleCloseMarkAttendanceModal = useCallback(() => setIsMarkAttendanceModalOpen(false), []);

    // Fungsi untuk mendapatkan ikon file
    const getFileIcon = (fileUrl: string) => {
        const extension = fileUrl.split('.').pop()?.toLowerCase();
        switch(extension) {
            case 'pdf': return <FaFilePdf className="text-red-500" />;
            case 'doc':
            case 'docx': return <FaFileWord className="text-blue-500" />;
            case 'ppt':
            case 'pptx': return <FaFilePowerpoint className="text-orange-500" />;
            case 'png':
            case 'jpg':
            case 'jpeg':
            case 'gif': return <FaFileImage className="text-purple-500" />;
            default: return <FaFileAlt className="text-gray-500" />;
        }
    };
    
    const isTeacher = user?.role === 'guru' && user?.id === classData?.teacherId;

    if (isLoading) return <div className="p-8 text-center">Memuat...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
    if (!classData) return <div className="p-8 text-center">Kelas tidak ditemukan.</div>;
    
    // Tampilan Pratinjau Materi
    if (viewingMaterial && viewingMaterial.fileUrl) {
        const fullFileUrl = `${backendUrl}${viewingMaterial.fileUrl}`;
        const fileType = viewingMaterial.fileUrl.split('.').pop()?.toLowerCase() || '';
        let viewerContent;

        switch(fileType) {
            case 'pdf':
                viewerContent = <iframe src={fullFileUrl} title={viewingMaterial.title} className="w-full h-full border-0" />;
                break;
            case 'png':
            case 'jpg':
            case 'jpeg':
            case 'gif':
            case 'webp':
                viewerContent = <div className="w-full h-full flex justify-center items-center bg-gray-100 p-4"><img src={fullFileUrl} alt={viewingMaterial.title} className="max-w-full max-h-full object-contain rounded-md" /></div>;
                break;
            case 'mp4':
            case 'webm':
                viewerContent = <video controls src={fullFileUrl} className="w-full h-full max-h-[85vh]"><source src={fullFileUrl} type={`video/${fileType}`} />Browser Anda tidak mendukung tag video.</video>;
                break;
            case 'docx':
            case 'pptx':
            case 'xlsx':
                const viewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fullFileUrl)}`;
                viewerContent = <iframe src={viewerUrl} title={viewingMaterial.title} className="w-full h-full border-0" />;
                break;
            default:
                viewerContent = (
                    <div className="p-8 text-center bg-gray-100 rounded-lg h-full flex flex-col justify-center items-center">
                        <h3 className="font-semibold text-lg">Pratinjau tidak tersedia untuk tipe file ini.</h3>
                    </div>
                );
        }

        return (
            <div className="space-y-4 h-[90vh] flex flex-col">
                {/* --- HEADER DENGAN TOMBOL KEMBALI DAN DOWNLOAD --- */}
                <div className="flex justify-between items-center flex-shrink-0 bg-white p-4 rounded-lg shadow-sm border">
                    <button onClick={() => setViewingMaterial(null)} className="inline-flex items-center gap-2 text-blue-600 hover:underline font-semibold">
                        <FaArrowLeft /> Kembali ke Daftar Materi
                    </button>
                    <a href={fullFileUrl} target="_blank" rel="noopener noreferrer" download className="btn-primary inline-flex items-center gap-2">
                        <FaDownload />
                        <span>Download Materi</span>
                    </a>
                </div>
                
                {/* --- AREA PRATINJAU --- */}
                <div className="bg-white p-2 rounded-lg shadow-md flex-grow">
                    {viewerContent}
                </div>
            </div>
        );
    }

    // Tampilan Utama Halaman Kelas
    return (
        <>
            {/* --- Render Semua Modal --- */}
            <AddTopicModal isOpen={isTopicModalOpen} onClose={handleCloseTopicModal} classId={classData.id} nextOrder={classData.topics?.length + 1 || 1} onTopicCreated={fetchData} />
            <AddActivityModal isOpen={isActivityModalOpen} onClose={handleCloseActivityModal} onSelectMaterial={() => { setIsActivityModalOpen(false); setIsMaterialModalOpen(true); }} onSelectQuestionBank={handleOpenQuestionBankModal} onSelectAttendance={handleOpenAddAttendanceModal} />
            <AddMaterialModal isOpen={isMaterialModalOpen} onClose={handleCloseMaterialModal} topicId={selectedTopicId} onMaterialAdded={fetchData} />
            <EditTopicModal isOpen={isEditTopicModalOpen} onClose={handleCloseEditTopicModal} topic={editingTopic} onTopicUpdated={fetchData} />
            <QuestionBankModal isOpen={isQuestionBankModalOpen} onClose={handleCloseQuestionBankModal} topicId={selectedTopicId} onAssignmentAdded={fetchData} />
            <AddAttendanceModal isOpen={isAddAttendanceModalOpen} onClose={handleCloseAddAttendanceModal} topicId={selectedTopicId} onAttendanceAdded={fetchData} />
            <MarkAttendanceModal isOpen={isMarkAttendanceModalOpen} onClose={handleCloseMarkAttendanceModal} onSuccess={fetchData} attendanceId={selectedAttendanceId} studentName={user?.fullName || ''} />

            {/* --- Konten Halaman --- */}
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
                                            {material.fileUrl ? (
                                                <button onClick={() => setViewingMaterial(material)} className="w-full text-left flex items-center gap-3 text-gray-700 font-semibold">
                                                    {getFileIcon(material.fileUrl)}
                                                    <span>{material.title} (Klik untuk melihat)</span>
                                                </button>
                                            ) : (
                                                <div className="flex items-center gap-3 text-gray-700 font-semibold">
                                                    {material.youtubeUrl && <FaYoutube className="text-red-600" />}
                                                    <span>{material.title}</span>
                                                </div>
                                            )}
                                            {material.youtubeUrl && (
                                                <div className="mt-4">
                                                    <YouTubeEmbed url={material.youtubeUrl} />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {topic.assignments?.map((assignment) => {
                                        const isStudent = user?.role === 'siswa';
                                        const attemptLimit = assignment.attemptLimit || 1;
                                        const studentAttemptCount = assignment.studentProgress?.attemptCount || 0;
                                        const canStillAttempt = !isStudent || (studentAttemptCount < attemptLimit);
                                        return (
                                            <div key={assignment.id} className={`flex justify-between items-center p-3 border rounded-md transition-colors ${canStillAttempt ? 'bg-slate-50 hover:bg-slate-100' : 'bg-gray-200 text-gray-500'}`}>
                                                {canStillAttempt ? (
                                                    <Link href={`/tugas/${assignment.id}`} className="flex items-center gap-3 font-semibold text-gray-700 w-full">
                                                        <FaClipboardList className="text-green-500" />
                                                        <div className="flex-grow"><span>{assignment.title}</span></div>
                                                        {isStudent && (<span className="text-sm text-blue-600 font-normal">Sisa: {attemptLimit - studentAttemptCount}x</span>)}
                                                    </Link>
                                                ) : (
                                                    <div className="flex items-center gap-3 font-semibold w-full cursor-not-allowed">
                                                        <FaClipboardList className="text-gray-400" />
                                                        <div className="flex-grow"><span>{assignment.title}</span></div>
                                                        <span className="text-sm text-red-600 font-bold">Selesai</span>
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
                                            {isTeacher ? (
                                                <Link href={`/absensi/${topic.attendance.id}`} className="text-blue-600 hover:underline font-semibold text-sm">Lihat Rekap</Link>
                                            ) : (
                                                <button onClick={() => handleOpenMarkAttendanceModal(topic.attendance!.id)} className="btn-primary text-sm">Tandai Kehadiran</button>
                                            )}
                                        </div>
                                    )}
                                    {isEditing && (
                                        <div className="mt-4 pt-4 border-t border-dashed">
                                            <button onClick={() => handleOpenActivityModal(topic.id)} className="text-blue-600 font-semibold hover:text-blue-800">+ Tambah Aktivitas atau Sumber Daya</button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                    {isEditing && (
                        <div className="flex justify-center mt-6">
                            <button onClick={() => setIsTopicModalOpen(true)} className="btn-primary font-bold py-2 px-6">+ Tambah Topik Baru</button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}