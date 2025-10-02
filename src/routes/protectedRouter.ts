import { authenticateJWT } from '@middlewares/authMiddleware';
import { authorizeRole } from '@middlewares/roleMiddleware';
import { Router } from 'express';

const router = Router();

router.get('/profile', authenticateJWT, (req, res) => {
  res.json({ message: 'This is a protected user profile route' });
});

router.get('/admin', authenticateJWT, authorizeRole('ADMIN'), (req, res) => {
  res.json({ message: 'Welcome admin, This is a protected admin route' });
});

export default router;
