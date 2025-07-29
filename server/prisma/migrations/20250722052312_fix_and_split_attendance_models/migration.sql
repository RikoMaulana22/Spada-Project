/*
  Warnings:

  - You are about to drop the column `classId` on the `Attendance` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `Attendance` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `Attendance` table. All the data in the column will be lost.
  - You are about to drop the column `recordedById` on the `Attendance` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Attendance` table. All the data in the column will be lost.
  - You are about to drop the column `studentId` on the `Attendance` table. All the data in the column will be lost.
  - Added the required column `closeTime` to the `Attendance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `openTime` to the `Attendance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Attendance` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DailyAttendanceStatus" AS ENUM ('HADIR', 'SAKIT', 'IZIN', 'ALPA');

-- DropForeignKey
ALTER TABLE "Announcement" DROP CONSTRAINT "Announcement_authorId_fkey";

-- DropForeignKey
ALTER TABLE "Assignment" DROP CONSTRAINT "Assignment_topicId_fkey";

-- DropForeignKey
ALTER TABLE "Attendance" DROP CONSTRAINT "Attendance_classId_fkey";

-- DropForeignKey
ALTER TABLE "Attendance" DROP CONSTRAINT "Attendance_recordedById_fkey";

-- DropForeignKey
ALTER TABLE "Attendance" DROP CONSTRAINT "Attendance_studentId_fkey";

-- DropForeignKey
ALTER TABLE "Material" DROP CONSTRAINT "Material_topicId_fkey";

-- DropIndex
DROP INDEX "Attendance_date_studentId_key";

-- AlterTable
ALTER TABLE "Attendance" DROP COLUMN "classId",
DROP COLUMN "date",
DROP COLUMN "notes",
DROP COLUMN "recordedById",
DROP COLUMN "status",
DROP COLUMN "studentId",
ADD COLUMN     "closeTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "openTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL;

-- DropEnum
DROP TYPE "AttendanceStatus";

-- CreateTable
CREATE TABLE "DailyAttendance" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL,
    "status" "DailyAttendanceStatus" NOT NULL,
    "notes" TEXT,
    "studentId" INTEGER NOT NULL,
    "classId" INTEGER NOT NULL,
    "recordedById" INTEGER NOT NULL,

    CONSTRAINT "DailyAttendance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyAttendance_date_studentId_key" ON "DailyAttendance"("date", "studentId");

-- AddForeignKey
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyAttendance" ADD CONSTRAINT "DailyAttendance_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyAttendance" ADD CONSTRAINT "DailyAttendance_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyAttendance" ADD CONSTRAINT "DailyAttendance_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Material" ADD CONSTRAINT "Material_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;
