// backend/controllers/auth.controller.ts
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const UserService = require('../services/UserService');
const prisma = require('../prisma/client').getInstance();
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

/**
 * POST /api/auth/register
 * Body: { email, password, roleName, name, surname, patronymic }
 */
async function register(req, res, next) {
  try {
    const { email, password, roleName, name, surname, patronymic } = req.body;

    if (
      !email ||
      !password ||
      !roleName ||
      !name ||
      !surname ||
      !patronymic
    ) {
      return res.status(400).json({ error: 'Все поля обязательны' });
    }

    // Создаём пользователя через сервис
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
      .json({
        token,
        user: { id: user.id, email: user.email, role: user.role },
      });
  } catch (err) {
    if (err.message === 'User already exists') {
      return res.status(409).json({ error: err.message });
    }
    if (err.message === 'Invalid role') {
      return res.status(400).json({ error: err.message });
    }
    console.error('Error in register:', err);
    return next(err);
  }
}

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email и пароль обязательны' });
    }

    // Находим пользователя в БД
    const user = await prisma.user.findUnique({
      where: { email, deletedAt: null },
      include: { role: true },
    });
    if (!user) {
      return res
        .status(401)
        .json({ error: 'Неверные учетные данные или аккаунт удалён' });
    }

    // Сравниваем пароль
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Неверные учетные данные' });
    }

    // Генерируем JWT
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
    return next(err);
  }
}

module.exports = { register, login };
