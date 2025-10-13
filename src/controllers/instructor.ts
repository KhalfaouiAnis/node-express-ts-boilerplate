import { getInstructorStats } from '@services/instructor';
import { Request, Response } from 'express';

export const fetchInstructorStats = async (req: Request, res: Response) => {
  try {
    const stats = await getInstructorStats(req.user!.userId);
    res.json(stats);
  } catch (error: unknown) {
    if (error instanceof Error) res.status(400).json({ error: error.message });
    res.status(400).json('Unexpected error');
  }
};
