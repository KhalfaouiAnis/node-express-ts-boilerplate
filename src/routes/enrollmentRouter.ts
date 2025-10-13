import {
  confirmPaymentAndEnroll,
  createPaymentIntent,
  deleteEnrollment,
  getEnrollmentDetails,
  getEnrollments,
  updateEnrollmentStatus,
} from '@controllers/enrollments';
import { authenticateJWT } from '@middlewares/authMiddleware';
import { Router } from 'express';

const router = Router();
router.post('/', authenticateJWT, createPaymentIntent);
router.post('/confirm', authenticateJWT, confirmPaymentAndEnroll);
router.get('/', authenticateJWT, getEnrollments);
router.get('/:enrollmentId', authenticateJWT, getEnrollmentDetails);
router.patch('/:enrollmentId', authenticateJWT, updateEnrollmentStatus);
router.delete('/:enrollmentId', authenticateJWT, deleteEnrollment);

export default router;
