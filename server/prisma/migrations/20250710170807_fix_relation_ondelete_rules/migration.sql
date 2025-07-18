/*
  Warnings:

  - The values [LINK_GOOGLE] on the enum `AssignmentType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AssignmentType_new" AS ENUM ('pilgan', 'esai', 'upload_gambar', 'link_google');
ALTER TABLE "Assignment" ALTER COLUMN "type" TYPE "AssignmentType_new" USING ("type"::text::"AssignmentType_new");
ALTER TYPE "AssignmentType" RENAME TO "AssignmentType_old";
ALTER TYPE "AssignmentType_new" RENAME TO "AssignmentType";
DROP TYPE "AssignmentType_old";
COMMIT;
