import { prisma } from 'database';
import { UserRole } from 'generated/prisma';

export const isOwner = async (
  userId: string,
  role: UserRole,
  courseId: string,
): Promise<boolean> => {
  if (role === 'ADMIN') {
    return true;
  }

  if (role === 'INSTRUCTOR') {
    const course = await prisma.course.findUnique({
      where: { id: courseId, instructorId: userId },
    });
    if (course) {
      return true;
    }
    return false;
  }

  return false;
};

export const isEnrolled = async (
  userId: string,
  courseId: string,
): Promise<boolean> => {
  const enrollment = await prisma.enrollment.findFirst({
    where: {
      userId: userId,
      courseId: courseId,
      status: 'ACTIVE',
    },
  });
  if (!enrollment) {
    return false;
  }
  return true;
};
