const express = require('express')
const { register } = require('../controllers/auth.controller')
const router = express.Router()

/**
 * POST /api/auth/register
 * Body: { email, password, roleName, name, surname, patronymic }
 */
router.post('/', register)


module.exports = router
