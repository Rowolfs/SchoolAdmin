// backend/routers/auth.router.js
const express = require('express');
const { register, login } = require('../controllers/auth.controller');
const router = express.Router();

/**
 * POST /api/auth/register
 * Body: { email, password, roleName, name, surname, patronymic }
 */
router.post('/register', register);

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
router.post('/login', login);

module.exports = router;
