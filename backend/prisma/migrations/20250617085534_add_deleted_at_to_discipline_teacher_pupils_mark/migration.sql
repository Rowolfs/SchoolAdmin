-- DropForeignKey
ALTER TABLE "DisciplineTeacher" DROP CONSTRAINT "DisciplineTeacher_disciplineId_fkey";

-- DropForeignKey
ALTER TABLE "DisciplineTeacher" DROP CONSTRAINT "DisciplineTeacher_teacherId_fkey";

-- DropForeignKey
ALTER TABLE "DisciplineTeacherPupilsMark" DROP CONSTRAINT "DisciplineTeacherPupilsMark_classId_fkey";

-- DropForeignKey
ALTER TABLE "DisciplineTeacherPupilsMark" DROP CONSTRAINT "DisciplineTeacherPupilsMark_disciplineTeacherId_fkey";

-- DropForeignKey
ALTER TABLE "DisciplineTeacherPupilsMark" DROP CONSTRAINT "DisciplineTeacherPupilsMark_pupilId_fkey";

-- DropForeignKey
ALTER TABLE "Pupil" DROP CONSTRAINT "Pupil_classId_fkey";

-- DropForeignKey
ALTER TABLE "Pupil" DROP CONSTRAINT "Pupil_userId_fkey";

-- DropForeignKey
ALTER TABLE "Teacher" DROP CONSTRAINT "Teacher_userId_fkey";

-- AddForeignKey
ALTER TABLE "Teacher" ADD CONSTRAINT "Teacher_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisciplineTeacher" ADD CONSTRAINT "DisciplineTeacher_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES "Discipline"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisciplineTeacher" ADD CONSTRAINT "DisciplineTeacher_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pupil" ADD CONSTRAINT "Pupil_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pupil" ADD CONSTRAINT "Pupil_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisciplineTeacherPupilsMark" ADD CONSTRAINT "DisciplineTeacherPupilsMark_disciplineTeacherId_fkey" FOREIGN KEY ("disciplineTeacherId") REFERENCES "DisciplineTeacher"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisciplineTeacherPupilsMark" ADD CONSTRAINT "DisciplineTeacherPupilsMark_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisciplineTeacherPupilsMark" ADD CONSTRAINT "DisciplineTeacherPupilsMark_pupilId_fkey" FOREIGN KEY ("pupilId") REFERENCES "Pupil"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
