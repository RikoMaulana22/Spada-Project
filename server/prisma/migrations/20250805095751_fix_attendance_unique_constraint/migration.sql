/*
  Warnings:

  - A unique constraint covering the columns `[date,studentId,classId]` on the table `DailyAttendance` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "DailyAttendance_date_studentId_key";

-- CreateIndex
CREATE UNIQUE INDEX "DailyAttendance_date_studentId_classId_key" ON "DailyAttendance"("date", "studentId", "classId");
