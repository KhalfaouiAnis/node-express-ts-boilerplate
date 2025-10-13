import { UserRole } from 'generated/prisma';
import { isEnrolled, isOwner } from './course';

export const canSeeVideo = async (
  userId: string,
  role: UserRole,
  courseId: string,
): Promise<boolean> => {
  const haveAccess = await isOwner(userId, role, courseId);
  if (haveAccess) return true;

  const isStudentEnrolled = await isEnrolled(userId, courseId);
  if (isStudentEnrolled) return true;

  return false;
};
