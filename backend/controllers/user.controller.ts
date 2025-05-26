const { Request, Response, NextFunction } =  require('express');
const PrismaSingelton = require('../prisma/client');

module.exports = async function getUser(req: Request, res: Response, next: NextFunction) {
  try {
    const prisma = PrismaSingelton.getInstance();
    const { id } = req.user! // verifyToken положил payload
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    })
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role.name
    })
  } catch (err) {
    next(err)
  }
}
