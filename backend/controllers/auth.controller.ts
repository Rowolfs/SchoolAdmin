const express = require("express");
const { Request, Response, NextFunction } = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../prisma/client");
const dotenv = require("dotenv");
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d'

/**
 * POST /api/auth/register
 * Body: { email, password, roleName, name, surname, patronymic }
 */
async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password, roleName, name, surname, patronymic } = req.body as unknown as {
      email: string
      password: string
      roleName: string
      name: string
      surname: string
      patronymic: string
    }

    if (!email || !password || !roleName || !name || !surname || !patronymic) {
      return res.status(400).json({ error: 'All fields are required' })
    }
    // check existing
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return res.status(409).json({ error: 'User already exists' })
    }
    // find role
    const role = await prisma.role.findUnique({ where: { name: roleName } })
    if (!role) {
      return res.status(400).json({ error: 'Invalid role' })
    }
    // hash
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)
    // create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hash,
        name,
        surname,
        patronymic,
        role: { connect: { id: role.id } }
      },
      include: { role: true }
    })
    // sign token
    const token = jwt.sign({ id: user.id, role: user.role.name }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
    return res.status(201).json({ token, user: { id: user.id, email: user.email, role: user.role.name } })
  } catch (err) {
    console.error('Error in register:', err)
    next(err)
  }
}

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
async function login(req: Request, res: Response, next: NextFunction) {
  try {

    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }
    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true }
    })
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    const match = await bcrypt.compare(password, user.password)
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    const token = jwt.sign({ id: user.id, role: user.role.name }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
    return res.status(200).json({ token, user: { id: user.id, email: user.email, role: user.role.name } })
  } catch (err) {
    console.error('Error in login:', err)
    next(err)
  }
}

module.exports = { register, login }
export { register, login }
