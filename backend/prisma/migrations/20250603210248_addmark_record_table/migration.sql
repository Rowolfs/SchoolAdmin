/*
  Warnings:

  - You are about to drop the `ClassesDisciplines` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DisciplinePupilsMark` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TeachersDisciplines` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ClassesDisciplines" DROP CONSTRAINT "ClassesDisciplines_classId_fkey";

-- DropForeignKey
ALTER TABLE "ClassesDisciplines" DROP CONSTRAINT "ClassesDisciplines_disciplineId_fkey";

-- DropForeignKey
ALTER TABLE "DisciplinePupilsMark" DROP CONSTRAINT "DisciplinePupilsMark_disciplineId_fkey";

-- DropForeignKey
ALTER TABLE "DisciplinePupilsMark" DROP CONSTRAINT "DisciplinePupilsMark_pupilId_fkey";

-- DropForeignKey
ALTER TABLE "TeachersDisciplines" DROP CONSTRAINT "TeachersDisciplines_disciplineId_fkey";

-- DropForeignKey
ALTER TABLE "TeachersDisciplines" DROP CONSTRAINT "TeachersDisciplines_teacherId_fkey";

-- DropTable
DROP TABLE "ClassesDisciplines";

-- DropTable
DROP TABLE "DisciplinePupilsMark";

-- DropTable
DROP TABLE "TeachersDisciplines";

-- CreateTable
CREATE TABLE "MarkRecord" (
    "id" SERIAL NOT NULL,
    "teacherId" INTEGER,
    "classId" INTEGER,
    "disciplineId" INTEGER NOT NULL,
    "pupilId" INTEGER,
    "quarter" INTEGER,
    "mark" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarkRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MarkRecord_teacherId_disciplineId_idx" ON "MarkRecord"("teacherId", "disciplineId");

-- CreateIndex
CREATE INDEX "MarkRecord_classId_disciplineId_idx" ON "MarkRecord"("classId", "disciplineId");

-- CreateIndex
CREATE INDEX "MarkRecord_pupilId_disciplineId_idx" ON "MarkRecord"("pupilId", "disciplineId");

-- CreateIndex
CREATE INDEX "MarkRecord_pupilId_disciplineId_quarter_idx" ON "MarkRecord"("pupilId", "disciplineId", "quarter");

-- AddForeignKey
ALTER TABLE "MarkRecord" ADD CONSTRAINT "MarkRecord_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarkRecord" ADD CONSTRAINT "MarkRecord_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarkRecord" ADD CONSTRAINT "MarkRecord_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES "Discipline"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarkRecord" ADD CONSTRAINT "MarkRecord_pupilId_fkey" FOREIGN KEY ("pupilId") REFERENCES "Pupil"("id") ON DELETE CASCADE ON UPDATE CASCADE;
