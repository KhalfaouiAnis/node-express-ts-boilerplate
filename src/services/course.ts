import { UserPayload } from '@utils/jwt';
import { canSeeVideo } from '@utils/video';
import { prisma } from 'database';
import {
  CreateCourseInterface,
  CreateSectionInterface,
  CreateVideoInterface,
  CreateVideoSchema,
  SectionSchema,
} from 'types';

/**
 * course
 */
export const createNewCourse = async (data: CreateCourseInterface) => {
  const { title, description, price, instructorId, thumbnail } = data;

  const thumbnailUrl = thumbnail
    ? `/uploads/images/${thumbnail.filename}`
    : null;

  const course = await prisma.course.create({
    data: { title, description, price, instructorId, thumbnailUrl },
    include: { sections: true },
  });

  if (!course) {
    throw new Error('Error occured while creating the course.');
  }

  return course;
};

export const fetchCourses = async () => {
  return prisma.course.findMany({
    include: {
      sections: {
        omit: { courseId: true },
        include: {
          _count: true,
          videos: {
            select: { id: true, title: true, durationSeconds: true },
          },
        },
      },
    },
  });
};

export const fetchCourseDetails = async (
  user: UserPayload,
  courseId: string,
) => {
  const haveAccessToVideo = await canSeeVideo(user.userId, user.role, courseId);
  return prisma.course.findUnique({
    where: { id: courseId },
    include: {
      sections: {
        omit: { courseId: true },
        include: {
          _count: true,
          videos: {
            select: {
              id: true,
              title: true,
              durationSeconds: true,
              url: haveAccessToVideo,
            },
          },
        },
      },
    },
  });
};

export const patchCourse = async (
  courseId: string,
  data: Partial<CreateCourseInterface>,
) => {
  const course = await prisma.course.findUnique({ where: { id: courseId } });

  if (!course) throw new Error('Course not found');

  return prisma.course.update({ where: { id: courseId }, data });
};

export const deleteCourse = async (courseId: string) => {
  const course = await prisma.course.findUnique({ where: { id: courseId } });

  if (!course) throw new Error('Course not found');

  return prisma.course.delete({ where: { id: courseId } });
};

/**
 * course video
 */
export const createCourseVideo = async (data: CreateVideoInterface) => {
  const { sectionId, title, durationSeconds, order, video } =
    CreateVideoSchema.parse(data);

  const videoUrl = `/uploads/videos/${video.filename}`;

  if (!videoUrl) throw new Error('Video file required');

  const courseVideo = await prisma.video.create({
    data: {
      sectionId,
      title,
      url: videoUrl,
      durationSeconds,
      order,
    },
  });

  if (!courseVideo) {
    throw new Error('Error occured while saving the video.');
  }

  return courseVideo;
};

export const deleteCourseVideo = async (videoId: string) => {
  const video = await prisma.video.findUnique({ where: { id: videoId } });

  if (!video) throw new Error('Video not found');

  return prisma.video.delete({ where: { id: videoId } });
};

/**
 * course section
 */
export const createCourseSection = async (
  courseId: string,
  data: CreateSectionInterface,
) => {
  const { title, order } = SectionSchema.parse(data);

  const section = await prisma.section.create({
    data: { courseId, title, order },
  });

  if (!section) {
    throw new Error('Error occured while creating the course section.');
  }

  return section;
};
export const patchCourseSection = async (
  sectionId: string,
  data: Partial<CreateSectionInterface>,
) => {
  const parsedData = SectionSchema.parse(data);

  const section = await prisma.section.update({
    where: { id: sectionId },
    data: parsedData,
  });

  if (!section) {
    throw new Error('Error occured while creating the course section.');
  }

  return section;
};
export const deleteCourseSection = async (sectionId: string) => {
  const section = await prisma.section.findUnique({ where: { id: sectionId } });

  if (!section) throw new Error('Section not found');

  return prisma.section.delete({ where: { id: sectionId } });
};
