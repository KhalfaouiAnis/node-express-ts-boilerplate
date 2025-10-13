import { fetchInstructorStats } from '@controllers/instructor';
import { authenticateJWT } from '@middlewares/authMiddleware';
import { authorizeRole } from '@middlewares/roleMiddleware';
import { Router } from 'express';

const router = Router();

router.get(
  '/stats',
  authenticateJWT,
  authorizeRole(['INSTRUCTOR']),
  fetchInstructorStats,
);

export default router;
