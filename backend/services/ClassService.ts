// backend/services/ClassService.ts
const PrismaSingleton = require('../prisma/client');
const prisma = PrismaSingleton.getInstance();

interface ClassWithConditionalTeacher {
  id: number;
  name: string;
  pupils: {
    id: number;
    deletedAt: Date;
    user: {
      name: string;
      surname: string;
      patronymic: string;
    };
  }
  teacher: {
    id: number;
    deletedAt: Date;
    user: {
      name: string;
      surname: string;
      patronymic: string;
    };
  } | null;
  // Add other class fields as needed
}

class ClassService {
  static async getAllClasses() {
    let raw = await prisma.class.findMany({
      where: { 
        deletedAt: null,
      },
      include: {
        teacher: {
          select: {
            id: true,
            deletedAt: true,
            user: {
              select: { name: true, surname: true, patronymic: true },
            },
          },
        },
        pupils: {
          select: {
            id: true,
            deletedAt: true,
            user: {
              select: { name: true, surname: true, patronymic: true },
            },
          },
        },
      },
      orderBy: { id: 'asc' },
    });

    const result: ClassWithConditionalTeacher[] = raw.map((c) => {
      // Process teacher
      let teacher = null;
      if (c.teacher && c.teacher.deletedAt === null) {
      const { deletedAt, ...t } = c.teacher;
      teacher = t;
      }

      // Process pupils
      const pupils = (c.pupils || [])
      .filter((p) => p.deletedAt === undefined || p.deletedAt === null)
      .map((p) => {
        const { deletedAt, ...rest } = p;
        return rest;
      });

      return {
      id: c.id,
      name: c.name,
      pupils,
      teacher,
      };
    });

    return result;

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
  static async getDisciplineTeacherPairs(classId: number) {
    const all = await prisma.disciplineTeacher.findMany({
      where: {
        deletedAt: null,
        discipline: { deletedAt: null },
        teacher: { deletedAt: null },
      },
      include: {
        discipline: { select: { id: true, name: true } },
        teacher: {
          select: {
            id: true,
            deletedAt: true,
            user: {
              select: {
                id: true,
                name: true,
                surname: true,
                patronymic: true,
              },
            },
          },
        },
      },
    });

    const assigned = await prisma.disciplineTeacherPupilsMark.findMany({
      where: { classId, deletedAt: null, mark: null },
      select: { disciplineTeacherId: true },
    });

    const assignedIds = new Set(assigned.map((r: { disciplineTeacherId: number }) => r.disciplineTeacherId));

    return all.map((pair: any) => {
      // Exclude deletedAt from teacher in the result
      const { deletedAt, ...teacherWithoutDeletedAt } = pair.teacher || {};
      return {
        id: pair.id,
        discipline: pair.discipline,
        teacher: teacherWithoutDeletedAt,
        assigned: assignedIds.has(pair.id),
      };
    });
  }

  static async searchDisciplineTeacherPairs(classId: number, search: string) {
    const where: any = {
      deletedAt: null,
      discipline: { deletedAt: null },
      teacher: { deletedAt: null },
    };

    if (search) {
      where.OR = [
        {
          discipline: {
            name: { contains: search, mode: 'insensitive' },
          },
        },
        {
          teacher: {
            user: {
              name: { contains: search, mode: 'insensitive' },
            },
          },
        },
        {
          teacher: {
            user: {
              surname: { contains: search, mode: 'insensitive' },
            },
          },
        },
        {
          teacher: {
            user: {
              patronymic: { contains: search, mode: 'insensitive' },
            },
          },
        },
      ];
    }

    const all = await prisma.disciplineTeacher.findMany({
      where,
      include: {
        discipline: { select: { id: true, name: true } },
        teacher: {
          select: {
            id: true,
            deletedAt: true,
            user: {
              select: {
                id: true,
                name: true,
                surname: true,
                patronymic: true,
              },
            },
          },
        },
      },
    });

    const assigned = await prisma.disciplineTeacherPupilsMark.findMany({
      where: { classId, deletedAt: null, mark: null },
      select: { disciplineTeacherId: true },
    });

    const assignedIds = new Set(assigned.map((r: { disciplineTeacherId: number }) => r.disciplineTeacherId));

    return all.map((pair: any) => ({
      id: pair.id,
      discipline: pair.discipline,
      teacher: pair.teacher,
      assigned: assignedIds.has(pair.id),
    }));
  }



  /**
   * Назначить пары «дисциплина–учитель» для класса
   */

  static async assignDisciplineTeacherPairs(classId: number, pairs: { id: number }[]) {
    // Мягкое удаление старых назначений
    await prisma.disciplineTeacherPupilsMark.updateMany({
      where: { classId, mark: null, deletedAt: null },
      data: { deletedAt: new Date() },
    });

    if (!pairs.length) return;

    const dtIds = pairs
      .map(p => typeof p === 'object' && p !== null && 'id' in p ? p.id : p)
      .filter(id => typeof id === 'number' && !isNaN(id));

    if (!dtIds.length) return;

    await prisma.disciplineTeacherPupilsMark.createMany({
      data: dtIds.map(id => ({
        disciplineTeacherId: id,
        classId,
        mark: null,
      })),
    });
  }
}



module.exports = ClassService;
