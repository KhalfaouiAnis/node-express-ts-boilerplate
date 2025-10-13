import { Router } from 'express';

import reviewsRouter from '@routes/reviewRouter';
import {
  createCourse,
  createSection,
  createVideo,
  deleteSection,
  deleteVideo,
  getCourseDetails,
  getCourses,
  removeCourse,
  updateCourse,
  updateSection,
} from '@controllers/courses';
import { streamVideo } from '@controllers/videos';
import { authenticateJWT } from '@middlewares/authMiddleware';
import { restrictToEnrolled } from '@middlewares/restrictToEnrolled';
import { restrictToManagers } from '@middlewares/restrictToManagers';
import { authorizeRole } from '@middlewares/roleMiddleware';
import {
  handleUpload,
  uploadImage,
  uploadVideo,
} from '@middlewares/uploadMiddleware';

const router = Router();

// Courses
router.get('/', getCourses);
router.get('/:courseId', getCourseDetails);
router.patch('/:courseId', updateCourse);
router.delete('/:courseId', removeCourse);
router.post(
  '/',
  authenticateJWT,
  authorizeRole(['ADMIN', 'INSTRUCTOR']),
  handleUpload(uploadImage),
  createCourse,
);

// Course videos
router.post(
  '/:courseId/videos',
  authenticateJWT,
  restrictToManagers,
  handleUpload(uploadVideo),
  createVideo,
);
router.delete(
  '/:courseId/videos/:videoId',
  authenticateJWT,
  restrictToManagers,
  deleteVideo,
);

// Course sections
router.post(
  '/:courseId/sections',
  authenticateJWT,
  restrictToManagers,
  createSection,
);
router.patch(
  '/:courseId/sections/:sectionId',
  authenticateJWT,
  restrictToManagers,
  updateSection,
);
router.delete(
  '/:courseId/sections/:sectionId',
  authenticateJWT,
  restrictToManagers,
  deleteSection,
);

// Course video stream
router.get(
  '/:courseId/videos/:videoId/stream',
  authenticateJWT,
  restrictToEnrolled,
  streamVideo,
);

// Course reviews
router.use('/:courseId/reviews', reviewsRouter);

export default router;
