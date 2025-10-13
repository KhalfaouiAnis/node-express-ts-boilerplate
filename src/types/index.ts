import {
  ACCEPTED_IMAGE_TYPES,
  ACCEPTED_VIDEO_TYPES,
  MAX_IMAGE_SIZE,
  MAX_VIDEO_SIZE,
} from 'constatnts';
import { UserRole } from 'generated/prisma';
import z from 'zod';

export const AvatarSchema = z.object({
  avatar: z.optional(
    z
      .custom<Express.Multer.File>((val) => {
        return (
          typeof val === 'object' &&
          val !== null &&
          'mimetype' in val &&
          typeof val.mimetype === 'string' &&
          val.mimetype?.startsWith('image/') &&
          'size' in val &&
          (val.size as number) <= 5 * 1024 * 1024 // 5MB
        );
      }, 'Avatar must be a valid image file under 5MB')
      .refine(
        (file) => file.size <= MAX_IMAGE_SIZE,
        `File size must be less than ${MAX_IMAGE_SIZE / (1024 * 1024)}MB`,
      )
      .refine(
        (file) => ACCEPTED_IMAGE_TYPES.includes(file.mimetype),
        `File must be a supported image format (${ACCEPTED_IMAGE_TYPES.join(',')})`,
      ),
  ),
});

export const VideoSchema = z.object({
  video: z
    .custom<Express.Multer.File>(
      () => {},
      `Video must be a valid video file under ${MAX_VIDEO_SIZE}MB`,
    )
    .refine(
      (file) => file.size <= MAX_VIDEO_SIZE,
      `File size must be less than ${MAX_VIDEO_SIZE / (1024 * 1024)}MB`,
    )
    .refine(
      (file) => ACCEPTED_VIDEO_TYPES.includes(file.mimetype),
      `File must be a supported video format (${ACCEPTED_VIDEO_TYPES.join(',')})`,
    ),
});

export const LoginSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

export const SignupSchema = z.object({
  fullname: z.string().min(3),
  email: z.email(),
  password: z.string().min(6),
  avatar: AvatarSchema.shape.avatar,
});

export const CreateVideoSchema = z.object({
  sectionId: z.string(),
  title: z.string().min(1),
  durationSeconds: z.coerce.number().int().positive(),
  order: z.coerce.number(),
  video: VideoSchema.shape.video,
});

export const EnrollmentSchema = z.object({
  courseId: z.string(),
});

export const ProgressSchema = z.object({
  videoId: z.string(),
  isCompleted: z.boolean(),
});

export const CourseSchema = z.object({
  title: z.string(),
  instructorId: z.string(),
  description: z.string(),
  price: z.coerce.number().min(0),
  thumbnail: AvatarSchema.shape.avatar,
});

export const SectionSchema = z.object({
  title: z.string(),
  order: z.coerce.number(),
});

export const ReviewSchema = z.object({
  title: z.string().min(1, 'Title required').max(100),
  description: z.string().max(1000),
  rating: z.coerce.number().int().min(1).max(5, 'Rating must be 1-5'),
});

export interface User {
  id: string;
  fullname: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
}

export interface Video {
  id: string;
  title: string;
  url: string;
  durationSeconds: number;
}

export interface ProgressUpdate {
  videoId: string;
  isCompleted: boolean;
}

export interface ProgressData {
  updatedAt: Date;
  isCompleted?: boolean;
  completedAt?: Date;
}

export interface ProgressSummary {
  totalSections: number;
  completedSections: number;
  totalVideos: number;
  completedVideos: number;
  overallProgress: number;
  sectionsProgress?: Array<{
    sectionId: string;
    title: string;
    totalVideos: number;
    completedVideos: number;
    progress: number;
  }>;
}

export interface Review {
  id: string;
  title: string;
  description?: string;
  rating: number;
  createdAt: Date;
  user: { id: string; fullame: string };
}

export interface InstructorStats {
  topReviewedCourses: Array<{
    courseId: string;
    title: string;
    totalReviews: number;
    averageRating: number;
  }>;
  totalIncome: number;
}

export type CreateCourseInterface = z.infer<typeof CourseSchema>;
export type CreateVideoInterface = z.infer<typeof CreateVideoSchema>;
export type CreateSectionInterface = z.infer<typeof SectionSchema>;
export type SignupInterface = z.infer<typeof SignupSchema>;
export type LoginInterface = z.infer<typeof LoginSchema>;
export type AvatarValidationType = z.infer<typeof AvatarSchema>;
export type ReviewInput = z.infer<typeof ReviewSchema>;
