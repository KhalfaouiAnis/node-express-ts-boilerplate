import { prisma } from 'database';
import { ReviewInput, ReviewSchema } from 'types';

export const createReview = async (
  userId: string,
  courseId: string,
  data: ReviewInput,
) => {
  const validated = ReviewSchema.parse(data);

  const enrollment = await prisma.enrollment.findFirst({
    where: { userId, courseId, status: 'ACTIVE' },
  });

  if (!enrollment) throw new Error('Must be enrolled to review');

  const existingReview = await prisma.review.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });

  if (existingReview) throw new Error('Review already submitted');

  return prisma.review.create({
    data: { userId, courseId, ...validated },
    include: { user: { select: { id: true, fullname: true } } },
  });
};

export const updatereview = async (
  userId: string,
  reviewId: string,
  data: Partial<ReviewInput>,
) => {
  const review = await prisma.review.findFirst({
    where: { id: reviewId, userId },
    include: { course: { select: { id: true } } },
  });

  if (!review) throw new Error('Review not found');

  const validatedData = ReviewSchema.parse(data);

  return prisma.review.update({
    where: { id: reviewId },
    data: validatedData,
    include: { user: { select: { id: true, fullname: true } } },
  });
};

export const deleteReview = async (userId: string, reviewId: string) => {
  const review = await prisma.review.findFirst({
    where: { id: reviewId, userId },
  });
  if (!review) throw new Error('Review not found');

  return prisma.review.delete({ where: { id: reviewId } });
};

export const listCourseReviews = async (courseId: string) => {
  const [reviews, avgRating] = await Promise.all([
    prisma.review.findMany({
      where: { courseId },
      orderBy: { created_at: 'desc' },
      include: { user: { select: { id: true, fullname: true } } },
    }),
    prisma.review.aggregate({
      where: { courseId },
      _avg: { rating: true },
      _count: { id: true },
    }),
  ]);

  return {
    reviews,
    averageRating: Math.round((avgRating._avg.rating || 0) * 10) / 10,
    totalReviews: avgRating._count.id,
  };
};

export const fetchUserCourseReview = async (
  userId: string,
  courseId: string,
) => {
  return prisma.review.findUnique({
    where: { userId_courseId: { userId, courseId } },
    include: { user: { select: { id: true, fullname: true } } },
  });
};
