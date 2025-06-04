/*
  Warnings:

  - You are about to drop the `MarkRecord` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "MarkRecord" DROP CONSTRAINT "MarkRecord_classId_fkey";

-- DropForeignKey
ALTER TABLE "MarkRecord" DROP CONSTRAINT "MarkRecord_disciplineId_fkey";

-- DropForeignKey
ALTER TABLE "MarkRecord" DROP CONSTRAINT "MarkRecord_pupilId_fkey";

-- DropForeignKey
ALTER TABLE "MarkRecord" DROP CONSTRAINT "MarkRecord_teacherId_fkey";

-- DropTable
DROP TABLE "MarkRecord";

-- CreateTable
CREATE TABLE "DisciplineTeacher" (
    "id" SERIAL NOT NULL,
    "disciplineId" INTEGER NOT NULL,
    "teacherId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "DisciplineTeacher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DisciplineTeacherPupilsMark" (
    "id" SERIAL NOT NULL,
    "disciplineTeacherId" INTEGER NOT NULL,
    "classId" INTEGER,
    "pupilId" INTEGER,
    "mark" DOUBLE PRECISION,
    "quarter" INTEGER,
    "disciplineId" INTEGER,
    "teacherId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DisciplineTeacherPupilsMark_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DisciplineTeacher_disciplineId_teacherId_key" ON "DisciplineTeacher"("disciplineId", "teacherId");

-- CreateIndex
CREATE INDEX "DisciplineTeacherPupilsMark_classId_disciplineTeacherId_idx" ON "DisciplineTeacherPupilsMark"("classId", "disciplineTeacherId");

-- CreateIndex
CREATE INDEX "DisciplineTeacherPupilsMark_pupilId_disciplineTeacherId_idx" ON "DisciplineTeacherPupilsMark"("pupilId", "disciplineTeacherId");

-- CreateIndex
CREATE INDEX "DisciplineTeacherPupilsMark_disciplineTeacherId_idx" ON "DisciplineTeacherPupilsMark"("disciplineTeacherId");

-- AddForeignKey
ALTER TABLE "DisciplineTeacher" ADD CONSTRAINT "DisciplineTeacher_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES "Discipline"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisciplineTeacher" ADD CONSTRAINT "DisciplineTeacher_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisciplineTeacherPupilsMark" ADD CONSTRAINT "DisciplineTeacherPupilsMark_disciplineTeacherId_fkey" FOREIGN KEY ("disciplineTeacherId") REFERENCES "DisciplineTeacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisciplineTeacherPupilsMark" ADD CONSTRAINT "DisciplineTeacherPupilsMark_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES "Discipline"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisciplineTeacherPupilsMark" ADD CONSTRAINT "DisciplineTeacherPupilsMark_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisciplineTeacherPupilsMark" ADD CONSTRAINT "DisciplineTeacherPupilsMark_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisciplineTeacherPupilsMark" ADD CONSTRAINT "DisciplineTeacherPupilsMark_pupilId_fkey" FOREIGN KEY ("pupilId") REFERENCES "Pupil"("id") ON DELETE CASCADE ON UPDATE CASCADE;
