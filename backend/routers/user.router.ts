const { Router } = require('express');
const { verifyToken } = require('../middlewares/auth');
const getUser  = require('../controllers/user.controller');


const router = Router()
// защищённый маршрут, возвращает профиль текущего пользователя
router.get('/', verifyToken, getUser)

module.exports = router;