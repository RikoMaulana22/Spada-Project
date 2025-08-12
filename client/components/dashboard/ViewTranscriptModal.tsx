// Path: src/components/dashboard/ViewTranscriptModal.tsx
'use client';

import React,{ useState, useEffect, useMemo } from 'react';
import apiClient from '@/lib/axios';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable, { RowInput } from 'jspdf-autotable';

// --- Definisikan tipe data ---
interface Student {
    id: number;
    fullName: string;
    nisn: string;
}

interface Grade {
    id: number;
    score: number;
    component: {
        name: string;
        subject: {
            name: string;
        }
    };
}

interface StudentDetails {
    grades: Grade[];
}

interface ViewTranscriptModalProps {
    student: Student | null;
    className: string; 
    onClose: () => void;
}

const getGradePredicate = (score: number | null | undefined): string => {
    if (score === null || score === undefined) return '';
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'E';
};

// --- Fungsi Cetak PDF yang sudah diperbarui ---
const generateTranscriptPDF = (
    student: Student, 
    className: string, 
    tableHeaders: string[],
    subjects: string[],
    transcriptData: Record<string, Record<string, number>>,
    subjectAverages: Record<string, number>,
    overallStats: { totalSum: number; overallAverage: number }
) => {
    if (!student) return;

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Transkrip Nilai Siswa', 14, 22);
    doc.setFontSize(11);
    doc.text(`Nama: ${student.fullName}`, 14, 32);
    doc.text(`NISN: ${student.nisn || '-'}`, 14, 38);
    doc.text(`Kelas: ${className}`, 14, 44);

    const head = [['Mata Pelajaran', ...tableHeaders, 'Rata-rata']];
    const body: RowInput[] = [];

    // Buat dua baris untuk setiap mata pelajaran
    subjects.forEach(subject => {
        const avg = subjectAverages[subject];
        const predicate = getGradePredicate(avg);

        // Baris untuk nilai
        const scoreRow: RowInput = [subject];
        tableHeaders.forEach(header => {
            scoreRow.push(transcriptData[subject]?.[header]?.toString() ?? '-');
        });
        scoreRow.push(avg?.toFixed(2) ?? '-');
        body.push(scoreRow);

        // Baris untuk predikat
        body.push([
            { content: `Predikat`, styles: { halign: 'right', fontStyle: 'italic' } },
            { content: `(${predicate})`, colSpan: tableHeaders.length, styles: { fontStyle: 'italic' } }
        ]);
    });

    const foot: RowInput[] = [
        [{ content: 'JUMLAH', colSpan: tableHeaders.length + 1, styles: { halign: 'right', fontStyle: 'bold' } }, { content: overallStats.totalSum.toFixed(2), styles: { fontStyle: 'bold', halign: 'center' } }],
        [{ content: 'RATA-RATA KESELURUHAN', colSpan: tableHeaders.length + 1, styles: { halign: 'right', fontStyle: 'bold' } }, { content: overallStats.overallAverage.toFixed(2), styles: { fontStyle: 'bold', halign: 'center' } }],
        [{ content: 'PREDIKAT KESELURUHAN', colSpan: tableHeaders.length + 1, styles: { halign: 'right', fontStyle: 'bold' } }, { content: `(${getGradePredicate(overallStats.overallAverage)})`, styles: { fontStyle: 'bold', halign: 'center' } }],
    ];

    autoTable(doc, {
        startY: 50,
        head: head,
        body: body,
        foot: foot,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        footStyles: { fillColor: [230, 247, 255], textColor: [0, 82, 128] },
        styles: { cellPadding: 2, fontSize: 8 },
        didParseCell: function (data) {
             if (data.column.index === head[0].length - 1 && data.row.section === 'body') {
                data.cell.styles.fontStyle = 'bold';
                data.cell.styles.fillColor = '#ecf8ff';
                data.cell.styles.halign = 'center';
            }
        },
    });

    doc.save(`transkrip_${student.fullName.replace(/ /g, '_')}.pdf`);
    toast.success('Transkrip sedang diunduh!');
};


// --- Komponen Modal ---
export default function ViewTranscriptModal({ student, className, onClose }: ViewTranscriptModalProps) {
    const [details, setDetails] = useState<StudentDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!student) return;
        setIsLoading(true);
        apiClient.get(`/homeroom/student/${student.id}`)
            .then(res => setDetails(res.data))
            .catch(() => toast.error("Gagal memuat detail transkrip."))
            .finally(() => setIsLoading(false));
    }, [student]);

    const tableHeaders = useMemo(() => {
        if (!details || !details.grades || details.grades.length === 0) return [];
        const existingComponents = [...new Set(details.grades.map(g => g.component.name))];
        const desiredOrder = ['PERTEMUAN 1', 'PERTEMUAN 2', 'PERTEMUAN 3', 'PERTEMUAN 4', 'PERTEMUAN 5', 'PERTEMUAN 6', 'DST', 'UTS', 'UAS'];
        existingComponents.sort((a, b) => {
            const indexA = desiredOrder.indexOf(a);
            const indexB = desiredOrder.indexOf(b);
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
        });
        return existingComponents;
    }, [details]);

    const transcriptData = useMemo(() => {
        if (!details) return {};
        const data: Record<string, Record<string, number>> = {};
        details.grades.forEach(grade => {
            const subject = grade.component.subject.name;
            const component = grade.component.name;
            if (!data[subject]) data[subject] = {};
            data[subject][component] = grade.score;
        });
        return data;
    }, [details]);
    
    const subjects = Object.keys(transcriptData).sort();

    const subjectAverages = useMemo(() => {
        const averages: Record<string, number> = {};
        for (const subject of subjects) {
            const scores = Object.values(transcriptData[subject]);
            if (scores.length > 0) {
                const sum = scores.reduce((total, score) => total + score, 0);
                averages[subject] = sum / scores.length;
            } else {
                averages[subject] = 0;
            }
        }
        return averages;
    }, [subjects, transcriptData]);

    const overallStats = useMemo(() => {
        if (!details || !details.grades || details.grades.length === 0) {
            return { totalSum: 0, overallAverage: 0 };
        }
        const totalSum = details.grades.reduce((sum, grade) => sum + grade.score, 0);
        const overallAverage = totalSum / details.grades.length;
        return { totalSum, overallAverage };
    }, [details]);

    if (!student) return null;

    return (
        <div className="fixed inset-0 bg-gray-200 text-gray-600 bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
                <h2 className="text-xl font-bold mb-4 text-gray-800">Transkrip Nilai Siswa</h2>
                {isLoading ? <p className="text-center py-10">Memuat transkrip...</p> : (
                    <div className="flex-grow overflow-auto">
                        <div className="mb-4 text-gray-700">
                            <p><span className="font-semibold">Nama    :</span> {student.fullName}</p>
                            <p><span className="font-semibold">Kelas     :</span> {className}</p>
                        </div>
                        <div className="border rounded-lg overflow-hidden">
                            <table className="min-w-full text-sm">
                                <thead className="bg-gray-100">
                                    <tr className="text-left text-gray-600">
                                        <th className="p-2 border font-semibold">Mata Pelajaran</th>
                                        {tableHeaders.map(header => (
                                            <th key={header} className="p-2 border font-semibold text-center whitespace-nowrap">{header}</th>
                                        ))}
                                        <th className="p-2 border font-semibold text-center whitespace-nowrap bg-blue-50 text-blue-800">Rata-rata</th>
                                    </tr>
                                </thead>
                                 <tbody>
                                    {subjects.length > 0 ? (
                                        subjects.map(subject => (
                                            <React.Fragment key={subject}>
                                                <tr className="border-t">
                                                    <td className="p-2 border font-semibold bg-gray-50">{subject}</td>
                                                    {tableHeaders.map(header => (
                                                        <td key={`${subject}-${header}`} className="p-2 border text-center">
                                                            {transcriptData[subject]?.[header] ?? '-'}
                                                        </td>
                                                    ))}
                                                    <td className="p-2 border text-center font-bold bg-blue-50 text-blue-800">
                                                        {subjectAverages[subject]?.toFixed(2) ?? '-'}
                                                    </td>
                                                </tr>
                                                <tr className="bg-blue-50/50">
                                                    <td colSpan={tableHeaders.length + 1} className="p-1 px-3 border-l border-r text-right text-xs italic text-blue-900">
                                                        Predikat
                                                    </td>
                                                    <td className="p-1 px-3 border-r text-center text-xs italic font-semibold text-blue-900">
                                                        ({getGradePredicate(subjectAverages[subject])})
                                                    </td>
                                                </tr>
                                            </React.Fragment>
                                        ))
                                    ) : (
                                        <tr><td colSpan={tableHeaders.length + 2} className="p-8 text-center text-gray-500">Belum ada data nilai.</td></tr>
                                    )}
                                </tbody>
                                 <tfoot className="font-bold bg-gray-100 text-gray-800">
                                    <tr className="border-t-2 border-gray-300">
                                        <td colSpan={tableHeaders.length + 1} className="p-2 border text-right">JUMLAH</td>
                                        <td className="p-2 border text-center">{overallStats.totalSum.toFixed(2)}</td>
                                    </tr>
                                    <tr className="border-t border-gray-200">
                                        <td colSpan={tableHeaders.length + 1} className="p-2 border text-right">RATA-RATA KESELURUHAN</td>
                                        <td className="p-2 border text-center">{overallStats.overallAverage.toFixed(2)}</td>
                                    </tr>
                                    <tr className="border-t border-gray-200 bg-gray-200">
                                        <td colSpan={tableHeaders.length + 1} className="p-2 border text-right">PREDIKAT KESELURUHAN</td>
                                        <td className="p-2 border text-center">({getGradePredicate(overallStats.overallAverage)})</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                        <div className="mt-6">
                            <h3 className="text-base font-semibold mb-2 text-gray-800">Keterangan :</h3>
                            <div className="border rounded-lg overflow-hidden">
                                <table className="min-w-full text-sm text-left">
                                    <thead className="bg-gray-100">
                                        <tr className="text-gray-600">
                                            <th className="p-2 border-r font-semibold">Nilai Angka</th>
                                            <th className="p-2 border-r font-semibold">Predikat</th>
                                            <th className="p-2 font-semibold">Deskripsi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-gray-700">
                                        <tr className="border-t">
                                            <td className="p-2 border-r">90 – 100</td>
                                            <td className="p-2 border-r font-bold">A</td>
                                            <td className="p-2">Sangat Baik – Menguasai seluruh materi dengan sangat baik, mampu menerapkan dalam berbagai konteks.</td>
                                        </tr>
                                        <tr className="border-t bg-gray-50">
                                            <td className="p-2 border-r">80 – 89</td>
                                            <td className="p-2 border-r font-bold">B</td>
                                            <td className="p-2">Baik – Menguasai sebagian besar materi dengan baik dan dapat menerapkannya.</td>
                                        </tr>
                                        <tr className="border-t">
                                            <td className="p-2 border-r">70 – 79</td>
                                            <td className="p-2 border-r font-bold">C</td>
                                            <td className="p-2">Cukup – Menguasai materi dasar, namun perlu bimbingan untuk pengembangan lebih lanjut.</td>
                                        </tr>
                                        <tr className="border-t bg-gray-50">
                                            <td className="p-2 border-r">60 – 69</td>
                                            <td className="p-2 border-r font-bold">D</td>
                                            <td className="p-2">Kurang – Penguasaan materi masih rendah, butuh banyak bimbingan.</td>
                                        </tr>
                                        <tr className="border-t">
                                            <td className="p-2 border-r">0 – 59</td>
                                            <td className="p-2 border-r font-bold">E</td>
                                            <td className="p-2">Sangat Kurang – Tidak menguasai kompetensi dasar, sangat membutuhkan pendampingan belajar.</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
                <div className="flex justify-between items-center pt-4 border-t mt-4">
                    <button 
                        onClick={() => generateTranscriptPDF(student, className, tableHeaders, subjects, transcriptData, subjectAverages, overallStats)}
                        className="btn-primary"
                        disabled={isLoading || subjects.length === 0}
                    >
                        Cetak Transkrip
                    </button>
                    <button onClick={onClose} className="btn-secondary">
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
};