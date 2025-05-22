const express = require('express')
const { login } = require('../controllers/auth.controller')
const router = express.Router()

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
router.post('/', login)


module.exports = router
