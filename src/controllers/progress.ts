import { enrollmentProgressSummary, updateProgress } from '@services/progress';
import { Request, Response } from 'express';
import { ProgressSchema } from 'types';

export const updateVideoProgress = async (req: Request, res: Response) => {
  try {
    const { enrollmentId } = req.params;
    const updateData = ProgressSchema.parse(req.body);
    const progress = await updateProgress(
      enrollmentId,
      req.user!.userId,
      updateData,
    );
    res.json(progress);
  } catch (error: unknown) {
    if (error instanceof Error) res.status(400).json({ error: error.message });
    res.status(400).json('Unexpected error');
  }
};

export const getEnrollmentProgressSummary = async (
  req: Request,
  res: Response,
) => {
  try {
    const { enrollmentId } = req.params;
    const summary = await enrollmentProgressSummary(
      enrollmentId,
      req.user!.userId,
    );
    res.json(summary);
  } catch (error: unknown) {
    if (error instanceof Error) res.status(400).json({ error: error.message });
  }
};
