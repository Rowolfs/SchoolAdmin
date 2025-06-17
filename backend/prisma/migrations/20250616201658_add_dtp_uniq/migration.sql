/*
  Warnings:

  - You are about to drop the column `disciplineId` on the `DisciplineTeacherPupilsMark` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[disciplineTeacherId,classId,pupilId,quarter]` on the table `DisciplineTeacherPupilsMark` will be added. If there are existing duplicate values, this will fail.
  - Made the column `classId` on table `DisciplineTeacherPupilsMark` required. This step will fail if there are existing NULL values in that column.
  - Made the column `teacherId` on table `DisciplineTeacherPupilsMark` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "DisciplineTeacherPupilsMark" DROP CONSTRAINT "DisciplineTeacherPupilsMark_disciplineId_fkey";

-- DropForeignKey
ALTER TABLE "DisciplineTeacherPupilsMark" DROP CONSTRAINT "DisciplineTeacherPupilsMark_pupilId_fkey";

-- DropForeignKey
ALTER TABLE "DisciplineTeacherPupilsMark" DROP CONSTRAINT "DisciplineTeacherPupilsMark_teacherId_fkey";

-- DropIndex
DROP INDEX "DisciplineTeacherPupilsMark_classId_disciplineTeacherId_idx";

-- DropIndex
DROP INDEX "DisciplineTeacherPupilsMark_disciplineTeacherId_idx";

-- DropIndex
DROP INDEX "DisciplineTeacherPupilsMark_pupilId_disciplineTeacherId_idx";

-- AlterTable
ALTER TABLE "DisciplineTeacherPupilsMark" DROP COLUMN "disciplineId",
ALTER COLUMN "classId" SET NOT NULL,
ALTER COLUMN "teacherId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "DisciplineTeacherPupilsMark_disciplineTeacherId_classId_pup_key" ON "DisciplineTeacherPupilsMark"("disciplineTeacherId", "classId", "pupilId", "quarter");

-- AddForeignKey
ALTER TABLE "DisciplineTeacherPupilsMark" ADD CONSTRAINT "DisciplineTeacherPupilsMark_pupilId_fkey" FOREIGN KEY ("pupilId") REFERENCES "Pupil"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisciplineTeacherPupilsMark" ADD CONSTRAINT "DisciplineTeacherPupilsMark_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisciplineTeacherPupilsMark" ADD CONSTRAINT "DisciplineTeacherPupilsMark_disciplineTeacherId_discipline_fkey" FOREIGN KEY ("disciplineTeacherId") REFERENCES "Discipline"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
