import { canSeeVideo } from '@utils/video';
import { Request, Response, NextFunction } from 'express';

export const restrictToEnrolled = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { courseId } = req.params;

    if (!courseId) {
      return res.status(400).json({ error: 'Invalid course ID' });
    }

    const haveAccess = await canSeeVideo(user.userId, user.role, courseId);

    if (haveAccess) {
      return next();
    }

    return res.status(403).json({ error: 'Access denied: Invalid role' });
  } catch (error) {
    console.error('Enrollment check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
