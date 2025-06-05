// backend/routers/user.router.ts
const { Router } = require('express');
const {
  getProfile,
  getUsers,
  searchUsers,
  changeUserRoleHandler,
  deleteUserHandler,
  updateUserHandler,
} = require('../controllers/user.controller');
const { verifyToken } = require('../middlewares/auth');

const router = Router();

// GET /api/users/me
router.get('/me', verifyToken, getProfile);

// Ниже — только для ADMIN
router.use(verifyToken);
router.use((req, res, next) => {
  if (req.user.role !== 'ADMIN') return res.sendStatus(403);
  next();
});
router.get('/search', searchUsers);
router.patch('/:id/role', changeUserRoleHandler);
router.patch('/:id', updateUserHandler);
router.delete('/:id', deleteUserHandler);


router.get('/', getUsers);

module.exports = router;
