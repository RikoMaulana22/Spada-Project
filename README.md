🎓 SPADA Project — Modern Learning Management System (LMS)

SPADA Project adalah platform Learning Management System (LMS) modern dan komprehensif yang dirancang untuk mendukung proses belajar mengajar secara digital. Sistem ini menyatukan Administrator, Guru, Siswa, dan Wali Kelas dalam satu ekosistem terpadu untuk mengelola kelas, absensi, materi, tugas, nilai, dan aktivitas akademik lainnya.

🚀 Fitur Utama (Role-Based Access Control)
👨‍💻 Administrator

Manajemen Pengguna: Tambah, edit, hapus, dan import data Siswa/Guru secara massal melalui CSV.

Manajemen Akademik: Pengaturan kelas, mata pelajaran, dan jadwal pelajaran.

Monitoring & Dashboard: Statistik akademik dan log aktivitas sekolah.

Pengaturan Sistem: Konfigurasi global LMS.

👨‍🏫 Guru

Manajemen Kelas: Upload materi (PDF, PPT, Video, Link YouTube).

Tugas & Ujian: Membuat tugas, kuis (Bank Soal), dan memberikan penilaian.

Absensi: Membuka sesi absensi serta memvalidasi kehadiran siswa.

Rekap Nilai: Melihat dan mengelola nilai siswa.

👨‍🎓 Siswa

Dashboard Pembelajaran: Mengakses materi, jadwal, dan pengumuman.

Tugas & Kuis: Upload tugas dan mengerjakan kuis secara online.

Absensi Digital: Mengisi absensi dengan bukti (foto/dokumen) dan lokasi.

Riwayat Akademik: Melihat nilai, progres belajar, dan feedback guru.

👨‍💼 Wali Kelas

Monitoring Kelas: Memantau kehadiran serta perkembangan akademik siswa.

🛠️ Teknologi yang Digunakan

SPADA Project menggunakan arsitektur Monorepo, memisahkan Client, Server, dan Landing Page untuk skalabilitas.

🖥️ Frontend (Client & Landing Page)

Framework: Next.js 14+ (App Router)

Language: TypeScript

Styling: Tailwind CSS

State Management: React Context / Hooks

HTTP Client: Axios

🔧 Backend (API Server)

Runtime: Node.js

Framework: Express.js

Language: TypeScript

ORM: Prisma

Database: MySQL/PostgreSQL

Authentication: JWT

File Upload: Multer

📂 Struktur Proyek
spada-project/
├── client/     # Dashboard LMS (Next.js)
├── server/     # REST API (Node.js, Express, Prisma)
├── landing/    # Landing Page / Company Profile Sekolah
└── ...

⚙️ Instalasi & Menjalankan Proyek
📌 Prasyarat

Node.js v18+

NPM / Yarn

MySQL atau PostgreSQL

Prisma CLI

🖥️ Setup Backend (Server)
1. Install Dependensi
cd server
npm install

2. Konfigurasi Environment

Buat file .env di folder server/:

PORT=5000
DATABASE_URL="mysql://user:password@localhost:3306/spada_db"
JWT_SECRET="rahasia_super_aman"

3. Migrasi Database (Prisma)
npx prisma migrate dev --name init
npx prisma db seed   # Opsional

4. Jalankan Server
npm run dev


Server berjalan di:
👉 http://localhost:5000

🌐 Setup Frontend (Client)
1. Install Dependensi
cd client
npm install

2. Konfigurasi Environment

Buat .env.local di client/:

NEXT_PUBLIC_API_URL=http://localhost:5000/api

3. Jalankan Client
npm run dev


Client berjalan di:
👉 http://localhost:3000

🏠 Setup Landing Page
cd landing
npm install
npm run dev


Landing Page berjalan di port default Next.js.

🧪 Kontribusi

Kami terbuka untuk kontribusi!

Fork repository

Buat branch baru

git checkout -b fitur-baru


Commit perubahan

git commit -m "Menambahkan fitur baru"


Push

git push origin fitur-baru


Buat Pull Request

📄 Lisensi

Dikembangkan secara profesional oleh Riko Maulana Al Habib.
Hak cipta & lisensi mengikuti ketentuan repository ini.
