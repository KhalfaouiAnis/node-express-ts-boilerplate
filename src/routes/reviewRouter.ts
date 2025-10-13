import {
  addReview,
  dropReview,
  fetchCourseReviews,
  getUserCourseReview,
  patchReview,
} from '@controllers/reviews';
import { authenticateJWT } from '@middlewares/authMiddleware';
import { Router } from 'express';

const router = Router({ mergeParams: true });

router.get('/', fetchCourseReviews);
router.get('/user-review', authenticateJWT, getUserCourseReview);

router.post('/', authenticateJWT, addReview);
router.patch('/:reviewId', authenticateJWT, patchReview);
router.delete('/:reviewId', authenticateJWT, dropReview);

export default router;
