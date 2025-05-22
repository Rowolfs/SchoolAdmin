const { Request, Response } = require('express');
const prisma = require('../prisma/client');

export const getAllTeachers = async (req: Request, res: Response) => {
  try {
    const teachers = await prisma.teacher.findMany();
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка получения преподавателей' });
  }
};
