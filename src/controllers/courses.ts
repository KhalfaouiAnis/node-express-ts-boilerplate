import {
  createCourseSection,
  createCourseVideo,
  createNewCourse,
  deleteCourse,
  deleteCourseSection,
  deleteCourseVideo,
  fetchCourseDetails,
  fetchCourses,
  patchCourse,
  patchCourseSection,
} from '@services/course';
import { Request, Response } from 'express';

/**
 * course
 */
export const createCourse = async (req: Request, res: Response) => {
  try {
    const course = await createNewCourse({ ...req.body, thumbnail: req.file });
    res.json(course);
  } catch (error: unknown) {
    if (error instanceof Error) res.status(400).json({ error: error.message });
    res.status(400).json('Unexpected error');
  }
};
export const getCourses = async (_: Request, res: Response) => {
  const courses = await fetchCourses();
  res.json(courses);
};
export const getCourseDetails = async (req: Request, res: Response) => {
  const course = await fetchCourseDetails(req.user!, req.params.courseId);
  res.json(course);
};
export const updateCourse = async (req: Request, res: Response) => {
  try {
    const course = await patchCourse(req.params.courseId, {
      ...req.body,
      thumbnail: req.file,
    });
    res.json(course);
  } catch (error: unknown) {
    if (error instanceof Error) res.status(400).json({ error: error.message });
    res.status(400).json('Unexpected error');
  }
};
export const removeCourse = async (req: Request, res: Response) => {
  try {
    await deleteCourse(req.params.courseId);
    res.json({ message: 'course deleted' });
  } catch (error: unknown) {
    if (error instanceof Error) res.status(400).json({ error: error.message });
    res.status(400).json('Unexpected error');
  }
};

/**
 * course video
 */
export const createVideo = async (req: Request, res: Response) => {
  try {
    const video = await createCourseVideo({ ...req.body, video: req.file });
    res.status(201).json(video);
  } catch (error: unknown) {
    if (error instanceof Error) res.status(400).json({ error: error.message });
    res.status(400).json('Unexpected error');
  }
};
export const deleteVideo = async (req: Request, res: Response) => {
  try {
    await deleteCourseVideo(req.params.videoId);
    res.json({ message: 'video deleted successfully' });
  } catch (error: unknown) {
    if (error instanceof Error) res.status(400).json({ error: error.message });
    res.status(400).json('Unexpected error');
  }
};

/**
 * course section
 */
export const createSection = async (req: Request, res: Response) => {
  try {
    const section = await createCourseSection(req.params.courseId, req.body);
    res.status(201).json(section);
  } catch (error: unknown) {
    if (error instanceof Error) res.status(400).json({ error: error.message });
    res.status(400).json('Unexpected error');
  }
};
export const updateSection = async (req: Request, res: Response) => {
  try {
    const section = await patchCourseSection(req.params.sectionId, req.body);
    res.json(section);
  } catch (error: unknown) {
    if (error instanceof Error) res.status(400).json({ error: error.message });
    res.status(400).json('Unexpected error');
  }
};
export const deleteSection = async (req: Request, res: Response) => {
  try {
    await deleteCourseSection(req.params.sectionId);
    res.json({ message: 'section deleted successfully' });
  } catch (error: unknown) {
    if (error instanceof Error) res.status(400).json({ error: error.message });
    res.status(400).json('Unexpected error');
  }
};
