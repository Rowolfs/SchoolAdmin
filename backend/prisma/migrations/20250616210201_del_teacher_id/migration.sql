/*
  Warnings:

  - You are about to drop the column `teacherId` on the `DisciplineTeacherPupilsMark` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "DisciplineTeacherPupilsMark" DROP CONSTRAINT "DisciplineTeacherPupilsMark_teacherId_fkey";

-- AlterTable
ALTER TABLE "DisciplineTeacherPupilsMark" DROP COLUMN "teacherId";
