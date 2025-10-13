import {
  confirmStripePaymentAndEnroll,
  createStripePaymentIntent,
  dropEnrollment,
  fetchEnrollmentById,
  fetchUserEnrollments,
  updateStatus,
} from '@services/enrollment';
import { Request, Response } from 'express';

export const createPaymentIntent = async (req: Request, res: Response) => {
  try {
    const intent = await createStripePaymentIntent(
      req.user!.userId,
      req.body.courseId,
    );
    res.status(201).json(intent);
  } catch (error: unknown) {
    if (error instanceof Error) res.status(400).json({ error: error.message });
    res.status(400).json('Unexpected error');
  }
};

export const confirmPaymentAndEnroll = async (req: Request, res: Response) => {
  try {
    const enrollment = await confirmStripePaymentAndEnroll(
      req.body.paymentIntentId,
      req.user!.userId,
    );
    res.status(201).json(enrollment);
  } catch (error: unknown) {
    if (error instanceof Error) res.status(400).json({ error: error.message });
    res.status(400).json('Unexpected error');
  }
};

export const getEnrollments = async (req: Request, res: Response) => {
  const enrollments = await fetchUserEnrollments(req.user!.userId);
  res.json(enrollments);
};

export const getEnrollmentDetails = async (req: Request, res: Response) => {
  const data = await fetchEnrollmentById(req.params.enrollmentId);
  res.json(data);
};

export const updateEnrollmentStatus = async (req: Request, res: Response) => {
  const data = await updateStatus(req.params.enrollmentId, req.body);
  res.json(data);
};

export const deleteEnrollment = async (req: Request, res: Response) => {
  const data = await dropEnrollment(req.params.enrollmentId);
  res.json(data);
};
