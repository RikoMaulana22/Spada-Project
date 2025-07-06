import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  // FIX: Hapus data dalam urutan yang benar untuk menghindari error foreign key
  // 1. Hapus data yang bergantung pada Class dan Subject (misalnya, Class_Members, Material, Assignment)
  await prisma.class_Members.deleteMany({});
  await prisma.material.deleteMany({});
  await prisma.assignment.deleteMany({}); // Anda mungkin perlu menghapus Question & Option dulu jika ada relasi
  
  // 2. Hapus Class, yang bergantung pada Subject
  await prisma.class.deleteMany({});
  console.log('Deleted old classes and related data.');

  // 3. Sekarang aman untuk menghapus Subject
  await prisma.subject.deleteMany({});
  console.log('Deleted old subjects.');

  const subjectsToCreate = [];
  const grades = [7, 8, 9];
  const subjectNames = [
    'Pendidikan Agama dan Budi Pekerti',
    'PPKn (Pendidikan Pancasila dan Kewarganegaraan)',
    'Bahasa Indonesia',
    'Matematika',
    'IPA (Ilmu Pengetahuan Alam)',
    'IPS (Ilmu Pengetahuan Sosial)',
    'Bahasa Inggris',
    'Seni Budaya',
    'PJOK (Pendidikan Jasmani dan Kesehatan)',
    'Informatika / TIK',
    'Prakarya dan Kewirausahaan'
  ];

  // Buat data untuk setiap mata pelajaran di setiap tingkatan kelas
  for (const grade of grades) {
    for (const name of subjectNames) {
      subjectsToCreate.push({ name, grade });
    }
  }

  await prisma.subject.createMany({
    data: subjectsToCreate,
  });

  console.log(`Seeding finished. Created ${subjectsToCreate.length} subjects.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
