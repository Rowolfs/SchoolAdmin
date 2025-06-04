/*
  Warnings:

  - The primary key for the `MarkRecord` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `MarkRecord` table. All the data in the column will be lost.
  - Made the column `description` on table `Discipline` required. This step will fail if there are existing NULL values in that column.
  - Made the column `teacherId` on table `MarkRecord` required. This step will fail if there are existing NULL values in that column.
  - Made the column `classId` on table `MarkRecord` required. This step will fail if there are existing NULL values in that column.
  - Made the column `pupilId` on table `MarkRecord` required. This step will fail if there are existing NULL values in that column.
  - Made the column `quarter` on table `MarkRecord` required. This step will fail if there are existing NULL values in that column.
  - Made the column `mark` on table `MarkRecord` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "MarkRecord_pupilId_disciplineId_idx";

-- DropIndex
DROP INDEX "MarkRecord_pupilId_disciplineId_quarter_idx";

-- DropIndex
DROP INDEX "MarkRecord_teacherId_disciplineId_idx";

-- AlterTable
ALTER TABLE "Discipline" ALTER COLUMN "description" SET NOT NULL;

-- AlterTable
ALTER TABLE "MarkRecord" DROP CONSTRAINT "MarkRecord_pkey",
DROP COLUMN "id",
ALTER COLUMN "teacherId" SET NOT NULL,
ALTER COLUMN "classId" SET NOT NULL,
ALTER COLUMN "pupilId" SET NOT NULL,
ALTER COLUMN "quarter" SET NOT NULL,
ALTER COLUMN "mark" SET NOT NULL,
ADD CONSTRAINT "MarkRecord_pkey" PRIMARY KEY ("teacherId", "classId", "disciplineId", "pupilId", "quarter");

-- CreateIndex
CREATE INDEX "MarkRecord_pupilId_idx" ON "MarkRecord"("pupilId");

-- CreateIndex
CREATE INDEX "MarkRecord_quarter_idx" ON "MarkRecord"("quarter");
