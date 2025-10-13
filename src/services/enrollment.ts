import { prisma } from 'database';
import { EnrollmentStatus } from 'generated/prisma';
import Stripe from 'stripe';
import { EnrollmentSchema } from 'types';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-09-30.clover',
});

export const createStripePaymentIntent = async (
  userId: string,
  courseIdInput: string,
) => {
  const { courseId } = EnrollmentSchema.parse({ courseId: courseIdInput });
  const existing = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: { userId, courseId: courseId },
    },
  });

  if (existing) throw new Error('Already enrolled');

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { title: true, price: true },
  });

  if (!course) throw new Error('Course not found');
  if (course.price.lessThanOrEqualTo(0))
    throw new Error('Free courses not supported via payment');

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(Number(course.price) * 100),
    currency: 'usd',
    metadata: {
      userId: userId.toString(),
      courseId: courseId,
    },
    automatic_payment_methods: { enabled: true },
  });

  return { client_secret: paymentIntent.client_secret! };
};

export const confirmStripePaymentAndEnroll = async (
  paymentIntentId: string,
  userId: string,
) => {
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  if (paymentIntent.status !== 'succeeded') {
    throw new Error(
      `Payment not confirmed, current status is: ${paymentIntent.status}`,
    );
  }

  const metadataUserId = paymentIntent.metadata.userId;
  const courseId = paymentIntent.metadata.courseId;

  if (metadataUserId !== userId) throw new Error('Payment mismatch');

  const existing = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });
  if (existing) throw new Error('Already enrolled');

  // enrollment + progress
  const videos = await prisma.video.findMany({
    where: { section: { courseId } },
    select: { id: true },
  });

  return prisma.$transaction(async (tx) => {
    const enrollment = await tx.enrollment.create({
      data: { userId, courseId },
      include: { course: { select: { id: true, title: true } } },
    });

    const progressData = videos.map((video) => ({
      enrollmentId: enrollment.id,
      videoId: video.id,
      watchedDuration: 0,
      isCompleted: false,
    }));

    await tx.progress.createMany({ data: progressData });

    return enrollment;
  });
};

export const fetchUserEnrollments = async (userId: string) => {
  return prisma.enrollment.findMany({
    where: { userId, status: 'ACTIVE' },
    include: {
      course: true,
      progress: {
        include: { video: true },
        select: { isCompleted: true, video: { select: { id: true } } },
      },
    },
  });
};

export const fetchEnrollmentById = async (id: string) => {
  return prisma.enrollment.findUnique({
    where: { id },
    include: {
      course: true,
      progress: {
        include: { video: true },
        select: { isCompleted: true, video: { select: { id: true } } },
      },
    },
  });
};

export const updateStatus = async (id: string, status: EnrollmentStatus) => {
  return prisma.enrollment.update({ where: { id }, data: { status } });
};

export const dropEnrollment = async (id: string) => {
  return prisma.enrollment.delete({ where: { id } });
};
