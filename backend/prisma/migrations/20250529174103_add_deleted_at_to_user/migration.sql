/*
  Warnings:

  - The primary key for the `DisciplinePupilsMark` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `updatedAt` to the `Class` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quarter` to the `DisciplinePupilsMark` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `DisciplinePupilsMark` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Pupil` table without a default value. This is not possible if the table is not empty.

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
ALTER TABLE "Pupil" DROP CONSTRAINT "Pupil_userId_fkey";

-- DropForeignKey
ALTER TABLE "Teacher" DROP CONSTRAINT "Teacher_userId_fkey";

-- DropForeignKey
ALTER TABLE "TeachersDisciplines" DROP CONSTRAINT "TeachersDisciplines_disciplineId_fkey";

-- DropForeignKey
ALTER TABLE "TeachersDisciplines" DROP CONSTRAINT "TeachersDisciplines_teacherId_fkey";

-- AlterTable
ALTER TABLE "Class" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Discipline" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "DisciplinePupilsMark" DROP CONSTRAINT "DisciplinePupilsMark_pkey",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "quarter" INTEGER NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD CONSTRAINT "DisciplinePupilsMark_pkey" PRIMARY KEY ("disciplineId", "pupilId", "quarter");

-- AlterTable
ALTER TABLE "Pupil" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Role" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Teacher" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "DisciplinePupilsMark_pupilId_idx" ON "DisciplinePupilsMark"("pupilId");

-- CreateIndex
CREATE INDEX "DisciplinePupilsMark_quarter_idx" ON "DisciplinePupilsMark"("quarter");

-- CreateIndex
CREATE INDEX "DisciplinePupilsMark_pupilId_quarter_idx" ON "DisciplinePupilsMark"("pupilId", "quarter");

-- AddForeignKey
ALTER TABLE "Teacher" ADD CONSTRAINT "Teacher_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pupil" ADD CONSTRAINT "Pupil_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeachersDisciplines" ADD CONSTRAINT "TeachersDisciplines_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeachersDisciplines" ADD CONSTRAINT "TeachersDisciplines_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES "Discipline"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassesDisciplines" ADD CONSTRAINT "ClassesDisciplines_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassesDisciplines" ADD CONSTRAINT "ClassesDisciplines_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES "Discipline"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisciplinePupilsMark" ADD CONSTRAINT "DisciplinePupilsMark_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES "Discipline"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisciplinePupilsMark" ADD CONSTRAINT "DisciplinePupilsMark_pupilId_fkey" FOREIGN KEY ("pupilId") REFERENCES "Pupil"("id") ON DELETE CASCADE ON UPDATE CASCADE;
