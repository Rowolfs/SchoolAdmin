// backend/controllers/auth.controller.ts
const { Request, Response, NextFunction } = require('express');
const jwt = require('jsonwebtoken');
const UserService = require('../services/UserService');
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

/**
 * POST /api/auth/register
 * Body: { email, password, roleName, name, surname, patronymic }
 */
async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      email,
      password,
      roleName,
      name,
      surname,
      patronymic,
    } = req.body as unknown as {
      email: string;
      password: string;
      roleName: string;
      name: string;
      surname: string;
      patronymic: string;
    };

    if (!email || !password || !roleName || !name || !surname || !patronymic) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Вызываем сервисную логику регистрации
    const user = await UserService.registerUser({
      email,
      password,
      roleName,
      name,
      surname,
      patronymic,
    });

    // Генерируем JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res
      .status(201)
      .cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 дней
      })
      .json({ token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (err: any) {
    // Обработка ошибок из сервиса
    if (err.message === 'User already exists') {
      return res.status(409).json({ error: err.message });
    }
    if (err.message === 'Invalid role') {
      return res.status(400).json({ error: err.message });
    }
    console.error('Error in register:', err);
    next(err);
  }
}

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body as {
      email?: string;
      password?: string;
    };
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    // Логика логина остаётся прежней
    const prisma = require('../prisma/client').getInstance();
    const user = await prisma.user.findUnique({
      where: { email, deletedAt: null },
      include: { role: true },
    });
    if (!user) {
      return res
        .status(401)
        .json({ error: 'Invalid credentials or your account was deleted' });
    }
    const match = await require('bcrypt').compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign(
      { id: user.id, role: user.role.name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    return res
      .status(200)
      .cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 дней
      })
      .json({ token, user: { id: user.id, email: user.email, role: user.role.name } });
  } catch (err) {
    console.error('Error in login:', err);
    next(err);
  }
}

module.exports = { register, login };
