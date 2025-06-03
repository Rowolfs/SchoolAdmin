// backend/services/ClassService.ts
const PrismaSingelton = require('../prisma/client');
const prisma = PrismaSingelton.getInstance();

class ClassService {
  /**
   * Получить список всех классов (неудалённых), включая привязанного учителя и список учеников
   */
  static async getAllClasses() {
    return prisma.class.findMany({
      where: { deletedAt: null },
      include: {
        teacher: {
          select: {
            id: true,
            user: {
              select: {
                name: true,
                surname: true,
                patronymic: true,
              },
            },
          },
        },
        pupils: {
          select: {
            id: true,
            user: {
              select: {
                name: true,
                surname: true,
                patronymic: true,
              },
            },
          },
        },
      },
      orderBy: { id: 'asc' },
    });
  }

  /**
   * Получить один класс по ID (если не удалён),
   * включая привязанного учителя и список учеников
   */
  static async getClassById(id) {
    return prisma.class.findFirst({
      where: { id, deletedAt: null },
      include: {
        teacher: {
          select: {
            id: true,
            user: {
              select: {
                name: true,
                surname: true,
                patronymic: true,
              },
            },
          },
        },
        pupils: {
          select: {
            id: true,
            user: {
              select: {
                name: true,
                surname: true,
                patronymic: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Создать новый класс.
   * data: { classTeacher?: number }
   */
  static async createClass(data) {
    return prisma.class.create({
      data: {
        name: data.name,
        classTeacher: data.classTeacher ?? null
        
      },
    });
  }

  /**
   * Обновить существующий класс (назначить/сменить учителя)
   * changes: { classTeacher?: number | null }
   */

  static async updateClass(id, changes) {
    const dataToUpdate = {};
    if (changes.classTeacher !== undefined) {
      dataToUpdate.classTeacher = changes.classTeacher;
    }
    const updated = await prisma.class.update({
      where: { id },
      data: dataToUpdate,
      // …include…
    });
    return updated;
  }


  /**
   * Soft-delete класса: выставить deletedAt = now()
   */
  static async deleteClass(id) {
    return prisma.class.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Назначить список учеников к классу.
   * Сначала открепляем всех текущих учеников, у которых classId = classId,
   * затем привязываем переданных pupil-ов.
   * Возвращает массив назначенных учеников (с их именами).
   *
   * studentIds: number[] — id записей из таблицы Pupil
   */
  static async assignStudentsToClass(classId, studentIds) {
    // Открепляем от этого класса всех предыдущих учеников
    await prisma.pupil.updateMany({
      where: { classId },
      data: { classId: null },
    });

    // Привязываем переданных учеников к этому классу
    await prisma.pupil.updateMany({
      where: { id: { in: studentIds } },
      data: { classId },
    });

    // Возвращаем список только что назначенных учеников (с их ФИО)
    return prisma.pupil.findMany({
      where: { id: { in: studentIds } },
      select: {
        id: true,
        user: {
          select: {
            name: true,
            surname: true,
            patronymic: true,
          },
        },
      },
    });
  }
}

module.exports = ClassService;
