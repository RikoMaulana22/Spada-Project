/*
  Warnings:

  - Added the required column `updatedAt` to the `Assignment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Assignment" ADD COLUMN     "attemptLimit" INTEGER DEFAULT 1,
ADD COLUMN     "endTime" TIMESTAMP(3),
ADD COLUMN     "passingGrade" INTEGER DEFAULT 70,
ADD COLUMN     "startTime" TIMESTAMP(3),
ADD COLUMN     "timeLimit" INTEGER,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
