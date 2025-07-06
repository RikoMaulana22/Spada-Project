-- DropForeignKey
ALTER TABLE "Class_Members" DROP CONSTRAINT "Class_Members_classId_fkey";

-- DropForeignKey
ALTER TABLE "Class_Members" DROP CONSTRAINT "Class_Members_studentId_fkey";

-- DropForeignKey
ALTER TABLE "Submission" DROP CONSTRAINT "Submission_studentId_fkey";

-- AddForeignKey
ALTER TABLE "Class_Members" ADD CONSTRAINT "Class_Members_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Class_Members" ADD CONSTRAINT "Class_Members_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
