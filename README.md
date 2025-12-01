🎓 SPADA Project - Sistem Pembelajaran Daring
SPADA Project adalah platform Learning Management System (LMS) modern yang komprehensif, dirancang untuk memfasilitasi kegiatan belajar mengajar secara digital. Platform ini menghubungkan Administrator, Guru, Siswa, dan Wali Kelas dalam satu ekosistem terintegrasi untuk manajemen kelas, absensi, materi, tugas, dan penilaian.

🚀 Fitur Utama
Sistem ini memiliki fitur yang dibedakan berdasarkan peran pengguna (Role-Based Access Control):

👨‍💻 Administrator
Manajemen Pengguna: Tambah, edit, hapus, dan import pengguna (Siswa & Guru) secara massal (CSV).

Manajemen Akademik: Pengaturan Kelas, Mata Pelajaran, dan Jadwal Pelajaran.

Monitoring: Dashboard statistik sekolah dan log aktivitas.

Pengaturan Sistem: Konfigurasi global aplikasi.

👨‍🏫 Guru (Teacher)
Manajemen Kelas: Upload materi pelajaran (PDF, PPT, Video, Link YouTube).

Tugas & Ujian: Membuat tugas, kuis (Bank Soal), dan memberikan penilaian.

Absensi: Membuka sesi absensi dan memvalidasi kehadiran siswa.

Rekap Nilai: Melihat dan mengelola transkrip nilai siswa.

👨‍🎓 Siswa (Student)
Dashboard Pembelajaran: Akses materi pelajaran dan jadwal harian.

Pengumpulan Tugas: Upload tugas dan mengerjakan kuis secara online.

Absensi Digital: Melakukan absensi dengan bukti (foto/dokumen) dan lokasi.

Riwayat Akademik: Melihat nilai dan umpan balik dari guru.

👨‍💼 Wali Kelas
Monitoring Kelas: Memantau kehadiran dan perkembangan siswa di kelas perwaliannya.

🛠️ Teknologi yang Digunakan
Proyek ini dibangun menggunakan arsitektur Monorepo (terpisah antara Client, Server, dan Landing Page).

Frontend (Client & Landing)
Framework: Next.js 14+ (App Router)

Language: TypeScript

Styling: Tailwind CSS

State Management: React Context / Hooks

HTTP Client: Axios

Backend (Server)
Runtime: Node.js

Framework: Express.js

Language: TypeScript

Database ORM: Prisma

Database: (MySQL/PostgreSQL - sesuaikan dengan schema.prisma)

Authentication: JWT (JSON Web Token)

File Upload: Multer

📂 Struktur Proyek
Bash

spada-project/
├── client/         # Aplikasi Frontend (Dashboard LMS) berbasis Next.js
├── server/         # API Backend (Node.js/Express + Prisma)
├── landing/        # Halaman Landing Page / Company Profile Sekolah
└── ...
⚙️ Instalasi dan Cara Menjalankan
Ikuti langkah-langkah berikut untuk menjalankan proyek di komputer lokal Anda.

Prasyarat
Node.js (v18 atau terbaru)

NPM atau Yarn

Database (MySQL atau PostgreSQL sesuai konfigurasi Prisma)

1. Setup Backend (Server)
Masuk ke folder server dan install dependensi:

Bash

cd server
npm install
Buat file .env di dalam folder server/ dan sesuaikan konfigurasinya:

Code snippet

PORT=5000
DATABASE_URL="mysql://user:password@localhost:3306/spada_db"
JWT_SECRET="rahasia_super_aman"
# Tambahkan variabel lain jika diperlukan
Jalankan migrasi database (Prisma):

Bash

npx prisma migrate dev --name init
npx prisma db seed # (Opsional) Jika ada script seeding data awal
Jalankan server:

Bash

npm run dev
Server akan berjalan di http://localhost:5000

2. Setup Frontend (Client)
Buka terminal baru, masuk ke folder client:

Bash

cd client
npm install
Buat file .env.local di dalam folder client/:

Code snippet

NEXT_PUBLIC_API_URL=http://localhost:5000/api
# Konfigurasi lain yang dibutuhkan client
Jalankan aplikasi client:

Bash

npm run dev
Aplikasi akan berjalan di http://localhost:3000

3. Setup Landing Page 
Jika ingin menjalankan halaman depan:

Bash

cd landing
npm install
npm run dev
🧪 Pengembangan & Kontribusi
Kami sangat terbuka untuk kontribusi! Jika Anda ingin menambahkan fitur atau memperbaiki bug:

Fork repositori ini.

Buat branch fitur baru (git checkout -b fitur-keren).

Commit perubahan Anda (git commit -m 'Menambahkan fitur keren').

Push ke branch tersebut (git push origin fitur-keren).

Buat Pull Request.

📄 Lisensi
Dibuat dengan profesional oleh Riko Maulana Al Habib
