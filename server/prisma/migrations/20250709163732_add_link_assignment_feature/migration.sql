-- AlterEnum
ALTER TYPE "AssignmentType" ADD VALUE 'LINK_GOOGLE';

-- AlterTable
ALTER TABLE "Assignment" ADD COLUMN     "externalUrl" TEXT;
