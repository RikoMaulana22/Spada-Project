/*
  Warnings:

  - Added the required column `status` to the `AttendanceRecord` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AttendanceRecord" ADD COLUMN     "notes" TEXT,
ADD COLUMN     "status" "DailyAttendanceStatus" NOT NULL;
