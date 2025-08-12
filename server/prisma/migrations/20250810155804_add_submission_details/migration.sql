/*
  Warnings:

  - A unique constraint covering the columns `[studentId,assignmentId]` on the table `Submission` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "completedOn" TIMESTAMP(3),
ADD COLUMN     "startedOn" TIMESTAMP(3),
ADD COLUMN     "timeTakenMs" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Submission_studentId_assignmentId_key" ON "Submission"("studentId", "assignmentId");
