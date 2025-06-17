// backend/services/GradeService.ts

const PrismaSingleton = require('../prisma/client');
const prisma = PrismaSingleton.getInstance();

type GradeParams = {
  classId: number;
  pupilId: number;
  disciplineTeacherId: number;
  quarter: number;
  mark: number;
};

class GradeService {
  // Получить все дисциплины и классы, где учитель преподает
  async getDisciplinesAndClassesByTeacher(teacherId: number) {
    const dtList = await prisma.disciplineTeacher.findMany({
      where: { teacherId },
      include: {
        discipline: true,
        journalEntries: { include: { class: true } }
      }
    });

    const pairs: any[] = [];
    dtList.forEach((dt: any) => {
      dt.journalEntries.forEach((entry: any) => {
        pairs.push({
          disciplineTeacherId: dt.id,
          discipline: dt.discipline,
          class: entry.class
        });
      });
    });

    const unique: any[] = [];
    const seen = new Set<string>();
    for (const item of pairs) {
      const key = `${item.disciplineTeacherId}_${item.class.id}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(item);
      }
    }
    return unique;
  }

  // Получить учеников класса
  async getPupilsByClass(classId: number) {
    return prisma.pupil.findMany({
      where: { classId, deletedAt: null },
      include: { user: true }
    });
  }

  // Получить оценки по дисциплине, классу, четверти (quarter опционален)
  async getGrades(opts: { classId: number; disciplineTeacherId: number; quarter?: number }) {
    const { classId, disciplineTeacherId, quarter } = opts;
    return await prisma.disciplineTeacherPupilsMark.findMany({
      where: {
        classId,
        disciplineTeacherId,
        ...(quarter !== undefined ? { quarter } : {}),
        deletedAt: null
      },
      include: { pupil: { include: { user: true } } }
    });
  }

  // Создать или обновить оценку
  async addOrUpdateGrade(params: GradeParams) {
    const { classId, pupilId, disciplineTeacherId, quarter, mark } = params;
    const existing = await prisma.disciplineTeacherPupilsMark.findFirst({
      where: { classId, pupilId, disciplineTeacherId, quarter, deletedAt: null }
    });

    if (existing) {
      return prisma.disciplineTeacherPupilsMark.update({
        where: { id: existing.id },
        data: { mark }
      });
    }
    return prisma.disciplineTeacherPupilsMark.create({
      data: { classId, pupilId, disciplineTeacherId, quarter, mark }
    });
  }

  // Soft delete: пометить запись как удаленную
  async softDeleteGrade(id: number | string) {
    const gradeId = Number(id);
    return prisma.disciplineTeacherPupilsMark.update({
      where: { id: gradeId },
      data: { deletedAt: new Date() }
    });
  }
}

module.exports = new GradeService();
