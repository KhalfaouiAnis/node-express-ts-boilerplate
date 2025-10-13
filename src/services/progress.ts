import { prisma } from 'database';
import { ProgressData, ProgressSchema, ProgressUpdate } from 'types';

export const updateProgress = async (
  enrollmentId: string,
  userId: string,
  update: ProgressUpdate,
) => {
  const { isCompleted, videoId } = ProgressSchema.parse(update);

  const video = await prisma.video.findUnique({ where: { id: videoId } });
  if (!video) throw new Error('Video not found');

  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      course: { include: { sections: { include: { videos: true } } } },
    },
  });

  if (
    !enrollment ||
    enrollment.userId !== userId ||
    !enrollment.course.sections.some((sec) =>
      sec.videos.some((vid) => vid.id === videoId),
    )
  ) {
    throw new Error('Unauthorized acceess to progress');
  }

  const data: ProgressData = {
    updatedAt: new Date(),
    ...(isCompleted ? { isCompleted: true, completedAt: new Date() } : {}),
  };

  const progress = await prisma.progress.upsert({
    where: { enrollmentId_videoId: { enrollmentId, videoId } },
    update: data,
    create: { enrollmentId, videoId, ...data },
  });

  const totalVideos = enrollment.course.sections.reduce(
    (acc, section) => acc + section.videos.length,
    0,
  );
  const completedVideos = await prisma.progress.count({
    where: { enrollmentId, isCompleted: true },
  });

  if (completedVideos == totalVideos) {
    await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: {
        status: 'COMPLETED',
      },
    });
  }

  return progress;
};

export const enrollmentProgress = async (id: string) => {
  return prisma.progress.findUnique({ where: { id } });
};

export const enrollmentProgressSummary = async (
  enrollmentId: string,
  userId: string,
) => {
  const enrollment = await prisma.enrollment.findFirst({
    where: {
      id: enrollmentId,
      userId,
      status: 'ACTIVE',
    },
    select: { courseId: true },
  });

  if (!enrollment) {
    throw new Error('Enrollment not found or access denied');
  }

  const courseId = enrollment.courseId;

  const progressList = await prisma.progress.findMany({
    where: { enrollmentId },
    select: {
      id: true,
      isCompleted: true,
      video: {
        select: {
          id: true,
          section: {
            select: { id: true, title: true },
          },
        },
      },
    },
  });

  const sections = await prisma.section.findMany({
    where: { courseId },
    orderBy: { order: 'asc' },
    select: {
      id: true,
      title: true,
      videos: { select: { id: true } },
    },
  });

  const totalVideos = progressList.length;
  const completedVideos = progressList.filter((p) => p.isCompleted).length;

  const progressBySection: Record<
    string,
    { completed: number; total: number }
  > = {};
  sections.forEach((section) => {
    const sectionTotal = section.videos.length;
    progressBySection[section.id] = {
      completed: 0,
      total: sectionTotal,
    };
  });

  progressList.forEach((progress) => {
    const sectionId = progress.video.section.id;
    if (progressBySection[sectionId]) {
      if (progress.isCompleted) {
        progressBySection[sectionId].completed++;
      }
    }
  });

  // Build sectionsProgress array
  const sectionsProgress = sections.map((section) => {
    const stats = progressBySection[section.id];
    const progress =
      stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
    return {
      sectionId: section.id,
      title: section.title,
      totalVideos: stats.total,
      completedVideos: stats.completed,
      progress: Math.round(progress),
    };
  });

  // Compute sections completion (full if progress === 100)
  const totalSections = sections.length;
  const completedSections = sectionsProgress.filter(
    (s) => s.progress === 100,
  ).length;

  // Overall progress
  const overallProgress =
    totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;

  return {
    totalSections,
    completedSections,
    totalVideos,
    completedVideos,
    overallProgress,
    sectionsProgress,
  };
};

export const deleteProgress = async (
  enrollmentId: string,
  progressId: string,
) => {
  return prisma.progress.delete({ where: { enrollmentId, id: progressId } });
};
