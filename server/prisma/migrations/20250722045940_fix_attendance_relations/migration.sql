/*
  Warnings:

  - You are about to drop the column `closeTime` on the `Attendance` table. All the data in the column will be lost.
  - You are about to drop the column `openTime` on the `Attendance` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Attendance` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[date,studentId]` on the table `Attendance` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nisn]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `classId` to the `Attendance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date` to the `Attendance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recordedById` to the `Attendance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Attendance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `studentId` to the `Attendance` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('HADIR', 'SAKIT', 'IZIN', 'ALPA');

-- CreateEnum
CREATE TYPE "NoteType" AS ENUM ('PELANGGARAN', 'PRESTASI', 'BIMBINGAN_KONSELING', 'CATATAN_ORANG_TUA');

-- CreateEnum
CREATE TYPE "LetterType" AS ENUM ('IZIN_SAKIT', 'IZIN_ACARA', 'PANGGILAN_ORANG_TUA');

-- DropForeignKey
ALTER TABLE "Class" DROP CONSTRAINT "Class_teacherId_fkey";

-- AlterTable
ALTER TABLE "Attendance" DROP COLUMN "closeTime",
DROP COLUMN "openTime",
DROP COLUMN "title",
ADD COLUMN     "classId" INTEGER NOT NULL,
ADD COLUMN     "date" DATE NOT NULL,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "recordedById" INTEGER NOT NULL,
ADD COLUMN     "status" "AttendanceStatus" NOT NULL,
ADD COLUMN     "studentId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Class" ADD COLUMN     "homeroomTeacherId" INTEGER;

-- CreateTable
CREATE TABLE "StudentNote" (
    "id" SERIAL NOT NULL,
    "type" "NoteType" NOT NULL,
    "content" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "studentId" INTEGER NOT NULL,
    "classId" INTEGER NOT NULL,
    "authorId" INTEGER NOT NULL,

    CONSTRAINT "StudentNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Letter" (
    "id" SERIAL NOT NULL,
    "type" "LetterType" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "studentId" INTEGER NOT NULL,
    "classId" INTEGER NOT NULL,

    CONSTRAINT "Letter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_date_studentId_key" ON "Attendance"("date", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "User_nisn_key" ON "User"("nisn");

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_homeroomTeacherId_fkey" FOREIGN KEY ("homeroomTeacherId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentNote" ADD CONSTRAINT "StudentNote_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentNote" ADD CONSTRAINT "StudentNote_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentNote" ADD CONSTRAINT "StudentNote_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Letter" ADD CONSTRAINT "Letter_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Letter" ADD CONSTRAINT "Letter_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
