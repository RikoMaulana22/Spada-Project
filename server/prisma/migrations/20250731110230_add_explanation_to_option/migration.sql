-- AlterTable
ALTER TABLE "Option" ADD COLUMN     "explanation" TEXT;

-- AlterTable
ALTER TABLE "Submission" ALTER COLUMN "updatedAt" DROP DEFAULT;
