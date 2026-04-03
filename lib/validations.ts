import { z } from 'zod';

// Auth validations
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

// Course validations
export const courseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  unit: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
});

// Enrollment validations
export const enrollmentSchema = z.object({
  course_id: z.number().positive('Course ID is required'),
  status: z.enum(['pending', 'active', 'completed', 'dropped']).optional(),
  payment_status: z.enum(['pending', 'paid', 'refunded']).optional(),
});

// User update validation (admin)
export const userUpdateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email address').optional(),
  role: z.enum(['student', 'instructor', 'admin']).optional(),
});

// Course material validation
export const courseMaterialSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  type: z.enum(['document', 'video', 'link', 'assignment']),
  url: z.string().url().optional(),
  content: z.string().optional(),
  sort_order: z.number().default(0),
});

// Lesson validation
export const lessonSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  scheduled_at: z.string().datetime(),
  duration_minutes: z.number().positive().default(60),
  meeting_url: z.string().url().optional(),
});

// Type exports
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CourseInput = z.infer<typeof courseSchema>;
export type EnrollmentInput = z.infer<typeof enrollmentSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
export type CourseMaterialInput = z.infer<typeof courseMaterialSchema>;
export type LessonInput = z.infer<typeof lessonSchema>;
