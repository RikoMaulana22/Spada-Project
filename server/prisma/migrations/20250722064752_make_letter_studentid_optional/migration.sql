-- DropForeignKey
ALTER TABLE "Letter" DROP CONSTRAINT "Letter_studentId_fkey";

-- AlterTable
ALTER TABLE "Letter" ALTER COLUMN "studentId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Letter" ADD CONSTRAINT "Letter_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
