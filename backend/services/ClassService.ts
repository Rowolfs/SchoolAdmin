// backend/services/ClassService.ts
const PrismaSingleton = require('../prisma/client');
const prisma = PrismaSingleton.getInstance();

class ClassService {
  static async getAllClasses() {
    return prisma.class.findMany({
      where: { deletedAt: null },
      include: {
        teacher: {
          select: {
            id: true,
            user: {
              select: { name: true, surname: true, patronymic: true },
            },
          },
        },
        pupils: {
          select: {
            id: true,
            user: {
              select: { name: true, surname: true, patronymic: true },
            },
          },
        },
      },
      orderBy: { id: 'asc' },
    });
  }

  static async getClassById(id) {
    return prisma.class.findFirst({
      where: { id, deletedAt: null },
      include: {
        teacher: {
          select: {
            id: true,
            user: {
              select: { name: true, surname: true, patronymic: true },
            },
          },
        },
        pupils: {
          select: {
            id: true,
            user: {
              select: { name: true, surname: true, patronymic: true },
            },
          },
        },
      },
    });
  }

  static async createClass(data) {
    return prisma.class.create({
      data: {
        name: data.name,
        classTeacher: data.classTeacher ?? null,
      },
    });
  }

  static async updateClass(id, changes) {
    const dataToUpdate = {};
    if (Object.prototype.hasOwnProperty.call(changes, 'classTeacher')) {
      dataToUpdate.classTeacher = changes.classTeacher;
    }
    if (Object.keys(dataToUpdate).length === 0) {
      return prisma.class.findUnique({ where: { id } });
    }
    return prisma.class.update({
      where: { id },
      data: dataToUpdate,
      include: {
        teacher: {
          select: {
            id: true,
            user: {
              select: { name: true, surname: true, patronymic: true },
            },
          },
        },
        pupils: {
          select: {
            id: true,
            user: {
              select: { name: true, surname: true, patronymic: true },
            },
          },
        },
      },
    });
  }

  static async deleteClass(id) {
    return prisma.class.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  static async assignStudentsToClass(classId, pupilIds) {
    await prisma.pupil.updateMany({
      where: { classId, deletedAt: null },
      data: { classId: null },
    });

    await prisma.pupil.updateMany({
      where: { id: { in: pupilIds }, deletedAt: null },
      data: { classId },
    });

    return prisma.pupil.findMany({
      where: { id: { in: pupilIds } },
      select: {
        id: true,
        user: {
          select: { name: true, surname: true, patronymic: true },
        },
      },
    });
  }

  /**
   * Назначить дисциплину классу через связку «учитель-дисциплина».
   *
   * @param {number} classId
   * @param {{ teacherId: number; disciplineId: number }} params
   * @returns {Promise<{
   *   class: { id: number; name: string };
   *   disciplineTeacher: { id: number; teacherId: number; disciplineId: number };
   * }>}
   */
  static async assignDisciplineToClass(classId, { teacherId, disciplineId }) {
    // 1. Проверяем класс
    const existingClass = await prisma.class.findUnique({
      where: { id: classId },
      select: { id: true, deletedAt: true },
    });
    if (!existingClass || existingClass.deletedAt) {
      throw new Error(`Класс с id=${classId} не найден или удалён`);
    }

    // 2. Проверяем учителя
    const existingTeacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
      select: { id: true, deletedAt: true },
    });
    if (!existingTeacher || existingTeacher.deletedAt) {
      throw new Error(`Учитель с id=${teacherId} не найден или удалён`);
    }

    // 3. Проверяем дисциплину
    const existingDiscipline = await prisma.discipline.findUnique({
      where: { id: disciplineId },
      select: { id: true, deletedAt: true },
    });
    if (!existingDiscipline || existingDiscipline.deletedAt) {
      throw new Error(`Дисциплина с id=${disciplineId} не найдена или удалена`);
    }

    // 4. Находим или создаём запись в DisciplineTeacher
    let discTeacher = await prisma.disciplineTeacher.findUnique({
      where: { disciplineId_teacherId: { disciplineId, teacherId } },
      select: { id: true, disciplineId: true, teacherId: true },
    });
    if (!discTeacher) {
      discTeacher = await prisma.disciplineTeacher.create({
        data: { disciplineId, teacherId },
        select: { id: true, disciplineId: true, teacherId: true },
      });
    } else if (discTeacher.deletedAt) {
      // Если ранее был soft-delete
      await prisma.disciplineTeacher.update({
        where: { id: discTeacher.id },
        data: { deletedAt: null },
      });
      discTeacher = { ...discTeacher };
    }

    // 5. Создаём запись в журнале (DisciplineTeacherPupilsMark) для привязки к классу
    const journalEntry = await prisma.disciplineTeacherPupilsMark.create({
      data: {
        disciplineTeacherId: discTeacher.id,
        classId,
        // teacherId, pupilId, quarter, mark остаются null
      },
    });

    // 6. Возвращаем базовую информацию о классе и связке учитель-дисциплина
    const resultClass = await prisma.class.findUnique({
      where: { id: classId },
      select: { id: true, name: true },
    });

    return {
      class: resultClass,
      disciplineTeacher: {
        id: discTeacher.id,
        teacherId: discTeacher.teacherId,
        disciplineId: discTeacher.disciplineId,
      },
    };
  }
}

module.exports = ClassService;
