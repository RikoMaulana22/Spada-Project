/*
  Warnings:

  - You are about to drop the column `topicId` on the `Assignment` table. All the data in the column will be lost.
  - You are about to drop the column `topicId` on the `Material` table. All the data in the column will be lost.
  - You are about to drop the `Topic` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[nisn]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `classId` to the `Assignment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `classId` to the `Material` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'admin';

-- DropForeignKey
ALTER TABLE "Assignment" DROP CONSTRAINT "Assignment_topicId_fkey";

-- DropForeignKey
ALTER TABLE "Material" DROP CONSTRAINT "Material_topicId_fkey";

-- DropForeignKey
ALTER TABLE "Topic" DROP CONSTRAINT "Topic_classId_fkey";

-- AlterTable
ALTER TABLE "Assignment" DROP COLUMN "topicId",
ADD COLUMN     "classId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Material" DROP COLUMN "topicId",
ADD COLUMN     "classId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "nisn" TEXT;

-- DropTable
DROP TABLE "Topic";

-- CreateIndex
CREATE UNIQUE INDEX "User_nisn_key" ON "User"("nisn");

-- AddForeignKey
ALTER TABLE "Material" ADD CONSTRAINT "Material_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
