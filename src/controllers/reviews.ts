import {
  createReview,
  deleteReview,
  fetchUserCourseReview,
  listCourseReviews,
  updatereview,
} from '@services/review';
import { Request, Response } from 'express';

export const addReview = async (req: Request, res: Response) => {
  try {
    const review = await createReview(
      req.user!.userId,
      req.params.courseId,
      req.body,
    );
    res.status(201).json(review);
  } catch (error: unknown) {
    if (error instanceof Error) res.status(400).json({ error: error.message });
  }
};

export const patchReview = async (req: Request, res: Response) => {
  try {
    const review = await updatereview(
      req.user!.userId,
      req.params.reviewId,
      req.body,
    );
    res.status(201).json(review);
  } catch (error: unknown) {
    if (error instanceof Error) res.status(400).json({ error: error.message });
  }
};

export const dropReview = async (req: Request, res: Response) => {
  try {
    await deleteReview(req.user!.userId, req.params.reviewId);
    res.status(204).send();
  } catch (error: unknown) {
    if (error instanceof Error) res.status(400).json({ error: error.message });
  }
};

export const fetchCourseReviews = async (req: Request, res: Response) => {
  try {
    const summary = await listCourseReviews(req.params.courseId);
    res.json(summary);
  } catch (error: unknown) {
    if (error instanceof Error) res.status(400).json({ error: error.message });
  }
};

export const getUserCourseReview = async (req: Request, res: Response) => {
  try {
    const review = await fetchUserCourseReview(
      req.user!.userId,
      req.params.courseId,
    );
    res.json(review);
  } catch (error: unknown) {
    if (error instanceof Error) res.status(400).json({ error: error.message });
  }
};
