import { prisma } from 'database';
import { InstructorStats } from 'types';

export const getInstructorStats = async (
  instructorId: string,
): Promise<InstructorStats> => {
  const courses = await prisma.course.findMany({
    where: { instructorId },
    select: { id: true, title: true },
  });

  if (courses.length === 0) {
    return { topReviewedCourses: [], totalIncome: 0 };
  }

  const courseIds = courses.map((course) => course.id);

  const [topCourses, totalIncome] = await Promise.all([
    prisma.review
      .groupBy({
        by: ['courseId'],
        where: { courseId: { in: courseIds } },
        _count: { id: true },
        _avg: { rating: true },
      })
      .then((reviewGroups) =>
        reviewGroups
          .map((group) => ({
            courseId: group.courseId,
            title:
              courses.find((c) => c.id === group.courseId)?.title || 'Unknown',
            totalReviews: group._count.id,
            averageRating: Math.round((group._avg.rating || 0) * 10) / 10,
          }))
          .sort((a, b) => b.totalReviews - a.totalReviews)
          .slice(0, 3),
      ),
    prisma.enrollment
      .aggregate({
        where: { course: { instructorId } },
        _sum: { amountPaid: true },
      })
      .then((agg) =>
        agg._sum.amountPaid ? parseFloat(agg._sum.amountPaid.toString()) : 0,
      ),
  ]);

  return {
    topReviewedCourses: topCourses,
    totalIncome,
  };
};
