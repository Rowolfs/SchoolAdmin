// backend/routers/user.router.ts
const { Router } = require('express');
const {
  getProfile,
  getUsers,
  searchUsers,
  filterUsers,
  changeUserRoleHandler,
  deleteUserHandler
} = require('../controllers/user.controller');
const { verifyToken } = require('../middlewares/auth');

const router = Router();

// GET /api/users/me
router.get('/me', verifyToken, getProfile);

// Далее — только ADMIN
router.use(verifyToken);
router.use((req, res, next) => {
  if (req.user.role !== 'ADMIN') return res.sendStatus(403);
  next();
});

router.get('/',      getUsers);
router.get('/search', searchUsers);
router.post('/filter', filterUsers);
router.patch('/:id/role', changeUserRoleHandler);
router.delete('/:id',     deleteUserHandler);

module.exports = router;
