import { Router } from 'express';
import {
  getEnrollmentProgressSummary,
  updateVideoProgress,
} from '@controllers/progress';
import { authenticateJWT } from '@middlewares/authMiddleware';

const router = Router();

router.patch('/:enrollmentId', authenticateJWT, updateVideoProgress);
router.get(
  '/:enrollmentId/summary',
  authenticateJWT,
  getEnrollmentProgressSummary,
);

export default router;
